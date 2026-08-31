import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";
import { MeetingEditor } from "@/components/meeting-editor";

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

  const d = meeting.date;
  const pad = (n: number) => String(n).padStart(2, "0");

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
          dateLabel: d.toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
          timeLabel: d.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }}
      />
    </main>
  );
}
