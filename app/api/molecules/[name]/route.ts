import { NextResponse } from "next/server";
import { Reaction, Molecule, ensureDbSynced } from "@/lib/db";
import { Op, fn, col } from "sequelize";

// Standard atomic number mapping to convert PubChem IDs into CPK elements
const ELEMENT_MAP: Record<number, string> = {
  1: "H",
  6: "C",
  7: "N",
  8: "O",
  9: "F",
  11: "Na",
  16: "S",
  17: "Cl",
  20: "Ca",
  26: "Fe",
  30: "Zn",
};

// --- Fallback 3D structures for ionic/difficult lattices (e.g., NaCl, CaO, CaCO3) ---
const IONIC_FALLBACKS: Record<string, { atoms: any[]; bonds: any[]; formula: string }> = {
  "sodium chloride": {
    formula: "NaCl",
    atoms: [
      { element: "Na", x: 0.0, y: 0.0, z: 0.0 },
      { element: "Cl", x: 2.8, y: 0.0, z: 0.0 },
    ],
    bonds: [{ source: 0, target: 1, order: 1 }],
  },
  "calcium oxide": {
    formula: "CaO",
    atoms: [
      { element: "Ca", x: 0.0, y: 0.0, z: 0.0 },
      { element: "O", x: 2.4, y: 0.0, z: 0.0 },
    ],
    bonds: [{ source: 0, target: 1, order: 2 }],
  },
  "calcium carbonate": {
    formula: "CaCO3",
    atoms: [
      { element: "Ca", x: 0.0, y: 2.0, z: 0.0 },
      { element: "C", x: 0.0, y: -1.0, z: 0.0 },
      { element: "O", x: 0.0, y: 0.2, z: 0.0 },
      { element: "O", x: -1.0, y: -1.6, z: 0.0 },
      { element: "O", x: 1.0, y: -1.6, z: 0.0 },
    ],
    bonds: [
      { source: 1, target: 2, order: 2 },
      { source: 1, target: 3, order: 1 },
      { source: 1, target: 4, order: 1 },
    ],
  },
};

/**
 * Helper to fetch and parse 3D structures on the fly from the PubChem PUG-REST API
 */
async function fetchMoleculeFromPubChem(name: string) {
  const normalizedName = name.trim().toLowerCase();
  
  // Check our ionic presets first
  if (IONIC_FALLBACKS[normalizedName]) {
    return IONIC_FALLBACKS[normalizedName];
  }

  try {
    const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(normalizedName)}/JSON?record_type=3d`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`PubChem returned status ${res.status} for "${name}"`);
    }

    const data = await res.json();
    const compound = data.PC_Compounds?.[0];
    if (!compound) {
      throw new Error(`No compound record found in PubChem response for "${name}"`);
    }

    // 1. Extract and map atoms
    const atomsList: any[] = [];
    const elementNumArray = compound.atoms?.element || [];
    const aidArray = compound.atoms?.aid || [];
    const conformer = compound.coords?.[0]?.conformers?.[0];
    const xCoords = conformer?.x || [];
    const yCoords = conformer?.y || [];
    const zCoords = conformer?.z || [];

    aidArray.forEach((aid: number, index: number) => {
      const atomicNum = elementNumArray[index];
      const elementSymbol = ELEMENT_MAP[atomicNum] || "X"; // Fallback identifier
      atomsList.push({
        element: elementSymbol,
        x: xCoords[index] || 0.0,
        y: yCoords[index] || 0.0,
        z: zCoords[index] || 0.0,
      });
    });

    // 2. Extract and map bonds
    const bondsList: any[] = [];
    const rawBonds = compound.bonds || {};
    const aid1 = rawBonds.aid1 || [];
    const aid2 = rawBonds.aid2 || [];
    const order = rawBonds.order || [];

    aid1.forEach((id1: number, index: number) => {
      const id2 = aid2[index];
      const bondOrder = order[index] || 1;
      // Convert 1-indexed PubChem IDs to 0-indexed for 3Dmol.js
      bondsList.push({
        source: id1 - 1,
        target: id2 - 1,
        order: bondOrder,
      });
    });

    // 3. Extract Chemical Formula
    const props = compound.props || [];
    let formula = name;
    const formulaProp = props.find((p: any) => p.urn?.label === "Molecular Formula");
    if (formulaProp) {
      formula = formulaProp.value?.sval || name;
    }

    return {
      atoms: atomsList,
      bonds: bondsList,
      formula,
    };
  } catch (err: any) {
    console.warn(`Failed to fetch dynamic 3D conformer for "${name}":`, err.message);
    return null; // Graceful fallback
  }
}

export async function GET() {
  try {
    // 0. Ensure database tables are fully structural and ready
    await ensureDbSynced();

    // 1. Fetch all reactions from the database
    const reactions = await Reaction.findAll();

    // 2. Extract all unique molecule names (lowercased for uniform matching)
    const moleculeNamesSet = new Set<string>();
    reactions.forEach((reaction) => {
      const reactants = (reaction.reactants as any[]) || [];
      const products = (reaction.products as any[]) || [];

      reactants.forEach((r) => r.molecule && moleculeNamesSet.add(r.molecule.trim().toLowerCase()));
      products.forEach((p) => p.molecule && moleculeNamesSet.add(p.molecule.trim().toLowerCase()));
    });

    const uniqueMoleculeNames = Array.from(moleculeNamesSet);

    // 3. Fetch existing 3D coordinate data with complete case-insensitive queries using LOWER()
    const moleculeRecords = await Molecule.findAll({
      where: {
        molecule: {
          [Op.in]: uniqueMoleculeNames,
        },
      },
    });

    // Map existing records to local dictionary using lowercased keys
    const moleculeDataMap: Record<string, { atoms: any; bonds: any; formula?: string }> = {};
    moleculeRecords.forEach((m: any) => {
      const key = m.molecule.trim().toLowerCase();
      moleculeDataMap[key] = {
        atoms: m.atoms,
        bonds: m.bonds,
        formula: m.formula,
      };
    });

    // Find which molecules are completely missing from our cache
    const missingMoleculeNames = uniqueMoleculeNames.filter(
      (name) => !moleculeDataMap[name]
    );

    // 4. Resolve missing molecules dynamically via PubChem/Fallbacks and Cache them
    if (missingMoleculeNames.length > 0) {
      const resolvePromises = missingMoleculeNames.map(async (name) => {
        const pubChemData = await fetchMoleculeFromPubChem(name);
        if (pubChemData) {
          try {
            // Write to our local MySQL database with 'upsert' to gracefully avoid duplicate keys
            // We store the molecule name as lowercase to match our dictionary key structure
            await Molecule.upsert({
              molecule: name.trim().toLowerCase(),
              formula: pubChemData.formula,
              category: "basic",
              description: `Dynamically compiled 3D data structure for ${name}.`,
              atoms: pubChemData.atoms,
              bonds: pubChemData.bonds,
            });

            // Update our request resolver map
            moleculeDataMap[name.trim().toLowerCase()] = {
              atoms: pubChemData.atoms,
              bonds: pubChemData.bonds,
              formula: pubChemData.formula,
            };
            console.log(`Successfully cached dynamically fetched molecule: "${name}"`);
          } catch (dbErr: any) {
            console.error(`Failed to store fetched molecule "${name}" to database:`, dbErr.message);
          }
        }
      });

      // Wait for all missing coordinate records to be resolved
      await Promise.all(resolvePromises);
    }

    // 5. Attach resolved 3D data to each reaction's reactants and products
    const enrichedReactions = reactions.map((reaction) => {
      const plainReaction = reaction.get({ plain: true });

      const enrichedReactants = ((plainReaction.reactants as any[]) || []).map((r) => {
        const key = r.molecule ? r.molecule.trim().toLowerCase() : "";
        return {
          ...r,
          data: moleculeDataMap[key] || null, // Delivers the coordinates directly
        };
      });

      const enrichedProducts = ((plainReaction.products as any[]) || []).map((p) => {
        const key = p.molecule ? p.molecule.trim().toLowerCase() : "";
        return {
          ...p,
          data: moleculeDataMap[key] || null,
        };
      });

      return {
        ...plainReaction,
        reactants: enrichedReactants,
        products: enrichedProducts,
      };
    });

    return NextResponse.json({ reactions: enrichedReactions }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching and enriching reactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch reactions", details: error.message },
      { status: 500 }
    );
  }
}