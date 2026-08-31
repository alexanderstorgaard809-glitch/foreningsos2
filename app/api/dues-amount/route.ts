import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";

export async function PUT(request: Request) {
  const auth = await getAuthContext();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const year = Number(body.year);
  const amount = Number(body.amount);

  if (!Number.isInteger(year) || year < 2000 || year > 3000) {
    return NextResponse.json({ error: "Invalid year" }, { status: 400 });
  }
  if (!Number.isInteger(amount) || amount < 1 || amount > 1000000) {
    return NextResponse.json(
      { error: "Amount must be a whole number between 1 and 1,000,000" },
      { status: 400 }
    );
  }

  const duesYear = await prisma.duesYear.upsert({
    where: {
      associationId_year: { associationId: auth.association.id, year },
    },
    update: { amount },
    create: { associationId: auth.association.id, year, amount },
  });

  return NextResponse.json(duesYear);
}
