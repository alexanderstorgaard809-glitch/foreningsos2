import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";
import { formatUsd } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const year = new Date().getFullYear();
  const auth = await getAuthContext();
  if (!auth) redirect("/login");
  const associationId = auth.association.id;
  const [
    memberCount,
    paidCount,
    duesYear,
    newCount,
    inProgressCount,
    budgetItems,
    nextMeeting,
    overdueCharges,
  ] = await Promise.all([
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
    prisma.budgetItem.findMany({
      where: { associationId, year },
    }),
    prisma.meeting.findFirst({
      where: {
        associationId,
        status: "scheduled",
        date: { gte: new Date() },
      },
      orderBy: { date: "asc" },
    }),
    prisma.charge.findMany({
      where: {
        associationId,
        paidAt: null,
        assessedAt: { lt: new Date() },
      },
      include: { member: { select: { name: true } } },
      orderBy: { assessedAt: "asc" },
    }),
  ]);

  const amount = duesYear?.amount ?? 0;
  const percent =
    memberCount === 0 ? 0 : Math.round((paidCount / memberCount) * 100);
  const openRequests = newCount + inProgressCount;

  const overdueTotal = overdueCharges.reduce((sum, c) => sum + c.amount, 0);
  const overdueMembers = new Set(overdueCharges.map((c) => c.memberId)).size;

  const budgetIncome = budgetItems
    .filter((item) => item.kind === "income")
    .reduce((sum, item) => sum + item.amount, 0);
  const budgetExpenses = budgetItems
    .filter((item) => item.kind === "expense")
    .reduce((sum, item) => sum + item.amount, 0);
  const budgetNet = budgetIncome - budgetExpenses;
  const hasBudget = budgetItems.length > 0;

  const nextMeetingDateLabel = nextMeeting
    ? nextMeeting.date.toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";
  const nextMeetingTimeLabel = nextMeeting
    ? nextMeeting.date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <main className="mx-auto max-w-5xl p-6 lg:p-8">
      <h1 className="font-heading text-2xl font-semibold text-neutral-900">
        Overview
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        A quick look at your association.
      </p>

      {overdueCharges.length > 0 && (
        <div className="mt-5 rounded-lg border border-amber-300 bg-amber-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-amber-900">
              {overdueCharges.length} overdue{" "}
              {overdueCharges.length === 1 ? "charge" : "charges"} —{" "}
              {formatUsd(overdueTotal)} unpaid across {overdueMembers}{" "}
              {overdueMembers === 1 ? "member" : "members"}
            </p>
            <Link
              href="/dashboard/dues"
              className="text-xs font-medium text-amber-800 underline hover:text-amber-900"
            >
              Review →
            </Link>
          </div>
          <ul className="mt-2 space-y-1">
            {overdueCharges.slice(0, 3).map((c) => (
              <li key={c.id} className="text-xs text-amber-900">
                {c.member.name} — {formatUsd(c.amount)}, assessed{" "}
                {c.assessedAt.toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  timeZone: "UTC",
                })}
                {c.description ? ` · ${c.description}` : ""}
              </li>
            ))}
            {overdueCharges.length > 3 && (
              <li className="text-xs text-amber-700">
                and {overdueCharges.length - 3} more…
              </li>
            )}
          </ul>
        </div>
      )}

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

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-neutral-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-neutral-500">Budget {year}</p>
            <Link
              href="/dashboard/budget"
              className="text-xs font-medium text-neutral-500 hover:text-neutral-900"
            >
              Open budget →
            </Link>
          </div>
          {hasBudget ? (
            <>
              <p
                className={`font-heading mt-1 text-3xl font-semibold ${
                  budgetNet >= 0 ? "text-emerald-700" : "text-amber-700"
                }`}
              >
                {formatUsd(budgetNet)}
              </p>
              <p className="mt-3 text-xs text-neutral-500">
                Net of {formatUsd(budgetIncome)} planned income and{" "}
                {formatUsd(budgetExpenses)} planned expenses
              </p>
            </>
          ) : (
            <>
              <p className="font-heading mt-1 text-3xl font-semibold text-neutral-300">
                —
              </p>
              <p className="mt-3 text-xs text-neutral-500">
                No budget lines yet — plan the year&apos;s income and expenses.
              </p>
            </>
          )}
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-neutral-500">Next meeting</p>
            <Link
              href="/dashboard/meetings"
              className="text-xs font-medium text-neutral-500 hover:text-neutral-900"
            >
              All meetings →
            </Link>
          </div>
          {nextMeeting ? (
            <>
              <p className="font-heading mt-1 truncate text-lg font-semibold text-neutral-900">
                {nextMeeting.title}
              </p>
              <p className="mt-1.5 text-xs text-neutral-500">
                {nextMeetingDateLabel} · {nextMeetingTimeLabel}
                {nextMeeting.location ? ` · ${nextMeeting.location}` : ""}
              </p>
            </>
          ) : (
            <>
              <p className="font-heading mt-1 text-3xl font-semibold text-neutral-300">
                —
              </p>
              <p className="mt-3 text-xs text-neutral-500">
                Nothing scheduled — set up the next board meeting.
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
