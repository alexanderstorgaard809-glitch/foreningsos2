import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";
import { AnnouncementsView } from "@/components/announcements-view";

export const dynamic = "force-dynamic";

export default async function AnnouncementsPage() {
  const auth = await getAuthContext();
  if (!auth) redirect("/login");

  const [announcements, memberEmailCounts] = await Promise.all([
    prisma.announcement.findMany({
      where: { associationId: auth.association.id },
      orderBy: { sentAt: "desc" },
      take: 20,
    }),
    prisma.member.findMany({
      where: { associationId: auth.association.id },
      select: { email: true },
    }),
  ]);

  const withEmail = memberEmailCounts.filter((m) => m.email).length;

  return (
    <main className="mx-auto max-w-3xl p-6 lg:p-8">
      <h1 className="font-heading text-2xl font-semibold text-neutral-900">
        Announcements
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        Email all members — notices, reminders, community updates.
      </p>
      <AnnouncementsView
        announcements={announcements.map((a) => ({
          id: a.id,
          subject: a.subject,
          sentLabel: a.sentAt.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          recipientCount: a.recipientCount,
          failedCount: a.failedCount,
        }))}
        membersWithEmail={withEmail}
        membersTotal={memberEmailCounts.length}
        emailConfigured={Boolean(process.env.RESEND_API_KEY)}
      />
    </main>
  );
}
