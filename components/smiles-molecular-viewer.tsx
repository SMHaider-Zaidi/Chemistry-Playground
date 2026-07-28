"use client"

import { useState, useMemo } from "react"
import { JSONMoleculeRenderer, type JSONMolecule } from "./json-molecule-renderer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface Atom {
  element: string
  bonds: number[]
  position: [number, number, number]
}

interface Bond {
  from: number
  to: number
  type: "single" | "double" | "triple"
}

// Simple SMILES parser
function parseSMILES(smiles: string): { atoms: Atom[]; bonds: Bond[] } {
  const atoms: Atom[] = []
  const bonds: Bond[] = []
  const stack: number[] = []
  let i = 0

  while (i < smiles.length) {
    const char = smiles[i]

    if (char === "(") {
      stack.push(atoms.length - 1)
      i++
    } else if (char === ")") {
      stack.pop()
      i++
    } else if (char === "=") {
      // Double bond
      const lastAtom = atoms.length - 1
      if (lastAtom >= 0 && bonds.length > 0) {
        const lastBond = bonds[bonds.length - 1]
        lastBond.type = "double"
      }
      i++
    } else if (char === "#") {
      // Triple bond
      const lastAtom = atoms.length - 1
      if (lastAtom >= 0 && bonds.length > 0) {
        const lastBond = bonds[bonds.length - 1]
        lastBond.type = "triple"
      }
      i++
    } else if (/[A-Z]/.test(char)) {
      // Element symbol
      let element = char
      if (i + 1 < smiles.length && /[a-z]/.test(smiles[i + 1])) {
        element += smiles[i + 1]
        i++
      }

      const newAtomIndex = atoms.length
      atoms.push({
        element,
        bonds: [],
        position: [0, 0, 0],
      })

      // Create bond to previous atom
      if (newAtomIndex > 0) {
        const prevAtomIndex = stack.length > 0 ? stack[stack.length - 1] : newAtomIndex - 1
        bonds.push({
          from: prevAtomIndex,
          to: newAtomIndex,
          type: "single",
        })
        atoms[prevAtomIndex].bonds.push(newAtomIndex)
        atoms[newAtomIndex].bonds.push(prevAtomIndex)
      }

      i++
    } else if (/\d/.test(char)) {
      // Digit (skip for now, simplified parser)
      i++
    } else {
      i++
    }
  }

  return { atoms, bonds }
}

// Generate 3D coordinates using a simple algorithm
function generate3DCoordinates(atoms: Atom[], bonds: Bond[]): Atom[] {
  const positions: [number, number, number][] = atoms.map(() => [0, 0, 0])

  // Place first atom at origin
  if (atoms.length > 0) {
    positions[0] = [0, 0, 0]
  }

  // Use a simple spring-like algorithm to position atoms
  for (let iteration = 0; iteration < 50; iteration++) {
    for (let i = 0; i < atoms.length; i++) {
      let fx = 0,
        fy = 0,
        fz = 0

      // Repulsive forces from all other atoms
      for (let j = 0; j < atoms.length; j++) {
        if (i !== j) {
          const dx = positions[i][0] - positions[j][0]
          const dy = positions[i][1] - positions[j][1]
          const dz = positions[i][2] - positions[j][2]
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.1
          const force = 0.5 / (dist * dist)
          fx += (force * dx) / dist
          fy += (force * dy) / dist
          fz += (force * dz) / dist
        }
      }

      // Attractive forces from bonded atoms
      for (const bondedIndex of atoms[i].bonds) {
        const dx = positions[bondedIndex][0] - positions[i][0]
        const dy = positions[bondedIndex][1] - positions[i][1]
        const dz = positions[bondedIndex][2] - positions[i][2]
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.1
        const targetDist = 1.5
        const force = 0.1 * (dist - targetDist)
        fx += (force * dx) / dist
        fy += (force * dy) / dist
        fz += (force * dz) / dist
      }

      // Update position
      const damping = 0.9
      positions[i][0] += fx * damping * 0.01
      positions[i][1] += fy * damping * 0.01
      positions[i][2] += fz * damping * 0.01
    }
  }

  return atoms.map((atom, i) => ({
    ...atom,
    position: positions[i],
  }))
}

export function SMILESMolecularViewer({ initialSmiles = "CCO" }: { initialSmiles?: string }) {
  const [smiles, setSmiles] = useState(initialSmiles)
  const [inputValue, setInputValue] = useState(initialSmiles)

  const molecule = useMemo<JSONMolecule | null>(() => {
    try {
      const { atoms: parsedAtoms, bonds } = parseSMILES(smiles)

      if (parsedAtoms.length === 0) {
        return null
      }

      const atomsWithCoords = generate3DCoordinates(parsedAtoms, bonds)

      // Calculate molecular formula
      const formulaMap: Record<string, number> = {}
      atomsWithCoords.forEach((atom) => {
        formulaMap[atom.element] = (formulaMap[atom.element] || 0) + 1
      })

      const formula = Object.entries(formulaMap)
        .sort(([a], [b]) => {
          if (a === "C") return -1
          if (b === "C") return 1
          if (a === "H") return -1
          if (b === "H") return 1
          return a.localeCompare(b)
        })
        .map(([element, count]) => `${element}${count > 1 ? count : ""}`)
        .join("")

      return {
        molecule: `SMILES: ${smiles}`,
        formula,
        description: `Molecule from SMILES string: ${smiles}`,
        category: "custom",
        atoms: atomsWithCoords.map((atom) => ({
          element: atom.element,
          position: atom.position,
        })),
        bonds: bonds,
      }
    } catch (error) {
      console.error("Error parsing SMILES:", error)
      return null
    }
  }, [smiles])

  const handleParse = () => {
    setSmiles(inputValue)
  }

  return (
    <div className="w-full space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">SMILES Molecular Viewer</CardTitle>
          <CardDescription>Enter a SMILES string to visualize molecules</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter SMILES string (e.g., CCO for ethanol)"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleParse()
                }
              }}
            />
            <Button onClick={handleParse}>Parse</Button>
          </div>

          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              <strong>Examples:</strong>
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setInputValue("CCO")
                  setSmiles("CCO")
                }}
                className="text-left hover:text-primary underline"
              >
                CCO (Ethanol)
              </button>
              <button
                onClick={() => {
                  setInputValue("CC(C)C")
                  setSmiles("CC(C)C")
                }}
                className="text-left hover:text-primary underline"
              >
                CC(C)C (Isobutane)
              </button>
              <button
                onClick={() => {
                  setInputValue("c1ccccc1")
                  setSmiles("c1ccccc1")
                }}
                className="text-left hover:text-primary underline"
              >
                c1ccccc1 (Benzene)
              </button>
              <button
                onClick={() => {
                  setInputValue("CC(=O)O")
                  setSmiles("CC(=O)O")
                }}
                className="text-left hover:text-primary underline"
              >
                CC(=O)O (Acetic Acid)
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {molecule ? (
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">3D Visualization</CardTitle>
          </CardHeader>
          <CardContent>
            <JSONMoleculeRenderer molecule={molecule} height={500} autoRotate={true} />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center h-96">
            <p className="text-muted-foreground">Enter a valid SMILES string to visualize</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
