import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";
import { parseMembers } from "@/lib/import-parser";

export async function POST(request: Request) {
  const auth = await getAuthContext();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const text = typeof body.text === "string" ? body.text : "";

  if (!text.trim()) {
    return NextResponse.json({ error: "Nothing to import" }, { status: 400 });
  }

  const { members, errors } = parseMembers(text);

  if (members.length === 0) {
    return NextResponse.json(
      { error: "No valid members found in the pasted text", errors },
      { status: 400 }
    );
  }

  const existing = await prisma.member.findMany({
    where: { associationId: auth.association.id },
    select: { name: true, address: true },
  });
  const existingKeys = new Set(
    existing.map(
      (m) =>
        `${m.name.trim().toLowerCase()}|${m.address.trim().toLowerCase()}`
    )
  );

  const toCreate = [];
  let skipped = 0;

  for (const m of members) {
    const key = `${m.name.trim().toLowerCase()}|${m.address.trim().toLowerCase()}`;
    if (existingKeys.has(key)) {
      skipped++;
      continue;
    }
    existingKeys.add(key);
    toCreate.push({
      associationId: auth.association.id,
      name: m.name,
      address: m.address,
      email: m.email,
      phone: m.phone,
    });
  }

  let created = 0;
  if (toCreate.length > 0) {
    const result = await prisma.member.createMany({ data: toCreate });
    created = result.count;
  }

  return NextResponse.json({ created, skipped, errors });
}
