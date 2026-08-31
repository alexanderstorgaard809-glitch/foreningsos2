"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Settings = {
  associationName: string;
  address: string;
  city: string;
  contactEmail: string;
};

const inputClass =
  "h-9 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10";

const labelClass = "mb-1.5 block text-sm font-medium text-neutral-900";

export function SettingsForm({ settings }: { settings: Settings }) {
  const router = useRouter();
  const [associationName, setAssociationName] = useState(
    settings.associationName
  );
  const [address, setAddress] = useState(settings.address);
  const [city, setCity] = useState(settings.city);
  const [contactEmail, setContactEmail] = useState(settings.contactEmail);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ associationName, address, city, contactEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 rounded-lg border border-neutral-200 bg-white p-6"
    >
      <p className="text-base font-semibold text-neutral-900">
        Association profile
      </p>
      <p className="mt-1 text-sm text-neutral-500">
        These details appear in the top bar and in meeting notices.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClass}>Association name</label>
          <input
            required
            value={associationName}
            onChange={(e) => setAssociationName(e.target.value)}
            placeholder="Maple Street Homeowners Association"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>
            Address{" "}
            <span className="font-normal text-neutral-400">(optional)</span>
          </label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="12 Maple Street"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>
            City{" "}
            <span className="font-normal text-neutral-400">(optional)</span>
          </label>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Springfield"
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>
            Contact email{" "}
            <span className="font-normal text-neutral-400">(optional)</span>
          </label>
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="board@example.com"
            className={inputClass}
          />
          <p className="mt-1.5 text-xs text-neutral-500">
            Shown at the bottom of meeting notices.
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <Button type="submit" size="sm" disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
        </Button>
        {saved && <span className="text-sm text-emerald-600">Saved</span>}
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </form>
  );
}
