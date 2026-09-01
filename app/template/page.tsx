import type { Metadata } from "next";
import Link from "next/link";
import { TemplateForm } from "@/components/template-form";

export const metadata: Metadata = {
  title: "Free HOA Dues Tracking Template",
  description:
    "A free spreadsheet template for tracking HOA dues per unit: live totals, example rows and treasurer how-tos. Works in Excel and Google Sheets.",
};

const inside = [
  {
    title: "Live summary",
    text: "Total expected, collected, outstanding and % collected — calculated automatically as you mark payments Paid or Due.",
  },
  {
    title: "Example rows",
    text: "Six pre-filled rows show exactly how to use it. Replace them with your units and you're running.",
  },
  {
    title: "Treasurer how-to",
    text: "A second sheet with the annual rollover, ledger-on-demand and handover tips — the stuff that usually lives only in someone's head.",
  },
];

const faqs = [
  {
    q: "Does it work with Google Sheets?",
    a: "Yes — File > Import > Upload, and all formulas carry over. Everything also works in Excel and LibreOffice.",
  },
  {
    q: "Why is it free?",
    a: "We make HOAcove, software that replaces this template when a board outgrows it. The template is ours to give — and if your board stays small and happy on it, that's genuinely fine.",
  },
  {
    q: "What happens to our data?",
    a: "The file lives wherever you put it — your drive, your computer. We receive only your email address.",
  },
  {
    q: "Is a spreadsheet really enough for a board?",
    a: "For dues tracking at a small association, mostly yes — that's why this template is good. Budgets, meetings, maintenance and document handover are where spreadsheets start to crack. That's what HOAcove adds.",
  },
];

export default function TemplatePage() {
  return (
    <main className="bg-white text-neutral-900">
      <header className="border-b border-neutral-200">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-neutral-900 text-[11px] font-bold text-white">
              H
            </span>
            <span className="font-heading">HOAcove</span>
          </Link>
          <Link
            href="/"
            className="text-sm text-neutral-500 hover:text-neutral-900"
          >
            Back to HOAcove
          </Link>
        </div>
      </header>

      <section className="border-b border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-3xl px-6 pt-16 pb-14 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-600">
            Free download — no account needed
          </span>
          <h1 className="font-heading mx-auto mt-5 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
            The HOA dues tracking template
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-neutral-600">
            The spreadsheet your treasurer wishes existed: one row per unit,
            live totals at the top, and a clean way to hand over records when
            the board changes.
          </p>
          <TemplateForm />
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="font-heading text-center text-2xl font-semibold tracking-tight">
            What's inside
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {inside.map((f) => (
              <div
                key={f.title}
                className="rounded-lg border border-neutral-200 bg-white p-5"
              >
                <h3 className="text-sm font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">
                  {f.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-neutral-200 bg-neutral-50 py-16">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="font-heading text-center text-2xl font-semibold tracking-tight">
            Questions
          </h2>
          <div className="mt-8 space-y-3">
            {faqs.map((f) => (
              <details
                key={f.q}
                className="rounded-lg border border-neutral-200 bg-white px-4 py-3"
              >
                <summary className="cursor-pointer list-none text-sm font-medium text-neutral-900">
                  {f.q}
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-neutral-200 py-8">
        <div className="mx-auto max-w-4xl px-6 text-sm text-neutral-500">
          © {new Date().getFullYear()} HOAcove — software for self-managed
          homeowner associations
        </div>
      </footer>
    </main>
  );
}
