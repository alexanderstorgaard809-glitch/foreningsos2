"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyScreen } from "@/components/ui/empty-screen";

export type MeetingRow = {
  id: string;
  title: string;
  type: string;
  status: string;
  location: string;
  dateLabel: string;
  timeLabel: string;
  isUpcoming: boolean;
};

const typeLabels: Record<string, string> = {
  annual: "Annual meeting",
  board: "Board meeting",
  other: "Meeting",
};

const statusLabels: Record<string, string> = {
  scheduled: "Scheduled",
  held: "Held",
  cancelled: "Cancelled",
};

const statusVariant: Record<string, "default" | "success" | "destructive"> = {
  scheduled: "default",
  held: "success",
  cancelled: "destructive",
};

const inputClass =
  "h-9 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10";

const labelClass = "mb-1.5 block text-sm font-medium text-neutral-900";

export function MeetingsView({
  initialMeetings,
}: {
  initialMeetings: MeetingRow[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    date: "",
    type: "annual",
    location: "",
  });

  const upcoming = initialMeetings.filter((m) => m.isUpcoming);
  const past = initialMeetings.filter((m) => !m.isUpcoming);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Something went wrong");
        return;
      }
      setForm({ title: "", date: "", type: "annual", location: "" });
      setOpen(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this meeting?")) return;
    await fetch(`/api/meetings/${id}`, { method: "DELETE" });
    router.refresh();
  }

  function Row({ m }: { m: MeetingRow }) {
    return (
      <div className="flex items-center border-b border-neutral-100 px-4 py-3 last:border-b-0 hover:bg-neutral-50">
        <Link href={`/dashboard/meetings/${m.id}`} className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-neutral-900">{m.title}</p>
            <Badge variant={statusVariant[m.status] ?? "default"}>
              {statusLabels[m.status] ?? m.status}
            </Badge>
          </div>
          <p className="mt-0.5 text-sm text-neutral-500">
            {typeLabels[m.type] ?? "Meeting"} · {m.dateLabel} · {m.timeLabel}
            {m.location ? ` · ${m.location}` : ""}
          </p>
        </Link>
        <button
          onClick={() => handleDelete(m.id)}
          className="ml-4 shrink-0 text-sm font-medium text-red-600 hover:text-red-700"
        >
          Delete
        </button>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-8">
      {open ? (
        <form
          onSubmit={handleCreate}
          className="rounded-lg border border-neutral-200 bg-white p-6"
        >
          <div className="flex items-start justify-between">
            <p className="text-base font-semibold text-neutral-900">
              New meeting
            </p>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Title</label>
              <input
                required
                placeholder="Annual meeting 2026"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Date & time</label>
              <input
                required
                type="datetime-local"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className={inputClass}
              >
                <option value="annual">Annual meeting</option>
                <option value="board">Board meeting</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>
                Location{" "}
                <span className="font-normal text-neutral-400">(optional)</span>
              </label>
              <input
                placeholder="Community hall"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
          <div className="mt-4">
            <Button
              type="submit"
              size="sm"
              disabled={saving || !form.title || !form.date}
            >
              {saving ? "Creating..." : "Create meeting"}
            </Button>
          </div>
        </form>
      ) : (
        <div>
          <Button size="sm" onClick={() => setOpen(true)}>
            New meeting
          </Button>
        </div>
      )}

      {initialMeetings.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white">
          <EmptyScreen
            title="No meetings yet"
            description="Create your first meeting, add an agenda, and copy the notice into an email for your members."
          />
        </div>
      ) : (
        <>
          <section>
            <p className="mb-2 text-sm font-medium text-neutral-500">
              Upcoming
            </p>
            <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
              {upcoming.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-neutral-500">
                  Nothing scheduled — create the next meeting above.
                </p>
              ) : (
                upcoming.map((m) => <Row key={m.id} m={m} />)
              )}
            </div>
          </section>

          <section>
            <p className="mb-2 text-sm font-medium text-neutral-500">Past</p>
            <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
              {past.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-neutral-500">
                  Past meetings will appear here.
                </p>
              ) : (
                past.map((m) => <Row key={m.id} m={m} />)
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
