import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

const statuses = ["attending", "proxy", "not_attending", "no_response"];

export async function GET(request: Request, { params }: Params) {
  const auth = await getAuthContext();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const meeting = await prisma.meeting.findFirst({
    where: { id, associationId: auth.association.id },
  });
  if (!meeting) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const responses = await prisma.meetingResponse.findMany({
    where: { associationId: auth.association.id, meetingId: id },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(responses);
}

export async function POST(request: Request, { params }: Params) {
  const auth = await getAuthContext();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const meeting = await prisma.meeting.findFirst({
    where: { id, associationId: auth.association.id },
  });
  if (!meeting) {
    return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
  }

  const memberId = typeof body.memberId === "string" ? body.memberId : "";
  const member = await prisma.member.findFirst({
    where: { id: memberId, associationId: auth.association.id },
  });
  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  const status = statuses.includes(body.status) ? body.status : null;
  if (!status) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  // "No response" = the absence of a record
  if (status === "no_response") {
    await prisma.meetingResponse.deleteMany({
      where: { meetingId: id, memberId },
    });
    return NextResponse.json({ ok: true });
  }

  let proxyHolder: string | null = null;
  if (status === "proxy") {
    proxyHolder =
      typeof body.proxyHolder === "string" && body.proxyHolder.trim()
        ? body.proxyHolder.trim().slice(0, 100)
        : null;
  }

  const response = await prisma.meetingResponse.upsert({
    where: { meetingId_memberId: { meetingId: id, memberId } },
    update: { status, proxyHolder, respondedAt: new Date() },
    create: {
      associationId: auth.association.id,
      meetingId: id,
      memberId,
      status,
      proxyHolder,
    },
  });

  return NextResponse.json(response, { status: 201 });
}
