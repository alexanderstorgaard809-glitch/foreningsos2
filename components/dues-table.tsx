"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type DuesRow = {
  id: string;
  name: string;
  address: string;
  paid: boolean;
  paidAtLabel: string | null;
};

export function DuesTable({
  year,
  members,
}: {
  year: number;
  members: DuesRow[];
}) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function toggle(member: DuesRow) {
    setPendingId(member.id);
    try {
      if (member.paid) {
        await fetch(`/api/dues?memberId=${member.id}&year=${year}`, {
          method: "DELETE",
        });
      } else {
        await fetch("/api/dues", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ memberId: member.id, year }),
        });
      }
      router.refresh();
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-neutral-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-neutral-200">
          <tr className="text-xs font-medium text-neutral-500">
            <th className="px-4 py-3">Name</th>
            <th className="hidden px-4 py-3 sm:table-cell">Address</th>
            <th className="px-4 py-3">Status</th>
            <th className="hidden px-4 py-3 sm:table-cell">Paid on</th>
            <th className="px-4 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {members.map((m) => (
            <tr key={m.id} className="hover:bg-neutral-50">
              <td className="px-4 py-3 font-medium text-neutral-900">
                {m.name}
              </td>
              <td className="hidden px-4 py-3 text-neutral-600 sm:table-cell">
                {m.address}
              </td>
              <td className="px-4 py-3">
                <Badge variant={m.paid ? "success" : "warning"}>
                  {m.paid ? "Paid" : "Due"}
                </Badge>
              </td>
              <td className="hidden px-4 py-3 text-neutral-500 sm:table-cell">
                {m.paidAtLabel ?? "—"}
              </td>
              <td className="px-4 py-3 text-right">
                <Button
                  size="sm"
                  variant={m.paid ? "secondary" : "primary"}
                  disabled={pendingId === m.id}
                  onClick={() => toggle(m)}
                >
                  {pendingId === m.id
                    ? "Saving..."
                    : m.paid
                      ? "Mark as due"
                      : "Mark as paid"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
