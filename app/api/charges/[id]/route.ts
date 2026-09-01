import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

const kinds = ["late_fee", "special_assessment"];

export async function PATCH(request: Request, { params }: Params) {
  const auth = await getAuthContext();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const data: Record<string, unknown> = {};

  if (body.kind !== undefined) {
    data.kind = kinds.includes(body.kind) ? body.kind : "late_fee";
  }
  if (body.description !== undefined) {
    data.description =
      typeof body.description === "string" && body.description.trim()
        ? body.description.trim().slice(0, 200)
        : null;
  }
  if (body.amount !== undefined) {
    const amount = Number(body.amount);
    if (!Number.isInteger(amount) || amount < 1 || amount > 10000000) {
      return NextResponse.json(
        { error: "Amount must be a whole number between 1 and 10,000,000" },
        { status: 400 }
      );
    }
    data.amount = amount;
  }
  if (body.assessedAt !== undefined) {
    const assessedAt = new Date(body.assessedAt);
    if (isNaN(assessedAt.getTime())) {
      return NextResponse.json(
        { error: "Invalid assessed date" },
        { status: 400 }
      );
    }
    data.assessedAt = assessedAt;
  }
  if (body.paid !== undefined) {
    data.paidAt = body.paid ? new Date() : null;
  }

  const charge = await prisma.charge.update({
    where: { id, associationId: auth.association.id },
    data,
  });

  return NextResponse.json(charge);
}

export async function DELETE(request: Request, { params }: Params) {
  const auth = await getAuthContext();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.charge.delete({
    where: { id, associationId: auth.association.id },
  });
  return NextResponse.json({ ok: true });
}
