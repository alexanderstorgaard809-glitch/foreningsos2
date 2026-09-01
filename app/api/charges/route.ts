import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";

const kinds = ["late_fee", "special_assessment"];

export async function GET(request: Request) {
  const auth = await getAuthContext();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const memberId = searchParams.get("memberId") ?? "";

  const charges = await prisma.charge.findMany({
    where: { associationId: auth.association.id, memberId },
    orderBy: { assessedAt: "desc" },
  });
  return NextResponse.json(charges);
}

export async function POST(request: Request) {
  const auth = await getAuthContext();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const memberId = typeof body.memberId === "string" ? body.memberId : "";
  const member = await prisma.member.findFirst({
    where: { id: memberId, associationId: auth.association.id },
  });
  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  const kind = kinds.includes(body.kind) ? body.kind : "late_fee";

  const amount = Number(body.amount);
  if (!Number.isInteger(amount) || amount < 1 || amount > 10000000) {
    return NextResponse.json(
      { error: "Amount must be a whole number between 1 and 10,000,000" },
      { status: 400 }
    );
  }

  const assessedAt = new Date(body.assessedAt);
  if (isNaN(assessedAt.getTime())) {
    return NextResponse.json(
      { error: "Assessed date is required" },
      { status: 400 }
    );
  }

  let description: string | null = null;
  if (typeof body.description === "string" && body.description.trim()) {
    description = body.description.trim().slice(0, 200);
  }

  const charge = await prisma.charge.create({
    data: {
      associationId: auth.association.id,
      memberId,
      kind,
      description,
      amount,
      assessedAt,
    },
  });

  return NextResponse.json(charge, { status: 201 });
}
