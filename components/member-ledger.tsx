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

export type ChargeRow = {
  id: string;
  kind: string;
  description: string;
  amount: number;
  assessedLabel: string;
  paid: boolean;
  paidAtLabel: string | null;
};

export type MemberLedgerProps = {
  memberId: string;
  member: {
    name: string;
    address: string;
    email: string;
    phone: string;
  };
  associationName: string;
  contactEmail: string;
  rows: LedgerRow[];
  charges: ChargeRow[];
  totals: {
    billed: number;
    collected: number;
    outstanding: number;
    hasUntrackedYears: boolean;
  };
};

const kindLabels: Record<string, string> = {
  late_fee: "Late fee",
  special_assessment: "Special assessment",
};

export function MemberLedger({
  memberId,
  member,
  associationName,
  contactEmail,
  rows,
  charges,
  totals,
}: MemberLedgerProps) {
  const [copied, setCopied] = useState(false);
  const [showChargeForm, setShowChargeForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [kind, setKind] = useState("late_fee");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [assessedAt, setAssessedAt] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [error, setError] = useState("");

  async function addCharge() {
    setBusy(true);
    setError("");
    const res = await fetch("/api/charges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        memberId,
        kind,
        description,
        amount: Number(amount),
        assessedAt,
      }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Something went wrong");
      return;
    }
    setKind("late_fee");
    setDescription("");
    setAmount("");
    setShowChargeForm(false);
    window.location.reload();
  }

  async function togglePaid(id: string, paid: boolean) {
    setBusy(true);
    await fetch(`/api/charges/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paid: !paid }),
    });
    setBusy(false);
    window.location.reload();
  }

  async function deleteCharge(id: string) {
    if (!confirm("Delete this charge?")) return;
    setBusy(true);
    await fetch(`/api/charges/${id}`, { method: "DELETE" });
    setBusy(false);
    window.location.reload();
  }

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
      ...charges.map((c) => {
        const label = kindLabels[c.kind] ?? c.kind;
        const desc = c.description ? ` (${c.description})` : "";
        const status = c.paid
          ? `Paid${c.paidAtLabel ? ` on ${c.paidAtLabel}` : ""}`
          : "Unpaid";
        return `${label}${desc} — assessed ${c.assessedLabel}   ${formatUsd(c.amount)}   ${status}`;
      }),
      charges.length ? "" : null,
      `Total billed: ${formatUsd(totals.billed)}`,
      `Total collected: ${formatUsd(totals.collected)}`,
      `Outstanding balance: ${formatUsd(totals.outstanding)}`,
      "",
      `Generated ${new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}`,
    ].filter((line): line is string => line !== null);

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

      {/* Charges — separate section, never merged into dues */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold text-neutral-900">
            Charges
          </h2>
          <Button
            size="sm"
            variant={showChargeForm ? "secondary" : "primary"}
            onClick={() => setShowChargeForm((v) => !v)}
          >
            {showChargeForm ? "Cancel" : "Add charge"}
          </Button>
        </div>
        <p className="mt-1 text-sm text-neutral-500">
          Late fees and special assessments, recorded exactly as the board
          decided them. Kept separate from dues.
        </p>

        {showChargeForm && (
          <div className="mt-4 rounded-lg border border-neutral-200 bg-white p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-medium text-neutral-500">
                  Type
                </span>
                <select
                  value={kind}
                  onChange={(e) => setKind(e.target.value)}
                  className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="late_fee">Late fee</option>
                  <option value="special_assessment">
                    Special assessment
                  </option>
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-medium text-neutral-500">
                  Amount (USD)
                </span>
                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 25"
                  className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-neutral-500">
                  Assessed on
                </span>
                <input
                  type="date"
                  value={assessedAt}
                  onChange={(e) => setAssessedAt(e.target.value)}
                  className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-neutral-500">
                  Description (optional)
                </span>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. 10% late fee, board decision 12 Mar"
                  maxLength={200}
                  className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                />
              </label>
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
            <div className="mt-4">
              <Button size="sm" onClick={addCharge} disabled={busy || !amount}>
                {busy ? "Saving…" : "Record charge"}
              </Button>
            </div>
          </div>
        )}

        {charges.length ? (
          <div className="mt-4 overflow-hidden rounded-lg border border-neutral-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-neutral-200">
                <tr className="text-xs font-medium text-neutral-500">
                  <th className="px-4 py-3">Charge</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Assessed</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {charges.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-neutral-900">
                        {kindLabels[c.kind] ?? c.kind}
                      </p>
                      {c.description && (
                        <p className="mt-0.5 text-xs text-neutral-500">
                          {c.description}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {formatUsd(c.amount)}
                    </td>
                    <td className="px-4 py-3 text-neutral-500">
                      {c.assessedLabel}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={c.paid ? "success" : "warning"}>
                        {c.paid ? "Paid" : "Unpaid"}
                      </Badge>
                      {c.paidAtLabel && (
                        <p className="mt-0.5 text-xs text-neutral-500">
                          {c.paidAtLabel}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          disabled={busy}
                          onClick={() => togglePaid(c.id, c.paid)}
                          className="text-xs text-neutral-500 hover:text-neutral-900"
                        >
                          {c.paid ? "Mark unpaid" : "Mark paid"}
                        </button>
                        <button
                          disabled={busy}
                          onClick={() => deleteCharge(c.id)}
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          !showChargeForm && (
            <p className="mt-4 rounded-lg border border-dashed border-neutral-300 bg-white p-6 text-center text-sm text-neutral-500">
              No charges for this member.
            </p>
          )
        )}
      </div>
    </div>
  );
}
