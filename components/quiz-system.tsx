"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle, RotateCcw, Trophy, Target } from "lucide-react"

// Quiz data structures
interface Question {
  id: string
  type: "multiple-choice" | "true-false" | "fill-blank"
  question: string
  options?: string[]
  correctAnswer: string | number
  explanation: string
  difficulty: "easy" | "medium" | "hard"
  topic: string
}

interface Quiz {
  id: string
  title: string
  description: string
  category: string
  questions: Question[]
  timeLimit?: number // minutes
  passingScore: number // percentage
}

// Sample quizzes
const quizzes: Quiz[] = [
  {
    id: "atomic-basics",
    title: "Atomic Structure Basics",
    description: "Test your knowledge of atoms, electrons, and the periodic table",
    category: "General Chemistry",
    passingScore: 70,
    questions: [
      {
        id: "q1",
        type: "multiple-choice",
        question: "What determines the identity of an element?",
        options: ["Number of neutrons", "Number of protons", "Number of electrons", "Atomic mass"],
        correctAnswer: 1,
        explanation:
          "The number of protons (atomic number) determines the identity of an element. This is what makes hydrogen different from helium, carbon, etc.",
        difficulty: "easy",
        topic: "Atomic Structure",
      },
      {
        id: "q2",
        type: "multiple-choice",
        question: "Which electron configuration represents a noble gas?",
        options: ["1s² 2s² 2p⁵", "1s² 2s² 2p⁶", "1s² 2s² 2p⁴", "1s² 2s¹"],
        correctAnswer: 1,
        explanation:
          "Noble gases have complete outer electron shells. The configuration 1s² 2s² 2p⁶ represents neon, which has a complete second shell.",
        difficulty: "medium",
        topic: "Electron Configuration",
      },
      {
        id: "q3",
        type: "true-false",
        question: "Isotopes of the same element have different numbers of protons.",
        correctAnswer: "false",
        explanation:
          "Isotopes have the same number of protons but different numbers of neutrons. The number of protons defines the element.",
        difficulty: "easy",
        topic: "Isotopes",
      },
      {
        id: "q4",
        type: "multiple-choice",
        question: "Which trend correctly describes atomic radius across a period?",
        options: [
          "Increases from left to right",
          "Decreases from left to right",
          "Remains constant",
          "Increases then decreases",
        ],
        correctAnswer: 1,
        explanation:
          "Atomic radius decreases across a period because increasing nuclear charge pulls electrons closer to the nucleus.",
        difficulty: "medium",
        topic: "Periodic Trends",
      },
      {
        id: "q5",
        type: "multiple-choice",
        question: "What is the maximum number of electrons that can occupy the 3d subshell?",
        options: ["2", "6", "10", "14"],
        correctAnswer: 2,
        explanation:
          "The d subshell has 5 orbitals, and each orbital can hold 2 electrons, so 5 × 2 = 10 electrons maximum.",
        difficulty: "hard",
        topic: "Electron Configuration",
      },
    ],
  },
  {
    id: "bonding-quiz",
    title: "Chemical Bonding",
    description: "Explore ionic, covalent, and metallic bonds",
    category: "General Chemistry",
    passingScore: 75,
    questions: [
      {
        id: "b1",
        type: "multiple-choice",
        question: "Which type of bond forms between a metal and a nonmetal?",
        options: ["Covalent", "Ionic", "Metallic", "Hydrogen"],
        correctAnswer: 1,
        explanation:
          "Ionic bonds form when electrons are transferred from metals (which lose electrons easily) to nonmetals (which gain electrons easily).",
        difficulty: "easy",
        topic: "Bond Types",
      },
      {
        id: "b2",
        type: "true-false",
        question: "Covalent bonds involve the sharing of electrons between atoms.",
        correctAnswer: "true",
        explanation:
          "Covalent bonds form when atoms share electrons to achieve stable electron configurations, typically between nonmetals.",
        difficulty: "easy",
        topic: "Covalent Bonding",
      },
      {
        id: "b3",
        type: "multiple-choice",
        question: "What is the molecular geometry of water (H₂O)?",
        options: ["Linear", "Bent", "Trigonal planar", "Tetrahedral"],
        correctAnswer: 1,
        explanation:
          "Water has a bent molecular geometry due to two lone pairs on oxygen that repel the bonding pairs, creating a bent shape with ~104.5° bond angle.",
        difficulty: "medium",
        topic: "Molecular Geometry",
      },
    ],
  },
]

// Question component
function QuestionCard({
  question,
  selectedAnswer,
  onAnswerSelect,
  showResult,
  isCorrect,
}: {
  question: Question
  selectedAnswer: string | number | null
  onAnswerSelect: (answer: string | number) => void
  showResult: boolean
  isCorrect: boolean | null
}) {
  if (question.type === "multiple-choice") {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs">
              {question.difficulty}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {question.topic}
            </Badge>
          </div>
          <CardTitle className="font-serif text-lg">{question.question}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={selectedAnswer?.toString()}
            onValueChange={(value) => onAnswerSelect(Number.parseInt(value))}
            disabled={showResult}
          >
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <Label
                  htmlFor={`option-${index}`}
                  className={`flex-1 cursor-pointer p-2 rounded ${
                    showResult && index === question.correctAnswer
                      ? "bg-green-100 text-green-800 border border-green-300"
                      : showResult && index === selectedAnswer && index !== question.correctAnswer
                        ? "bg-red-100 text-red-800 border border-red-300"
                        : ""
                  }`}
                >
                  {option}
                </Label>
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
              <p className="text-sm text-muted-foreground">{question.explanation}</p>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  if (question.type === "true-false") {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs">
              {question.difficulty}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {question.topic}
            </Badge>
          </div>
          <CardTitle className="font-serif text-lg">{question.question}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={selectedAnswer?.toString()}
            onValueChange={(value) => onAnswerSelect(value)}
            disabled={showResult}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id="true" />
              <Label
                htmlFor="true"
                className={`flex-1 cursor-pointer p-2 rounded ${
                  showResult && question.correctAnswer === "true"
                    ? "bg-green-100 text-green-800 border border-green-300"
                    : showResult && selectedAnswer === "true" && question.correctAnswer !== "true"
                      ? "bg-red-100 text-red-800 border border-red-300"
                      : ""
                }`}
              >
                True
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id="false" />
              <Label
                htmlFor="false"
                className={`flex-1 cursor-pointer p-2 rounded ${
                  showResult && question.correctAnswer === "false"
                    ? "bg-green-100 text-green-800 border border-green-300"
                    : showResult && selectedAnswer === "false" && question.correctAnswer !== "false"
                      ? "bg-red-100 text-red-800 border border-red-300"
                      : ""
                }`}
              >
                False
              </Label>
            </div>
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
              <p className="text-sm text-muted-foreground">{question.explanation}</p>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return null
}

// Quiz component
function QuizViewer({ quiz, onBack }: { quiz: Quiz; onBack: () => void }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<{ [key: string]: string | number }>({})
  const [showResults, setShowResults] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)

  const currentQuestion = quiz.questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100

  const handleAnswerSelect = (answer: string | number) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: answer,
    })
  }

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setShowResults(false)
    } else {
      setQuizCompleted(true)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      setShowResults(false)
    }
  }

  const checkAnswer = () => {
    setShowResults(true)
  }

  const calculateScore = () => {
    let correct = 0
    quiz.questions.forEach((question) => {
      if (answers[question.id] === question.correctAnswer) {
        correct++
      }
    })
    return Math.round((correct / quiz.questions.length) * 100)
  }

  const isCorrect = showResults && answers[currentQuestion.id] === currentQuestion.correctAnswer
  const hasAnswered = answers[currentQuestion.id] !== undefined
  const score = calculateScore()
  const passed = score >= quiz.passingScore

  if (quizCompleted) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {passed ? (
                <Trophy className="h-16 w-16 text-yellow-500" />
              ) : (
                <Target className="h-16 w-16 text-blue-500" />
              )}
            </div>
            <CardTitle className="font-serif text-2xl">{passed ? "Congratulations!" : "Quiz Complete"}</CardTitle>
            <CardDescription>
              You scored {score}% on {quiz.title}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">{score}%</div>
              <div className="text-sm text-muted-foreground">
                {quiz.questions.filter((q) => answers[q.id] === q.correctAnswer).length} out of {quiz.questions.length}{" "}
                correct
              </div>
              <div className="mt-2">
                {passed ? (
                  <Badge className="bg-green-500">Passed</Badge>
                ) : (
                  <Badge variant="destructive">Needs Improvement</Badge>
                )}
              </div>
            </div>

            <div className="flex justify-center gap-4 mt-6">
              <Button onClick={onBack} variant="outline">
                Back to Quizzes
              </Button>
              <Button
                onClick={() => {
                  setCurrentQuestionIndex(0)
                  setAnswers({})
                  setShowResults(false)
                  setQuizCompleted(false)
                }}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Retake Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          Back to Quizzes
        </Button>
        <div className="text-sm text-muted-foreground">
          Question {currentQuestionIndex + 1} of {quiz.questions.length}
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-serif font-bold mb-2">{quiz.title}</h1>
        <Progress value={progress} className="h-2" />
      </div>

      <QuestionCard
        question={currentQuestion}
        selectedAnswer={answers[currentQuestion.id] || null}
        onAnswerSelect={handleAnswerSelect}
        showResult={showResults}
        isCorrect={isCorrect}
      />

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
          Previous
        </Button>

        <div className="flex gap-2">
          {!showResults && hasAnswered && (
            <Button onClick={checkAnswer} variant="secondary">
              Check Answer
            </Button>
          )}

          <Button onClick={handleNext} disabled={!hasAnswered}>
            {currentQuestionIndex === quiz.questions.length - 1 ? "Finish Quiz" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  )
}

// Main quiz system component
export function QuizSystem() {
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)

  if (selectedQuiz) {
    return <QuizViewer quiz={selectedQuiz} onBack={() => setSelectedQuiz(null)} />
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-bold mb-2">Chemistry Quizzes</h2>
        <p className="text-muted-foreground">Test your knowledge and track your progress</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <Card
            key={quiz.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedQuiz(quiz)}
          >
            <CardHeader>
              <CardTitle className="font-serif">{quiz.title}</CardTitle>
              <CardDescription>{quiz.description}</CardDescription>
              <div className="flex items-center justify-between mt-4">
                <Badge variant="secondary">{quiz.category}</Badge>
                <div className="text-sm text-muted-foreground">{quiz.questions.length} questions</div>
              </div>
              <div className="text-sm text-muted-foreground">Passing score: {quiz.passingScore}%</div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}
