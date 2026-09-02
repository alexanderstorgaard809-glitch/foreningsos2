import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";

function csvField(value: string | number | null | undefined): string {
  const s = value === null || value === undefined ? "" : String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET() {
  const auth = await getAuthContext();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [members, duesYears, payments] = await Promise.all([
    prisma.member.findMany({
      where: { associationId: auth.association.id },
      orderBy: { name: "asc" },
    }),
    prisma.duesYear.findMany({
      where: { associationId: auth.association.id },
      orderBy: { year: "asc" },
    }),
    prisma.duesPayment.findMany({
      where: { associationId: auth.association.id },
    }),
  ]);

  const paidByMemberYear = new Map<string, Map<number, Date>>();
  for (const p of payments) {
    if (!paidByMemberYear.has(p.memberId)) {
      paidByMemberYear.set(p.memberId, new Map());
    }
    paidByMemberYear.get(p.memberId)!.set(p.year, p.paidAt);
  }

  const header = [
    "Name",
    "Address",
    "Email",
    "Phone",
    ...duesYears.map((d) => `Dues ${d.year}`),
  ];

  const lines = [header.map(csvField).join(",")];

  for (const m of members) {
    const row: string[] = [m.name, m.address, m.email ?? "", m.phone ?? ""];
    for (const dy of duesYears) {
      const paidAt = paidByMemberYear.get(m.id)?.get(dy.year);
      row.push(paidAt ? `Paid (${paidAt.toISOString().slice(0, 10)})` : "Due");
    }
    lines.push(row.map(csvField).join(","));
  }

  return new Response(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="members-export-${new Date()
        .toISOString()
        .slice(0, 10)}.csv"`,
    },
  });
}
