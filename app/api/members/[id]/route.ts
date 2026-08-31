import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const auth = await getAuthContext();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const member = await prisma.member.update({
    where: { id, associationId: auth.association.id },
    data: {
      name: body.name,
      address: body.address,
      email: body.email || null,
      phone: body.phone || null,
    },
  });

  return NextResponse.json(member);
}

export async function DELETE(request: Request, { params }: Params) {
  const auth = await getAuthContext();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.member.delete({
    where: { id, associationId: auth.association.id },
  });
  return NextResponse.json({ ok: true });
}
