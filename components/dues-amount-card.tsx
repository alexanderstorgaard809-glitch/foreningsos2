"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatUsd } from "@/lib/format";

export function DuesAmountCard({
  year,
  paidCount,
  memberCount,
  amount,
}: {
  year: number;
  paidCount: number;
  memberCount: number;
  amount: number;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(amount > 0 ? String(amount) : "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const percent =
    memberCount === 0 ? 0 : Math.round((paidCount / memberCount) * 100);
  const collected = paidCount * amount;
  const expected = memberCount * amount;

  function startEditing() {
    setValue(amount > 0 ? String(amount) : "");
    setError(null);
    setEditing(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 1000000) {
      setError("Enter a whole number between 1 and 1,000,000");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/dues-amount", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year, amount: parsed }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Something went wrong");
        return;
      }
      setEditing(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-neutral-900">
          Collection progress
        </p>
        <Badge variant={percent === 100 ? "success" : "warning"}>
          {percent}%
        </Badge>
      </div>

      {amount > 0 ? (
        <>
          <div className="mt-3 flex flex-wrap items-baseline gap-2">
            <p className="font-heading text-3xl font-semibold text-neutral-900">
              {formatUsd(collected)}
            </p>
            <p className="text-sm text-neutral-500">
              collected of {formatUsd(expected)} expected
            </p>
          </div>
          <p className="mt-1 text-xs text-neutral-500">
            {paidCount} of {memberCount} members have paid
          </p>
        </>
      ) : (
        <>
          <p className="font-heading mt-3 text-3xl font-semibold text-neutral-900">
            {percent}%
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            {paidCount} of {memberCount} members have paid. Set the annual
            amount below to see totals in dollars.
          </p>
        </>
      )}

      <div className="mt-3 h-1.5 w-full rounded-full bg-neutral-100">
        <div
          className="h-1.5 rounded-full bg-emerald-500 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="mt-5 border-t border-neutral-100 pt-4">
        {editing ? (
          <form onSubmit={save} className="flex flex-wrap items-end gap-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-900">
                Annual dues per member ($)
              </label>
              <input
                type="number"
                min={1}
                step={1}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="e.g. 1200"
                className="h-9 w-48 rounded-md border border-neutral-200 bg-white px-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
              />
            </div>
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setEditing(false)}
            >
              Cancel
            </Button>
            {error && <p className="pb-2 text-sm text-red-600">{error}</p>}
          </form>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-sm text-neutral-500">
              Annual dues per member:{" "}
              <span className="font-medium text-neutral-900">
                {amount > 0 ? formatUsd(amount) : "Not set"}
              </span>
            </p>
            <Button variant="secondary" size="sm" onClick={startEditing}>
              {amount > 0 ? "Change amount" : "Set amount"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
