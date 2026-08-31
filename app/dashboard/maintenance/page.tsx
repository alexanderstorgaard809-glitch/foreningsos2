import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";
import { MaintenanceView } from "@/components/maintenance-view";

export const dynamic = "force-dynamic";

export default async function MaintenancePage() {
  const auth = await getAuthContext();
  if (!auth) redirect("/login");
  const [requests, members] = await Promise.all([
    prisma.maintenanceRequest.findMany({
      where: { associationId: auth.association.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.member.findMany({
      where: { associationId: auth.association.id },
      select: { name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const rows = requests.map((r) => ({
    id: r.id,
    title: r.title,
    category: r.category,
    priority: r.priority,
    status: r.status,
    reporter: r.reporter ?? "",
    dateLabel: r.createdAt.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    completedLabel: r.completedAt
      ? r.completedAt.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : null,
  }));

  return (
    <main className="mx-auto max-w-5xl p-6 lg:p-8">
      <h1 className="font-heading text-2xl font-semibold text-neutral-900">
        Maintenance
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        Repair requests from residents and the board — one queue instead of a
        text message maze.
      </p>
      <MaintenanceView initialRequests={rows} memberNames={members.map((m) => m.name)} />
    </main>
  );
}
