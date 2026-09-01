"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyScreen } from "@/components/ui/empty-screen";
import { SearchInput } from "@/components/ui/search-input";

export type MaintenanceRow = {
  id: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  reporter: string;
  dateLabel: string;
  completedLabel: string | null;
};

const categoryLabels: Record<string, string> = {
  plumbing: "Plumbing",
  electricity: "Electricity",
  common: "Common areas",
  other: "Other",
};

const priorityLabels: Record<string, string> = {
  low: "Low",
  medium: "Normal",
  urgent: "Urgent",
};

const priorityRank: Record<string, number> = {
  urgent: 0,
  medium: 1,
  low: 2,
};

const statusLabels: Record<string, string> = {
  new: "New",
  in_progress: "In progress",
  done: "Done",
};

const statusVariant: Record<string, "default" | "warning" | "success"> = {
  new: "default",
  in_progress: "warning",
  done: "success",
};

const tabs = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "in_progress", label: "In progress" },
  { key: "done", label: "Done" },
];

const inputClass =
  "h-9 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10";

const labelClass = "mb-1.5 block text-sm font-medium text-neutral-900";

const textareaClass =
  "w-full rounded-md border border-neutral-200 bg-white p-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10";

export function MaintenanceView({
  initialRequests,
  memberNames,
}: {
  initialRequests: MaintenanceRow[];
  memberNames: string[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [form, setForm] = useState({
    title: "",
    category: "plumbing",
    priority: "medium",
    reporter: "",
    description: "",
  });

  const counts: Record<string, number> = {
    all: initialRequests.length,
    new: initialRequests.filter((r) => r.status === "new").length,
    in_progress: initialRequests.filter((r) => r.status === "in_progress").length,
    done: initialRequests.filter((r) => r.status === "done").length,
  };

  const q = query.trim().toLowerCase();

  const visible = initialRequests
    .filter((r) => filter === "all" || r.status === filter)
    .filter(
      (r) =>
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.reporter.toLowerCase().includes(q)
    );

  // Open requests before done ones, then urgent first. Within equal
  // groups the original order (newest first) is preserved.
  const sorted = [...visible].sort((a, b) => {
    const openA = a.status === "done" ? 1 : 0;
    const openB = b.status === "done" ? 1 : 0;
    if (openA !== openB) return openA - openB;
    const pA = priorityRank[a.priority] ?? 1;
    const pB = priorityRank[b.priority] ?? 1;
    return pA - pB;
  });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Something went wrong");
        return;
      }
      setForm({
        title: "",
        category: "plumbing",
        priority: "medium",
        reporter: "",
        description: "",
      });
      setOpen(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function setStatus(id: string, status: string) {
    setPendingId(id);
    try {
      await fetch(`/api/maintenance/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      router.refresh();
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="mt-8 space-y-6">
      {open ? (
        <form
          onSubmit={handleCreate}
          className="rounded-lg border border-neutral-200 bg-white p-6"
        >
          <div className="flex items-start justify-between">
            <p className="text-base font-semibold text-neutral-900">
              New maintenance request
            </p>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelClass}>Title</label>
              <input
                required
                placeholder="Streetlight at the entrance is out"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className={inputClass}
              >
                <option value="plumbing">Plumbing</option>
                <option value="electricity">Electricity</option>
                <option value="common">Common areas</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className={inputClass}
              >
                <option value="low">Low</option>
                <option value="medium">Normal</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>
                Reported by{" "}
                <span className="font-normal text-neutral-400">(optional)</span>
              </label>
              <input
                list="member-names"
                placeholder="Name"
                value={form.reporter}
                onChange={(e) => setForm({ ...form, reporter: e.target.value })}
                className={inputClass}
              />
              <datalist id="member-names">
                {memberNames.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>
                Description{" "}
                <span className="font-normal text-neutral-400">(optional)</span>
              </label>
              <textarea
                rows={3}
                placeholder="What is broken, where exactly, and since when?"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className={textareaClass}
              />
            </div>
          </div>
          <div className="mt-4">
            <Button type="submit" size="sm" disabled={saving || !form.title.trim()}>
              {saving ? "Creating..." : "Create request"}
            </Button>
          </div>
        </form>
      ) : (
        <div>
          <Button size="sm" onClick={() => setOpen(true)}>
            New request
          </Button>
        </div>
      )}

      {initialRequests.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white">
          <EmptyScreen
            title="No maintenance requests"
            description="When something breaks — a streetlight, a leaking pipe, a damaged fence — log it here so nothing gets forgotten."
          />
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1 rounded-lg border border-neutral-200 bg-white p-1">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setFilter(t.key)}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors ${
                    filter === t.key
                      ? "bg-neutral-900 font-medium text-white"
                      : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
                  }`}
                >
                  {t.label}
                  <span
                    className={`rounded-full px-1.5 text-xs ${
                      filter === t.key
                        ? "bg-white/20 text-white"
                        : "bg-neutral-100 text-neutral-500"
                    }`}
                  >
                    {counts[t.key]}
                  </span>
                </button>
              ))}
            </div>
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search title or reporter"
            />
          </div>

          <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
            {sorted.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-neutral-500">
                {q
                  ? `No requests match “${q}”`
                  : "Nothing here."}
              </p>
            ) : (
              sorted.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center border-b border-neutral-100 px-4 py-3 last:border-b-0 hover:bg-neutral-50"
                >
                  <Link
                    href={`/dashboard/maintenance/${r.id}`}
                    className="min-w-0 flex-1"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-neutral-900">{r.title}</p>
                      {r.priority === "urgent" && (
                        <Badge variant="destructive">Urgent</Badge>
                      )}
                      {r.priority === "low" && <Badge>Low</Badge>}
                      <Badge>{categoryLabels[r.category] ?? "Other"}</Badge>
                    </div>
                    <p className="mt-0.5 text-sm text-neutral-500">
                      Reported {r.dateLabel}
                      {r.reporter ? ` by ${r.reporter}` : ""}
                      {r.completedLabel ? ` · completed ${r.completedLabel}` : ""}
                    </p>
                  </Link>
                  <div className="ml-4 flex shrink-0 items-center gap-3">
                    <Badge variant={statusVariant[r.status] ?? "default"}>
                      {statusLabels[r.status] ?? r.status}
                    </Badge>
                    {r.status === "new" && (
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={pendingId === r.id}
                        onClick={() => setStatus(r.id, "in_progress")}
                      >
                        {pendingId === r.id ? "..." : "Start"}
                      </Button>
                    )}
                    {r.status === "in_progress" && (
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={pendingId === r.id}
                        onClick={() => setStatus(r.id, "done")}
                      >
                        {pendingId === r.id ? "..." : "Mark done"}
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
