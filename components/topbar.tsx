"use client";

import { usePathname } from "next/navigation";
import { CommandPalette } from "@/components/command-palette";

const crumbs: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/members": "Members",
  "/dashboard/dues": "Dues",
  "/dashboard/budget": "Budget",
  "/dashboard/settings": "Settings",
  "/dashboard/documents": "Documents",
  "/dashboard/handover": "Handover",
};

export function Topbar({
  associationName,
  userName,
}: {
  associationName: string;
  userName: string;
}) {
  const pathname = usePathname();
  const crumb = pathname.startsWith("/dashboard/meetings")
    ? "Meetings"
    : pathname.startsWith("/dashboard/maintenance")
      ? "Maintenance"
      : crumbs[pathname] ?? "Overview";

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

  return (
    <header className="flex h-14 items-center justify-between border-b border-neutral-200 bg-white px-4 md:px-6">
      <div className="flex min-w-0 items-center gap-2 text-sm">
        <span className="truncate text-neutral-500">{associationName}</span>
        <span className="hidden text-neutral-300 sm:inline">/</span>
        <span className="hidden shrink-0 font-medium text-neutral-900 sm:inline">
          {crumb}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <div className="hidden sm:block">
          <CommandPalette />
        </div>
        <button
          onClick={handleLogout}
          className="rounded-md px-2 py-1 text-sm text-neutral-500 hover:text-neutral-900"
        >
          Log out
        </button>
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-medium text-white"
          title={userName}
        >
          {initials}
        </span>
      </div>
    </header>
  );
}
