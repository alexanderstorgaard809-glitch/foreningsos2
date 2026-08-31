"use client";

import { usePathname, useRouter } from "next/navigation";

export function YearSelect({
  years,
  selected,
}: {
  years: number[];
  selected: number;
}) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <select
      value={selected}
      onChange={(e) => router.push(`${pathname}?year=${e.target.value}`)}
      className="h-9 rounded-md border border-neutral-200 bg-white px-3 text-sm text-neutral-900 shadow-sm focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
    >
      {years.map((y) => (
        <option key={y} value={y}>
          {y}
        </option>
      ))}
    </select>
  );
}
