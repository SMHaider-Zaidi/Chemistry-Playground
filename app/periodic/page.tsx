import { PeriodicTable } from "@/components/periodic-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Atom, Beaker, Zap, Thermometer } from "lucide-react"
import Link from "next/link"

export default function PeriodicTablePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {/* Added mx-auto & px-4 to ensure container centering */}
        <div className="container mx-auto px-4 flex h-16 items-center justify-between max-w-7xl">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-secondary rounded-sm flex items-center justify-center text-xs font-bold text-secondary-foreground">
                H
              </div>
              <h1 className="text-lg font-serif font-bold">Interactive Periodic Table</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      {/* Added mx-auto, px-4, and max-w-7xl to keep layout responsive and centered */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-foreground mb-4">Explore the Elements</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Discover the properties, uses, and history of chemical elements. Click on any element to learn more about
            its characteristics and role in chemistry.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Atom className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <CardTitle className="text-sm font-serif">118 Elements</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Complete periodic table with all known elements</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Beaker className="h-5 w-5 text-green-600 dark:text-green-400" />
                <CardTitle className="text-sm font-serif">Element Groups</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Color-coded by chemical properties and behavior</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <CardTitle className="text-sm font-serif">Properties</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Atomic mass, electron configuration, and more</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Thermometer className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                <CardTitle className="text-sm font-serif">States</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Solid, liquid, gas, and synthetic elements</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="font-serif">Element Categories</CardTitle>
            <CardDescription>Understanding the color-coded groups in the periodic table</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-sm">Alkali Metals</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span className="text-sm">Alkaline Earth</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-sm">Transition Metals</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm">Metalloids</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-sm">Nonmetals</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-purple-500 rounded"></div>
                <span className="text-sm">Noble Gases</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <PeriodicTable />

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="font-serif">Did You Know?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Periodic Law</h4>
                <p className="text-sm text-muted-foreground">
                  The periodic table is organized by atomic number, and elements with similar properties appear at
                  regular intervals.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">New Elements</h4>
                <p className="text-sm text-muted-foreground">
                  Scientists continue to discover new superheavy elements, with the most recent additions being elements
                  113-118.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}