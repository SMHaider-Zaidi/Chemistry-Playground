import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { QuizAttempt, ensureDbSynced } from "@/lib/db";

// POST /api/quizzes/submit
export async function POST(req: Request) {
  try {
    await ensureDbSynced();
    const token = (await cookies()).get("chemistry-session")?.value;
    const session = token ? verifyToken(token) : null;
    if (!session?.id) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

    const { quizId, chapterName, score, totalQuestions } = await req.json();
    if (!quizId || !chapterName || !Number.isInteger(score) || !Number.isInteger(totalQuestions) || totalQuestions <= 0) {
      return NextResponse.json({ error: "Invalid quiz submission" }, { status: 400 });
    }
    const percentage = (score / totalQuestions) * 100;

    const attempt = await QuizAttempt.create({
      userId: Number(session.id), quizId: Number(quizId), chapterName: String(chapterName),
      score, totalQuestions, percentage,
    });
    return NextResponse.json({ success: true, attemptId: attempt.id });
  } catch {
    return NextResponse.json({ error: "Failed to submit quiz" }, { status: 500 });
  }
}