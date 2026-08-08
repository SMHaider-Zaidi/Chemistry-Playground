"use client"

import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { QuizSystem } from "@/components/quiz-system"
import { ChevronLeft } from "lucide-react"

export default function QuizzesPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Imported Navigation Component */}
      <Navigation />

      {/* Sub-header Navigation ("Back to Home") */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <Link 
          href="/" 
          className="inline-flex items-center space-x-1 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Main Content */}
      <main className="py-4">
        <QuizSystem />
      </main>
    </div>
  )
}