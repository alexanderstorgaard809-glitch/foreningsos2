"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatUsd } from "@/lib/format";

export type LedgerRow = {
  year: number;
  amount: number | null;
  paid: boolean;
  paidAtLabel: string | null;
};

export type MemberLedgerProps = {
  member: {
    name: string;
    address: string;
    email: string;
    phone: string;
  };
  associationName: string;
  contactEmail: string;
  rows: LedgerRow[];
  totals: {
    billed: number;
    collected: number;
    outstanding: number;
    hasUntrackedYears: boolean;
  };
};

export function MemberLedger({
  member,
  associationName,
  contactEmail,
  rows,
  totals,
}: MemberLedgerProps) {
  const [copied, setCopied] = useState(false);

  async function copyStatement() {
    const lines = [
      associationName,
      "",
      `LEDGER — ${member.name}`,
      "",
      `Member: ${member.name}`,
      `Address: ${member.address || "—"}`,
      `Email: ${member.email || "—"}`,
      "",
      ...rows.map((r) => {
        const amount = r.amount !== null ? formatUsd(r.amount) : "—";
        const status = r.paid
          ? `Paid${r.paidAtLabel ? ` on ${r.paidAtLabel}` : ""}`
          : "Due";
        return `${r.year}   ${amount}   ${status}`;
      }),
      "",
      `Total billed: ${formatUsd(totals.billed)}`,
      `Total collected: ${formatUsd(totals.collected)}`,
      `Outstanding balance: ${formatUsd(totals.outstanding)}`,
      "",
      `Generated ${new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}`,
    ];

    if (contactEmail.trim()) {
      lines.push(`Questions? Contact: ${contactEmail.trim()}`);
    }

    await navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <Link
        href="/dashboard/members"
        className="text-sm text-neutral-500 hover:text-neutral-900"
      >
        Back to members
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-neutral-900">
            {member.name}
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Dues ledger{member.address ? ` · ${member.address}` : ""}
          </p>
        </div>
        <Button size="sm" variant="secondary" onClick={copyStatement}>
          {copied ? "Copied!" : "Copy ledger"}
        </Button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-neutral-200 bg-white p-5">
          <p className="text-sm text-neutral-500">Total billed</p>
          <p className="font-heading mt-1 text-2xl font-semibold text-neutral-900">
            {formatUsd(totals.billed)}
          </p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-5">
          <p className="text-sm text-neutral-500">Collected</p>
          <p className="font-heading mt-1 text-2xl font-semibold text-neutral-900">
            {formatUsd(totals.collected)}
          </p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-5">
          <p className="text-sm text-neutral-500">Outstanding</p>
          <p
            className={`font-heading mt-1 text-2xl font-semibold ${
              totals.outstanding > 0 ? "text-amber-700" : "text-emerald-700"
            }`}
          >
            {formatUsd(totals.outstanding)}
          </p>
        </div>
      </div>

      {totals.hasUntrackedYears && (
        <p className="mt-3 text-xs text-neutral-500">
          Years without an annual amount set are excluded from the totals. Set
          the amount on the Dues page to include them.
        </p>
      )}

      <div className="mt-6 overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200">
            <tr className="text-xs font-medium text-neutral-500">
              <th className="px-4 py-3">Year</th>
              <th className="px-4 py-3">Annual amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Paid on</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {rows.map((r) => (
              <tr key={r.year} className="hover:bg-neutral-50">
                <td className="px-4 py-3 font-medium text-neutral-900">
                  {r.year}
                </td>
                <td className="px-4 py-3 text-neutral-600">
                  {r.amount !== null ? formatUsd(r.amount) : "—"}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={r.paid ? "success" : "warning"}>
                    {r.paid ? "Paid" : "Due"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-neutral-500">
                  {r.paidAtLabel ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
