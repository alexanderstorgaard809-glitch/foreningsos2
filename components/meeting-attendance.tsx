"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type AttendanceMember = {
  id: string;
  name: string;
  email: string;
};

export type AttendanceResponse = {
  memberId: string;
  status: string;
  proxyHolder: string;
  respondedLabel: string;
};

export type MeetingAttendanceProps = {
  meetingId: string;
  meetingTitle: string;
  dateLabel: string;
  quorumRequired: number | null;
  members: AttendanceMember[];
  responses: AttendanceResponse[];
  associationName: string;
  contactEmail: string;
};

const statusLabels: Record<string, string> = {
  attending: "Attending",
  proxy: "Proxy given",
  not_attending: "Not attending",
};

const inputClass =
  "h-9 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10";

const selectClass =
  "h-8 rounded-md border border-neutral-200 bg-white px-2 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10";

export function MeetingAttendance({
  meetingId,
  meetingTitle,
  dateLabel,
  quorumRequired,
  members,
  responses,
  associationName,
  contactEmail,
}: MeetingAttendanceProps) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [quorumDraft, setQuorumDraft] = useState(
    quorumRequired === null ? "" : String(quorumRequired)
  );
  const [savingQuorum, setSavingQuorum] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const responseByMember = useMemo(() => {
    const map = new Map<string, AttendanceResponse>();
    for (const r of responses) map.set(r.memberId, r);
    return map;
  }, [responses]);

  const attendingCount = responses.filter(
    (r) => r.status === "attending" || r.status === "proxy"
  ).length;
  const quorumMet = quorumRequired !== null && attendingCount >= quorumRequired;

  const noResponseMembers = members.filter(
    (m) => !responseByMember.has(m.id)
  );

  async function setStatus(
    memberId: string,
    status: string,
    proxyHolder?: string
  ) {
    setPendingId(memberId);
    setError(null);
    try {
      const res = await fetch(`/api/meetings/${meetingId}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, status, proxyHolder }),
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

  async function saveQuorum() {
    const value = quorumDraft.trim();
    setSavingQuorum(true);
    setError(null);
    try {
      const res = await fetch(`/api/meetings/${meetingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quorumRequired: value === "" ? null : Number(value),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Something went wrong");
        return;
      }
      router.refresh();
    } finally {
      setSavingQuorum(false);
    }
  }

  async function copyReminders() {
    const lines = [
      associationName,
      `Reminder — response needed: ${meetingTitle}`,
      dateLabel,
      "",
      "We haven't heard from you yet about attendance. Please reply with one of:",
      "- I will attend",
      "- I am giving my proxy to (name)",
      "- I will not attend",
      "",
      "Not yet responded:",
      ...noResponseMembers.map((m) => `- ${m.name}${m.email ? ` (${m.email})` : ""}`),
    ];
    if (contactEmail.trim()) {
      lines.push("", `Questions? Contact: ${contactEmail.trim()}`);
    }
    await navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-heading text-lg font-semibold text-neutral-900">
          Attendance &amp; proxies
        </h2>
        <Button
          size="sm"
          variant="secondary"
          onClick={copyReminders}
          disabled={noResponseMembers.length === 0}
        >
          {copied ? "Copied!" : `Copy reminder list (${noResponseMembers.length})`}
        </Button>
      </div>
      <p className="mt-1 text-sm text-neutral-500">
        Track who is coming, who sent a proxy, and who has not responded —
        before the meeting, not during it.
      </p>

      <div className="mt-4 flex flex-wrap items-end gap-3 rounded-lg border border-neutral-200 bg-white p-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-neutral-500">
            Quorum required (from your governing docs)
          </label>
          <input
            type="number"
            min={1}
            step={1}
            placeholder="e.g. 6"
            value={quorumDraft}
            onChange={(e) => setQuorumDraft(e.target.value)}
            className={`${inputClass} w-32`}
          />
        </div>
        <Button size="sm" onClick={saveQuorum} disabled={savingQuorum}>
          {savingQuorum ? "Saving..." : "Save quorum"}
        </Button>
        <div className="ml-auto text-right">
          <p
            className={`font-heading text-2xl font-semibold ${
              quorumRequired === null
                ? "text-neutral-900"
                : quorumMet
                  ? "text-emerald-700"
                  : "text-amber-700"
            }`}
          >
            {attendingCount}
            {quorumRequired !== null ? ` / ${quorumRequired}` : ""}
          </p>
          <p className="text-xs text-neutral-500">
            {quorumRequired === null
              ? "attending or proxy — set a quorum to track it"
              : quorumMet
                ? "quorum met"
                : `quorum not yet met (${attendingCount} attending incl. proxies)`}
          </p>
        </div>
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-4 overflow-hidden rounded-lg border border-neutral-200 bg-white">
        {members.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-neutral-500">
            No members yet — add members first, then track attendance here.
          </p>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {members.map((m) => {
              const r = responseByMember.get(m.id);
              const status = r?.status ?? "no_response";
              return (
                <li
                  key={m.id}
                  className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 hover:bg-neutral-50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-neutral-900">{m.name}</p>
                    {status !== "no_response" && r && (
                      <p className="mt-0.5 text-xs text-neutral-500">
                        {statusLabels[status]}
                        {status === "proxy" && r.proxyHolder
                          ? ` → ${r.proxyHolder}`
                          : ""}
                        {" · "}
                        responded {r.respondedLabel}
                      </p>
                    )}
                    {status === "no_response" && (
                      <p className="mt-0.5 text-xs text-neutral-500">
                        No response yet
                      </p>
                    )}
                  </div>

                  {status === "proxy" && (
                    <input
                      placeholder="Proxy holder"
                      defaultValue={r?.proxyHolder ?? ""}
                      onBlur={(e) => {
                        if (e.target.value.trim() !== (r?.proxyHolder ?? "")) {
                          setStatus(m.id, "proxy", e.target.value);
                        }
                      }}
                      className={`${inputClass} h-8 w-36 text-xs`}
                    />
                  )}

                  <Badge
                    variant={
                      status === "attending" || status === "proxy"
                        ? "success"
                        : status === "not_attending"
                          ? "default"
                          : "warning"
                    }
                  >
                    {status === "no_response"
                      ? "No response"
                      : statusLabels[status]}
                  </Badge>

                  <select
                    value={status}
                    disabled={pendingId === m.id}
                    onChange={(e) => setStatus(m.id, e.target.value)}
                    className={selectClass}
                  >
                    <option value="no_response">No response</option>
                    <option value="attending">Attending</option>
                    <option value="proxy">Proxy given</option>
                    <option value="not_attending">Not attending</option>
                  </select>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
