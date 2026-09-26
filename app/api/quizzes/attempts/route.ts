import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { QuizAttempt, User, ensureDbSynced } from "@/lib/db";

export async function GET() {
  try {
    await ensureDbSynced();
    const token = (await cookies()).get("chemistry-session")?.value;
    const session = token ? verifyToken(token) : null;
    if (!session?.id) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

    const user = await User.findByPk(session.id, { attributes: ["id", "name", "email"] });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const attempts = await QuizAttempt.findAll({ where: { userId: Number(session.id) }, order: [["createdAt", "DESC"]], raw: true });
    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email }, attempts });
  } catch (error) {
    console.error("Quiz attempts API error:", error);
    return NextResponse.json({ error: "Failed to load quiz attempts" }, { status: 500 });
  }
}