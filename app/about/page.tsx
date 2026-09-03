import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "HOAcove is simple, honest software for self-managed homeowners' associations — dues, ledgers, budgets, meetings and documents in one place. Free for small boards.",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-heading text-4xl font-semibold tracking-tight text-neutral-900">
        About HOAcove
      </h1>
      <div className="mt-6 space-y-4 text-neutral-600">
        <p>
          HOAcove is all-in-one software for self-managed homeowners'
          associations: dues tracking with per-unit ledgers, budget planning,
          meeting notices, attendance and proxies, announcements, maintenance
          requests and a document archive.
        </p>
        <p>
          It exists because most boards run on a spreadsheet, a banking app and
          a shoebox of paper — and the tools that try to replace that are
          either built for professional property managers or demand accounting
          knowledge a volunteer treasurer shouldn't need.
        </p>
        <p>
          So the design rules are simple: if a treasurer thinks in "who has
          paid, who hasn't, and what do we owe," that's what the screen shows.
          No double-entry, no chart of accounts, no per-seat pricing games.
        </p>
        <p>
          HOAcove is free for boards up to 25 homes — not a trial, the actual
          plan. No card, no timer, and no board vote required. Larger
          associations pay for the tiers above. That's the whole deal.
        </p>
        <p>
          It's built by one person in Denmark, and support is the same person.
          If anything is unclear, missing or broken, write to{" "}
          <a
            href="mailto:alexanderstorgaard809@gmail.com"
            className="font-medium text-neutral-900 underline"
          >
            alexanderstorgaard809@gmail.com
          </a>{" "}
          — you'll get a human answer, fast.
        </p>
      </div>
    </main>
  );
}
