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

  const [payments, duesYears] = await Promise.all([
    prisma.duesPayment.findMany({ where: { memberId: member.id } }),
    prisma.duesYear.findMany({
      where: { associationId: auth.association.id },
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

  const billed = rows.reduce((sum, r) => sum + (r.amount ?? 0), 0);
  const collected = rows.reduce(
    (sum, r) => sum + (r.amount !== null && r.paid ? r.amount : 0),
    0
  );

  return (
    <main className="mx-auto max-w-3xl p-6 lg:p-8">
      <MemberLedger
        member={{
          name: member.name,
          address: member.address,
          email: member.email ?? "",
          phone: member.phone ?? "",
        }}
        associationName={auth.association.name}
        contactEmail={auth.association.contactEmail ?? ""}
        rows={rows}
        totals={{
          billed,
          collected,
          outstanding: billed - collected,
          hasUntrackedYears: rows.some((r) => r.amount === null),
        }}
      />
    </main>
  );
}
