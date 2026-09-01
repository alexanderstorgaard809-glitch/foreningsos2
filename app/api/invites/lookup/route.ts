import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = (searchParams.get("code") ?? "").trim().toUpperCase();

  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  const association = await prisma.association.findUnique({
    where: { inviteCode: code },
  });

  if (!association) {
    return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });
  }
  if (
    !association.inviteExpiresAt ||
    association.inviteExpiresAt < new Date()
  ) {
    return NextResponse.json(
      { error: "This invite link has expired" },
      { status: 410 }
    );
  }

  return NextResponse.json({ associationName: association.name });
}
