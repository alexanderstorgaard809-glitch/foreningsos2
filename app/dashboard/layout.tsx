import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { MobileNav } from "@/components/mobile-nav";
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
    <div className="flex min-h-screen bg-neutral-50">
      <Sidebar />
      <div className="flex-1 pb-16 md:pb-0">
        <Topbar
          associationName={auth.association.name}
          userName={auth.user.name}
        />
        {children}
      </div>
      <MobileNav />
    </div>
  );
}
