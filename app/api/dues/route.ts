import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";

export async function POST(request: Request) {
  const auth = await getAuthContext();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  if (!body.memberId || !body.year) {
    return NextResponse.json(
      { error: "memberId and year are required" },
      { status: 400 }
    );
  }

  const member = await prisma.member.findFirst({
    where: { id: body.memberId, associationId: auth.association.id },
  });
  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  const payment = await prisma.duesPayment.upsert({
    where: {
      memberId_year: { memberId: body.memberId, year: body.year },
    },
    update: {},
    create: {
      associationId: auth.association.id,
      memberId: body.memberId,
      year: body.year,
    },
  });

  return NextResponse.json(payment, { status: 201 });
}

export async function DELETE(request: Request) {
  const auth = await getAuthContext();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const memberId = searchParams.get("memberId");
  const year = Number(searchParams.get("year"));

  if (!memberId || !year) {
    return NextResponse.json(
      { error: "memberId and year are required" },
      { status: 400 }
    );
  }

  await prisma.duesPayment.deleteMany({
    where: { memberId, year, associationId: auth.association.id },
  });
  return NextResponse.json({ ok: true });
}
