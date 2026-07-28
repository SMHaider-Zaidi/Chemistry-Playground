"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Search, Loader2 } from "lucide-react"
import { JSONMoleculeRenderer, type JSONMolecule, loadMoleculesFromCategory } from "./json-molecule-renderer"

export function MolecularViewer() {
  const [molecules, setMolecules] = useState<Record<string, JSONMolecule[]>>({
    basic: [],
    organic: [],
    inorganic: [],
    biomolecules: [],
  })
  const [currentMolecule, setCurrentMolecule] = useState<JSONMolecule | null>(null)
  const [currentCategory, setCurrentCategory] = useState("basic")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [searchingApi, setSearchingApi] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  useEffect(() => {
    const loadAllMolecules = async () => {
      setLoading(true)
      try {
        const categories = ["basic", "organic", "inorganic", "biomolecules"]
        const moleculeData: Record<string, JSONMolecule[]> = {
          basic: [],
          organic: [],
          inorganic: [],
          biomolecules: [],
        }

        for (const category of categories) {
          const data = await loadMoleculesFromCategory(category)
          moleculeData[category] = data || []
        }

        setMolecules(moleculeData)

        if (moleculeData.basic && moleculeData.basic.length > 0) {
          setCurrentMolecule(moleculeData.basic[0])
        }
      } catch (error) {
        console.error("Failed to load local mockup molecules:", error)
      } finally {
        setLoading(false)
      }
    }

    loadAllMolecules()
  }, [])

  const getFilteredMolecules = (category: string) => {
    const categoryMolecules = molecules[category] || []
    if (!searchTerm) return categoryMolecules

    return categoryMolecules.filter(
      (mol) =>
        mol.molecule.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mol.formula.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }

  const handleLiveApiSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchTerm.trim()) return

    setSearchingApi(true)
    setApiError(null)

    const normalSearch = searchTerm.toLowerCase().trim()

    for (const cat of Object.keys(molecules)) {
      const existing = molecules[cat].find((m) => m.molecule.toLowerCase() === normalSearch)
      if (existing) {
        setCurrentMolecule(existing)
        setCurrentCategory(cat)
        setSearchingApi(false)
        return
      }
    }

    try {
      const response = await fetch(`/api/molecules/${encodeURIComponent(normalSearch)}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || "SERVER_ERROR")
      }

      const fetchedMolecule: JSONMolecule = data
      const targetCat = fetchedMolecule.category || "basic"

      setMolecules((prev) => ({
        ...prev,
        [targetCat]: [...(prev[targetCat] || []), fetchedMolecule],
      }))

      setCurrentMolecule(fetchedMolecule)
      setCurrentCategory(targetCat)
      setApiError(null)
    } catch (err: any) {
      console.error("Live API Fetch Fault:", err)
      setApiError(err.message || "SERVER_ERROR")
    } finally {
      setSearchingApi(false)
    }
  }

  const handleAtomClick = (atomIndex: number, atom: JSONMolecule["atoms"][0]) => {
    console.log(`Clicked atom ${atomIndex}:`, atom)
  }

  if (loading) {
    return (
      <div className="w-full">
        <Card>
          <CardContent className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading interactive molecular lab space...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Left Layout Container */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Card className="h-full flex flex-col justify-between">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-serif text-2xl">3D Molecular Viewer</CardTitle>
                  <CardDescription>
                    {currentMolecule 
                      ? `Visualizing spatial atomic geometry for ${currentMolecule.molecule}`
                      : "Interact with structures synchronizing live through database and PubChem pipelines"
                    }
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col relative min-h-[400px] gap-4">
              
              {currentMolecule && (
                /* Vertical bullet info list */
                <div className="text-sm space-y-1 text-slate-700 px-6 pt-2">
                  <div>• <b>Formula:</b> {currentMolecule.formula}</div>
                  <div>• <b>Geometry:</b> {currentMolecule.geometry || "Determining..."}</div>
                  <div>• <b>Bond Angles:</b> {currentMolecule.bondAngles || "Determining..."}</div>
                  <div>• <b>Atoms:</b> {currentMolecule.atoms.length}</div>
                  <div>• <b>Bonds:</b> {currentMolecule.bonds.length}</div>
                </div>
              )}

              {currentMolecule ? (
                /* 3D View Render Window — white info card hidden via CSS */
                <div className="flex-1 w-full px-6 pb-6">
                  <style>{`
                    .molecule-renderer-wrapper > div > div:first-child {
                      display: none !important;
                    }
                  `}</style>
                  <div className="molecule-renderer-wrapper">
                    <JSONMoleculeRenderer
                      molecule={currentMolecule}
                      height={450}
                      autoRotate={true}
                      onAtomClick={handleAtomClick}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center m-6 bg-muted/20 rounded-lg border-2 border-dashed">
                  <p className="text-muted-foreground">Select a compound item or type above to pull spatial structures</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Selection Panel Sidebar */}
        <div>
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="font-serif">Search & Library</CardTitle>
              <CardDescription>Query database caching layer or register live PubChem configurations</CardDescription>

              <form onSubmit={handleLiveApiSearch} className="space-y-2 mt-2">
                <div className="relative flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search or fetch compound..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Button type="submit" disabled={searchingApi || !searchTerm.trim()} className="px-3">
                    {searchingApi ? <Loader2 className="h-4 w-4 animate-spin" /> : "Fetch"}
                  </Button>
                </div>

                {apiError && (
                  <div className="my-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-4 h-4 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <h3 className="font-bold text-red-900 text-sm">
                        {apiError === "NOT_FOUND" ? "Structure Resolution Failed" : "Data Mapping Issue"}
                      </h3>
                    </div>
                    <p className="text-xs text-red-700 mb-2 leading-normal">
                      The active database could not map this entry. Review the troubleshooting steps below:
                    </p>
                    <ul className="space-y-1.5 text-xs text-red-700 list-disc pl-4 font-medium leading-normal">
                      <li>
                        <span className="font-bold text-red-900">Check spelling details:</span> Verify chemical suffixes or numerical configurations precisely (e.g., use <span className="italic">"dioxide"</span> instead of <span className="italic">"dioxyd"</span>).
                      </li>
                      <li>
                        <span className="font-bold text-red-900">Avoid common household names:</span> Do not input everyday mixed products or brand names such as <span className="italic">"baking powder"</span>, <span className="italic">"bleach"</span>, or <span className="italic">"rust"</span>.
                      </li>
                      <li>
                        <span className="font-bold text-red-900">Use proper chemical nomenclature:</span> Explicitly type strict textbook formulas or scientific terms like <span className="italic">"sodium bicarbonate"</span>, <span className="italic">"sodium hypochlorite"</span>, or <span className="italic">"iron iii oxide"</span>.
                      </li>
                    </ul>
                  </div>
                )}
              </form>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              <Tabs value={currentCategory} onValueChange={setCurrentCategory}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">Basic</TabsTrigger>
                  <TabsTrigger value="organic">Organic</TabsTrigger>
                </TabsList>
                <TabsList className="grid w-full grid-cols-2 mt-2">
                  <TabsTrigger value="inorganic">Inorganic</TabsTrigger>
                  <TabsTrigger value="biomolecules">Biomolecules</TabsTrigger>
                </TabsList>

                {["basic", "organic", "inorganic", "biomolecules"].map((category) => (
                  <TabsContent key={category} value={category} className="space-y-2 mt-4 max-h-[380px] overflow-y-auto pr-1">
                    {getFilteredMolecules(category).map((mol, index) => (
                      <div
                        key={`${category}-${index}`}
                        className={`p-3 rounded-lg border cursor-pointer transition-all duration-150 ${
                          currentMolecule?.molecule === mol.molecule
                            ? "bg-primary/10 border-primary shadow-sm"
                            : "hover:bg-muted/70 border-border"
                        }`}
                        onClick={() => setCurrentMolecule(mol)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-sm capitalize">{mol.molecule}</h4>
                          <Badge variant="secondary" className="text-xs font-mono font-bold tracking-tight">
                            {mol.formula}
                          </Badge>
                        </div>
                        <div className="text-[11px] font-medium text-muted-foreground/80 mt-2 flex gap-3 border-t pt-1.5">
                          <span>🔵 {mol.atoms.length} Atoms</span>
                          <span>🔗 {mol.bonds.length} Bonds</span>
                        </div>
                      </div>
                    ))}

                    {getFilteredMolecules(category).length === 0 && (
                      <div className="text-center py-8 text-muted-foreground text-xs bg-muted/10 rounded-lg border border-dashed">
                        {searchTerm 
                          ? "No items match current filter. Click 'Fetch' to pull live from server!" 
                          : "No models currently in this catalog tier."
                        }
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader className="py-3">
              <CardTitle className="font-serif text-xs uppercase tracking-wider text-muted-foreground">Lab Interaction Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 text-xs text-muted-foreground/90 pb-4">
              <div>• <b>Left Click + Drag:</b> Orbit/Rotate 3D bounding camera</div>
              <div>• <b>Scroll Wheel:</b> Precision distance focal zoom</div>
              <div>• <b>Right Click + Drag:</b> Global viewport workspace panning</div>
              <div>• <b>Search Input + Fetch Button:</b> Queries dynamic API cache runtime</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
