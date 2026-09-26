import { NextResponse } from "next/server";
import { Molecule, ensureDbSynced } from "@/lib/db";

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

function normalizeMoleculeName(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizeRawMolecule(raw: any, fallbackName?: string) {
  const atoms = Array.isArray(raw.atoms)
    ? raw.atoms.map((atom: any) => {
        const rawPos = Array.isArray(atom.position)
          ? atom.position
          : Array.isArray(atom.location)
          ? atom.location
          : atom.position || atom.location ||
            (atom.x !== undefined || atom.y !== undefined || atom.z !== undefined
              ? [Number(atom.x || 0), Number(atom.y || 0), Number(atom.z || 0)]
              : [0, 0, 0]);

        return {
          element: atom.element || "X",
          position: [
            Number(rawPos[0] || 0),
            Number(rawPos[1] || 0),
            Number(rawPos[2] || 0),
          ],
          color: atom.color,
        };
      })
    : [];

  const bonds = Array.isArray(raw.bonds)
    ? raw.bonds.map((bond: any) => {
        const from = bond.from !== undefined
          ? Number(bond.from)
          : bond.source !== undefined
          ? Number(bond.source)
          : 0;
        const to = bond.to !== undefined
          ? Number(bond.to)
          : bond.target !== undefined
          ? Number(bond.target)
          : 0;

        let type: "single" | "double" | "triple" = "single";
        const rawType = bond.type || "";
        if (bond.order === 2 || rawType === "double") type = "double";
        if (bond.order === 3 || rawType === "triple") type = "triple";

        return { from, to, type };
      })
    : [];

  return {
    molecule: raw.molecule || fallbackName || "Unknown",
    formula: raw.formula || "",
    category: raw.category || "basic",
    description: raw.description || "",
    geometry: raw.geometry,
    bondAngles: raw.bondAngles,
    atoms,
    bonds,
  };
}

async function fetchMoleculeFromPubChem(name: string) {
  const normalizedName = normalizeMoleculeName(name);

  if (IONIC_FALLBACKS[normalizedName]) {
    return normalizeRawMolecule({ ...IONIC_FALLBACKS[normalizedName], molecule: name }, name);
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

    const elementNumArray = compound.atoms?.element || [];
    const aidArray = compound.atoms?.aid || [];
    const conformer = compound.coords?.[0]?.conformers?.[0];
    const xCoords = Array.isArray(conformer?.x) ? conformer.x : [];
    const yCoords = Array.isArray(conformer?.y) ? conformer.y : [];
    const zCoords = Array.isArray(conformer?.z) ? conformer.z : [];

    const atomsList = aidArray.map((aid: number, index: number) => ({
      element: ELEMENT_MAP[elementNumArray[index]] || "X",
      position: [
        Number(xCoords[index] || 0.0),
        Number(yCoords[index] || 0.0),
        Number(zCoords[index] || 0.0),
      ],
    }));

    const rawBonds = compound.bonds || {};
    const aid1 = rawBonds.aid1 || [];
    const aid2 = rawBonds.aid2 || [];
    const order = rawBonds.order || [];

    const bondsList = aid1.map((id1: number, index: number) => ({
      source: id1 - 1,
      target: (aid2[index] || 1) - 1,
      order: order[index] || 1,
    }));

    const props = compound.props || [];
    const formulaProp = props.find((p: any) => p.urn?.label === "Molecular Formula");
    const formula = formulaProp?.value?.sval || name;

    return normalizeRawMolecule(
      {
        molecule: name,
        formula,
        category: "basic",
        description: `PubChem-sourced structure for ${name}`,
        atoms: atomsList,
        bonds: bondsList,
      },
      name,
    );
  } catch (err: any) {
    console.warn(`Failed to fetch dynamic 3D conformer for "${name}":`, err.message);
    return null;
  }
}

export async function GET(request: Request, context: { params: Promise<{ name: string }> }) {
  const params = await context.params
  const requestedName = params?.name;
  if (!requestedName) {
    return NextResponse.json({ error: "Molecule name is required" }, { status: 400 });
  }

  await ensureDbSynced();
  const normalizedName = normalizeMoleculeName(requestedName);

  const moleculeRecord = await Molecule.findOne({
    where: { molecule: normalizedName },
  });

  let moleculeData: any = null;
  if (moleculeRecord) {
    moleculeData = normalizeRawMolecule(
      { ...moleculeRecord.get({ plain: true }), molecule: moleculeRecord.molecule },
      requestedName,
    );
  } else {
    const pubChemData = await fetchMoleculeFromPubChem(requestedName);
    if (pubChemData) {
      moleculeData = pubChemData;
      try {
        await Molecule.upsert({
          molecule: normalizedName,
          formula: moleculeData.formula || requestedName,
          category: moleculeData.category,
          description: moleculeData.description,
          atoms: moleculeData.atoms,
          bonds: moleculeData.bonds,
        });
      } catch (dbErr: any) {
        console.error(`Failed to cache fetched molecule "${requestedName}" to database:`, dbErr.message);
      }
    }
  }

  if (!moleculeData || !Array.isArray(moleculeData.atoms)) {
    return NextResponse.json(
      { error: "NOT_FOUND", message: `No structure found for ${requestedName}` },
      { status: 404 },
    );
  }

  return NextResponse.json(moleculeData, { status: 200 });
}
