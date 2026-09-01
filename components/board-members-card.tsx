"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type BoardUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  joinedLabel: string;
};

export function BoardMembersCard({
  users,
  isOwner,
  invite,
}: {
  users: BoardUser[];
  isOwner: boolean;
  invite: { code: string; expiresLabel: string } | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setBusy("generate");
    setError(null);
    try {
      const res = await fetch("/api/invites", { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Something went wrong");
        return;
      }
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  async function revoke() {
    setBusy("revoke");
    setError(null);
    try {
      const res = await fetch("/api/invites", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Something went wrong");
        return;
      }
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  async function removeUser(id: string) {
    if (
      !confirm(
        "Remove this board member's access? Their login stops working immediately."
      )
    )
      return;
    setBusy(id);
    setError(null);
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Something went wrong");
        return;
      }
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  async function copyLink() {
    if (!invite) return;
    await navigator.clipboard.writeText(
      `${window.location.origin}/join?code=${invite.code}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mt-4 rounded-lg border border-neutral-200 bg-white p-6">
      <p className="text-base font-semibold text-neutral-900">
        Board members
      </p>
      <p className="mt-1 text-sm text-neutral-500">
        Everyone with access to this association.
      </p>

      <ul className="mt-4 divide-y divide-neutral-100 border border-neutral-200 rounded-lg">
        {users.map((u) => (
          <li
            key={u.id}
            className="flex items-center gap-3 px-4 py-3 text-sm"
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium text-neutral-900">{u.name}</p>
              <p className="text-xs text-neutral-500">
                {u.email} · joined {u.joinedLabel}
              </p>
            </div>
            <Badge variant={u.role === "owner" ? "default" : "default"}>
              {u.role === "owner" ? "Owner" : "Board member"}
            </Badge>
            {isOwner && u.role !== "owner" && (
              <button
                onClick={() => removeUser(u.id)}
                disabled={busy === u.id}
                className="shrink-0 text-sm font-medium text-red-600 hover:text-red-700"
              >
                {busy === u.id ? "Removing..." : "Remove"}
              </button>
            )}
          </li>
        ))}
      </ul>

      {isOwner ? (
        <div className="mt-5 border-t border-neutral-100 pt-4">
          {invite ? (
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-neutral-900">
                  Invite link active — expires {invite.expiresLabel}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={copyLink}>
                    {copied ? "Copied!" : "Copy invite link"}
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={generate}
                    disabled={busy === "generate"}
                  >
                    {busy === "generate" ? "Generating..." : "Regenerate"}
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={revoke}
                    disabled={busy === "revoke"}
                  >
                    {busy === "revoke" ? "Revoking..." : "Revoke"}
                  </Button>
                </div>
              </div>
              <p className="mt-3 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 font-mono text-sm text-neutral-700">
                /join?code={invite.code}
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-neutral-500">
                No active invite link.
              </p>
              <Button
                size="sm"
                onClick={generate}
                disabled={busy === "generate"}
              >
                {busy === "generate" ? "Generating..." : "Generate invite link"}
              </Button>
            </div>
          )}
          <p className="mt-3 text-xs text-neutral-500">
            Anyone with this link can join as a board member with full access
            to this association's data. Regenerate or revoke to invalidate it.
          </p>
        </div>
      ) : (
        <p className="mt-4 text-xs text-neutral-500">
          Only the association owner can manage invites and access.
        </p>
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
