import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/reveal";
import { AppPreview } from "@/components/landing/product-showcase";
import { PricingCard } from "@/components/landing/pricing-card";

const iconProps = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const features = [
  {
    title: "Dues collection",
    text: "Set the annual amount once. Mark payments as they arrive and watch the money total grow — no more chasing bank transfers through spreadsheets.",
    icon: (
      <svg {...iconProps}>
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    big: true,
  },
  {
    title: "Member directory",
    text: "Every home, owner and contact in one searchable list.",
    icon: (
      <svg {...iconProps}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: "Annual meetings",
    text: "Notices, agendas and minutes in the correct order, stored with every past meeting. Your board stays compliant without knowing it is.",
    icon: (
      <svg {...iconProps}>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    title: "Document archive",
    text: "Bylaws, budgets and reports in one searchable archive, ready the day a lawyer asks for them.",
    icon: (
      <svg {...iconProps}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    title: "Maintenance queue",
    text: "Repair requests from residents in a single queue — not a text message maze.",
    icon: (
      <svg {...iconProps}>
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
];

const marqueeItems = [
  "Dues collection",
  "Member directory",
  "Annual meetings",
  "Document archive",
  "Maintenance queue",
  "Board meeting minutes",
  "Payment tracking",
  "Built for volunteer boards",
];

const steps = [
  {
    title: "Add your members",
    text: "Type them in — a typical association takes a few minutes. Bulk import is on the way.",
  },
  {
    title: "Set the annual amount",
    text: "One number per year. HOAcove turns it into live collection totals for the whole association.",
  },
  {
    title: "Mark payments as they arrive",
    text: "One click per member. The progress bar fills, and the stragglers sort themselves to the top.",
  },
];

const faqs = [
  {
    q: "What is HOAcove?",
    a: "An all-in-one tool for homeowners' associations run by volunteer boards. It replaces the spreadsheets, email chains and paper binders with one place for members, dues, meetings and documents.",
  },
  {
    q: "Do we need to install anything?",
    a: "No. HOAcove runs in the browser on any laptop, tablet or phone. Nothing to install, nothing to update.",
  },
  {
    q: "How does dues tracking work?",
    a: "You set an annual amount per member. When payments arrive, the treasurer marks them paid with one click. HOAcove shows who has paid, who has not, and exactly how much money has been collected.",
  },
  {
    q: "Can we import our existing member list?",
    a: "Members can be added manually today, and CSV import is on the roadmap — paste an export from Excel and all members appear at once.",
  },
  {
    q: "What happens to our data?",
    a: "Your data belongs to your association. We never sell it or share it, and you can export or delete everything at any time.",
  },
];

function CheckIcon() {
  return (
    <svg
      className="mt-0.5 shrink-0 text-emerald-600"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function Home() {
  const year = new Date().getFullYear();

  return (
    <main className="bg-white text-neutral-900">
      {/* Navbar */}
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold text-neutral-900"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-neutral-900 text-[11px] font-bold text-white">
              H
            </span>
            <span className="font-heading">HOAcove</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-neutral-600 md:flex">
            <a href="#features" className="transition-colors hover:text-neutral-900">Features</a>
            <a href="#how" className="transition-colors hover:text-neutral-900">How it works</a>
            <a href="#pricing" className="transition-colors hover:text-neutral-900">Pricing</a>
            <a href="#faq" className="transition-colors hover:text-neutral-900">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" href="/login">
              Log in
            </Button>
            <Button href="/signup">Get started</Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-neutral-200 bg-neutral-50">
        <div aria-hidden className="hero-grid absolute inset-0" />
        <div className="relative mx-auto max-w-5xl px-6 pt-20 pb-20 text-center">
          <span
            className="anim-fade-up inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-600 shadow-sm"
            style={{ animationDelay: "0ms" }}
          >
            <span className="anim-pulse-dot h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Early access — built for volunteer boards
          </span>
          <h1
            className="anim-fade-up font-heading mx-auto mt-6 max-w-3xl text-5xl font-semibold tracking-tight sm:text-6xl"
            style={{ animationDelay: "90ms" }}
          >
            Run your homeowners' association{" "}
            <span className="bg-gradient-to-b from-neutral-900 to-neutral-500 bg-clip-text text-transparent">
              without the spreadsheet chaos
            </span>
          </h1>
          <p
            className="anim-fade-up mx-auto mt-5 max-w-xl text-lg text-neutral-600"
            style={{ animationDelay: "180ms" }}
          >
            HOAcove collects dues, organizes meetings and keeps every
            document in one place — so your volunteer board can spend its time
            on the neighborhood, not the paperwork.
          </p>
          <div
            className="anim-fade-up mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
            style={{ animationDelay: "270ms" }}
          >
            <Button href="/signup">Start free</Button>
            <Button variant="secondary" href="#how">
              See how it works
            </Button>
          </div>
          <p
            className="anim-fade-up mt-4 text-xs text-neutral-400"
            style={{ animationDelay: "340ms" }}
          >
            Free during early access · No credit card required
          </p>

          {/* Animated product showcase */}
          <div
            className="anim-fade-up"
            style={{ animationDelay: "420ms" }}
          >
            <AppPreview />
          </div>
        </div>

        {/* Capability marquee */}
        <div className="relative border-t border-neutral-200 bg-white py-4">
          <div className="marquee-fade overflow-hidden">
            <div className="anim-marquee flex w-max items-center gap-8 pr-8">
              {[...marqueeItems, ...marqueeItems].map((item, i) => (
                <span
                  key={i}
                  className="flex items-center gap-8 text-sm text-neutral-400"
                >
                  {item}
                  <span className="h-1 w-1 rounded-full bg-neutral-300" />
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features — bento grid */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-5xl px-6">
          <Reveal className="text-center">
            <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              The boring work — all in one place
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-neutral-600">
              Everything a volunteer board actually does, without the parts
              nobody volunteers for.
            </p>
          </Reveal>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {features.map((f, i) => (
              <Reveal
                key={f.title}
                delay={i * 70}
                className={f.big ? "md:col-span-2" : ""}
              >
                <div
                  className={`group h-full rounded-xl border border-neutral-200 bg-white p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-lg hover:shadow-neutral-900/5 ${
                    f.big ? "md:flex md:items-center md:gap-8" : ""
                  }`}
                >
                  <div className={f.big ? "md:flex-1" : ""}>
                    <div className="flex h-9 w-9 items-center justify-center rounded-md border border-neutral-200 bg-neutral-50 text-neutral-700 transition-colors group-hover:border-neutral-300 group-hover:bg-white">
                      {f.icon}
                    </div>
                    <h3 className="mt-4 text-sm font-semibold text-neutral-900">
                      {f.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">
                      {f.text}
                    </p>
                  </div>
                  {f.big && (
                    <div className="mt-6 w-full max-w-xs shrink-0 rounded-lg border border-neutral-200 bg-neutral-50 p-4 md:mt-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-neutral-900">
                          Dues 2026
                        </p>
                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                          75%
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-neutral-500">
                        <span className="font-semibold text-neutral-900">
                          $3,600
                        </span>{" "}
                        of $4,800 expected
                      </p>
                      <div className="mt-2 h-1.5 w-full rounded-full bg-neutral-200/70">
                        <div className="h-1.5 w-3/4 rounded-full bg-emerald-500" />
                      </div>
                      <div className="mt-3 flex h-12 items-end gap-1">
                        {[35, 55, 45, 70, 60, 90].map((h, j) => (
                          <div
                            key={j}
                            className="anim-bar flex-1 rounded-sm bg-neutral-900"
                            style={{
                              height: `${h}%`,
                              animationDelay: `${0.3 + j * 0.08}s`,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>

          {/* Security band */}
          <Reveal className="mt-4">
            <div className="flex flex-col items-start gap-4 rounded-xl border border-neutral-200 bg-neutral-50 p-6 sm:flex-row sm:items-center">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-700">
                <svg {...iconProps}>
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-neutral-900">
                  Your data belongs to your association
                </h3>
                <p className="mt-1 text-sm text-neutral-600">
                  Passwords are hashed, sessions are encrypted cookies, and
                  every record is scoped to your association only. Export or
                  delete everything at any time.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how"
        className="border-t border-neutral-200 bg-neutral-50 py-24"
      >
        <div className="mx-auto max-w-5xl px-6">
          <Reveal className="text-center">
            <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              Set up in one evening
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-neutral-600">
              From spreadsheet chaos to a running system the same night.
            </p>
          </Reveal>
          <div className="relative mt-12">
            <div
              aria-hidden
              className="absolute left-0 right-0 top-7 hidden border-t border-dashed border-neutral-300 md:block"
            />
            <div className="grid gap-4 md:grid-cols-3">
              {steps.map((s, i) => (
                <Reveal key={s.title} delay={i * 100}>
                  <div className="relative h-full rounded-xl border border-neutral-200 bg-white p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-neutral-900/5">
                    <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white ring-4 ring-neutral-50">
                      {i + 1}
                    </span>
                    <h3 className="mt-4 text-sm font-semibold text-neutral-900">
                      {s.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">
                      {s.text}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24">
        <div className="mx-auto max-w-5xl px-6">
          <Reveal className="text-center">
            <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              Every feature. One price.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-neutral-600">
              All plans include everything — the only difference is how many
              homes your association has. Pick a size, see the price.
            </p>
          </Reveal>
          <div className="mt-14">
            <Reveal delay={80}>
              <PricingCard />
            </Reveal>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section
        id="faq"
        className="border-t border-neutral-200 bg-neutral-50 py-24"
      >
        <div className="mx-auto max-w-2xl px-6">
          <Reveal className="text-center">
            <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              Common questions
            </h2>
          </Reveal>
          <div className="mt-10 space-y-3">
            {faqs.map((f, i) => (
              <Reveal key={f.q} delay={i * 60}>
                <details className="group rounded-xl border border-neutral-200 bg-white px-5 py-4 transition-colors open:border-neutral-300">
                  <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-neutral-900 marker:hidden [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <svg
                      className="h-4 w-4 shrink-0 text-neutral-400 transition-transform duration-300 group-open:rotate-45"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                    {f.a}
                  </p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-neutral-950 py-24">
        <div aria-hidden className="cta-grid absolute inset-0" />
        <div
          aria-hidden
          className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-3xl"
        />
        <div className="relative mx-auto max-w-5xl px-6 text-center">
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Your board didn't volunteer for admin work
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-neutral-400">
            Set up HOAcove tonight and never chase a dues payment through a
            spreadsheet again.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button variant="inverted" href="/signup">
              Start free
            </Button>
            <Button
              variant="ghost"
              href="#faq"
              className="border border-white/15 text-neutral-300 hover:bg-white/5 hover:text-white"
            >
              Read the FAQ
            </Button>
          </div>
          <p className="mt-4 text-xs text-neutral-500">
            Free during early access · Set up in minutes · Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 py-12">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-8 sm:grid-cols-3">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-neutral-900 text-[11px] font-bold text-white">
                  H
                </span>
                <span className="font-heading">HOAcove</span>
              </div>
              <p className="mt-2 text-sm text-neutral-500">
                All-in-one software for homeowners' associations.
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-900">Product</p>
              <ul className="mt-2 space-y-1.5 text-sm text-neutral-500">
                <li><a href="#features" className="transition-colors hover:text-neutral-900">Features</a></li>
                <li><a href="#how" className="transition-colors hover:text-neutral-900">How it works</a></li>
                <li><a href="#pricing" className="transition-colors hover:text-neutral-900">Pricing</a></li>
                <li><a href="#faq" className="transition-colors hover:text-neutral-900">FAQ</a></li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-900">Contact</p>
              <ul className="mt-2 space-y-1.5 text-sm text-neutral-500">
                <li>
                  <a href="mailto:alexanderstorgaard809@gmail.com" className="transition-colors hover:text-neutral-900">
                    alexanderstorgaard809@gmail.com
                  </a>
                </li>
                <li>
                  <a href="/login" className="transition-colors hover:text-neutral-900">
                    Board login
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <p className="mt-10 border-t border-neutral-100 pt-6 text-sm text-neutral-400">
            © {year} HOAcove — built in Denmark
          </p>
        </div>
      </footer>
    </main>
  );
}
