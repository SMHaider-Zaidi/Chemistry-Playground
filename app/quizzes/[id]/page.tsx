import { QuizSystem } from "@/components/quiz-system"

export default async function QuizByIdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <QuizSystem initialChapterId={Number(id)} />
}