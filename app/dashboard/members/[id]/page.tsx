import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";
import { MemberLedger } from "@/components/member-ledger";

export const dynamic = "force-dynamic";

export default async function MemberLedgerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const auth = await getAuthContext();
  if (!auth) redirect("/login");

  const member = await prisma.member.findFirst({
    where: { id, associationId: auth.association.id },
  });
  if (!member) notFound();

  const [payments, duesYears, charges] = await Promise.all([
    prisma.duesPayment.findMany({ where: { memberId: member.id } }),
    prisma.duesYear.findMany({
      where: { associationId: auth.association.id },
    }),
    prisma.charge.findMany({
      where: { associationId: auth.association.id, memberId: member.id },
      orderBy: { assessedAt: "desc" },
    }),
  ]);

  const amountByYear = new Map(duesYears.map((d) => [d.year, d.amount]));
  const paidByYear = new Map(payments.map((p) => [p.year, p.paidAt]));

  const yearSet = new Set<number>([
    ...duesYears.map((d) => d.year),
    ...payments.map((p) => p.year),
    new Date().getFullYear(),
  ]);

  const rows = [...yearSet]
    .sort((a, b) => b - a)
    .map((year) => {
      const paidAt = paidByYear.get(year) ?? null;
      return {
        year,
        amount: amountByYear.get(year) ?? null,
        paid: paidAt !== null,
        paidAtLabel: paidAt
          ? paidAt.toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : null,
      };
    });

  const duesBilled = rows.reduce((sum, r) => sum + (r.amount ?? 0), 0);
  const duesCollected = rows.reduce(
    (sum, r) => sum + (r.amount !== null && r.paid ? r.amount : 0),
    0
  );

  const chargesBilled = charges.reduce((sum, c) => sum + c.amount, 0);
  const chargesCollected = charges.reduce(
    (sum, c) => sum + (c.paidAt ? c.amount : 0),
    0
  );

  const chargeRows = charges.map((c) => ({
    id: c.id,
    kind: c.kind,
    description: c.description ?? "",
    amount: c.amount,
    assessedLabel: c.assessedAt.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }),
    paid: c.paidAt !== null,
    paidAtLabel: c.paidAt
      ? c.paidAt.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : null,
  }));

  return (
    <main className="mx-auto max-w-3xl p-6 lg:p-8">
      <MemberLedger
        memberId={member.id}
        member={{
          name: member.name,
          address: member.address,
          email: member.email ?? "",
          phone: member.phone ?? "",
        }}
        associationName={auth.association.name}
        contactEmail={auth.association.contactEmail ?? ""}
        rows={rows}
        charges={chargeRows}
        totals={{
          billed: duesBilled + chargesBilled,
          collected: duesCollected + chargesCollected,
          outstanding:
            duesBilled +
            chargesBilled -
            duesCollected -
            chargesCollected,
          hasUntrackedYears: rows.some((r) => r.amount === null),
        }}
      />
    </main>
  );
}
