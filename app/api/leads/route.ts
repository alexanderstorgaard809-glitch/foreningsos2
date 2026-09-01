import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  // Honeypot: hidden field, bots only. Fake success, store nothing.
  if (typeof body.company === "string" && body.company.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!emailPattern.test(email) || email.length > 200) {
    return NextResponse.json(
      { error: "Enter a valid email address" },
      { status: 400 }
    );
  }

  const source =
    typeof body.source === "string" ? body.source.slice(0, 50) : "template";

  // Upsert: downloading twice never errors, list stays deduped.
  await prisma.lead.upsert({
    where: { email },
    update: {},
    create: { email, source },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
