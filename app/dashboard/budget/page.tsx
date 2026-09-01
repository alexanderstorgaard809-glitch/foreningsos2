import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";
import { YearSelect } from "@/components/year-select";
import { BudgetView } from "@/components/budget-view";

export const dynamic = "force-dynamic";

export default async function BudgetPage({
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
  const associationId = auth.association.id;

  const [items, memberCount, duesYear, prevYearCount] = await Promise.all([
    prisma.budgetItem.findMany({
      where: { associationId, year },
      orderBy: { createdAt: "asc" },
    }),
    prisma.member.count({ where: { associationId } }),
    prisma.duesYear.findUnique({
      where: { associationId_year: { associationId, year } },
    }),
    prisma.budgetItem.count({ where: { associationId, year: year - 1 } }),
  ]);

  const rows = items.map((item) => ({
    id: item.id,
    name: item.name,
    amount: item.amount,
    pot: item.pot,
    kind: item.kind,
  }));

  return (
    <main className="mx-auto max-w-5xl p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-neutral-900">
            Budget {year}
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Plan income and expenses for the year — operating and reserve.
          </p>
        </div>
        <YearSelect years={years} selected={year} />
      </div>

      <BudgetView
        year={year}
        prevYear={year - 1}
        prevYearCount={prevYearCount}
        lines={rows}
        duesAmount={duesYear?.amount ?? 0}
        memberCount={memberCount}
      />
    </main>
  );
}