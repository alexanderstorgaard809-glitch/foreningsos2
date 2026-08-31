import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";
import { MembersTable } from "@/components/members-table";
import { ImportMembers } from "@/components/import-members";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const auth = await getAuthContext();
  if (!auth) redirect("/login");
  const members = await prisma.member.findMany({
    where: { associationId: auth.association.id },
    orderBy: { name: "asc" },
  });

  return (
    <main className="mx-auto max-w-5xl p-6 lg:p-8">
      <h1 className="font-heading text-2xl font-semibold text-neutral-900">
        Members
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        Add, edit and remove members of your association.
      </p>
      <ImportMembers />
      <MembersTable initialMembers={members} />
    </main>
  );
}
