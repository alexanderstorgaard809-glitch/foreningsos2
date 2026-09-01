import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { getAuthContext } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getAuthContext();
  if (!auth) redirect("/login");

  return (
    <div className="min-h-screen bg-neutral-50">
      <Sidebar />

      <div className="flex min-h-screen flex-col md:pl-56">
        {/* Desktop topbar */}
        <div className="hidden md:block">
          <Topbar
            associationName={auth.association.name}
            userName={auth.user.name}
          />
        </div>

        {/* Mobile: association name strip under the fixed hamburger bar */}
        <div className="border-b border-neutral-200 bg-white px-4 py-2 md:hidden">
          <p className="truncate text-sm text-neutral-500">
            {auth.association.name}
          </p>
        </div>

        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
