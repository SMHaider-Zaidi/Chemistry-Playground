"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle, RotateCcw, Trophy, Target, Lock, Loader2 } from "lucide-react"

interface Question {
  id: string
  type: "multiple-choice"
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  difficulty: "easy" | "medium" | "hard"
  topic: string
}

interface Chapter {
  id: number
  chapter_number: number
  title: string
  class_level: number
  question_count: number
}

function QuestionCard({
  question,
  selectedAnswer,
  onAnswerSelect,
  showResult,
  isCorrect,
}: {
  question: Question
  selectedAnswer: number | null
  onAnswerSelect: (answer: number) => void
  showResult: boolean
  isCorrect: boolean | null
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs uppercase">
            {question.difficulty}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {question.topic}
          </Badge>
        </div>
        <CardTitle 
          className="font-serif text-lg mt-2" 
          dangerouslySetInnerHTML={{ __html: question.question }} 
        />
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup
          value={selectedAnswer?.toString()}
          onValueChange={(val) => onAnswerSelect(Number(val))}
          disabled={showResult}
        >
          {question.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem value={index.toString()} id={`option-${index}`} />
              <Label
                htmlFor={`option-${index}`}
                className={`flex-1 cursor-pointer p-2 rounded ${
                  showResult && index === question.correctAnswer
                    ? "bg-green-100 text-green-800 border border-green-300 dark:bg-green-950 dark:text-green-200"
                    : showResult && index === selectedAnswer && index !== question.correctAnswer
                      ? "bg-red-100 text-red-800 border border-red-300 dark:bg-red-950 dark:text-red-200"
                      : ""
                }`}
                dangerouslySetInnerHTML={{ __html: option }}
              />
            </div>
          ))}
        </RadioGroup>

        {showResult && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              {isCorrect ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <span className="font-medium">{isCorrect ? "Correct!" : "Incorrect"}</span>
            </div>
            <p className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: question.explanation }} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function QuizViewer({ chapter, onBack }: { chapter: Chapter; onBack: () => void }) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<{ [key: string]: number }>({})
  const [showResults, setShowResults] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)

  useEffect(() => {
    async function loadQuestions() {
      try {
        const res = await fetch(`/api/quizzes?chapter_id=${chapter.id}`)
        const data = await res.json()
        setQuestions(data.questions || [])
      } catch (err) {
        console.error("Failed to load questions:", err)
      } finally {
        setLoading(false)
      }
    }
    loadQuestions()
  }, [chapter.id])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <h3 className="text-xl font-bold">No questions available yet.</h3>
        <Button onClick={onBack}>Back to Chapters</Button>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]
  const progress = ((currentIndex + 1) / questions.length) * 100

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setShowResults(false)
    } else {
      setQuizCompleted(true)
    }
  }

  const calculateScore = () => {
    let correct = 0
    questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) correct++
    })
    return Math.round((correct / questions.length) * 100)
  }

  const score = calculateScore()
  const passed = score >= 70

  if (quizCompleted) {
    return (
      <Card className="max-w-xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {passed ? <Trophy className="h-16 w-16 text-yellow-500" /> : <Target className="h-16 w-16 text-blue-500" />}
          </div>
          <CardTitle className="text-2xl font-serif">{passed ? "Congratulations!" : "Keep Practicing!"}</CardTitle>
          <CardDescription>You scored {score}% on Chapter {chapter.chapter_number}: {chapter.title}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <div className="text-3xl font-bold">{score}%</div>
          <p className="text-sm text-muted-foreground">
            {questions.filter((q) => answers[q.id] === q.correctAnswer).length} out of {questions.length} correct
          </p>
          <div className="flex justify-center gap-4 mt-6">
            <Button onClick={onBack} variant="outline">Back to Quizzes</Button>
            <Button onClick={() => { setCurrentIndex(0); setAnswers({}); setShowResults(false); setQuizCompleted(false); }}>
              <RotateCcw className="h-4 w-4 mr-2" /> Retake Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>Back to Quizzes</Button>
        <span className="text-sm text-muted-foreground">Question {currentIndex + 1} of {questions.length}</span>
      </div>

      <div>
        <h1 className="text-2xl font-serif font-bold mb-2">Chapter {chapter.chapter_number}: {chapter.title}</h1>
        <Progress value={progress} className="h-2" />
      </div>

      <QuestionCard
        question={currentQuestion}
        selectedAnswer={answers[currentQuestion.id] ?? null}
        onAnswerSelect={(ans) => setAnswers({ ...answers, [currentQuestion.id]: ans })}
        showResult={showResults}
        isCorrect={showResults && answers[currentQuestion.id] === currentQuestion.correctAnswer}
      />

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => { setCurrentIndex(currentIndex - 1); setShowResults(false); }} disabled={currentIndex === 0}>
          Previous
        </Button>
        <div className="flex gap-2">
          {!showResults && answers[currentQuestion.id] !== undefined && (
            <Button onClick={() => setShowResults(true)} variant="secondary">Check Answer</Button>
          )}
          <Button onClick={handleNext} disabled={answers[currentQuestion.id] === undefined}>
            {currentIndex === questions.length - 1 ? "Finish Quiz" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  )
}

export function QuizSystem() {
  const [selectedClass, setSelectedClass] = useState<string>("9")
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    async function fetchChapters() {
      setLoading(true)
      try {
        const res = await fetch(`/api/quizzes`)
        const data = await res.json()
        setChapters(data.chapters || [])
      } catch (err) {
        console.error("Failed to load chapters:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchChapters()
  }, [])

  if (selectedChapter) {
    return <QuizViewer chapter={selectedChapter} onBack={() => setSelectedChapter(null)} />
  }

  const filteredChapters = chapters.filter((c) => c.class_level === Number(selectedClass))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-bold mb-1">Chemistry Quizzes</h2>
        <p className="text-muted-foreground">Select your class level and topic to practice</p>
      </div>

      <Tabs defaultValue="9" onValueChange={setSelectedClass}>
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="9">Class 9</TabsTrigger>
          <TabsTrigger value="10">Class 10</TabsTrigger>
          <TabsTrigger value="11">Class 11</TabsTrigger>
          <TabsTrigger value="12">Class 12</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredChapters.length === 0 ? (
        <Card className="p-8 text-center border-dashed">
          <Lock className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-semibold text-lg">Class {selectedClass} Content Coming Soon</h3>
          <p className="text-sm text-muted-foreground mt-1">We are currently adding chapters and questions for Class {selectedClass}. Check back soon!</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChapters.map((ch) => {
            const hasQuestions = ch.question_count > 0

            return (
              <Card
                key={ch.id}
                className={`transition-all ${
                  hasQuestions
                    ? "hover:shadow-lg cursor-pointer border-primary/20"
                    : "opacity-60 cursor-not-allowed bg-muted/30"
                }`}
                onClick={() => hasQuestions && setSelectedChapter(ch)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={hasQuestions ? "default" : "secondary"}>
                      Chapter {ch.chapter_number}
                    </Badge>
                    {hasQuestions ? (
                      <span className="text-xs text-muted-foreground">{ch.question_count} questions</span>
                    ) : (
                      <Badge variant="outline" className="text-xs border-amber-500 text-amber-600 dark:text-amber-400">
                        Coming Soon 🚀
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="font-serif text-lg">{ch.title}</CardTitle>
                  <CardDescription>
                    {hasQuestions
                      ? `Test your understanding of Chapter ${ch.chapter_number}.`
                      : "Questions for this chapter are currently being processed."}
                  </CardDescription>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}