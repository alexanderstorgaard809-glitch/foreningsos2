import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";

export async function GET() {
  const auth = await getAuthContext();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const members = await prisma.member.findMany({
    where: { associationId: auth.association.id },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(members);
}

export async function POST(request: Request) {
  const auth = await getAuthContext();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  if (!body.name || !body.address) {
    return NextResponse.json(
      { error: "Name and address are required" },
      { status: 400 }
    );
  }

  const member = await prisma.member.create({
    data: {
      associationId: auth.association.id,
      name: body.name,
      address: body.address,
      email: body.email || null,
      phone: body.phone || null,
    },
  });

  return NextResponse.json(member, { status: 201 });
}
