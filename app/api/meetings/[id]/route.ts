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

  const data: Record<string, unknown> = {};

  if (body.title !== undefined) data.title = body.title;
  if (body.date !== undefined) {
    const date = new Date(body.date);
    if (isNaN(date.getTime())) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }
    data.date = date;
  }
  if (body.type !== undefined) {
    data.type = ["annual", "board", "other"].includes(body.type)
      ? body.type
      : "board";
  }
  if (body.location !== undefined) data.location = body.location || null;
  if (body.agenda !== undefined) data.agenda = body.agenda;
  if (body.minutes !== undefined) data.minutes = body.minutes;
  if (body.status !== undefined) {
    if (!["scheduled", "held", "cancelled"].includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    data.status = body.status;
  }

  const meeting = await prisma.meeting.update({
    where: { id, associationId: auth.association.id },
    data,
  });

  return NextResponse.json(meeting);
}

export async function DELETE(request: Request, { params }: Params) {
  const auth = await getAuthContext();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.meeting.delete({
    where: { id, associationId: auth.association.id },
  });
  return NextResponse.json({ ok: true });
}
