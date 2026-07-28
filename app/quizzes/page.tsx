import { QuizSystem } from "@/components/quiz-system"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users } from "lucide-react"
import Link from "next/link"

export default function QuizzesPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Users className="h-6 w-6 text-secondary" />
              <h1 className="text-lg font-serif font-bold">Quizzes</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <QuizSystem />
      </main>
    </div>
  )
}
