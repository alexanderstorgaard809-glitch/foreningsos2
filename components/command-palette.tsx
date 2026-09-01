"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const destinations = [
  { label: "Overview", href: "/dashboard" },
  { label: "Members", href: "/dashboard/members" },
  { label: "Dues", href: "/dashboard/dues" },
  { label: "Budget", href: "/dashboard/budget" },
  { label: "Meetings", href: "/dashboard/meetings" },
  { label: "Maintenance", href: "/dashboard/maintenance" },
  { label: "Documents", href: "/dashboard/documents" },
  { label: "Settings", href: "/dashboard/settings" },
  { label: "Back to website", href: "/" },
];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      inputRef.current?.focus();
    }
  }, [open]);

  const results = destinations.filter((d) =>
    d.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden h-8 w-56 items-center justify-between rounded-md border border-neutral-200 bg-neutral-50 px-3 text-sm text-neutral-400 hover:bg-neutral-100 sm:flex"
      >
        Search...
        <kbd className="rounded border border-neutral-200 bg-white px-1.5 text-xs text-neutral-500">
          K
        </kbd>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-neutral-900/40"
          onClick={() => setOpen(false)}
        >
          <div
            className="mx-auto mt-[15vh] max-w-md overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a command or search..."
              className="w-full border-b border-neutral-200 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
            />
            <ul className="max-h-64 overflow-y-auto p-2">
              {results.length === 0 && (
                <li className="px-3 py-6 text-center text-sm text-neutral-400">
                  No results
                </li>
              )}
              {results.map((d) => (
                <li key={d.href}>
                  <button
                    onClick={() => {
                      setOpen(false);
                      router.push(d.href);
                    }}
                    className="w-full rounded-md px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100"
                  >
                    {d.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
