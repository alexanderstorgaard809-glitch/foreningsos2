"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatUsd } from "@/lib/format";

export type HandoverProps = {
  isOwner: boolean;
  association: {
    name: string;
    address: string;
    city: string;
    contactEmail: string;
  };
  users: { id: string; name: string; email: string; role: string }[];
  memberCount: number;
  duesYears: {
    year: number;
    amount: number;
    paidCount: number;
    memberCount: number;
    percent: number;
  }[];
  charges: { count: number; total: number };
  maintenance: {
    openCount: number;
    items: { title: string; status: string }[];
  };
  meetings: {
    title: string;
    dateLabel: string;
    timeLabel: string;
    location: string;
  }[];
  documentCount: number;
  documentNames: string[];
};

const statusLabels: Record<string, string> = {
  new: "New",
  in_progress: "In progress",
};

const selectClass =
  "h-9 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10";

const downloadClass =
  "inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md border border-neutral-900 bg-neutral-900 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-neutral-800";

export function HandoverView({
  isOwner,
  association,
  users,
  memberCount,
  duesYears,
  charges,
  maintenance,
  meetings,
  documentCount,
  documentNames,
}: HandoverProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [transferTarget, setTransferTarget] = useState("");
  const [transferring, setTransferring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transferred, setTransferred] = useState(false);

  const boardMembers = users.filter((u) => u.role === "board");

  function buildHandoverText(): string {
    const lines: string[] = [];
    const today = new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    lines.push(association.name);
    lines.push("TREASURER HANDOVER PACKAGE");
    lines.push(`Generated ${today}`);
    lines.push("");

    lines.push("BOARD MEMBERS");
    for (const u of users) {
      lines.push(
        `- ${u.name} (${u.role === "owner" ? "Owner" : "Board member"}) — ${u.email}`
      );
    }

    lines.push("");
    lines.push(`MEMBERS: ${memberCount} on record`);
    lines.push(
      "Full roster with dues history: members-export CSV (from the handover page)."
    );

    lines.push("");
    lines.push("DUES STATUS");
    if (duesYears.length === 0) {
      lines.push("No dues years configured yet.");
    } else {
      for (const dy of duesYears) {
        lines.push(
          `- ${dy.year}: ${formatUsd(dy.amount)} per member — ${dy.paidCount} of ${dy.memberCount} paid (${dy.percent}%), ${formatUsd(dy.paidCount * dy.amount)} collected`
        );
      }
    }

    if (charges.count > 0) {
      lines.push("");
      lines.push(
        `OUTSTANDING CHARGES (late fees / assessments): ${charges.count} unpaid, ${formatUsd(charges.total)} total`
      );
    }

    lines.push("");
    lines.push(`OPEN MAINTENANCE REQUESTS: ${maintenance.openCount}`);
    for (const item of maintenance.items) {
      lines.push(
        `- ${item.title} [${statusLabels[item.status] ?? item.status}]`
      );
    }

    lines.push("");
    lines.push("UPCOMING MEETINGS");
    if (meetings.length === 0) {
      lines.push("- None scheduled");
    } else {
      for (const m of meetings) {
        lines.push(
          `- ${m.title} — ${m.dateLabel}, ${m.timeLabel}${m.location ? `, ${m.location}` : ""}`
        );
      }
    }

    lines.push("");
    lines.push(`DOCUMENTS IN ARCHIVE: ${documentCount}`);
    for (const name of documentNames) {
      lines.push(`- ${name}`);
    }

    lines.push("");
    lines.push("OUTSIDE THIS SYSTEM — HAND OVER IN PERSON");
    lines.push(
      "- Bank account: add the successor as signatory, remove the departing member"
    );
    lines.push("- PO box key, checkbooks, debit cards");
    lines.push(
      "- Logins outside HOAcove (utilities, insurance portals, mail forwarding)"
    );
    lines.push("- Contacts: accountant, attorney, regular vendors");

    lines.push("");
    lines.push("SUCCESSOR GETTING STARTED");
    lines.push(
      "1. The owner generates an invite link in Settings and sends it to the successor"
    );
    lines.push(
      "2. The successor joins as a board member — all records visible immediately"
    );
    lines.push("3. Ownership transfers on this page (or Settings > Board members)");

    if (association.contactEmail.trim()) {
      lines.push("");
      lines.push(`Questions? Contact: ${association.contactEmail.trim()}`);
    }

    return lines.join("\n");
  }

  async function copyHandover() {
    await navigator.clipboard.writeText(buildHandoverText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleTransfer() {
    const target = boardMembers.find((u) => u.id === transferTarget);
    if (!target) return;
    const confirmed = confirm(
      `Transfer ownership to ${target.name}? You become a regular board member and lose the ability to manage invites and ownership. Only ${target.name} can transfer it back.`
    );
    if (!confirmed) return;

    setTransferring(true);
    setError(null);
    try {
      const res = await fetch("/api/association/transfer-ownership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: transferTarget }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Something went wrong");
        return;
      }
      setTransferTarget("");
      setTransferred(true);
      router.refresh();
    } finally {
      setTransferring(false);
    }
  }

  return (
    <div>
      <Link
        href="/dashboard/settings"
        className="text-sm text-neutral-500 hover:text-neutral-900"
      >
        Back to settings
      </Link>

      <h1 className="font-heading mt-4 text-2xl font-semibold text-neutral-900">
        Treasurer handover
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        Everything a departing board member hands to the successor — in one
        place, so the association keeps its records even when people leave.
      </p>

      <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-6">
        <p className="text-base font-semibold text-neutral-900">
          1. The handover document
        </p>
        <p className="mt-1 text-sm text-neutral-500">
          A complete summary: board members, dues status per year, outstanding
          charges, open maintenance, upcoming meetings, documents — plus a
          checklist of what must be handed over in person (bank signatory,
          keys, outside logins). Copy it into an email to the successor.
        </p>
        <div className="mt-4">
          <Button size="sm" variant="secondary" onClick={copyHandover}>
            {copied ? "Copied!" : "Copy handover document"}
          </Button>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-neutral-200 bg-white p-6">
        <p className="text-base font-semibold text-neutral-900">
          2. Members CSV
        </p>
        <p className="mt-1 text-sm text-neutral-500">
          The full roster with contact details and per-year dues status — the
          same format the CSV import accepts, so it can be re-imported
          anywhere, anytime.
        </p>
        <div className="mt-4">
          <a href="/api/members/export" download className={downloadClass}>
            Download members CSV
          </a>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-neutral-200 bg-white p-6">
        <p className="text-base font-semibold text-neutral-900">
          3. Ownership transfer
        </p>
        {isOwner ? (
          <>
            <p className="mt-1 text-sm text-neutral-500">
              Hand the keys to a board member. They become the owner and can
              manage invites, settings and future ownership transfers. You
              remain a board member with full access to records.
            </p>
            {transferred && (
              <p className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                Ownership transferred. You are now a board member.
              </p>
            )}
            {boardMembers.length === 0 ? (
              <p className="mt-3 text-sm text-neutral-500">
                No board members yet — invite the successor first (Settings →
                Board members → generate invite link).
              </p>
            ) : (
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <select
                  value={transferTarget}
                  onChange={(e) => setTransferTarget(e.target.value)}
                  className={selectClass}
                >
                  <option value="">Select a board member…</option>
                  {boardMembers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
                <Button
                  onClick={handleTransfer}
                  disabled={!transferTarget || transferring}
                  className="shrink-0"
                >
                  {transferring ? "Transferring..." : "Transfer ownership"}
                </Button>
              </div>
            )}
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </>
        ) : (
          <p className="mt-1 text-sm text-neutral-500">
            Only the association owner can transfer ownership. Ask{" "}
            {users.find((u) => u.role === "owner")?.name ?? "the owner"} to do
            this from their account.
          </p>
        )}
      </div>

      <div className="mt-4 rounded-lg border border-dashed border-neutral-300 bg-white p-6">
        <p className="text-sm font-medium text-neutral-900">
          Outside this system — hand over in person
        </p>
        <ul className="mt-2 space-y-1 text-sm text-neutral-600">
          <li>Bank account signatory change at the bank</li>
          <li>PO box key, checkbooks, debit cards</li>
          <li>Logins outside HOAcove (utilities, insurance portals)</li>
          <li>
            Contact details for the accountant, attorney and regular vendors
          </li>
        </ul>
        <p className="mt-3 text-xs text-neutral-500">
          Software can transfer records. These four still need a handshake.
        </p>
      </div>
    </div>
  );
}
