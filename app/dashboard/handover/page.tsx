import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";
import { HandoverView } from "@/components/handover-view";

export const dynamic = "force-dynamic";

export default async function HandoverPage() {
  const auth = await getAuthContext();
  if (!auth) redirect("/login");
  const associationId = auth.association.id;
  const now = new Date();

  const [
    users,
    memberCount,
    duesYears,
    payments,
    unpaidCharges,
    openRequests,
    upcomingMeetings,
    documents,
    documentCount,
  ] = await Promise.all([
    prisma.user.findMany({
      where: { associationId },
      select: { id: true, name: true, email: true, role: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.member.count({ where: { associationId } }),
    prisma.duesYear.findMany({
      where: { associationId },
      orderBy: { year: "desc" },
    }),
    prisma.duesPayment.findMany({ where: { associationId } }),
    prisma.charge.findMany({
      where: { associationId, paidAt: null },
      select: { amount: true },
    }),
    prisma.maintenanceRequest.findMany({
      where: { associationId, status: { not: "done" } },
      select: { title: true, status: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.meeting.findMany({
      where: { associationId, status: "scheduled", date: { gte: now } },
      select: { title: true, date: true, location: true },
      orderBy: { date: "asc" },
      take: 3,
    }),
    prisma.document.findMany({
      where: { associationId },
      select: { name: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.document.count({ where: { associationId } }),
  ]);

  const charges = {
    count: unpaidCharges.length,
    total: unpaidCharges.reduce((sum, c) => sum + c.amount, 0),
  };

  const dues = duesYears.map((dy) => {
    const paidCount = payments.filter((p) => p.year === dy.year).length;
    return {
      year: dy.year,
      amount: dy.amount,
      paidCount,
      memberCount,
      percent:
        memberCount === 0 ? 0 : Math.round((paidCount / memberCount) * 100),
    };
  });

  const maintenance = {
    openCount: openRequests.length,
    items: openRequests.map((r) => ({ title: r.title, status: r.status })),
  };

  const meetings = upcomingMeetings.map((m) => ({
    title: m.title,
    dateLabel: m.date.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    timeLabel: m.date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    location: m.location ?? "",
  }));

  return (
    <main className="mx-auto max-w-3xl p-6 lg:p-8">
      <HandoverView
        isOwner={auth.user.role === "owner"}
        association={{
          name: auth.association.name,
          address: auth.association.address ?? "",
          city: auth.association.city ?? "",
          contactEmail: auth.association.contactEmail ?? "",
        }}
        users={users}
        memberCount={memberCount}
        duesYears={dues}
        charges={charges}
        maintenance={maintenance}
        meetings={meetings}
        documentCount={documentCount}
        documentNames={documents.map((d) => d.name)}
      />
    </main>
  );
}
