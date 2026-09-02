"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type AttendanceMember = {
  id: string;
  name: string;
  email: string | null;
};

export type AttendanceResponse = {
  memberId: string;
  status: string;
  proxyHolder: string;
  respondedLabel: string;
};

const statusLabels: Record<string, string> = {
  attending: "Attending",
  proxy: "Proxy given",
  not_attending: "Not attending",
  no_response: "No response",
};

const responseOrder: Record<string, number> = {
  no_response: 0,
  not_attending: 1,
  attending: 2,
  proxy: 3,
};

export function MeetingAttendance({
  meetingId,
  meetingTitle,
  dateLabel,
  quorumRequired,
  members,
  responses,
  associationName,
  contactEmail,
}: {
  meetingId: string;
  meetingTitle: string;
  dateLabel: string;
  quorumRequired: number | null;
  members: AttendanceMember[];
  responses: AttendanceResponse[];
  associationName: string;
  contactEmail: string;
}) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [quorumDraft, setQuorumDraft] = useState(
    quorumRequired === null ? "" : String(quorumRequired)
  );
  const [savingQuorum, setSavingQuorum] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const byMember = new Map(responses.map((r) => [r.memberId, r]));

  const attendingCount = responses.filter(
    (r) => r.status === "attending"
  ).length;
  const proxyCount = responses.filter((r) => r.status === "proxy").length;
  const countTowardQuorum = attendingCount + proxyCount;
  const quorumMet =
    quorumRequired !== null && countTowardQuorum >= quorumRequired;
  const quorumPercent =
    quorumRequired && quorumRequired > 0
      ? Math.min(100, Math.round((countTowardQuorum / quorumRequired) * 100))
      : 0;

  const notResponding = members.filter((m) => {
    const r = byMember.get(m.id);
    return !r || r.status === "not_attending";
  });

  async function setStatus(
    memberId: string,
    status: string,
    proxyHolder = ""
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
    setSavingQuorum(true);
    setError(null);
    try {
      const value = quorumDraft.trim() === "" ? null : Number(quorumDraft);
      const res = await fetch(`/api/meetings/${meetingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quorumRequired: value }),
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
      `Still needed for "${meetingTitle}" (${dateLabel}): ${notResponding.length} household${
        notResponding.length === 1 ? "" : "s"
      }`,
      "",
      ...notResponding.map((m) => {
        const email =
          m.email && m.email.trim() ? m.email.trim() : "no email on file";
        return `- ${m.name} — ${email}`;
      }),
      "",
      "Reminder text per household:",
      "",
    ];
    const sample = notResponding[0];
    if (sample) {
      lines.push(
        `Hi ${sample.name},`,
        "",
        `Our ${meetingTitle} is coming up on ${dateLabel}. Please reply to let us know if you'll attend — or if you can't make it, return the proxy form so your vote counts toward quorum.`,
        "",
        contactEmail.trim()
          ? `Questions? Reply here or contact ${contactEmail.trim()}.`
          : "Questions? Just reply to this message."
      );
    }
    await navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const sortedMembers = [...members].sort((a, b) => {
    const aStatus = byMember.get(a.id)?.status ?? "no_response";
    const bStatus = byMember.get(b.id)?.status ?? "no_response";
    const aRank = responseOrder[aStatus] ?? 0;
    const bRank = responseOrder[bStatus] ?? 0;
    if (aRank !== bRank) return aRank - bRank;
    return a.name.localeCompare(b.name);
  });

  const selectClass =
    "h-8 rounded-md border border-neutral-200 bg-white px-2 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none";

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-base font-semibold text-neutral-900">
            Attendance &amp; proxies
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            Track who is coming, who gave a proxy, and whether you have quorum
            — before the meeting, not at the door.
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-neutral-200 bg-white p-5">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-900">
              Quorum required (homes)
            </label>
            <input
              type="number"
              min={1}
              step={1}
              placeholder="e.g. 15"
              value={quorumDraft}
              onChange={(e) => setQuorumDraft(e.target.value)}
              className="h-9 w-36 rounded-md border border-neutral-200 bg-white px-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
            />
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={saveQuorum}
            disabled={savingQuorum}
          >
            {savingQuorum ? "Saving..." : "Save"}
          </Button>
          <p className="pb-2 text-xs text-neutral-500">
            Check your governing docs — often a majority or a set percentage
            of homes. Leave empty to skip quorum tracking.
          </p>
        </div>

        {quorumRequired !== null && (
          <div className="mt-4 border-t border-neutral-100 pt-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-neutral-600">
                <span className="font-heading text-xl font-semibold text-neutral-900">
                  {countTowardQuorum}
                </span>{" "}
                of {quorumRequired} toward quorum{" "}
                <span className="text-neutral-400">
                  ({attendingCount} attending + {proxyCount} proxies)
                </span>
              </p>
              <Badge variant={quorumMet ? "success" : "warning"}>
                {quorumMet ? "Quorum met" : "Quorum not yet met"}
              </Badge>
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-neutral-100">
              <div
                className={`h-1.5 rounded-full transition-all ${
                  quorumMet ? "bg-emerald-500" : "bg-amber-500"
                }`}
                style={{ width: `${quorumPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {notResponding.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5">
          <p className="text-sm text-amber-800">
            {notResponding.length} household
            {notResponding.length === 1 ? "" : "s"} haven't responded yet
          </p>
          <button
            onClick={copyReminders}
            className="text-sm font-medium text-amber-800 underline hover:text-amber-900"
          >
            {copied ? "Copied!" : "Copy reminder list"}
          </button>
        </div>
      )}

      <div className="mt-4 overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <ul className="divide-y divide-neutral-100">
          {sortedMembers.map((m) => {
            const r = byMember.get(m.id);
            const status = r?.status ?? "no_response";
            return (
              <li
                key={m.id}
                className="flex flex-wrap items-center gap-3 px-4 py-3 hover:bg-neutral-50"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-neutral-900">{m.name}</p>
                  <p className="text-sm text-neutral-500">
                    {status === "no_response" && "No response yet"}
                    {status === "attending" &&
                      `Attending in person${
                        r?.respondedLabel ? ` · recorded ${r.respondedLabel}` : ""
                      }`}
                    {status === "proxy" &&
                      `Proxy${
                        r?.proxyHolder ? ` to ${r.proxyHolder}` : ""
                      }${r?.respondedLabel ? ` · recorded ${r.respondedLabel}` : ""}`}
                    {status === "not_attending" &&
                      "Said they can't attend — proxy still needed"}
                  </p>
                </div>

                {status === "proxy" && <Badge variant="success">Proxy</Badge>}
                {status === "attending" && (
                  <Badge variant="success">Attending</Badge>
                )}
                {status === "not_attending" && (
                  <Badge variant="warning">No proxy</Badge>
                )}

                <div className="flex shrink-0 items-center gap-2">
                  {status === "proxy" && (
                    <input
                      list="member-names-proxy"
                      placeholder="Proxy holder"
                      defaultValue={r?.proxyHolder ?? ""}
                      onBlur={(e) => {
                        const value = e.target.value.trim();
                        if (value !== (r?.proxyHolder ?? "")) {
                          setStatus(m.id, "proxy", value);
                        }
                      }}
                      className="h-8 w-36 rounded-md border border-neutral-200 bg-white px-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none"
                    />
                  )}
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
                  <datalist id="member-names-proxy">
                    {members.map((opt) => (
                      <option key={opt.id} value={opt.name} />
                    ))}
                  </datalist>
                </div>
              </li>
            );
          })}
          {members.length === 0 && (
            <li className="px-4 py-6 text-center text-sm text-neutral-500">
              No members yet — add members first, then track attendance here.
            </li>
          )}
        </ul>
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
