"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { parseMembers } from "@/lib/import-parser";

type Result = { ok: boolean; message: string };

export function ImportMembers() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const parsed = useMemo(() => parseMembers(text), [text]);
  const missingAddress = parsed.members.filter((m) => !m.address).length;

  async function handleImport() {
    setImporting(true);
    setResult(null);
    try {
      const res = await fetch("/api/members/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();

      if (!res.ok) {
        setResult({ ok: false, message: data.error ?? "Import failed" });
        return;
      }

      const skipped =
        data.skipped > 0 ? `, ${data.skipped} duplicates skipped` : "";
      setResult({
        ok: true,
        message: `Imported ${data.created} member${data.created === 1 ? "" : "s"}${skipped}.`,
      });
      setText("");
      router.refresh();
    } finally {
      setImporting(false);
    }
  }

  if (!open) {
    return (
      <div className="mt-8 flex items-center gap-3">
        <p className="text-sm text-neutral-500">
          Moving from a spreadsheet?
        </p>
        <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
          Import members
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-lg border border-neutral-200 bg-white p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-base font-semibold text-neutral-900">
            Import members
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            One member per line. Columns: Name, Address, Email (optional),
            Phone (optional). Separated by commas, semicolons — or paste
            directly from Excel or Google Sheets.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setOpen(false);
            setResult(null);
          }}
        >
          Close
        </Button>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={
          "Jane Jensen, 12 Maple Street\nJohn Smith, 12 Maple Street, john@example.com\n..."
        }
        rows={8}
        className="mt-4 w-full rounded-md border border-neutral-200 bg-white p-3 font-mono text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
      />

      {text.trim() !== "" && (
        <div className="mt-3 rounded-md border border-neutral-200 bg-neutral-50 p-3 text-sm">
          {parsed.members.length === 0 ? (
            <p className="text-neutral-500">No members detected yet.</p>
          ) : (
            <>
              <p className="font-medium text-neutral-900">
                {parsed.members.length} member
                {parsed.members.length === 1 ? "" : "s"} detected
              </p>
              {missingAddress > 0 && (
                <p className="mt-1 text-xs text-amber-700">
                  {missingAddress} without an address — you can add it later.
                </p>
              )}
              {parsed.errors.length > 0 && (
                <p className="mt-1 text-xs text-red-600">
                  {parsed.errors.length} line
                  {parsed.errors.length === 1 ? "" : "s"} could not be read.
                </p>
              )}
              <ul className="mt-2 space-y-1">
                {parsed.members.slice(0, 5).map((m, i) => (
                  <li key={i} className="text-neutral-700">
                    <span className="font-medium text-neutral-900">
                      {m.name}
                    </span>
                    {" — "}
                    {m.address || <span className="text-neutral-400">No address</span>}
                  </li>
                ))}
              </ul>
              {parsed.members.length > 5 && (
                <p className="mt-2 text-xs text-neutral-500">
                  and {parsed.members.length - 5} more…
                </p>
              )}
            </>
          )}
        </div>
      )}

      <div className="mt-4 flex items-center gap-2">
        <Button
          size="sm"
          onClick={handleImport}
          disabled={importing || parsed.members.length === 0}
        >
          {importing
            ? "Importing..."
            : `Import ${parsed.members.length} member${
                parsed.members.length === 1 ? "" : "s"
              }`}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setText("");
            setResult(null);
          }}
        >
          Clear
        </Button>
      </div>

      {result && (
        <p
          className={`mt-4 rounded-md border px-3 py-2 text-sm ${
            result.ok
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {result.message}
        </p>
      )}
    </div>
  );
}
