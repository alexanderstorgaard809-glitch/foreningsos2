"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/components/sidebar";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-neutral-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
      {navItems.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.label}
            href={item.href}
            aria-label={item.label}
            className={`flex flex-col items-center gap-0.5 py-2 px-1 ${
              active ? "text-neutral-900" : "text-neutral-400"
            }`}
          >
            {item.icon}
            <span className="text-[10px] leading-none">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
