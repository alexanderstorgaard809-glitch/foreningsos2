"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type MeetingDetail = {
  id: string;
  title: string;
  type: string;
  status: string;
  location: string;
  agenda: string;
  minutes: string;
  associationName: string;
  contactEmail: string;
  dateValue: string;
  dateLabel: string;
  timeLabel: string;
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

const textareaClass =
  "w-full rounded-md border border-neutral-200 bg-white p-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10";

export function MeetingEditor({ meeting }: { meeting: MeetingDetail }) {
  const router = useRouter();
  const [title, setTitle] = useState(meeting.title);
  const [dateValue, setDateValue] = useState(meeting.dateValue);
  const [type, setType] = useState(meeting.type);
  const [location, setLocation] = useState(meeting.location);
  const [agenda, setAgenda] = useState(meeting.agenda);
  const [minutes, setMinutes] = useState(meeting.minutes);
  const [status, setStatus] = useState(meeting.status);
  const [dateLabel, setDateLabel] = useState(meeting.dateLabel);
  const [timeLabel, setTimeLabel] = useState(meeting.timeLabel);
  const [busy, setBusy] = useState<string | null>(null);
  const [editingDetails, setEditingDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  async function save(fields: Record<string, unknown>, key: string) {
    setBusy(key);
    try {
      const res = await fetch(`/api/meetings/${meeting.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Something went wrong");
        return false;
      }
      router.refresh();
      return true;
    } finally {
      setBusy(null);
    }
  }

  function changeStatus(newStatus: string) {
    setStatus(newStatus);
    save({ status: newStatus }, "status");
  }

  async function handleSaveDetails(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !dateValue) {
      alert("Title and date are required");
      return;
    }
    const newDate = new Date(dateValue);
    const ok = await save(
      {
        title: title.trim(),
        date: newDate.toISOString(),
        type,
        location,
      },
      "details"
    );
    if (!ok) return;
    setDateLabel(
      newDate.toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    );
    setTimeLabel(
      newDate.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
    setEditingDetails(false);
  }

  async function copyNotice() {
    const lines = [
      meeting.associationName,
      "",
      "NOTICE OF MEETING",
      "",
      title,
      "",
      `Date: ${dateLabel}, ${timeLabel}`,
      `Location: ${location.trim() || "To be announced"}`,
      "",
      "Agenda:",
      agenda.trim() || "To be announced",
    ];

    if (meeting.contactEmail.trim()) {
      lines.push("", `Contact: ${meeting.contactEmail.trim()}`);
    }

    await navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <Link
        href="/dashboard/meetings"
        className="text-sm text-neutral-500 hover:text-neutral-900"
      >
        Back to meetings
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-heading text-2xl font-semibold text-neutral-900">
              {title}
            </h1>
            <Badge variant={statusVariant[status] ?? "default"}>
              {statusLabels[status] ?? status}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-neutral-500">
            {typeLabels[type] ?? "Meeting"} · {dateLabel} · {timeLabel}
            {location ? ` · ${location}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          {status !== "held" && (
            <Button
              size="sm"
              disabled={busy === "status"}
              onClick={() => changeStatus("held")}
            >
              Mark as held
            </Button>
          )}
          {status === "scheduled" && (
            <Button
              size="sm"
              variant="secondary"
              disabled={busy === "status"}
              onClick={() => changeStatus("cancelled")}
            >
              Cancel meeting
            </Button>
          )}
          {status === "cancelled" && (
            <Button
              size="sm"
              variant="secondary"
              disabled={busy === "status"}
              onClick={() => changeStatus("scheduled")}
            >
              Restore
            </Button>
          )}
          {status === "held" && (
            <Button
              size="sm"
              variant="secondary"
              disabled={busy === "status"}
              onClick={() => changeStatus("scheduled")}
            >
              Reopen
            </Button>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-base font-semibold text-neutral-900">Notice</p>
            <p className="mt-1 text-sm text-neutral-500">
              Copy the notice and paste it into an email to your members.
            </p>
          </div>
          <Button size="sm" variant="secondary" onClick={copyNotice}>
            {copied ? "Copied!" : "Copy notice"}
          </Button>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-neutral-200 bg-white p-6">
        <p className="text-base font-semibold text-neutral-900">Agenda</p>
        <textarea
          rows={6}
          value={agenda}
          onChange={(e) => setAgenda(e.target.value)}
          placeholder={
            "1. Election of the chair\n2. Approval of the budget\n3. Any other business"
          }
          className={`${textareaClass} mt-3`}
        />
        <div className="mt-3">
          <Button
            size="sm"
            disabled={busy === "agenda"}
            onClick={() => save({ agenda }, "agenda")}
          >
            {busy === "agenda" ? "Saving..." : "Save agenda"}
          </Button>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-neutral-200 bg-white p-6">
        <p className="text-base font-semibold text-neutral-900">Minutes</p>
        <p className="mt-1 text-sm text-neutral-500">
          Written after the meeting. Keep the record of decisions and votes
          here — it stays in the archive permanently.
        </p>
        <textarea
          rows={8}
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
          placeholder="Present: ... Decisions: ..."
          className={`${textareaClass} mt-3`}
        />
        <div className="mt-3">
          <Button
            size="sm"
            disabled={busy === "minutes"}
            onClick={() => save({ minutes }, "minutes")}
          >
            {busy === "minutes" ? "Saving..." : "Save minutes"}
          </Button>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-neutral-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <p className="text-base font-semibold text-neutral-900">Details</p>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setEditingDetails(!editingDetails)}
          >
            {editingDetails ? "Close" : "Edit details"}
          </Button>
        </div>
        {editingDetails && (
          <form onSubmit={handleSaveDetails} className="mt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Title</label>
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Date & time</label>
                <input
                  required
                  type="datetime-local"
                  value={dateValue}
                  onChange={(e) => setDateValue(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className={inputClass}
                >
                  <option value="annual">Annual meeting</option>
                  <option value="board">Board meeting</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Location</label>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="mt-4">
              <Button type="submit" size="sm" disabled={busy === "details"}>
                {busy === "details" ? "Saving..." : "Save details"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
