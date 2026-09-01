"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyScreen } from "@/components/ui/empty-screen";
import { formatUsd } from "@/lib/format";

export type BudgetLine = {
  id: string;
  name: string;
  amount: number;
  pot: string;
  kind: string;
};

const inputClass =
  "h-9 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10";

const labelClass = "mb-1.5 block text-sm font-medium text-neutral-900";

function PotCard({
  title,
  lines,
}: {
  title: string;
  lines: BudgetLine[];
}) {
  const income = lines
    .filter((l) => l.kind === "income")
    .reduce((sum, l) => sum + l.amount, 0);
  const expenses = lines
    .filter((l) => l.kind === "expense")
    .reduce((sum, l) => sum + l.amount, 0);
  const net = income - expenses;

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5">
      <p className="text-sm font-medium text-neutral-900">{title}</p>
      <div className="mt-3 space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-neutral-500">Planned income</span>
          <span className="font-medium text-neutral-900">
            {formatUsd(income)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-500">Planned expenses</span>
          <span className="font-medium text-neutral-900">
            {formatUsd(expenses)}
          </span>
        </div>
        <div className="flex justify-between border-t border-neutral-100 pt-1.5">
          <span className="text-neutral-500">Net</span>
          <span
            className={`font-heading text-lg font-semibold ${
              net >= 0 ? "text-emerald-700" : "text-amber-700"
            }`}
          >
            {formatUsd(net)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function BudgetView({
  year,
  prevYear,
  prevYearCount,
  lines,
  duesAmount,
  memberCount,
}: {
  year: number;
  prevYear: number;
  prevYearCount: number;
  lines: BudgetLine[];
  duesAmount: number;
  memberCount: number;
}) {
  const router = useRouter();
  const emptyForm = { name: "", amount: "", pot: "operating", kind: "expense" };
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [copying, setCopying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const operating = lines.filter((l) => l.pot === "operating");
  const reserve = lines.filter((l) => l.pot === "reserve");

  const byKindFirst = (group: BudgetLine[]) =>
    [...group].sort((a, b) =>
      a.kind === b.kind ? 0 : a.kind === "income" ? -1 : 1
    );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amount = Number(form.amount);
    if (!Number.isInteger(amount) || amount < 1 || amount > 10000000) {
      setError("Amount must be a whole number between 1 and 10,000,000");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(
        editingId ? `/api/budget/${editingId}` : "/api/budget",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            editingId
              ? { name: form.name, amount, pot: form.pot, kind: form.kind }
              : { year, name: form.name, amount, pot: form.pot, kind: form.kind }
          ),
        }
      );
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Something went wrong");
        return;
      }
      setForm(emptyForm);
      setEditingId(null);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  function startEdit(line: BudgetLine) {
    setEditingId(line.id);
    setForm({
      name: line.name,
      amount: String(line.amount),
      pot: line.pot,
      kind: line.kind,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this budget line?")) return;
    if (editingId === id) cancelEdit();
    await fetch(`/api/budget/${id}`, { method: "DELETE" });
    router.refresh();
  }

  async function copyFromPrevYear() {
    setCopying(true);
    setError(null);
    try {
      const res = await fetch("/api/budget/copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromYear: prevYear, toYear: year }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Something went wrong");
        return;
      }
      router.refresh();
    } finally {
      setCopying(false);
    }
  }

  function LineTable({ title, group }: { title: string; group: BudgetLine[] }) {
    const sorted = byKindFirst(group);

    return (
      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <p className="border-b border-neutral-200 px-4 py-3 text-sm font-medium text-neutral-500">
          {title} — {group.length} line{group.length === 1 ? "" : "s"}
        </p>
        {sorted.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-neutral-500">
            No lines yet — add one below.
          </p>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {sorted.map((line) => (
              <li
                key={line.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-neutral-900">
                    {line.name}
                  </p>
                </div>
                <Badge variant={line.kind === "income" ? "success" : "default"}>
                  {line.kind === "income" ? "Income" : "Expense"}
                </Badge>
                <span className="w-28 text-right font-medium text-neutral-900">
                  {formatUsd(line.amount)}
                </span>
                <div className="flex shrink-0 gap-3">
                  <button
                    onClick={() => startEdit(line)}
                    className="text-sm font-medium text-neutral-500 hover:text-neutral-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(line.id)}
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
    );
  }

  return (
    <div className="mt-6 space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <PotCard title="Operating" lines={operating} />
        <PotCard title="Reserve" lines={reserve} />
        <div className="rounded-lg border border-neutral-200 bg-white p-5">
          <p className="text-sm font-medium text-neutral-900">
            Dues projection
          </p>
          {duesAmount > 0 && memberCount > 0 ? (
            <>
              <p className="font-heading mt-3 text-2xl font-semibold text-neutral-900">
                {formatUsd(duesAmount * memberCount)}
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                {memberCount} members × {formatUsd(duesAmount)} — automatic,
                updates as your member list changes.
              </p>
            </>
          ) : (
            <p className="mt-3 text-sm text-neutral-500">
              Set the annual dues amount on the Dues page and add members to
              see projected income here.
            </p>
          )}
        </div>
      </div>

      {lines.length === 0 && prevYearCount > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-3">
          <p className="text-sm text-neutral-600">
            Your {prevYear} budget has {prevYearCount} line
            {prevYearCount === 1 ? "" : "s"} — use it as the starting point.
          </p>
          <Button size="sm" variant="secondary" onClick={copyFromPrevYear} disabled={copying}>
            {copying ? "Copying..." : `Start from ${prevYear} budget`}
          </Button>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-lg border border-neutral-200 bg-white p-6"
      >
        <p className="text-base font-semibold text-neutral-900">
          {editingId ? "Edit budget line" : "Add budget line"}
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <label className={labelClass}>Name</label>
            <input
              required
              placeholder="Landscaping contract"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Amount</label>
            <input
              required
              type="number"
              min={1}
              step={1}
              placeholder="3600"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelClass}>Pot</label>
              <select
                value={form.pot}
                onChange={(e) => setForm({ ...form, pot: e.target.value })}
                className={inputClass}
              >
                <option value="operating">Operating</option>
                <option value="reserve">Reserve</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Type</label>
              <select
                value={form.kind}
                onChange={(e) => setForm({ ...form, kind: e.target.value })}
                className={inputClass}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Button type="submit" size="sm" disabled={saving || !form.name.trim()}>
            {saving
              ? "Saving..."
              : editingId
                ? "Save changes"
                : "Add line"}
          </Button>
          {editingId && (
            <Button variant="secondary" size="sm" onClick={cancelEdit}>
              Cancel
            </Button>
          )}
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </form>

      {lines.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white">
          <EmptyScreen
            title={`No budget lines for ${year}`}
            description="Add the expenses you expect for the year — contracts, insurance, maintenance — split between operating and reserve. Or copy last year's budget above as a starting point."
          />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <LineTable title="Operating" group={operating} />
          <LineTable title="Reserve" group={reserve} />
        </div>
      )}
    </div>
  );
}