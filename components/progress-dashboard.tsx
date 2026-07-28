"use client"

import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trophy, BookOpen, Brain, Target, Calendar, TrendingUp, Award, Clock, CheckCircle, Star } from "lucide-react"
import { useEffect, useState } from "react"
import Link from "next/link"

interface ProgressData {
  tutorialsCompleted: number
  totalTutorials: number
  quizzesCompleted: number
  totalQuizzes: number
  averageQuizScore: number
  currentStreak: number
  totalStudyTime: number
  achievements: string[]
  recentActivity: Array<{
    type: "tutorial" | "quiz"
    title: string
    date: string
    score?: number
  }>
}

export function ProgressDashboard() {
  const { user } = useAuth()
  const [progressData, setProgressData] = useState<ProgressData>({
    tutorialsCompleted: 0,
    totalTutorials: 3,
    quizzesCompleted: 0,
    totalQuizzes: 3,
    averageQuizScore: 0,
    currentStreak: 0,
    totalStudyTime: 0,
    achievements: [],
    recentActivity: [],
  })

  useEffect(() => {
    if (user) {
      // Load progress data from localStorage
      const savedProgress = localStorage.getItem(`progress-${user.id}`)
      if (savedProgress) {
        setProgressData(JSON.parse(savedProgress))
      } else {
        // Initialize with sample data for demo
        const sampleData: ProgressData = {
          tutorialsCompleted: 2,
          totalTutorials: 3,
          quizzesCompleted: 1,
          totalQuizzes: 3,
          averageQuizScore: 85,
          currentStreak: 3,
          totalStudyTime: 120, // minutes
          achievements: ["First Steps", "Quiz Master", "Streak Keeper"],
          recentActivity: [
            { type: "tutorial", title: "Atomic Structure", date: "2024-01-15", score: undefined },
            { type: "quiz", title: "Basic Chemistry Quiz", date: "2024-01-14", score: 85 },
            { type: "tutorial", title: "Chemical Bonding", date: "2024-01-13", score: undefined },
          ],
        }
        setProgressData(sampleData)
        localStorage.setItem(`progress-${user.id}`, JSON.stringify(sampleData))
      }
    }
  }, [user])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to view your progress dashboard</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/auth">
              <Button>Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const tutorialProgress = (progressData.tutorialsCompleted / progressData.totalTutorials) * 100
  const quizProgress = (progressData.quizzesCompleted / progressData.totalQuizzes) * 100
  const overallProgress =
    ((progressData.tutorialsCompleted + progressData.quizzesCompleted) /
      (progressData.totalTutorials + progressData.totalQuizzes)) *
    100

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Welcome back, {user.name}!</h1>
          <p className="text-muted-foreground">Track your chemistry learning journey and see how far you've come.</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(overallProgress)}%</div>
              <Progress value={overallProgress} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progressData.currentStreak} days</div>
              <p className="text-xs text-muted-foreground mt-1">Keep it up!</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Quiz Score</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progressData.averageQuizScore}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                {progressData.averageQuizScore >= 80 ? "Excellent!" : "Keep practicing!"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Study Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(progressData.totalStudyTime / 60)}h</div>
              <p className="text-xs text-muted-foreground mt-1">Total learning time</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Learning Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Learning Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Tutorials</span>
                  <span className="text-sm text-muted-foreground">
                    {progressData.tutorialsCompleted}/{progressData.totalTutorials}
                  </span>
                </div>
                <Progress value={tutorialProgress} />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Quizzes</span>
                  <span className="text-sm text-muted-foreground">
                    {progressData.quizzesCompleted}/{progressData.totalQuizzes}
                  </span>
                </div>
                <Progress value={quizProgress} />
              </div>

              <div className="flex gap-2 pt-4">
                <Link href="/tutorials">
                  <Button variant="outline" size="sm">
                    Continue Learning
                  </Button>
                </Link>
                <Link href="/quizzes">
                  <Button variant="outline" size="sm">
                    Take Quiz
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {progressData.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <Award className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{achievement}</span>
                  </div>
                ))}
                {progressData.achievements.length === 0 && (
                  <p className="text-sm text-muted-foreground col-span-2">
                    Complete tutorials and quizzes to earn achievements!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {progressData.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    {activity.type === "tutorial" ? (
                      <BookOpen className="h-4 w-4 text-primary" />
                    ) : (
                      <Brain className="h-4 w-4 text-secondary" />
                    )}
                    <div>
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {activity.score && (
                      <Badge variant={activity.score >= 80 ? "default" : "secondary"}>{activity.score}%</Badge>
                    )}
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              ))}
              {progressData.recentActivity.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent activity. Start learning to see your progress here!
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recommended Next Steps</CardTitle>
            <CardDescription>Based on your progress, here's what we suggest:</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {tutorialProgress < 100 && (
                <Link href="/tutorials">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <BookOpen className="h-8 w-8 text-primary mb-2" />
                      <h3 className="font-semibold mb-1">Continue Tutorials</h3>
                      <p className="text-sm text-muted-foreground">
                        Complete remaining lessons to master the fundamentals
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              )}

              {progressData.averageQuizScore < 80 && (
                <Link href="/quizzes">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <Brain className="h-8 w-8 text-secondary mb-2" />
                      <h3 className="font-semibold mb-1">Practice Quizzes</h3>
                      <p className="text-sm text-muted-foreground">Improve your scores with more practice questions</p>
                    </CardContent>
                  </Card>
                </Link>
              )}

              <Link href="/molecules">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <Target className="h-8 w-8 text-accent mb-2" />
                    <h3 className="font-semibold mb-1">Explore 3D Models</h3>
                    <p className="text-sm text-muted-foreground">
                      Visualize molecular structures to deepen understanding
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
