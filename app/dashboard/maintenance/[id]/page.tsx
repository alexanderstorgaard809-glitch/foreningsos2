import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";
import { MaintenanceEditor } from "@/components/maintenance-editor";

export const dynamic = "force-dynamic";

export default async function MaintenanceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const auth = await getAuthContext();
  if (!auth) redirect("/login");
  const request = await prisma.maintenanceRequest.findFirst({
    where: { id, associationId: auth.association.id },
  });
  if (!request) notFound();

  return (
    <main className="mx-auto max-w-3xl p-6 lg:p-8">
      <MaintenanceEditor
        request={{
          id: request.id,
          title: request.title,
          category: request.category,
          priority: request.priority,
          status: request.status,
          reporter: request.reporter ?? "",
          description: request.description,
          createdAtLabel: request.createdAt.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
          completedAtLabel: request.completedAt
            ? request.completedAt.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : null,
        }}
      />
    </main>
  );
}
