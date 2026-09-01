import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(request: Request, { params }: Params) {
  const auth = await getAuthContext();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (auth.user.role !== "owner") {
    return NextResponse.json(
      { error: "Only the association owner can manage access" },
      { status: 403 }
    );
  }

  const { id } = await params;

  const target = await prisma.user.findFirst({
    where: { id, associationId: auth.association.id },
  });
  if (!target) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (target.role === "owner") {
    return NextResponse.json(
      { error: "Owners cannot be removed" },
      { status: 400 }
    );
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
