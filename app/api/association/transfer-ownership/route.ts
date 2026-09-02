import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";

export async function POST(request: Request) {
  const auth = await getAuthContext();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (auth.user.role !== "owner") {
    return NextResponse.json(
      { error: "Only the owner can transfer ownership" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const targetId = typeof body.userId === "string" ? body.userId : "";

  if (targetId === auth.user.id) {
    return NextResponse.json(
      { error: "You already own this association" },
      { status: 400 }
    );
  }

  const target = await prisma.user.findFirst({
    where: { id: targetId, associationId: auth.association.id },
  });
  if (!target) {
    return NextResponse.json(
      { error: "Board member not found" },
      { status: 404 }
    );
  }
  if (target.role !== "board") {
    return NextResponse.json(
      { error: "Only board members can receive ownership" },
      { status: 400 }
    );
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: auth.user.id },
      data: { role: "board" },
    }),
    prisma.user.update({
      where: { id: target.id },
      data: { role: "owner" },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
