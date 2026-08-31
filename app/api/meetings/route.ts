import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";

export async function GET() {
  const auth = await getAuthContext();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const meetings = await prisma.meeting.findMany({
    where: { associationId: auth.association.id },
    orderBy: { date: "asc" },
  });
  return NextResponse.json(meetings);
}

export async function POST(request: Request) {
  const auth = await getAuthContext();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  if (!body.title || !body.date) {
    return NextResponse.json(
      { error: "Title and date are required" },
      { status: 400 }
    );
  }

  const date = new Date(body.date);
  if (isNaN(date.getTime())) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  const type = ["annual", "board", "other"].includes(body.type)
    ? body.type
    : "board";

  const meeting = await prisma.meeting.create({
    data: {
      associationId: auth.association.id,
      title: body.title,
      date,
      type,
      location: body.location || null,
      agenda: body.agenda || "",
    },
  });

  return NextResponse.json(meeting, { status: 201 });
}
