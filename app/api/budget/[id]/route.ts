import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

const pots = ["operating", "reserve"];
const kinds = ["income", "expense"];

export async function PATCH(request: Request, { params }: Params) {
  const auth = await getAuthContext();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const data: Record<string, unknown> = {};

  if (body.name !== undefined) {
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name || name.length > 100) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    data.name = name;
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
  if (body.pot !== undefined) {
    data.pot = pots.includes(body.pot) ? body.pot : "operating";
  }
  if (body.kind !== undefined) {
    data.kind = kinds.includes(body.kind) ? body.kind : "expense";
  }

  const item = await prisma.budgetItem.update({
    where: { id, associationId: auth.association.id },
    data,
  });

  return NextResponse.json(item);
}

export async function DELETE(request: Request, { params }: Params) {
  const auth = await getAuthContext();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.budgetItem.delete({
    where: { id, associationId: auth.association.id },
  });
  return NextResponse.json({ ok: true });
}