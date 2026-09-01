"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/search-input";
import { formatUsd } from "@/lib/format";

export type DuesRow = {
  id: string;
  name: string;
  address: string;
  paid: boolean;
  paidAtLabel: string | null;
  email: string | null;
};

export function DuesTable({
  year,
  members,
  amount,
  associationName,
  contactEmail,
}: {
  year: number;
  members: DuesRow[];
  amount: number;
  associationName: string;
  contactEmail: string;
}) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedList, setCopiedList] = useState(false);
  const [query, setQuery] = useState("");

  const filteredMembers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) =>
      [m.name, m.address].some((field) => field.toLowerCase().includes(q))
    );
  }, [members, query]);

  const unpaid = members.filter((m) => !m.paid);

  function reminderText(member: DuesRow): string {
    const lines = [
      `Hi ${member.name},`,
      "",
      `Our records show that the ${year} annual dues${
        amount > 0 ? ` (${formatUsd(amount)})` : ""
      } for ${associationName} are still outstanding.`,
      "",
      "If you have already paid, please disregard this message — and let us know so we can correct our records.",
      "",
      contactEmail.trim()
        ? `Questions? Reply here or contact ${contactEmail.trim()}.`
        : "Questions? Just reply to this message.",
    ];
    return lines.join("\n");
  }

  async function copyReminder(member: DuesRow) {
    await navigator.clipboard.writeText(reminderText(member));
    setCopiedId(member.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function copyList() {
    const lines = [
      `Outstanding dues ${year} — ${unpaid.length} member${
        unpaid.length === 1 ? "" : "s"
      }`,
      "",
      ...unpaid.map((m) => {
        const email =
          m.email && m.email.trim() ? m.email.trim() : "no email on file";
        return `- ${m.name}${amount > 0 ? ` — ${formatUsd(amount)}` : ""} — ${email}`;
      }),
    ];
    await navigator.clipboard.writeText(lines.join("\n"));
    setCopiedList(true);
    setTimeout(() => setCopiedList(false), 2000);
  }

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
    <div className="mt-6">
      {unpaid.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5">
          <p className="text-sm text-amber-800">
            {unpaid.length} member{unpaid.length === 1 ? "" : "s"} outstanding
            for {year}
          </p>
          <button
            onClick={copyList}
            className="text-sm font-medium text-amber-800 underline hover:text-amber-900"
          >
            {copiedList ? "Copied!" : "Copy reminder list"}
          </button>
        </div>
      )}

      {members.length > 0 && (
        <div className="mb-3">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search members"
          />
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
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
            {filteredMembers.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-sm text-neutral-500"
                >
                  No members match &ldquo;{query.trim()}&rdquo;
                </td>
              </tr>
            )}
            {filteredMembers.map((m) => (
              <tr key={m.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3 font-medium text-neutral-900">
                  <Link
                    href={`/dashboard/members/${m.id}`}
                    className="hover:underline"
                  >
                    {m.name}
                  </Link>
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
                  <div className="flex items-center justify-end gap-3">
                    {!m.paid && (
                      <button
                        onClick={() => copyReminder(m)}
                        className="text-sm font-medium text-neutral-500 hover:text-neutral-900"
                      >
                        {copiedId === m.id ? "Copied!" : "Copy reminder"}
                      </button>
                    )}
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
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
