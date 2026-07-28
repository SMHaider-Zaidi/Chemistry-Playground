import { NextResponse } from "next/server";
import { User, ensureDbSynced } from "@/lib/db";
import { verifyPassword, signToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    await ensureDbSynced();

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Fetch user from MySQL
    const user = await User.findOne({ where: { email: normalizedEmail } });
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Verify password
    const isPasswordValid = verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Create session token
    const token = signToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    // Set HttpOnly session cookie
    const cookieStore = await cookies();
    cookieStore.set("chemistry-session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 86400, // 1 day in seconds
      path: "/",
    });

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
    });
  } catch (error: any) {
    console.error("Login API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
