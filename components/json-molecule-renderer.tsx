"use client"

import { useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Html } from "@react-three/drei"
import * as THREE from "three"

export interface JSONMolecule {
  molecule: string
  formula: string
  description?: string
  category?: string
  geometry?: string
  bondAngles?: string
  atoms: {
    element: string
    position: [number, number, number]
    color?: string
  }[]
  bonds: {
    from: number
    to: number
    type?: "single" | "double" | "triple"
  }[]
}

// 🌐 COMPREHENSIVE TOP 40 METRIC/INTERMEDIATE SCALE DICTIONARY
const ELEMENT_PROPERTIES: Record<
  string,
  {
    size: number
    color: string
    atomicNumber: number
    commonValency: number[]
    name: string
  }
> = {
  // --- Non-Metals / Gases (Small & Balanced Scales) ---
  H: { size: 0.35, color: "#ffffff", atomicNumber: 1, commonValency: [1], name: "Hydrogen" },
  He: { size: 0.40, color: "#c8ffff", atomicNumber: 2, commonValency: [0], name: "Helium" },
  B: { size: 0.55, color: "#ffb5b5", atomicNumber: 5, commonValency: [3], name: "Boron" },
  C: { size: 0.62, color: "#222222", atomicNumber: 6, commonValency: [4], name: "Carbon" },
  N: { size: 0.58, color: "#3050f8", atomicNumber: 7, commonValency: [3, 5], name: "Nitrogen" },
  O: { size: 0.55, color: "#ff0d0d", atomicNumber: 8, commonValency: [2], name: "Oxygen" },
  Ne: { size: 0.50, color: "#b3e3f5", atomicNumber: 10, commonValency: [0], name: "Neon" },
  
  // --- Halogens (Slightly larger than Period 2 Non-Metals) ---
  F: { size: 0.52, color: "#90e050", atomicNumber: 9, commonValency: [1], name: "Fluorine" },
  Cl: { size: 0.72, color: "#1ff01f", atomicNumber: 17, commonValency: [1, 3, 5, 7], name: "Chlorine" },
  Br: { size: 0.82, color: "#a62929", atomicNumber: 35, commonValency: [1, 3, 5], name: "Bromine" },
  I: { size: 0.92, color: "#9400d3", atomicNumber: 53, commonValency: [1, 5, 7], name: "Iodine" },

  // --- Metalloids & Non-metal Solids ---
  Si: { size: 0.75, color: "#f0c8a0", atomicNumber: 14, commonValency: [4], name: "Silicon" },
  P: { size: 0.70, color: "#ff8000", atomicNumber: 15, commonValency: [3, 5], name: "Phosphorus" },
  S: { size: 0.72, color: "#ffff30", atomicNumber: 16, commonValency: [2, 4, 6], name: "Sulfur" },
  As: { size: 0.85, color: "#bd80ff", atomicNumber: 33, commonValency: [3, 5], name: "Arsenic" },
  Se: { size: 0.80, color: "#ffa500", atomicNumber: 34, commonValency: [2, 4, 6], name: "Selenium" },

  // --- Alkali Metals (Optimized down from raw sizes to stop clipping) ---
  Li: { size: 0.75, color: "#cc80ff", atomicNumber: 3, commonValency: [1], name: "Lithium" },
  Na: { size: 0.85, color: "#ab5cf2", atomicNumber: 11, commonValency: [1], name: "Sodium" },
  K: { size: 0.98, color: "#8f40d4", atomicNumber: 19, commonValency: [1], name: "Potassium" },
  Rb: { size: 1.05, color: "#a040b0", atomicNumber: 37, commonValency: [1], name: "Rubidium" },
  Cs: { size: 1.15, color: "#7030a0", atomicNumber: 55, commonValency: [1], name: "Cesium" },

  // --- Alkaline Earth Metals ---
  Be: { size: 0.65, color: "#c2ff00", atomicNumber: 4, commonValency: [2], name: "Beryllium" },
  Mg: { size: 0.80, color: "#8ad400", atomicNumber: 12, commonValency: [2], name: "Magnesium" },
  Ca: { size: 0.92, color: "#3dff00", atomicNumber: 20, commonValency: [2], name: "Calcium" },
  Sr: { size: 1.00, color: "#00ff7f", atomicNumber: 38, commonValency: [2], name: "Strontium" },
  Ba: { size: 1.10, color: "#00aa00", atomicNumber: 56, commonValency: [2], name: "Barium" },

  // --- Transition Metals (Unified matching frame) ---
  Cr: { size: 0.90, color: "#8a99ad", atomicNumber: 24, commonValency: [2, 3, 6], name: "Chromium" },
  Mn: { size: 0.90, color: "#9c7ac7", atomicNumber: 25, commonValency: [2, 4, 7], name: "Manganese" },
  Fe: { size: 0.92, color: "#e06633", atomicNumber: 26, commonValency: [2, 3], name: "Iron" },
  Co: { size: 0.90, color: "#f090a0", atomicNumber: 27, commonValency: [2, 3], name: "Cobalt" },
  Ni: { size: 0.90, color: "#50d050", atomicNumber: 28, commonValency: [2, 3], name: "Nickel" },
  Cu: { size: 0.92, color: "#c88033", atomicNumber: 29, commonValency: [1, 2], name: "Copper" },
  Zn: { size: 0.92, color: "#7d80b0", atomicNumber: 30, commonValency: [2], name: "Zinc" },
  Ag: { size: 1.00, color: "#c0c0c0", atomicNumber: 47, commonValency: [1], name: "Silver" },
  Au: { size: 1.02, color: "#ffd700", atomicNumber: 79, commonValency: [1, 3], name: "Gold" },
  Pt: { size: 1.00, color: "#d0d0e0", atomicNumber: 78, commonValency: [2, 4], name: "Platinum" },
  Hg: { size: 1.05, color: "#b8b8b8", atomicNumber: 80, commonValency: [1, 2], name: "Mercury" },

  // --- Post-Transition Metals & Metalloids ---
  Al: { size: 0.80, color: "#bfa6a6", atomicNumber: 13, commonValency: [3], name: "Aluminum" },
  Sn: { size: 0.95, color: "#667f80", atomicNumber: 50, commonValency: [2, 4], name: "Tin" },
  Pb: { size: 1.02, color: "#575961", atomicNumber: 82, commonValency: [2, 4], name: "Lead" },
}

function JSONAtomSphere({
  atom,
  index,
  onClick,
  isHighlighted,
}: {
  atom: JSONMolecule["atoms"][0]
  index: number
  onClick: () => void
  isHighlighted?: boolean
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  const elementProps = ELEMENT_PROPERTIES[atom.element] || {
    size: 0.6,
    color: "#cccccc",
    atomicNumber: 0,
    commonValency: [0],
    name: "Unknown",
  }

  const atomSize = elementProps.size
  const atomColor = atom.color || elementProps.color

  useFrame((state) => {
    if (meshRef.current) {
      if (hovered || isHighlighted) {
        meshRef.current.scale.setScalar(1.15 + Math.sin(state.clock.elapsedTime * 4) * 0.05)
      } else {
        meshRef.current.scale.setScalar(1)
      }
    }
  })

  return (
    <group position={atom.position}>
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
        }}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[atomSize, 32, 32]} />
        <meshStandardMaterial
          color={atomColor}
          emissive={isHighlighted ? atomColor : "#000000"}
          emissiveIntensity={isHighlighted ? 0.2 : 0}
          roughness={0.2}
          metalness={["Na", "K", "Ca", "Fe", "Zn", "Al", "Cu", "Ag", "Au", "Pt", "Cr", "Mn", "Co", "Ni", "Hg", "Sn", "Pb"].includes(atom.element) ? 0.4 : 0.0}
        />
      </mesh>
      {hovered && (
        <Html distanceFactor={8} center style={{ pointerEvents: "none", zIndex: 50 }}>
          <div className="bg-card border rounded-lg px-3 py-2 text-xs font-medium shadow-xl max-w-48 select-none pointer-events-none text-foreground bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <div className="font-bold text-sm text-foreground">
              {elementProps.name} ({atom.element})
            </div>
            <div className="text-muted-foreground">Atomic #: {elementProps.atomicNumber}</div>
            <div className="text-muted-foreground">Valency: {elementProps.commonValency.join(", ")}</div>
            <div className="text-muted-foreground mt-1 text-[10px] font-mono">
              Pos: [{atom.position?.map((p) => (typeof p === "number" ? p.toFixed(2) : p)).join(", ") || "0.00, 0.00, 0.00"}]
            </div>
          </div>
        </Html>
      )}
    </group>
  )
}

function JSONBond({
  bond,
  atoms,
}: {
  bond: JSONMolecule["bonds"][0]
  atoms: JSONMolecule["atoms"]
}) {
  const [hovered, setHovered] = useState(false)
  const fromAtom = atoms[bond.from]
  const toAtom = atoms[bond.to]

  if (!fromAtom || !toAtom) return null

  const fromPos = new THREE.Vector3(...fromAtom.position)
  const toPos = new THREE.Vector3(...toAtom.position)
  const direction = new THREE.Vector3().subVectors(toPos, fromPos)
  const length = direction.length()
  const midpoint = new THREE.Vector3().addVectors(fromPos, toPos).multiplyScalar(0.5)

  const bondType = bond.type || "single"
  const bondRadius = 0.06
  const bondColor = hovered ? "#4ade80" : "#888888"

  const renderBonds = () => {
    switch (bondType) {
      case "single":
        return (
          <group
            position={midpoint.toArray()}
            onPointerOver={(e) => {
              e.stopPropagation()
              setHovered(true)
            }}
            onPointerOut={() => setHovered(false)}
          >
            <mesh
              ref={(mesh) => {
                if (mesh) {
                  mesh.lookAt(toPos)
                  mesh.rotateX(Math.PI / 2)
                }
              }}
            >
              <cylinderGeometry args={[bondRadius, bondRadius, length, 12]} />
              <meshStandardMaterial color={bondColor} roughness={0.4} />
            </mesh>
          </group>
        )

      case "double": {
        const offset = 0.14
        const perpendicular = new THREE.Vector3(1, 0, 0).cross(direction).normalize().multiplyScalar(offset)
        return (
          <group 
            onPointerOver={(e) => {
              e.stopPropagation()
              setHovered(true)
            }} 
            onPointerOut={() => setHovered(false)}
          >
            <group position={midpoint.clone().add(perpendicular).toArray()}>
              <mesh
                ref={(mesh) => {
                  if (mesh) {
                    mesh.lookAt(toPos)
                    mesh.rotateX(Math.PI / 2)
                  }
                }}
              >
                <cylinderGeometry args={[bondRadius * 0.8, bondRadius * 0.8, length, 8]} />
                <meshStandardMaterial color={bondColor} roughness={0.4} />
              </mesh>
            </group>
            <group position={midpoint.clone().sub(perpendicular).toArray()}>
              <mesh
                ref={(mesh) => {
                  if (mesh) {
                    mesh.lookAt(toPos)
                    mesh.rotateX(Math.PI / 2)
                  }
                }}
              >
                <cylinderGeometry args={[bondRadius * 0.8, bondRadius * 0.8, length, 8]} />
                <meshStandardMaterial color={bondColor} roughness={0.4} />
              </mesh>
            </group>
          </group>
        )
      }

      case "triple": {
        const offset1 = new THREE.Vector3(1, 0, 0).cross(direction).normalize().multiplyScalar(0.12)
        const offset2 = new THREE.Vector3(0, 1, 0).cross(direction).normalize().multiplyScalar(0.12)
        return (
          <group 
            onPointerOver={(e) => {
              e.stopPropagation()
              setHovered(true)
            }} 
            onPointerOut={() => setHovered(false)}
          >
            <group position={midpoint.toArray()}>
              <mesh
                ref={(mesh) => {
                  if (mesh) {
                    mesh.lookAt(toPos)
                    mesh.rotateX(Math.PI / 2)
                  }
                }}
              >
                <cylinderGeometry args={[bondRadius * 0.7, bondRadius * 0.7, length, 8]} />
                <meshStandardMaterial color={bondColor} roughness={0.4} />
              </mesh>
            </group>
            <group position={midpoint.clone().add(offset1).toArray()}>
              <mesh
                ref={(mesh) => {
                  if (mesh) {
                    mesh.lookAt(toPos)
                    mesh.rotateX(Math.PI / 2)
                  }
                }}
              >
                <cylinderGeometry args={[bondRadius * 0.7, bondRadius * 0.7, length, 8]} />
                <meshStandardMaterial color={bondColor} roughness={0.4} />
              </mesh>
            </group>
            <group position={midpoint.clone().add(offset2).toArray()}>
              <mesh
                ref={(mesh) => {
                  if (mesh) {
                    mesh.lookAt(toPos)
                    mesh.rotateX(Math.PI / 2)
                  }
                }}
              >
                <cylinderGeometry args={[bondRadius * 0.7, bondRadius * 0.7, length, 8]} />
                <meshStandardMaterial color={bondColor} roughness={0.4} />
              </mesh>
            </group>
          </group>
        )
      }

      default:
        return null
    }
  }

  return (
    <group>
      {renderBonds()}
      {hovered && (
        <Html position={midpoint.toArray()} distanceFactor={8} center style={{ pointerEvents: 'none', zIndex: 40 }}>
          <div className="bg-card border rounded px-2 py-1 text-xs font-medium shadow-md select-none pointer-events-none text-foreground bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <div className="font-semibold capitalize">{bondType} Bond</div>
            <div className="text-muted-foreground">Length: {length.toFixed(2)}Å</div>
            <div className="text-muted-foreground font-mono">
              {fromAtom.element}-{toAtom.element}
            </div>
          </div>
        </Html>
      )}
    </group>
  )
}

function JSONMoleculeVisualization({
  molecule,
  onAtomClick,
  highlightedAtoms,
}: {
  molecule: JSONMolecule
  onAtomClick?: (atomIndex: number, atom: JSONMolecule["atoms"][0]) => void
  highlightedAtoms?: number[]
}) {
  return (
    <>
      {molecule.atoms?.map((atom, index) => (
        <JSONAtomSphere
          key={`atom-${index}`}
          atom={atom}
          index={index}
          onClick={() => onAtomClick?.(index, atom)}
          isHighlighted={highlightedAtoms?.includes(index)}
        />
      ))}
      {molecule.bonds?.map((bond, index) => (
        <JSONBond key={`bond-${index}`} bond={bond} atoms={molecule.atoms} />
      ))}
    </>
  )
}

export function JSONMoleculeRenderer({
  molecule: rawMolecule,
  height = 430,
  showControls = true,
  autoRotate = false,
  onAtomClick,
}: {
  molecule: JSONMolecule
  height?: number
  showControls?: boolean
  autoRotate?: boolean
  onAtomClick?: (atomIndex: number, atom: JSONMolecule["atoms"][0]) => void
}) {
  const molecule = normalizeMoleculeData(rawMolecule)

  const [selectedAtom, setSelectedAtom] = useState<{ index: number; atom: JSONMolecule["atoms"][0] } | null>(null)
  const [highlightedAtoms, setHighlightedAtoms] = useState<number[]>([])

  const handleAtomClick = (atomIndex: number, atom: JSONMolecule["atoms"][0]) => {
    setSelectedAtom({ index: atomIndex, atom })

    if (molecule.bonds) {
      const connectedAtoms = molecule.bonds
        .filter((bond) => bond.from === atomIndex || bond.to === atomIndex)
        .map((bond) => (bond.from === atomIndex ? bond.to : bond.from))
      setHighlightedAtoms([atomIndex, ...connectedAtoms])
    } else {
      setHighlightedAtoms([atomIndex])
    }

    onAtomClick?.(atomIndex, atom)
  }

  return (
    <div className="w-full flex flex-col gap-4">
      {/* 📋 DISPLACED PROPERTIES BANNER (Now sits out of the canvas view layout as requested) */}
      <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-sm select-text">
        <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-2 capitalize">
          {molecule.molecule} <span className="text-base font-normal text-slate-400">({molecule.formula})</span>
        </h3>
        
        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-y-2 gap-x-4 text-sm text-slate-600 dark:text-slate-300 list-none p-0 m-0 font-medium">
          <li className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span className="text-slate-400 font-normal">Formula:</span> {molecule.formula}
          </li>
          <li className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            <span className="text-slate-400 font-normal">Geometry:</span> {molecule.geometry || "Determining..."}
          </li>
          <li className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span className="text-slate-400 font-normal">Bond Angles:</span> {molecule.bondAngles || "Determining..."}
          </li>
          <li className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-slate-400 font-normal">Atoms:</span> {molecule.atoms?.length || 0}
          </li>
          <li className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-pink-500"></span>
            <span className="text-slate-400 font-normal">Bonds:</span> {molecule.bonds?.length || 0}
          </li>
        </ul>
        
        {molecule.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 leading-relaxed">
            {molecule.description}
          </p>
        )}
      </div>

      {/* 🎨 3D MODEL WORKSPACE GRID CONTROLLER CONTAINER */}
      <div
        className="relative w-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-lg overflow-hidden border"
        style={{ height }}
      >
        <Canvas camera={{ position: [0, 0, 7], fov: 45 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1.2} castShadow />
          <pointLight position={[-10, -10, -10]} intensity={0.4} />
          <JSONMoleculeVisualization
            molecule={molecule}
            onAtomClick={handleAtomClick}
            highlightedAtoms={highlightedAtoms}
          />
          {showControls && (
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              autoRotate={autoRotate}
              autoRotateSpeed={0.5}
              minDistance={2}
              maxDistance={20}
            />
          )}
        </Canvas>

        {/* BOTTOM HUD INSPECTOR LEFT BAR PANEL */}
        {selectedAtom && (
          <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur border rounded-lg p-3 max-w-sm shadow-md animate-in fade-in duration-150 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <h4 className="font-bold text-base mb-2 text-foreground">
              {ELEMENT_PROPERTIES[selectedAtom.atom.element]?.name || selectedAtom.atom.element}
            </h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div>
                <span className="font-medium text-foreground">Symbol:</span> {selectedAtom.atom.element}
              </div>
              <div>
                <span className="font-medium text-foreground">Atomic Number:</span>{" "}
                {ELEMENT_PROPERTIES[selectedAtom.atom.element]?.atomicNumber || "Unknown"}
              </div>
              <div>
                <span className="font-medium text-foreground">Common Valency:</span>{" "}
                {ELEMENT_PROPERTIES[selectedAtom.atom.element]?.commonValency.join(", ") || "Unknown"}
              </div>
              <div>
                <span className="font-medium text-foreground">Position:</span> [
                {selectedAtom.atom.position?.map((p) => (typeof p === "number" ? p.toFixed(2) : p)).join(", ") || "0.00, 0.00, 0.00"}]
              </div>
            </div>
            <button
              className="text-xs text-blue-500 hover:underline mt-2 font-medium block text-left"
              onClick={() => {
                setSelectedAtom(null)
                setHighlightedAtoms([])
              }}
            >
              Close Inspector
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function normalizeMoleculeData(raw: any): JSONMolecule {
  if (!raw) throw new Error("Invalid structure data")
  
  if (raw._isNormalized) return raw

  const isFlat2DLayout = (raw.atoms || []).every((atom: any) => {
    const pos = atom.position || atom.location || [0, 0, 0]
    return Number(pos[2] || 0) === 0
  })

  const normalizedAtoms = (raw.atoms || []).map((atom: any, idx: number) => {
    const rawPos = atom.position || atom.location || [0, 0, 0]
    let zCoord = Number(rawPos[2] || 0)
    
    if (isFlat2DLayout && zCoord === 0) {
      zCoord = (idx * 0.25) - 0.25
    }

    const coords: [number, number, number] = Array.isArray(rawPos) 
      ? [Number(rawPos[0] || 0), Number(rawPos[1] || 0), zCoord]
      : [0, 0, zCoord]

    return {
      element: atom.element || "X",
      position: coords,
      color: atom.color
    }
  })

  const normalizedBonds = (raw.bonds || []).map((bond: any) => {
    let calculatedType: "single" | "double" | "triple" = "single"
    const rawType = bond.type || ""
    if (bond.order === 2 || rawType === "double") calculatedType = "double"
    if (bond.order === 3 || rawType === "triple") calculatedType = "triple"

    let fromIdx = 0
    let toIdx = 0

    if (bond.atoms && Array.isArray(bond.atoms) && bond.atoms.length >= 2) {
      fromIdx = Number(bond.atoms[0])
      toIdx = Number(bond.atoms[1])
    } else {
      fromIdx = bond.from !== undefined ? Number(bond.from) : 0
      toIdx = bond.to !== undefined ? Number(bond.to) : 0
    }

    return {
      from: fromIdx,
      to: toIdx,
      type: calculatedType
    }
  })

  return {
    molecule: raw.molecule || "Unknown",
    formula: raw.formula || "",
    category: raw.category || "basic",
    description: raw.description || "",
    geometry: raw.geometry,
    bondAngles: raw.bondAngles,
    atoms: normalizedAtoms,
    bonds: normalizedBonds,
    // @ts-ignore
    _isNormalized: true
  }
}

export async function loadMoleculeFromJSON(path: string): Promise<JSONMolecule> {
  try {
    const response = await fetch(path, { cache: 'no-store' })
    if (!response.ok) {
      throw new Error(`Failed to load molecule: ${response.statusText}`)
    }
    const data = await response.json()
    return normalizeMoleculeData(data)
  } catch (error) {
    console.error("Error loading molecule:", error)
    throw error
  }
}

export async function loadMoleculesFromCategory(category: string): Promise<JSONMolecule[]> {
  const moleculeFiles: Record<string, string[]> = {
    basic: ["water.json", "methane.json", "ammonia.json", "carbon-dioxide.json"],
    organic: ["ethanol.json", "benzene.json", "glucose.json"],
    inorganic: ["sodium-chloride.json", "sulfuric-acid.json"],
    biomolecules: ["glycine.json"],
  }

  const files = moleculeFiles[category] || []
  
  const loaders = files.map(async (file) => {
    try {
      return await loadMoleculeFromJSON(`/data/molecules/${category}/${file}`)
    } catch (error) {
      console.error(`Failed to load standalone asset file ${file}:`, error)
      return null
    }
  })

  const results = await Promise.all(loaders)
  return results.filter((m): m is JSONMolecule => m !== null)
}