import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { formatUsd } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const year = new Date().getFullYear();
  const auth = await getAuthContext();
  if (!auth) redirect("/login");
  const associationId = auth.association.id;
  const [memberCount, paidCount, duesYear, newCount, inProgressCount] =
    await Promise.all([
      prisma.member.count({ where: { associationId } }),
      prisma.duesPayment.count({ where: { year, associationId } }),
      prisma.duesYear.findUnique({
        where: { associationId_year: { associationId, year } },
      }),
      prisma.maintenanceRequest.count({
        where: { status: "new", associationId },
      }),
      prisma.maintenanceRequest.count({
        where: { status: "in_progress", associationId },
      }),
    ]);

  const amount = duesYear?.amount ?? 0;
  const percent =
    memberCount === 0 ? 0 : Math.round((paidCount / memberCount) * 100);
  const openRequests = newCount + inProgressCount;

  return (
    <main className="mx-auto max-w-5xl p-6 lg:p-8">
      <h1 className="font-heading text-2xl font-semibold text-neutral-900">
        Overview
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        A quick look at your association.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-neutral-200 bg-white p-5">
          <p className="text-sm text-neutral-500">Members</p>
          <p className="font-heading mt-1 text-3xl font-semibold text-neutral-900">
            {memberCount}
          </p>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-5">
          <p className="text-sm text-neutral-500">Dues {year}</p>
          <p className="font-heading mt-1 text-3xl font-semibold text-neutral-900">
            {percent}%
          </p>
          <div className="mt-3 h-1.5 w-full rounded-full bg-neutral-100">
            <div
              className="h-1.5 rounded-full bg-emerald-500 transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-neutral-500">
            {amount > 0 && memberCount > 0
              ? `${formatUsd(paidCount * amount)} of ${formatUsd(
                  memberCount * amount
                )} collected`
              : `${paidCount} of ${memberCount} paid`}
          </p>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-5">
          <p className="text-sm text-neutral-500">Open maintenance requests</p>
          <p className="font-heading mt-1 text-3xl font-semibold text-neutral-900">
            {openRequests}
          </p>
          <p className="mt-3 text-xs text-neutral-500">
            {openRequests === 0
              ? "All clear"
              : `${newCount} new · ${inProgressCount} in progress`}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-dashed border-neutral-300 bg-white p-8 text-center">
        <p className="text-sm font-medium text-neutral-900">
          The full toolkit is live
        </p>
        <p className="mt-1 text-sm text-neutral-500">
          Members, dues, meetings, maintenance and documents — everything a
          volunteer board needs, in one place.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Button href="/dashboard/members" size="sm" variant="secondary">
            Members
          </Button>
          <Button href="/dashboard/dues" size="sm" variant="secondary">
            Dues
          </Button>
          <Button href="/dashboard/meetings" size="sm" variant="secondary">
            Meetings
          </Button>
          <Button href="/dashboard/maintenance" size="sm" variant="secondary">
            Maintenance
          </Button>
          <Button href="/dashboard/documents" size="sm">
            Documents
          </Button>
        </div>
      </div>
    </main>
  );
}
