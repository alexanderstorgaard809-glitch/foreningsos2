"use client";

import { useState } from "react";
import Link from "next/link";

const inputClass =
  "h-9 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10";

const downloadClass =
  "inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md border border-neutral-900 bg-neutral-900 px-5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-neutral-800";

export function TemplateForm() {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, company, source: "template" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      setDone(true);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="mx-auto mt-8 max-w-md rounded-lg border border-neutral-200 bg-white p-6 text-left shadow-sm">
        <p className="text-base font-semibold text-neutral-900">
          Here&apos;s your template
        </p>
        <p className="mt-1 text-sm text-neutral-500">
          No confirmation email needed — it downloads right now.
        </p>
        <a
          href="/api/template/download"
          download
          className={`${downloadClass} mt-4 w-full`}
        >
          Download the template (.xlsx)
        </a>

        <div className="mt-6 rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-4">
          <p className="text-sm font-medium text-neutral-900">
            This template works — until updating it by hand becomes the chore.
          </p>
          <ul className="mt-2 space-y-1 text-sm text-neutral-600">
            <li>Marks payments, reminders and per-unit ledgers — automatically</li>
            <li>Budget planning with operating and reserve pots</li>
            <li>Records live with the association, not one person&apos;s accounts</li>
          </ul>
          <Link
            href="/signup"
            className="mt-3 inline-block text-sm font-medium text-neutral-900 underline hover:no-underline"
          >
            See what HOAcove does — free for small boards
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-8 max-w-md">
      <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <label className="mb-1.5 block text-sm font-medium text-neutral-900">
          Where should we send it?
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={inputClass}
          />
          {/* Honeypot — hidden from humans, irresistible to bots */}
          <input
            type="text"
            name="company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="hidden"
          />
          <button
            type="submit"
            disabled={busy}
            className="inline-flex h-9 shrink-0 items-center justify-center whitespace-nowrap rounded-md border border-neutral-900 bg-neutral-900 px-5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? "Sending..." : "Get the template"}
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <p className="mt-3 text-xs text-neutral-500">
          Free, no account needed. We&apos;ll only email you about this template or
          HOAcove — never sold, never spammed.
        </p>
      </div>
    </form>
  );
}
