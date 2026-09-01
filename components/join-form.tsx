"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

const inputClass =
  "h-9 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10";

const labelClass = "mb-1.5 block text-sm font-medium text-neutral-900";

export function JoinForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCode = (searchParams.get("code") ?? "").trim().toUpperCase();

  const [code, setCode] = useState(initialCode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [associationName, setAssociationName] = useState<string | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function lookup(value: string) {
    setAssociationName(null);
    setLookupError(null);
    if (value.length < 6) return;
    try {
      const res = await fetch(
        `/api/invites/lookup?code=${encodeURIComponent(value)}`
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setLookupError(data.error ?? "Invalid invite code");
        return;
      }
      setAssociationName(data.associationName);
    } catch {
      setLookupError("Could not verify the code");
    }
  }

  useEffect(() => {
    if (initialCode.length >= 6) {
      lookup(initialCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, inviteCode: code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-6">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2 text-sm font-semibold text-neutral-900"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-neutral-900 text-[11px] font-bold text-white">
            H
          </span>
          <span className="font-heading">HOAcove</span>
        </Link>
        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <h1 className="font-heading text-xl font-semibold text-neutral-900">
            Join your association
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            You were invited by your board. You&apos;ll join as a board member.
          </p>

          {associationName && (
            <p className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              You&apos;re joining: {associationName}
            </p>
          )}
          {lookupError && (
            <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {lookupError}
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className={labelClass}>Invite code</label>
              <input
                required
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setAssociationName(null);
                  setLookupError(null);
                }}
                onBlur={() => lookup(code.trim().toUpperCase())}
                placeholder="From your invite link"
                className={`${inputClass} font-mono uppercase`}
              />
            </div>
            <div>
              <label className={labelClass}>Your name</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Smith"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Password</label>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className={inputClass}
              />
            </div>
            {error && (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}
            <Button type="submit" disabled={busy} className="w-full">
              {busy ? "Joining..." : "Join association"}
            </Button>
          </form>
        </div>
        <p className="mt-4 text-center text-sm text-neutral-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-neutral-900 hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
