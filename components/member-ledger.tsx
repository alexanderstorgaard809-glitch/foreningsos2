"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

const inputClass =
  "h-9 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10";

const labelClass = "mb-1.5 block text-sm font-medium text-neutral-900";

export function MemberLedger({
  memberId,
  member,
  associationName,
  contactEmail,
  rows,
  charges,
  totals,
}: MemberLedgerProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(() => ({
    kind: "late_fee",
    description: "",
    amount: "",
    assessedAt: new Date().toISOString().slice(0, 10),
  }));

  function resetForm() {
    setForm({
      kind: "late_fee",
      description: "",
      amount: "",
      assessedAt: new Date().toISOString().slice(0, 10),
    });
    setFormOpen(false);
    setError(null);
  }

  async function copyStatement() {
    const duesLines = rows.map((r) => {
      const amount = r.amount !== null ? formatUsd(r.amount) : "—";
      const status = r.paid
        ? `Paid${r.paidAtLabel ? ` on ${r.paidAtLabel}` : ""}`
        : "Due";
      return `${r.year}   ${amount}   ${status}`;
    });

    const chargeLines = charges.map((c) => {
      const label = kindLabels[c.kind] ?? "Charge";
      const desc = c.description ? ` (${c.description})` : "";
      const status = c.paid
        ? `Paid${c.paidAtLabel ? ` on ${c.paidAtLabel}` : ""}`
        : "Due";
      return `${label}${desc} — assessed ${c.assessedLabel}   ${formatUsd(
        c.amount
      )}   ${status}`;
    });

    const lines = [
      associationName,
      "",
      `LEDGER — ${member.name}`,
      "",
      `Member: ${member.name}`,
      `Address: ${member.address || "—"}`,
      `Email: ${member.email || "—"}`,
      "",
      "DUES",
      ...duesLines,
    ];

    if (charges.length > 0) {
      lines.push("", "LATE FEES & ASSESSMENTS", ...chargeLines);
    }

    lines.push(
      "",
      `Total billed: ${formatUsd(totals.billed)}`,
      `Total collected: ${formatUsd(totals.collected)}`,
      `Outstanding balance: ${formatUsd(totals.outstanding)}`,
      "",
      `Generated ${new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}`
    );

    if (contactEmail.trim()) {
      lines.push(`Questions? Contact: ${contactEmail.trim()}`);
    }

    await navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleAddCharge(e: React.FormEvent) {
    e.preventDefault();
    const amount = Number(form.amount);
    if (!Number.isInteger(amount) || amount < 1 || amount > 10000000) {
      setError("Amount must be a whole number between 1 and 10,000,000");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/charges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId,
          kind: form.kind,
          description: form.description,
          amount,
          assessedAt: form.assessedAt,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Something went wrong");
        return;
      }
      resetForm();
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function togglePaid(charge: ChargeRow) {
    setPendingId(charge.id);
    setError(null);
    try {
      const res = await fetch(`/api/charges/${charge.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paid: !charge.paid }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Something went wrong");
        return;
      }
      router.refresh();
    } finally {
      setPendingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this charge?")) return;
    setPendingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/charges/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Something went wrong");
        return;
      }
      router.refresh();
    } finally {
      setPendingId(null);
    }
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
          Dues years without an annual amount set are excluded from the
          totals. Set the amount on the Dues page to include them.
        </p>
      )}

      <div className="mt-6 overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <p className="border-b border-neutral-200 px-4 py-3 text-sm font-medium text-neutral-500">
          Dues
        </p>
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200">
            <tr className="text-xs font-medium text-neutral-500">
              <th className="px-4 py-3">Year</th>
              <th className="px-4 py-3">Annual amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="hidden px-4 py-3 sm:table-cell">Paid on</th>
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
                <td className="hidden px-4 py-3 text-neutral-500 sm:table-cell">
                  {r.paidAtLabel ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-neutral-500">
            Late fees &amp; special assessments
            {charges.length > 0 ? ` — ${charges.length}` : ""}
          </p>
          {!formOpen && (
            <Button size="sm" variant="secondary" onClick={() => setFormOpen(true)}>
              Add charge
            </Button>
          )}
        </div>

        {formOpen && (
          <form
            onSubmit={handleAddCharge}
            className="mt-3 rounded-lg border border-neutral-200 bg-white p-4"
          >
            <div className="grid gap-3 sm:grid-cols-4">
              <div>
                <label className={labelClass}>Type</label>
                <select
                  value={form.kind}
                  onChange={(e) => setForm({ ...form, kind: e.target.value })}
                  className={inputClass}
                >
                  <option value="late_fee">Late fee</option>
                  <option value="special_assessment">
                    Special assessment
                  </option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Amount</label>
                <input
                  required
                  type="number"
                  min={1}
                  step={1}
                  placeholder="120"
                  value={form.amount}
                  onChange={(e) =>
                    setForm({ ...form, amount: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Assessed on</label>
                <input
                  required
                  type="date"
                  value={form.assessedAt}
                  onChange={(e) =>
                    setForm({ ...form, assessedAt: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>
                  Description{" "}
                  <span className="font-normal text-neutral-400">
                    (optional)
                  </span>
                </label>
                <input
                  placeholder="e.g. Roof fund"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Button type="submit" size="sm" disabled={saving}>
                {saving ? "Adding..." : "Add charge"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={resetForm}
              >
                Cancel
              </Button>
              {error && (
                <span className="text-sm text-red-600">{error}</span>
              )}
            </div>
          </form>
        )}

        <div className="mt-3 overflow-hidden rounded-lg border border-neutral-200 bg-white">
          {charges.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-neutral-500">
              No charges. Add a late fee or special assessment when you issue
              one — it appears as its own line on the ledger, with the date it
              was assessed.
            </p>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {charges.map((c) => (
                <li
                  key={c.id}
                  className="flex flex-wrap items-center gap-3 px-4 py-3 hover:bg-neutral-50"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge>{kindLabels[c.kind] ?? "Charge"}</Badge>
                      <p className="font-medium text-neutral-900">
                        {formatUsd(c.amount)}
                      </p>
                    </div>
                    <p className="mt-0.5 text-sm text-neutral-500">
                      Assessed {c.assessedLabel}
                      {c.description ? ` · ${c.description}` : ""}
                      {c.paid && c.paidAtLabel
                        ? ` · paid on ${c.paidAtLabel}`
                        : ""}
                    </p>
                  </div>
                  <Badge variant={c.paid ? "success" : "warning"}>
                    {c.paid ? "Paid" : "Due"}
                  </Badge>
                  <div className="flex shrink-0 items-center gap-3">
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={pendingId === c.id}
                      onClick={() => togglePaid(c)}
                    >
                      {pendingId === c.id
                        ? "..."
                        : c.paid
                          ? "Mark unpaid"
                          : "Mark paid"}
                    </Button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="text-sm font-medium text-red-600 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && !formOpen && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
}
