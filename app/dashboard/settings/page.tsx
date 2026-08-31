import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth";
import { toSettings } from "@/lib/settings";
import { SettingsForm } from "@/components/settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const auth = await getAuthContext();
  if (!auth) redirect("/login");

  return (
    <main className="mx-auto max-w-3xl p-6 lg:p-8">
      <h1 className="font-heading text-2xl font-semibold text-neutral-900">
        Settings
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        Details about your association, used across HOAcove.
      </p>

      <SettingsForm settings={toSettings(auth.association)} />

      <div className="mt-4 rounded-lg border border-dashed border-neutral-300 bg-white p-6 text-center">
        <p className="text-sm font-medium text-neutral-900">
          Board members & roles
        </p>
        <p className="mt-1 text-sm text-neutral-500">
          Invite co-board members — coming soon.
        </p>
      </div>
    </main>
  );
}
