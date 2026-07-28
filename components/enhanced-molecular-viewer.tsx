"use client"

import { useRef, useState, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Html } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RotateCcw, Info, Search, Zap } from "lucide-react"
import * as THREE from "three"

// Enhanced molecular data structures
interface EnhancedAtom {
  element: string
  position: [number, number, number]
  color: string
  size: number
  hybridization?: string
  formalCharge?: number
  electronegativity?: number
}

interface Bond {
  from: number
  to: number
  type: "single" | "double" | "triple" | "aromatic"
  length: number
  angle?: number
}

interface MolecularProperties {
  iupacName: string
  formula: string
  molecularMass: number
  polarity: "polar" | "nonpolar"
  geometry: string
  bondAngles: number[]
  dipoleMoment?: number
  boilingPoint?: number
  meltingPoint?: number
  solubility: string
  uses: string[]
  hazards?: string[]
}

interface EnhancedMolecule {
  id: string
  name: string
  category: "basic" | "organic" | "inorganic" | "biomolecule"
  difficulty: "beginner" | "intermediate" | "advanced"
  properties: MolecularProperties
  atoms: EnhancedAtom[]
  bonds: Bond[]
  description: string
}

const enhancedMolecules: EnhancedMolecule[] = [
  // Basic Molecules
  {
    id: "water",
    name: "Water",
    category: "basic",
    difficulty: "beginner",
    properties: {
      iupacName: "Water",
      formula: "H₂O",
      molecularMass: 18.015,
      polarity: "polar",
      geometry: "Bent",
      bondAngles: [104.5],
      dipoleMoment: 1.85,
      boilingPoint: 100,
      meltingPoint: 0,
      solubility: "Universal solvent",
      uses: ["Essential for life", "Solvent", "Chemical reactions"],
      hazards: ["None at normal conditions"],
    },
    atoms: [
      { element: "O", position: [0, 0, 0], color: "#ff0000", size: 0.8, hybridization: "sp³", electronegativity: 3.44 },
      { element: "H", position: [0.96, 0.76, 0], color: "#ffffff", size: 0.4, electronegativity: 2.2 },
      { element: "H", position: [-0.96, 0.76, 0], color: "#ffffff", size: 0.4, electronegativity: 2.2 },
    ],
    bonds: [
      { from: 0, to: 1, type: "single", length: 0.96, angle: 104.5 },
      { from: 0, to: 2, type: "single", length: 0.96, angle: 104.5 },
    ],
    description: "The most essential compound for life, featuring bent molecular geometry due to lone pairs on oxygen.",
  },
  {
    id: "methane",
    name: "Methane",
    category: "basic",
    difficulty: "beginner",
    properties: {
      iupacName: "Methane",
      formula: "CH₄",
      molecularMass: 16.043,
      polarity: "nonpolar",
      geometry: "Tetrahedral",
      bondAngles: [109.5],
      boilingPoint: -161.5,
      meltingPoint: -182.5,
      solubility: "Insoluble in water",
      uses: ["Natural gas", "Fuel", "Chemical feedstock"],
      hazards: ["Flammable", "Asphyxiant"],
    },
    atoms: [
      { element: "C", position: [0, 0, 0], color: "#404040", size: 0.7, hybridization: "sp³", electronegativity: 2.55 },
      { element: "H", position: [1.09, 1.09, 1.09], color: "#ffffff", size: 0.4, electronegativity: 2.2 },
      { element: "H", position: [-1.09, -1.09, 1.09], color: "#ffffff", size: 0.4, electronegativity: 2.2 },
      { element: "H", position: [-1.09, 1.09, -1.09], color: "#ffffff", size: 0.4, electronegativity: 2.2 },
      { element: "H", position: [1.09, -1.09, -1.09], color: "#ffffff", size: 0.4, electronegativity: 2.2 },
    ],
    bonds: [
      { from: 0, to: 1, type: "single", length: 1.09, angle: 109.5 },
      { from: 0, to: 2, type: "single", length: 1.09, angle: 109.5 },
      { from: 0, to: 3, type: "single", length: 1.09, angle: 109.5 },
      { from: 0, to: 4, type: "single", length: 1.09, angle: 109.5 },
    ],
    description: "The simplest hydrocarbon with perfect tetrahedral geometry and sp³ hybridization.",
  },
  // Organic Molecules
  {
    id: "ethanol",
    name: "Ethanol",
    category: "organic",
    difficulty: "intermediate",
    properties: {
      iupacName: "Ethanol",
      formula: "C₂H₅OH",
      molecularMass: 46.069,
      polarity: "polar",
      geometry: "Mixed (tetrahedral carbons, bent at oxygen)",
      bondAngles: [109.5, 104.5],
      boilingPoint: 78.4,
      meltingPoint: -114.1,
      solubility: "Miscible with water",
      uses: ["Alcoholic beverages", "Fuel additive", "Solvent", "Antiseptic"],
      hazards: ["Flammable", "Toxic in large quantities"],
    },
    atoms: [
      { element: "C", position: [-1.2, 0, 0], color: "#404040", size: 0.7, hybridization: "sp³" },
      { element: "C", position: [0, 0, 0], color: "#404040", size: 0.7, hybridization: "sp³" },
      { element: "O", position: [1.4, 0, 0], color: "#ff0000", size: 0.8, hybridization: "sp³" },
      { element: "H", position: [2.0, 0.8, 0], color: "#ffffff", size: 0.4 },
      { element: "H", position: [-1.8, 0.9, 0.9], color: "#ffffff", size: 0.4 },
      { element: "H", position: [-1.8, -0.9, 0.9], color: "#ffffff", size: 0.4 },
      { element: "H", position: [-1.8, 0, -1.8], color: "#ffffff", size: 0.4 },
      { element: "H", position: [0, 0.9, 0.9], color: "#ffffff", size: 0.4 },
      { element: "H", position: [0, -0.9, 0.9], color: "#ffffff", size: 0.4 },
    ],
    bonds: [
      { from: 0, to: 1, type: "single", length: 1.54 },
      { from: 1, to: 2, type: "single", length: 1.43 },
      { from: 2, to: 3, type: "single", length: 0.96 },
      { from: 0, to: 4, type: "single", length: 1.09 },
      { from: 0, to: 5, type: "single", length: 1.09 },
      { from: 0, to: 6, type: "single", length: 1.09 },
      { from: 1, to: 7, type: "single", length: 1.09 },
      { from: 1, to: 8, type: "single", length: 1.09 },
    ],
    description: "A simple alcohol with both hydrophobic and hydrophilic regions, making it miscible with water.",
  },
  {
    id: "benzene",
    name: "Benzene",
    category: "organic",
    difficulty: "advanced",
    properties: {
      iupacName: "Benzene",
      formula: "C₆H₆",
      molecularMass: 78.114,
      polarity: "nonpolar",
      geometry: "Planar hexagonal",
      bondAngles: [120],
      boilingPoint: 80.1,
      meltingPoint: 5.5,
      solubility: "Slightly soluble in water",
      uses: ["Chemical intermediate", "Solvent", "Gasoline additive"],
      hazards: ["Carcinogenic", "Flammable", "Toxic"],
    },
    atoms: [
      { element: "C", position: [1.4, 0, 0], color: "#404040", size: 0.7, hybridization: "sp²" },
      { element: "C", position: [0.7, 1.21, 0], color: "#404040", size: 0.7, hybridization: "sp²" },
      { element: "C", position: [-0.7, 1.21, 0], color: "#404040", size: 0.7, hybridization: "sp²" },
      { element: "C", position: [-1.4, 0, 0], color: "#404040", size: 0.7, hybridization: "sp²" },
      { element: "C", position: [-0.7, -1.21, 0], color: "#404040", size: 0.7, hybridization: "sp²" },
      { element: "C", position: [0.7, -1.21, 0], color: "#404040", size: 0.7, hybridization: "sp²" },
      { element: "H", position: [2.48, 0, 0], color: "#ffffff", size: 0.4 },
      { element: "H", position: [1.24, 2.15, 0], color: "#ffffff", size: 0.4 },
      { element: "H", position: [-1.24, 2.15, 0], color: "#ffffff", size: 0.4 },
      { element: "H", position: [-2.48, 0, 0], color: "#ffffff", size: 0.4 },
      { element: "H", position: [-1.24, -2.15, 0], color: "#ffffff", size: 0.4 },
      { element: "H", position: [1.24, -2.15, 0], color: "#ffffff", size: 0.4 },
    ],
    bonds: [
      { from: 0, to: 1, type: "aromatic", length: 1.39 },
      { from: 1, to: 2, type: "aromatic", length: 1.39 },
      { from: 2, to: 3, type: "aromatic", length: 1.39 },
      { from: 3, to: 4, type: "aromatic", length: 1.39 },
      { from: 4, to: 5, type: "aromatic", length: 1.39 },
      { from: 5, to: 0, type: "aromatic", length: 1.39 },
      { from: 0, to: 6, type: "single", length: 1.08 },
      { from: 1, to: 7, type: "single", length: 1.08 },
      { from: 2, to: 8, type: "single", length: 1.08 },
      { from: 3, to: 9, type: "single", length: 1.08 },
      { from: 4, to: 10, type: "single", length: 1.08 },
      { from: 5, to: 11, type: "single", length: 1.08 },
    ],
    description: "The archetypal aromatic compound with delocalized π electrons forming a stable ring system.",
  },
  // Biomolecules
  {
    id: "glucose",
    name: "Glucose",
    category: "biomolecule",
    difficulty: "advanced",
    properties: {
      iupacName: "(2R,3S,4R,5R)-2,3,4,5,6-pentahydroxyhexanal",
      formula: "C₆H₁₂O₆",
      molecularMass: 180.156,
      polarity: "polar",
      geometry: "Chair conformation (cyclic form)",
      bondAngles: [109.5],
      meltingPoint: 146,
      solubility: "Highly soluble in water",
      uses: ["Energy source", "Metabolic intermediate", "Food additive"],
      hazards: ["Generally safe"],
    },
    atoms: [
      // Simplified glucose ring structure
      { element: "C", position: [1.4, 0, 0.5], color: "#404040", size: 0.7, hybridization: "sp³" },
      { element: "C", position: [0.7, 1.21, -0.5], color: "#404040", size: 0.7, hybridization: "sp³" },
      { element: "C", position: [-0.7, 1.21, -0.5], color: "#404040", size: 0.7, hybridization: "sp³" },
      { element: "C", position: [-1.4, 0, 0.5], color: "#404040", size: 0.7, hybridization: "sp³" },
      { element: "C", position: [-0.7, -1.21, 0.5], color: "#404040", size: 0.7, hybridization: "sp³" },
      { element: "O", position: [0.7, -1.21, -0.5], color: "#ff0000", size: 0.8, hybridization: "sp³" },
      // OH groups
      { element: "O", position: [2.8, 0, 0.5], color: "#ff0000", size: 0.8 },
      { element: "H", position: [3.4, 0.8, 0.5], color: "#ffffff", size: 0.4 },
      { element: "O", position: [1.4, 2.42, -0.5], color: "#ff0000", size: 0.8 },
      { element: "H", position: [2.0, 3.0, -0.5], color: "#ffffff", size: 0.4 },
    ],
    bonds: [
      { from: 0, to: 1, type: "single", length: 1.54 },
      { from: 1, to: 2, type: "single", length: 1.54 },
      { from: 2, to: 3, type: "single", length: 1.54 },
      { from: 3, to: 4, type: "single", length: 1.54 },
      { from: 4, to: 5, type: "single", length: 1.43 },
      { from: 5, to: 0, type: "single", length: 1.43 },
      { from: 0, to: 6, type: "single", length: 1.43 },
      { from: 6, to: 7, type: "single", length: 0.96 },
      { from: 1, to: 8, type: "single", length: 1.43 },
      { from: 8, to: 9, type: "single", length: 0.96 },
    ],
    description: "The primary energy source for cellular metabolism, existing in both linear and cyclic forms.",
  },
  // Inorganic Molecules
  {
    id: "sulfuric-acid",
    name: "Sulfuric Acid",
    category: "inorganic",
    difficulty: "intermediate",
    properties: {
      iupacName: "Sulfuric acid",
      formula: "H₂SO₄",
      molecularMass: 98.079,
      polarity: "polar",
      geometry: "Tetrahedral around sulfur",
      bondAngles: [109.5],
      boilingPoint: 337,
      meltingPoint: 10,
      solubility: "Miscible with water (highly exothermic)",
      uses: ["Industrial acid", "Battery acid", "Chemical synthesis"],
      hazards: ["Highly corrosive", "Dehydrating agent", "Toxic"],
    },
    atoms: [
      { element: "S", position: [0, 0, 0], color: "#ffff00", size: 0.9, hybridization: "sp³" },
      { element: "O", position: [1.5, 0, 0], color: "#ff0000", size: 0.8 },
      { element: "O", position: [-1.5, 0, 0], color: "#ff0000", size: 0.8 },
      { element: "O", position: [0, 1.5, 0], color: "#ff0000", size: 0.8 },
      { element: "O", position: [0, -1.5, 0], color: "#ff0000", size: 0.8 },
      { element: "H", position: [2.3, 0.8, 0], color: "#ffffff", size: 0.4 },
      { element: "H", position: [-2.3, 0.8, 0], color: "#ffffff", size: 0.4 },
    ],
    bonds: [
      { from: 0, to: 1, type: "single", length: 1.57 },
      { from: 0, to: 2, type: "single", length: 1.57 },
      { from: 0, to: 3, type: "double", length: 1.43 },
      { from: 0, to: 4, type: "double", length: 1.43 },
      { from: 1, to: 5, type: "single", length: 0.96 },
      { from: 2, to: 6, type: "single", length: 0.96 },
    ],
    description:
      "One of the most important industrial chemicals, featuring a tetrahedral sulfur center with mixed single and double bonds.",
  },
]

function EnhancedAtomSphere({
  atom,
  onClick,
  isSelected,
}: { atom: EnhancedAtom; onClick: () => void; isSelected: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (meshRef.current) {
      if (isSelected) {
        meshRef.current.scale.setScalar(1.2 + Math.sin(state.clock.elapsedTime * 4) * 0.1)
      } else if (hovered) {
        meshRef.current.scale.setScalar(1.1 + Math.sin(state.clock.elapsedTime * 3) * 0.05)
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
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[atom.size, 32, 32]} />
        <meshStandardMaterial
          color={atom.color}
          metalness={0.1}
          roughness={0.3}
          emissive={isSelected ? atom.color : "#000000"}
          emissiveIntensity={isSelected ? 0.2 : 0}
        />
      </mesh>
      {(hovered || isSelected) && (
        <Html distanceFactor={10}>
          <div className="bg-card border rounded px-3 py-2 text-xs font-medium shadow-lg min-w-32">
            <div className="font-bold">{atom.element}</div>
            {atom.hybridization && <div>Hybridization: {atom.hybridization}</div>}
            {atom.electronegativity && <div>EN: {atom.electronegativity}</div>}
            {atom.formalCharge && (
              <div>
                Charge: {atom.formalCharge > 0 ? "+" : ""}
                {atom.formalCharge}
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  )
}

function EnhancedBond({
  from,
  to,
  atoms,
  type,
  length,
}: { from: number; to: number; atoms: EnhancedAtom[]; type: string; length: number }) {
  const fromPos = new THREE.Vector3(...atoms[from].position)
  const toPos = new THREE.Vector3(...atoms[to].position)
  const direction = new THREE.Vector3().subVectors(toPos, fromPos)
  const bondLength = direction.length()
  const midpoint = new THREE.Vector3().addVectors(fromPos, toPos).multiplyScalar(0.5)

  const getBondVisualization = () => {
    switch (type) {
      case "single":
        return [{ offset: 0, color: "#666666" }]
      case "double":
        return [
          { offset: 0.15, color: "#666666" },
          { offset: -0.15, color: "#666666" },
        ]
      case "triple":
        return [
          { offset: 0, color: "#666666" },
          { offset: 0.2, color: "#666666" },
          { offset: -0.2, color: "#666666" },
        ]
      case "aromatic":
        return [{ offset: 0, color: "#8B5CF6" }]
      default:
        return [{ offset: 0, color: "#666666" }]
    }
  }

  const bonds = getBondVisualization()

  return (
    <group>
      {bonds.map((bond, i) => {
        const perpendicular = new THREE.Vector3(0, 1, 0).cross(direction).normalize().multiplyScalar(bond.offset)
        const bondPosition = midpoint.clone().add(perpendicular)

        return (
          <mesh key={i} position={bondPosition.toArray()} lookAt={toPos.toArray()}>
            <cylinderGeometry
              args={[type === "aromatic" ? 0.08 : 0.05, type === "aromatic" ? 0.08 : 0.05, bondLength, 8]}
            />
            <meshStandardMaterial color={bond.color} metalness={type === "aromatic" ? 0.3 : 0.1} roughness={0.4} />
          </mesh>
        )
      })}
    </group>
  )
}

function EnhancedMoleculeVisualization({ molecule }: { molecule: EnhancedMolecule }) {
  const [selectedAtom, setSelectedAtom] = useState<number | null>(null)

  return (
    <>
      {molecule.atoms.map((atom, index) => (
        <EnhancedAtomSphere
          key={index}
          atom={atom}
          onClick={() => setSelectedAtom(selectedAtom === index ? null : index)}
          isSelected={selectedAtom === index}
        />
      ))}
      {molecule.bonds.map((bond, index) => (
        <EnhancedBond
          key={index}
          from={bond.from}
          to={bond.to}
          atoms={molecule.atoms}
          type={bond.type}
          length={bond.length}
        />
      ))}
      {selectedAtom !== null && (
        <Html position={molecule.atoms[selectedAtom].position}>
          <div className="bg-card border rounded p-3 text-sm shadow-lg max-w-xs">
            <div className="font-semibold text-lg">{molecule.atoms[selectedAtom].element}</div>
            <div className="space-y-1 text-xs text-muted-foreground">
              {molecule.atoms[selectedAtom].hybridization && (
                <div>Hybridization: {molecule.atoms[selectedAtom].hybridization}</div>
              )}
              {molecule.atoms[selectedAtom].electronegativity && (
                <div>Electronegativity: {molecule.atoms[selectedAtom].electronegativity}</div>
              )}
              <div className="text-xs text-muted-foreground mt-2">Click again to close</div>
            </div>
          </div>
        </Html>
      )}
    </>
  )
}

export function EnhancedMolecularViewer() {
  const [currentMolecule, setCurrentMolecule] = useState(enhancedMolecules[0])
  const [autoRotate, setAutoRotate] = useState(true)
  const [showInfo, setShowInfo] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all")

  const filteredMolecules = useMemo(() => {
    return enhancedMolecules.filter((molecule) => {
      const matchesSearch =
        molecule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        molecule.properties.formula.toLowerCase().includes(searchTerm.toLowerCase()) ||
        molecule.properties.iupacName.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = categoryFilter === "all" || molecule.category === categoryFilter
      const matchesDifficulty = difficultyFilter === "all" || molecule.difficulty === difficultyFilter

      return matchesSearch && matchesCategory && matchesDifficulty
    })
  }, [searchTerm, categoryFilter, difficultyFilter])

  return (
    <div className="w-full">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Enhanced 3D Viewer */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-serif">Enhanced 3D Molecular Viewer</CardTitle>
                  <CardDescription>Explore molecules with realistic bond angles and properties</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAutoRotate(!autoRotate)}
                    className={autoRotate ? "bg-primary text-primary-foreground" : ""}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowInfo(!showInfo)}>
                    <Info className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative w-full h-96 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-lg overflow-hidden">
                <Canvas camera={{ position: [8, 8, 8], fov: 50 }}>
                  <ambientLight intensity={0.4} />
                  <pointLight position={[10, 10, 10]} intensity={1} />
                  <pointLight position={[-10, -10, -10]} intensity={0.5} />
                  <pointLight position={[0, 10, -10]} intensity={0.3} />
                  <EnhancedMoleculeVisualization molecule={currentMolecule} />
                  <OrbitControls
                    enablePan={true}
                    enableZoom={true}
                    enableRotate={true}
                    autoRotate={autoRotate}
                    autoRotateSpeed={0.5}
                    minDistance={3}
                    maxDistance={20}
                  />
                </Canvas>
                {showInfo && (
                  <div className="absolute top-4 left-4 bg-card/95 backdrop-blur border rounded-lg p-4 max-w-sm">
                    <h4 className="font-semibold text-sm mb-2">{currentMolecule.name}</h4>
                    <div className="space-y-1 text-xs">
                      <div>
                        <span className="font-medium">Formula:</span> {currentMolecule.properties.formula}
                      </div>
                      <div>
                        <span className="font-medium">Geometry:</span> {currentMolecule.properties.geometry}
                      </div>
                      <div>
                        <span className="font-medium">Polarity:</span> {currentMolecule.properties.polarity}
                      </div>
                      <div>
                        <span className="font-medium">Mass:</span> {currentMolecule.properties.molecularMass} g/mol
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Molecular Properties Panel */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="font-serif flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Molecular Properties
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Basic</TabsTrigger>
                  <TabsTrigger value="structure">Structure</TabsTrigger>
                  <TabsTrigger value="physical">Physical</TabsTrigger>
                  <TabsTrigger value="uses">Uses</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">IUPAC Name:</span>
                      <div className="text-muted-foreground">{currentMolecule.properties.iupacName}</div>
                    </div>
                    <div>
                      <span className="font-medium">Molecular Formula:</span>
                      <div className="text-muted-foreground font-mono">{currentMolecule.properties.formula}</div>
                    </div>
                    <div>
                      <span className="font-medium">Molecular Mass:</span>
                      <div className="text-muted-foreground">{currentMolecule.properties.molecularMass} g/mol</div>
                    </div>
                    <div>
                      <span className="font-medium">Polarity:</span>
                      <Badge variant={currentMolecule.properties.polarity === "polar" ? "default" : "secondary"}>
                        {currentMolecule.properties.polarity}
                      </Badge>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="structure" className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Geometry:</span>
                      <div className="text-muted-foreground">{currentMolecule.properties.geometry}</div>
                    </div>
                    <div>
                      <span className="font-medium">Bond Angles:</span>
                      <div className="text-muted-foreground">{currentMolecule.properties.bondAngles.join(", ")}°</div>
                    </div>
                    {currentMolecule.properties.dipoleMoment && (
                      <div>
                        <span className="font-medium">Dipole Moment:</span>
                        <div className="text-muted-foreground">{currentMolecule.properties.dipoleMoment} D</div>
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Atoms:</span>
                      <div className="text-muted-foreground">{currentMolecule.atoms.length}</div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="physical" className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {currentMolecule.properties.boilingPoint && (
                      <div>
                        <span className="font-medium">Boiling Point:</span>
                        <div className="text-muted-foreground">{currentMolecule.properties.boilingPoint}°C</div>
                      </div>
                    )}
                    {currentMolecule.properties.meltingPoint && (
                      <div>
                        <span className="font-medium">Melting Point:</span>
                        <div className="text-muted-foreground">{currentMolecule.properties.meltingPoint}°C</div>
                      </div>
                    )}
                    <div className="col-span-2">
                      <span className="font-medium">Solubility:</span>
                      <div className="text-muted-foreground">{currentMolecule.properties.solubility}</div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="uses" className="space-y-3">
                  <div>
                    <span className="font-medium text-sm">Common Uses:</span>
                    <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
                      {currentMolecule.properties.uses.map((use, index) => (
                        <li key={index}>{use}</li>
                      ))}
                    </ul>
                  </div>
                  {currentMolecule.properties.hazards && (
                    <div>
                      <span className="font-medium text-sm text-orange-600">Safety Hazards:</span>
                      <ul className="list-disc list-inside text-sm text-orange-600 mt-2 space-y-1">
                        {currentMolecule.properties.hazards.map((hazard, index) => (
                          <li key={index}>{hazard}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Molecule Selection with Search and Filters */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif flex items-center gap-2">
                <Search className="h-5 w-5" />
                Molecule Library
              </CardTitle>
              <CardDescription>Search and filter from our extensive collection</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Input
                  placeholder="Search molecules..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />

                <div className="grid grid-cols-2 gap-2">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="organic">Organic</SelectItem>
                      <SelectItem value="inorganic">Inorganic</SelectItem>
                      <SelectItem value="biomolecule">Biomolecules</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredMolecules.map((molecule) => (
                  <div
                    key={molecule.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      currentMolecule.id === molecule.id
                        ? "bg-primary/10 border-primary"
                        : "hover:bg-muted/50 border-border"
                    }`}
                    onClick={() => setCurrentMolecule(molecule)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-sm">{molecule.name}</h4>
                      <div className="flex gap-1">
                        <Badge variant="outline" className="text-xs">
                          {molecule.properties.formula}
                        </Badge>
                        <Badge
                          variant={
                            molecule.category === "basic"
                              ? "default"
                              : molecule.category === "organic"
                                ? "secondary"
                                : molecule.category === "inorganic"
                                  ? "destructive"
                                  : "outline"
                          }
                          className="text-xs"
                        >
                          {molecule.category}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{molecule.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">{molecule.properties.geometry}</span>
                      <Badge
                        variant={
                          molecule.difficulty === "beginner"
                            ? "default"
                            : molecule.difficulty === "intermediate"
                              ? "secondary"
                              : "destructive"
                        }
                        className="text-xs"
                      >
                        {molecule.difficulty}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-sm">Enhanced Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              <div>
                • <strong>Rotate:</strong> Click and drag
              </div>
              <div>
                • <strong>Zoom:</strong> Scroll wheel
              </div>
              <div>
                • <strong>Pan:</strong> Right-click and drag
              </div>
              <div>
                • <strong>Select Atom:</strong> Click on atoms
              </div>
              <div>
                • <strong>Bond Types:</strong> Single, double, triple, aromatic
              </div>
              <div>
                • <strong>Properties:</strong> Hover for quick info
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
