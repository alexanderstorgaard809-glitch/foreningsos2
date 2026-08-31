"use client";

import { usePathname } from "next/navigation";
import { CommandPalette } from "@/components/command-palette";

const crumbs: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/members": "Members",
  "/dashboard/dues": "Dues",
  "/dashboard/settings": "Settings",
  "/dashboard/documents": "Documents",
};

export function Topbar({
  associationName,
  userName,
}: {
  associationName: string;
  userName: string;
}) {
  const pathname = usePathname();
  const initials = userName
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.assign("/login");
  }

  const crumb = pathname.startsWith("/dashboard/meetings")
    ? "Meetings"
    : pathname.startsWith("/dashboard/maintenance")
      ? "Maintenance"
      : crumbs[pathname] ?? "Overview";

  return (
    <header className="flex h-14 items-center justify-between border-b border-neutral-200 bg-white px-6">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-neutral-500">{associationName}</span>
        <span className="text-neutral-300">/</span>
        <span className="font-medium text-neutral-900">{crumb}</span>
      </div>
      <div className="flex items-center gap-3">
        <CommandPalette />
        <button
          onClick={handleLogout}
          className="rounded-md px-2 py-1 text-sm text-neutral-500 hover:text-neutral-900"
        >
          Log out
        </button>
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-xs font-medium text-white"
          title={userName}
        >
          {initials}
        </span>
      </div>
    </header>
  );
}
