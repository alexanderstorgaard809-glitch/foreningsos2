import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";
import { MeetingsView } from "@/components/meetings-view";

export const dynamic = "force-dynamic";

export default async function MeetingsPage() {
  const auth = await getAuthContext();
  if (!auth) redirect("/login");
  const meetings = await prisma.meeting.findMany({
    where: { associationId: auth.association.id },
    orderBy: { date: "asc" },
  });
  const now = new Date();

  const rows = meetings.map((m) => ({
    id: m.id,
    title: m.title,
    type: m.type,
    status: m.status,
    location: m.location ?? "",
    dateLabel: m.date.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    timeLabel: m.date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    isUpcoming: m.status === "scheduled" && m.date >= now,
  }));

  return (
    <main className="mx-auto max-w-5xl p-6 lg:p-8">
      <h1 className="font-heading text-2xl font-semibold text-neutral-900">
        Meetings
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        Plan meetings, share the agenda, and keep minutes in the archive.
      </p>
      <MeetingsView initialMeetings={rows} />
    </main>
  );
}
