import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Atom, FlaskConical, Users, Zap, Microscope } from "lucide-react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            Interactive Learning Platform
          </Badge>
          <h1 className="text-4xl md:text-6xl font-serif font-black text-foreground mb-6">
            Explore Chemistry in
            <span className="text-primary"> 3D</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover molecular structures, master the periodic table, and simulate chemical reactions in an engaging,
            interactive environment designed for students of all levels.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/molecules">
              <Button size="lg" className="text-lg px-8">
                <Zap className="mr-2 h-5 w-5" />
                Start Exploring
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-foreground mb-4">
              Everything You Need to Master Chemistry
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From 3D molecular visualization to interactive quizzes, our platform provides comprehensive tools for
              chemistry education.
            </p>
          </div>

          {/* Grid layout shifts dynamically now that the 4th item is gone */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/molecules">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Atom className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="font-serif">3D Molecular Viewer</CardTitle>
                  <CardDescription>
                    Visualize and manipulate molecular structures in three dimensions. Rotate, zoom, and explore atomic
                    bonds interactively.
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/periodic">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                    <div className="w-6 h-6 bg-secondary rounded-sm flex items-center justify-center text-xs font-bold text-secondary-foreground">
                      H
                    </div>
                  </div>
                  <CardTitle className="font-serif">Interactive Periodic Table</CardTitle>
                  <CardDescription>
                    Explore element properties, electron configurations, and trends with our dynamic periodic table
                    interface.
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/reactions">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                    <FlaskConical className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle className="font-serif">Reaction Simulator</CardTitle>
                  <CardDescription>
                    Simulate chemical reactions, balance equations, and observe reaction mechanisms in real-time.
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/quizzes">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-secondary" />
                  </div>
                  <CardTitle className="font-serif">Interactive Quizzes</CardTitle>
                  <CardDescription>
                    Test your knowledge with adaptive quizzes that adjust to your learning level and track your
                    progress.
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/dashboard">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                    <Microscope className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle className="font-serif">Progress Tracking</CardTitle>
                  <CardDescription>
                    Monitor your learning journey with detailed analytics and personalized recommendations for
                    improvement.
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-serif font-bold text-foreground mb-4">
            Ready to Transform Your Chemistry Learning?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Join thousands of students already exploring chemistry in a whole new way.
          </p>
          
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; 2024 Chemistry Playground. Built for students, by Education Global - IT Team.</p>
        </div>
      </footer>
    </div>
  )
}