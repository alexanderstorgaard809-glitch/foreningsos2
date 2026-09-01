import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { EmptyScreen } from "@/components/ui/empty-screen";
import { YearSelect } from "@/components/year-select";
import { DuesTable } from "@/components/dues-table";
import { DuesAmountCard } from "@/components/dues-amount-card";

export const dynamic = "force-dynamic";

export default async function DuesPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const { year: yearParam } = await searchParams;
  const currentYear = new Date().getFullYear();
  const year = Number(yearParam) || currentYear;
  const years = Array.from({ length: 4 }, (_, i) => currentYear + 1 - i);

  const auth = await getAuthContext();
  if (!auth) redirect("/login");
  const [members, payments, duesYear] = await Promise.all([
    prisma.member.findMany({
      where: { associationId: auth.association.id },
      orderBy: { name: "asc" },
    }),
    prisma.duesPayment.findMany({
      where: { year, associationId: auth.association.id },
    }),
    prisma.duesYear.findUnique({
      where: {
        associationId_year: { associationId: auth.association.id, year },
      },
    }),
  ]);

  if (members.length === 0) {
    return (
      <main className="mx-auto max-w-5xl p-6 lg:p-8">
        <h1 className="font-heading text-2xl font-semibold text-neutral-900">
          Dues {year}
        </h1>
        <div className="mt-8 rounded-lg border border-neutral-200 bg-white">
          <EmptyScreen
            title="No members yet"
            description="Dues tracking needs members first. Add your members, then come back here to start tracking payments."
          />
          <div className="flex justify-center pb-8">
            <Button href="/dashboard/members" size="sm">
              Go to members
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const paidByMember = new Map(payments.map((p) => [p.memberId, p.paidAt]));

  const rows = members
    .map((m) => {
      const paidAt = paidByMember.get(m.id) ?? null;
      return {
        id: m.id,
        name: m.name,
        address: m.address,
        email: m.email,
        paid: paidAt !== null,
        paidAtLabel: paidAt
          ? paidAt.toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : null,
      };
    })
    .sort((a, b) =>
      a.paid === b.paid ? a.name.localeCompare(b.name) : a.paid ? 1 : -1
    );

  return (
    <main className="mx-auto max-w-5xl p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-neutral-900">
            Dues {year}
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Track who has paid their annual dues.
          </p>
        </div>
        <YearSelect years={years} selected={year} />
      </div>

      <DuesAmountCard
        year={year}
        paidCount={payments.length}
        memberCount={members.length}
        amount={duesYear?.amount ?? 0}
      />

      <DuesTable
        year={year}
        members={rows}
        amount={duesYear?.amount ?? 0}
        associationName={auth.association.name}
        contactEmail={auth.association.contactEmail ?? ""}
      />
    </main>
  );
}
