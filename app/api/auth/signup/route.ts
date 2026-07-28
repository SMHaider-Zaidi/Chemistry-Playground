import { NextResponse } from "next/server";
import { UniqueConstraintError } from "sequelize";
import { User, ensureDbSynced } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    await ensureDbSynced();

    const { email, password, name, institution } = await request.json();

    if (!email || !password || !name || !institution) {
      return NextResponse.json(
        { error: "Missing required fields: email, password, name, or institution" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedInstitution = institution.trim();

    const passwordHash = hashPassword(password);

    const newUser = await User.create({
      email: normalizedEmail,
      passwordHash,
      name,
      institution: normalizedInstitution,
    });

    return NextResponse.json(
      {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        institution: newUser.institution,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof UniqueConstraintError) {
      return NextResponse.json({ error: "EMAIL_ALREADY_EXISTS" }, { status: 400 });
    }

    console.error("Signup API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}