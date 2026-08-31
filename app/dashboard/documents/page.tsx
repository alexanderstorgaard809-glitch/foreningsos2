import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";
import { DocumentsView } from "@/components/documents-view";

export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  const auth = await getAuthContext();
  if (!auth) redirect("/login");
  const documents = await prisma.document.findMany({
    where: { associationId: auth.association.id },
    orderBy: { createdAt: "desc" },
  });

  const rows = documents.map((d) => ({
    id: d.id,
    name: d.name,
    size: d.size,
    isImage: d.mimeType.startsWith("image/"),
    dateLabel: d.createdAt.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
  }));

  return (
    <main className="mx-auto max-w-5xl p-6 lg:p-8">
      <h1 className="font-heading text-2xl font-semibold text-neutral-900">
        Documents
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        Bylaws, budgets, insurance policies, minutes — the association's
        archive.
      </p>
      <DocumentsView initialDocuments={rows} />
    </main>
  );
}
