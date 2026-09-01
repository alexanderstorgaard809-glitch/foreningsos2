import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";
import { randomBytes } from "crypto";

const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function generateCode(): string {
  const bytes = randomBytes(8);
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  }
  return code;
}

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

export async function POST(request: Request) {
  const auth = await getAuthContext();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (auth.user.role !== "owner") {
    return NextResponse.json(
      { error: "Only the association owner can manage invites" },
      { status: 403 }
    );
  }

  const inviteCode = generateCode();
  const inviteExpiresAt = new Date(Date.now() + SEVEN_DAYS);

  await prisma.association.update({
    where: { id: auth.association.id },
    data: { inviteCode, inviteExpiresAt },
  });

  return NextResponse.json({
    code: inviteCode,
    expiresAt: inviteExpiresAt.toISOString(),
  });
}

export async function DELETE(request: Request) {
  const auth = await getAuthContext();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (auth.user.role !== "owner") {
    return NextResponse.json(
      { error: "Only the association owner can manage invites" },
      { status: 403 }
    );
  }

  await prisma.association.update({
    where: { id: auth.association.id },
    data: { inviteCode: null, inviteExpiresAt: null },
  });

  return NextResponse.json({ ok: true });
}
