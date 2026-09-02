import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";
import { MeetingEditor } from "@/components/meeting-editor";
import { MeetingAttendance } from "@/components/meeting-attendance";

export const dynamic = "force-dynamic";

export default async function MeetingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const auth = await getAuthContext();
  if (!auth) redirect("/login");

  const meeting = await prisma.meeting.findFirst({
    where: { id, associationId: auth.association.id },
  });
  if (!meeting) notFound();

  const [members, responses] = await Promise.all([
    prisma.member.findMany({
      where: { associationId: auth.association.id },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
    prisma.meetingResponse.findMany({
      where: { associationId: auth.association.id, meetingId: meeting.id },
    }),
  ]);

  const d = meeting.date;
  const pad = (n: number) => String(n).padStart(2, "0");

  const dateLabel = d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="mx-auto max-w-3xl p-6 lg:p-8">
      <MeetingEditor
        meeting={{
          id: meeting.id,
          title: meeting.title,
          type: meeting.type,
          status: meeting.status,
          location: meeting.location ?? "",
          agenda: meeting.agenda,
          minutes: meeting.minutes ?? "",
          associationName: auth.association.name,
          contactEmail: auth.association.contactEmail ?? "",
          dateValue: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
            d.getDate()
          )}T${pad(d.getHours())}:${pad(d.getMinutes())}`,
          dateLabel,
          timeLabel: d.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }}
      />

      <MeetingAttendance
        meetingId={meeting.id}
        meetingTitle={meeting.title}
        dateLabel={dateLabel}
        quorumRequired={meeting.quorumRequired}
        members={members}
        responses={responses.map((r) => ({
          memberId: r.memberId,
          status: r.status,
          proxyHolder: r.proxyHolder ?? "",
          respondedLabel: r.respondedAt.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
          }),
        }))}
        associationName={auth.association.name}
        contactEmail={auth.association.contactEmail ?? ""}
      />
    </main>
  );
}
