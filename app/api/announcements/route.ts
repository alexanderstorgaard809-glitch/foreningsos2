import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";
import { sendAnnouncementEmail } from "@/lib/mailer";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET() {
  const auth = await getAuthContext();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const announcements = await prisma.announcement.findMany({
    where: { associationId: auth.association.id },
    orderBy: { sentAt: "desc" },
    take: 20,
  });
  return NextResponse.json(announcements);
}

export async function POST(request: Request) {
  const auth = await getAuthContext();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!auth.association.contactEmail) {
    return NextResponse.json(
      {
        error:
          "Add a contact email in Settings first — members who reply need somewhere for their response to land",
      },
      { status: 400 }
    );
  }

  const body = await request.json();

  const subject =
    typeof body.subject === "string" ? body.subject.trim().slice(0, 150) : "";
  const text =
    typeof body.body === "string" ? body.body.trim().slice(0, 10000) : "";

  if (!subject || !text) {
    return NextResponse.json(
      { error: "Subject and message are required" },
      { status: 400 }
    );
  }

  const members = await prisma.member.findMany({
    where: {
      associationId: auth.association.id,
      email: { not: null },
    },
    select: { email: true, name: true },
  });

  const recipients = members
    .map((m) => ({ email: (m.email ?? "").trim(), name: m.name }))
    .filter((r) => emailPattern.test(r.email));

  if (recipients.length === 0) {
    return NextResponse.json(
      {
        error:
          "No members with email addresses on file — add emails to members first",
      },
      { status: 400 }
    );
  }

  const result = await sendAnnouncementEmail(
    recipients,
    subject,
    text,
    auth.association.name,
    auth.association.contactEmail ?? ""
  );

  const announcement = await prisma.announcement.create({
    data: {
      associationId: auth.association.id,
      subject,
      body: text,
      audience: "all",
      recipientCount: result.sent,
      failedCount: result.failed,
    },
  });

  return NextResponse.json(
    {
      announcement,
      sent: result.sent,
      failed: result.failed,
      error: result.error,
      skippedNoEmail: members.length - recipients.length,
    },
    { status: 201 }
  );
}
