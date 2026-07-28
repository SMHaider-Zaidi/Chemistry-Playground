import { NextResponse } from "next/server";
import { User, ensureDbSynced } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    await ensureDbSynced();

    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json({ error: "Token and new password are required" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const user = await User.findOne({ where: { resetToken: token } });

    if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 });
    }

    const passwordHash = hashPassword(newPassword);

    await user.update({
      passwordHash,
      resetToken: null,
      resetTokenExpiry: null,
    });

    return NextResponse.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
