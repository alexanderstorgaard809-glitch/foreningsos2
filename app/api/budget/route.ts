import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";

const pots = ["operating", "reserve"];
const kinds = ["income", "expense"];

function isValidAmount(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 10000000
  );
}

export async function GET(request: Request) {
  const auth = await getAuthContext();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const year = Number(searchParams.get("year"));
  if (!Number.isInteger(year) || year < 2000 || year > 3000) {
    return NextResponse.json({ error: "Invalid year" }, { status: 400 });
  }

  const items = await prisma.budgetItem.findMany({
    where: { associationId: auth.association.id, year },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const auth = await getAuthContext();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const year = Number(body.year);
  if (!Number.isInteger(year) || year < 2000 || year > 3000) {
    return NextResponse.json({ error: "Invalid year" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name || name.length > 100) {
    return NextResponse.json(
      { error: "Name is required (max 100 characters)" },
      { status: 400 }
    );
  }

  const amount = Number(body.amount);
  if (!isValidAmount(amount)) {
    return NextResponse.json(
      { error: "Amount must be a whole number between 1 and 10,000,000" },
      { status: 400 }
    );
  }

  const item = await prisma.budgetItem.create({
    data: {
      associationId: auth.association.id,
      year,
      name,
      amount,
      pot: pots.includes(body.pot) ? body.pot : "operating",
      kind: kinds.includes(body.kind) ? body.kind : "expense",
    },
  });

  return NextResponse.json(item, { status: 201 });
}