"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { EmptyScreen } from "@/components/ui/empty-screen";

export type AnnouncementRow = {
  id: string;
  subject: string;
  sentLabel: string;
  recipientCount: number;
  failedCount: number;
};

const inputClass =
  "h-9 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10";

export function AnnouncementsView({
  announcements,
  membersWithEmail,
  membersTotal,
  emailConfigured,
}: {
  announcements: AnnouncementRow[];
  membersWithEmail: number;
  membersTotal: number;
  emailConfigured: boolean;
}) {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const confirmed = confirm(
      `Send this announcement to ${membersWithEmail} member${
        membersWithEmail === 1 ? "" : "s"
      } with an email on file?`
    );
    if (!confirmed) return;

    setSending(true);
    setResult(null);
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, body }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setResult({ ok: false, text: data.error ?? "Something went wrong" });
        return;
      }
      const skipNote =
        data.skippedNoEmail > 0
          ? ` (${data.skippedNoEmail} member${
              data.skippedNoEmail === 1 ? "" : "s"
            } skipped — no email on file)`
          : "";
      const failNote = data.failed > 0 ? ` — ${data.failed} failed` : "";
      setResult({
        ok: data.failed === 0,
        text: `Sent to ${data.sent} member${
          data.sent === 1 ? "" : "s"
        }${failNote}.${skipNote}`,
      });
      setSubject("");
      setBody("");
      router.refresh();
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mt-8 space-y-6">
      {!emailConfigured && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Email sending is not configured yet — announcements will fail until
          an email provider is connected.
        </p>
      )}

      {membersWithEmail === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white">
          <EmptyScreen
            title="No member emails yet"
            description="Announcements go to members with an email on file. Add emails in the Members section, then come back."
          />
          <div className="flex justify-center pb-8">
            <Button href="/dashboard/members" size="sm">
              Go to members
            </Button>
          </div>
        </div>
      ) : (
        <>
          <form
            onSubmit={handleSend}
            className="rounded-lg border border-neutral-200 bg-white p-6"
          >
            <p className="text-base font-semibold text-neutral-900">
              New announcement
            </p>
            <p className="mt-1 text-sm text-neutral-500">
              Goes to{" "}
              <span className="font-medium text-neutral-900">
                {membersWithEmail} of {membersTotal}
              </span>{" "}
              members (those with an email on file).
            </p>
            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-900">
                  Subject
                </label>
                <input
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Community update — water shutoff Tuesday"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-900">
                  Message
                </label>
                <textarea
                  required
                  rows={8}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write the announcement — it arrives as plain text, signed with the association name."
                  className="w-full rounded-md border border-neutral-200 bg-white p-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <Button type="submit" size="sm" disabled={sending}>
                {sending
                  ? "Sending..."
                  : `Send to ${membersWithEmail} member${
                      membersWithEmail === 1 ? "" : "s"
                    }`}
              </Button>
              {result && (
                <span
                  className={`text-sm ${
                    result.ok ? "text-emerald-700" : "text-red-600"
                  }`}
                >
                  {result.text}
                </span>
              )}
            </div>
          </form>

          <div>
            <p className="mb-2 text-sm font-medium text-neutral-500">
              Recently sent
            </p>
            {announcements.length === 0 ? (
              <p className="rounded-lg border border-neutral-200 bg-white px-4 py-6 text-center text-sm text-neutral-500">
                Nothing sent yet.
              </p>
            ) : (
              <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
                <ul className="divide-y divide-neutral-100">
                  {announcements.map((a) => (
                    <li key={a.id} className="px-4 py-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-medium text-neutral-900">
                          {a.subject}
                        </p>
                        <p className="text-sm text-neutral-500">
                          {a.sentLabel}
                        </p>
                      </div>
                      <p className="mt-0.5 text-sm text-neutral-500">
                        Delivered to {a.recipientCount}
                        {a.failedCount > 0
                          ? ` · ${a.failedCount} failed`
                          : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
