import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";

export async function POST(request: Request) {
  const auth = await getAuthContext();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const fromYear = Number(body.fromYear);
  const toYear = Number(body.toYear);

  if (
    !Number.isInteger(fromYear) ||
    !Number.isInteger(toYear) ||
    fromYear < 2000 ||
    fromYear > 3000 ||
    toYear < 2000 ||
    toYear > 3000 ||
    fromYear === toYear
  ) {
    return NextResponse.json({ error: "Invalid years" }, { status: 400 });
  }

  const targetCount = await prisma.budgetItem.count({
    where: { associationId: auth.association.id, year: toYear },
  });
  if (targetCount > 0) {
    return NextResponse.json(
      { error: "Target year already has budget lines" },
      { status: 409 }
    );
  }

  const source = await prisma.budgetItem.findMany({
    where: { associationId: auth.association.id, year: fromYear },
  });
  if (source.length === 0) {
    return NextResponse.json(
      { error: "No budget lines to copy" },
      { status: 400 }
    );
  }

  const result = await prisma.budgetItem.createMany({
    data: source.map((item) => ({
      associationId: auth.association.id,
      year: toYear,
      name: item.name,
      amount: item.amount,
      pot: item.pot,
      kind: item.kind,
    })),
  });

  return NextResponse.json({ created: result.count }, { status: 201 });
}