import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSession, SESSION_COOKIE } from "@/lib/auth";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const body = await request.json();

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const associationName =
    typeof body.associationName === "string"
      ? body.associationName.trim()
      : "";
  const inviteCode =
    typeof body.inviteCode === "string"
      ? body.inviteCode.trim().toUpperCase()
      : "";
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!name || name.length > 100) {
    return NextResponse.json({ error: "Your name is required" }, { status: 400 });
  }
  if (!emailPattern.test(email)) {
    return NextResponse.json(
      { error: "Enter a valid email address" },
      { status: 400 }
    );
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 }
    );
  }
  if (password.length > 200) {
    return NextResponse.json({ error: "Password is too long" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists" },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);

  let user: { id: string };

  if (inviteCode) {
    const association = await prisma.association.findUnique({
      where: { inviteCode },
    });
    if (!association) {
      return NextResponse.json(
        { error: "Invalid invite code" },
        { status: 400 }
      );
    }
    if (
      !association.inviteExpiresAt ||
      association.inviteExpiresAt < new Date()
    ) {
      return NextResponse.json(
        { error: "This invite link has expired — ask the owner for a new one" },
        { status: 400 }
      );
    }

    user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "board",
        associationId: association.id,
      },
    });
  } else {
    if (!associationName || associationName.length > 100) {
      return NextResponse.json(
        { error: "Association name is required" },
        { status: 400 }
      );
    }

    user = await prisma.$transaction(async (tx) => {
      const association = await tx.association.create({
        data: { name: associationName },
      });
      return tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: "owner",
          associationId: association.id,
        },
      });
    });
  }

  const { token, expiresAt } = await createSession(user.id);

  const res = NextResponse.json({ ok: true }, { status: 201 });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
  return res;
}
