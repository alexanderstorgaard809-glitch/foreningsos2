import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";
import { toSettings } from "@/lib/settings";
import { SettingsForm } from "@/components/settings-form";
import { BoardMembersCard } from "@/components/board-members-card";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const auth = await getAuthContext();
  if (!auth) redirect("/login");

  const users = await prisma.user.findMany({
    where: { associationId: auth.association.id },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const invite =
    auth.association.inviteCode &&
    auth.association.inviteExpiresAt &&
    auth.association.inviteExpiresAt > new Date()
      ? {
          code: auth.association.inviteCode,
          expiresLabel: auth.association.inviteExpiresAt.toLocaleDateString(
            "en-GB",
            { day: "numeric", month: "short", year: "numeric" }
          ),
        }
      : null;

  return (
    <main className="mx-auto max-w-3xl p-6 lg:p-8">
      <h1 className="font-heading text-2xl font-semibold text-neutral-900">
        Settings
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        Details about your association, used across HOAcove.
      </p>

      <SettingsForm settings={toSettings(auth.association)} />

      <BoardMembersCard
        users={users.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          joinedLabel: u.createdAt.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
        }))}
        isOwner={auth.user.role === "owner"}
        invite={invite}
      />
    </main>
  );
}
