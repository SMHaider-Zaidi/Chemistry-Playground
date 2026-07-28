import { MolecularViewer } from "@/components/molecular-viewer"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Atom } from "lucide-react"
import Link from "next/link"

export default function MoleculesPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {/* Added mx-auto, px-4, and max-w-7xl for centering */}
        <div className="container mx-auto px-4 flex h-16 items-center justify-between max-w-7xl">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Atom className="h-6 w-6 text-primary" />
              <h1 className="text-lg font-serif font-bold">3D Molecular Viewer</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      {/* Added mx-auto, px-4, and max-w-7xl for centering */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-foreground mb-4">Explore Molecules in 3D</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Visualize and interact with molecular structures. Rotate, zoom, and examine atomic bonds to understand
            chemical compounds better.
          </p>
        </div>

        <MolecularViewer />
      </main>
    </div>
  )
}