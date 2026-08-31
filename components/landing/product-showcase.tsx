"use client";

import { useEffect, useState } from "react";

const navIconProps = {
  width: 13,
  height: 13,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const navItems = [
  {
    label: "Overview",
    icon: (
      <svg {...navIconProps}>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: "Members",
    icon: (
      <svg {...navIconProps}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: "Dues",
    icon: (
      <svg {...navIconProps}>
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    label: "Meetings",
    icon: (
      <svg {...navIconProps}>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    label: "Documents",
    icon: (
      <svg {...navIconProps}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    label: "Maintenance",
    icon: (
      <svg {...navIconProps}>
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
];

const chartBars = [42, 58, 50, 66, 60, 74, 68, 82, 78, 84, 88, 92];

const activity = [
  { dot: "bg-emerald-500", text: "Payment marked paid", meta: "2m ago" },
  { dot: "bg-neutral-300", text: "Meeting minutes uploaded", meta: "1d ago" },
  { dot: "bg-amber-400", text: "New maintenance request", meta: "3d ago" },
];

const members = [
  { initials: "EC", name: "Emily Carter", unit: "Unit 2", paid: true },
  { initials: "JM", name: "James Miller", unit: "Unit 4", paid: false },
  { initials: "SA", name: "Sofia Andersen", unit: "Unit 7", paid: true },
  { initials: "LN", name: "Lars Nielsen", unit: "Unit 11", paid: false },
];

const meetings = [
  { date: "Mar 12", title: "Annual meeting 2026", status: "Minutes ready", tone: "emerald" },
  { date: "May 20", title: "Extraordinary meeting", status: "Upcoming", tone: "neutral" },
  { date: "Nov 03", title: "Board meeting", status: "Agenda sent", tone: "neutral" },
];

const documents = [
  { name: "bylaws-2019.pdf", meta: "1.2 MB" },
  { name: "budget-2026.xlsx", meta: "84 KB" },
  { name: "minutes-annual-2026.pdf", meta: "310 KB" },
  { name: "insurance-policy.pdf", meta: "2.4 MB" },
];

const requests = [
  { title: "Leaky faucet", unit: "Hallway B", status: "In progress", tone: "amber" },
  { title: "Broken mailbox", unit: "Unit 9", status: "Open", tone: "neutral" },
  { title: "Garage door sensor", unit: "Unit 3", status: "Done", tone: "emerald" },
];

const pillTones: Record<string, string> = {
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  neutral: "border-neutral-200 bg-neutral-50 text-neutral-600",
};

function StatusPill({ label, tone }: { label: string; tone: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${
        pillTones[tone] ?? pillTones.neutral
      }`}
    >
      {label}
    </span>
  );
}

function PaidPill() {
  return (
    <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
      Paid
    </span>
  );
}

function DuePill() {
  return (
    <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
      Due
    </span>
  );
}

/* ---------- Panels: one mini-demo per nav item ---------- */

function OverviewPanel() {
  return (
    <div>
      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-neutral-200 p-3">
          <p className="text-[10px] text-neutral-500">Collected · 2026</p>
          <div className="relative mt-1 h-6">
            <span className="anim-swap-a font-heading absolute text-lg font-semibold text-neutral-900">
              $3,600
            </span>
            <span className="anim-swap-b font-heading absolute text-lg font-semibold text-neutral-900">
              $3,800
          </span>
          </div>
          <p className="text-[10px] text-neutral-400">of $4,800</p>
        </div>
        <div className="rounded-lg border border-neutral-200 p-3">
          <p className="text-[10px] text-neutral-500">Members</p>
          <p className="font-heading mt-1 text-lg font-semibold text-neutral-900">
            24
          </p>
          <p className="text-[10px] text-neutral-400">18 homes paid</p>
        </div>
        <div className="rounded-lg border border-neutral-200 p-3">
          <p className="flex items-center gap-1.5 text-[10px] text-neutral-500">
            Open requests
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          </p>
          <p className="font-heading mt-1 text-lg font-semibold text-neutral-900">
            3
          </p>
          <p className="text-[10px] text-neutral-400">2 urgent</p>
        </div>
      </div>

      {/* Dues card with live flip */}
      <div className="mt-3 rounded-lg border border-neutral-200 p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-neutral-900">Dues 2026</p>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
            75%
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full rounded-full bg-neutral-200/70">
          <div className="anim-progress h-1.5 rounded-full bg-emerald-500" />
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 text-[9px] font-semibold text-neutral-600">
              JM
            </span>
            <div>
              <p className="text-[11px] font-medium text-neutral-900">
                James Miller
              </p>
              <p className="text-[10px] text-neutral-400">Unit 4</p>
            </div>
          </div>
          <div className="relative h-5 w-14">
            <span className="anim-swap-a absolute right-0">
              <DuePill />
            </span>
            <span className="anim-swap-b absolute right-0">
              <PaidPill />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MembersPanel() {
  return (
    <div>
      <div className="flex items-center gap-2 rounded-md border border-neutral-200 px-2.5 py-1.5 text-[11px] text-neutral-400">
        <svg {...navIconProps} width={11} height={11}>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        Search members…
      </div>
      <div className="mt-2 space-y-0.5">
        {members.map((m) => (
          <div
            key={m.name}
            className="flex items-center justify-between rounded-md px-2 py-1.5 transition-colors hover:bg-neutral-50"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 text-[9px] font-semibold text-neutral-600">
                {m.initials}
              </span>
              <div>
                <p className="text-[11px] font-medium text-neutral-900">
                  {m.name}
                </p>
                <p className="text-[10px] text-neutral-400">{m.unit}</p>
              </div>
            </div>
            {m.paid ? <PaidPill /> : <DuePill />}
          </div>
        ))}
      </div>
      <p className="mt-1.5 text-[10px] text-neutral-400">
        24 members · every home, owner and contact in one list
      </p>
    </div>
  );
}

function DuesPanel() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-neutral-900">Dues 2026</p>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
          75%
        </span>
      </div>
      <p className="mt-0.5 text-[10px] text-neutral-500">
        <span className="font-semibold text-neutral-900">$3,600</span> of $4,800
        collected
      </p>
      <div className="mt-2 h-1.5 w-full rounded-full bg-neutral-200/70">
        <div className="anim-progress h-1.5 rounded-full bg-emerald-500" />
      </div>
      <div className="mt-3 space-y-0.5">
        {members.map((m) => (
          <div
            key={m.name}
            className="flex items-center justify-between rounded-md px-2 py-1.5 transition-colors hover:bg-neutral-50"
          >
            <p className="text-[11px] text-neutral-700">
              {m.name} <span className="text-neutral-400">· {m.unit}</span>
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-neutral-400">$200</span>
              {m.paid ? <PaidPill /> : <DuePill />}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-1.5 text-[10px] text-neutral-400">
        One click per payment — the stragglers sort themselves to the top.
      </p>
    </div>
  );
}

function MeetingsPanel() {
  return (
    <div>
      <div className="space-y-1">
        {meetings.map((mtg) => (
          <div
            key={mtg.title}
            className="flex items-center justify-between rounded-md border border-neutral-200 px-3 py-2"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 flex-col items-center justify-center rounded-md bg-neutral-50 leading-none">
                <span className="text-[8px] text-neutral-400">
                  {mtg.date.split(" ")[0]}
                </span>
                <span className="mt-0.5 text-[11px] font-semibold text-neutral-900">
                  {mtg.date.split(" ")[1]}
                </span>
              </span>
              <p className="text-[11px] font-medium text-neutral-900">
                {mtg.title}
              </p>
            </div>
            <StatusPill label={mtg.status} tone={mtg.tone} />
          </div>
        ))}
      </div>
      <p className="mt-2 text-[10px] text-neutral-400">
        Notices, agendas and minutes — kept with every past meeting.
      </p>
    </div>
  );
}

function DocumentsPanel() {
  return (
    <div>
      <div className="space-y-0.5">
        {documents.map((d) => (
          <div
            key={d.name}
            className="flex items-center justify-between rounded-md px-2 py-1.5 transition-colors hover:bg-neutral-50"
          >
            <div className="flex items-center gap-2">
              <svg
                className="shrink-0 text-neutral-400"
                {...navIconProps}
                width={11}
                height={11}
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <p className="text-[11px] text-neutral-700">{d.name}</p>
            </div>
            <span className="text-[10px] text-neutral-400">{d.meta}</span>
          </div>
        ))}
      </div>
      <p className="mt-1.5 text-[10px] text-neutral-400">
        Bylaws, budgets and reports — searchable and ready when a lawyer asks.
      </p>
    </div>
  );
}

function MaintenancePanel() {
  return (
    <div>
      <div className="space-y-0.5">
        {requests.map((r) => (
          <div
            key={r.title}
            className="flex items-center justify-between rounded-md px-2 py-1.5 transition-colors hover:bg-neutral-50"
          >
            <div>
              <p className="text-[11px] font-medium text-neutral-900">
                {r.title}
              </p>
              <p className="text-[10px] text-neutral-400">{r.unit}</p>
            </div>
            <StatusPill label={r.status} tone={r.tone} />
          </div>
        ))}
      </div>
      <p className="mt-1.5 text-[10px] text-neutral-400">
        Resident requests in one queue — nothing lost in a group chat.
      </p>
    </div>
  );
}

const panelByLabel: Record<string, () => React.JSX.Element> = {
  Overview: OverviewPanel,
  Members: MembersPanel,
  Dues: DuesPanel,
  Meetings: MeetingsPanel,
  Documents: DocumentsPanel,
  Maintenance: MaintenancePanel,
};

export function AppPreview() {
  const [active, setActive] = useState("Overview");
  const [interacted, setInteracted] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Gently auto-cycle through the tabs until the visitor interacts.
  useEffect(() => {
    if (interacted || hovered) return;
    const id = setInterval(() => {
      setActive((cur) => {
        const i = navItems.findIndex((n) => n.label === cur);
        return navItems[(i + 1) % navItems.length].label;
      });
    }, 6000);
    return () => clearInterval(id);
  }, [interacted, hovered]);

  const select = (label: string) => {
    setInteracted(true);
    setActive(label);
  };

  const Panel = panelByLabel[active] ?? OverviewPanel;

  return (
    <div
      className="relative mx-auto mt-14 max-w-4xl"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Emerald glow backdrop */}
      <div
        aria-hidden
        className="absolute -inset-x-8 top-8 bottom-0 rounded-[2rem] bg-emerald-500/10 blur-3xl"
      />

      {/* Floating toast: payment */}
      <div className="absolute -top-5 right-4 z-10 sm:right-10">
        <div className="anim-toast flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs shadow-lg shadow-neutral-900/10">
          <span className="anim-pulse-dot h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span className="font-medium text-neutral-900">Payment received</span>
          <span className="text-neutral-400">· $200 · Emily Carter</span>
        </div>
      </div>

      {/* Floating toast: maintenance */}
      <div className="absolute -bottom-5 left-4 z-10 sm:left-10">
        <div
          className="anim-toast flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs shadow-lg shadow-neutral-900/10"
          style={{ animationDelay: "3.5s" }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          <span className="font-medium text-neutral-900">
            New maintenance request
          </span>
          <span className="text-neutral-400">· Leaky faucet · Hallway B</span>
        </div>
      </div>

      {/* Browser frame */}
      <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white text-left shadow-2xl shadow-neutral-900/10">
        {/* Browser chrome */}
        <div className="flex items-center border-b border-neutral-200 px-4 py-2.5">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-neutral-200" />
            <span className="h-2.5 w-2.5 rounded-full bg-neutral-200" />
            <span className="h-2.5 w-2.5 rounded-full bg-neutral-200" />
          </div>
          <div className="mx-auto flex items-center gap-1.5 rounded-md bg-neutral-100 px-3 py-1 text-[11px] text-neutral-500">
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            app.hoacove.com/dashboard
          </div>
          <div className="w-10" />
        </div>

        <div className="flex">
          {/* Sidebar (hidden on small screens) */}
          <aside className="hidden w-40 shrink-0 border-r border-neutral-200 bg-neutral-50/60 p-3 sm:block">
            <div className="flex items-center gap-1.5 px-2 pb-3 text-[11px] font-semibold text-neutral-900">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-neutral-900 text-[9px] font-bold text-white">
                H
              </span>
              HOAcove
            </div>
            <nav className="space-y-0.5">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => select(item.label)}
                  className={`flex w-full cursor-pointer items-center gap-2 rounded-md border px-2 py-1.5 text-left text-[11px] transition-colors ${
                    item.label === active
                      ? "border-neutral-200 bg-white font-medium text-neutral-900 shadow-sm"
                      : "border-transparent text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </nav>
            <p className="mt-3 px-2 text-[9px] leading-relaxed text-neutral-400">
              Live demo — click around
            </p>
          </aside>

          {/* Main panel */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-2.5">
              <p className="text-[11px] text-neutral-400">
                 <span className="mx-1 text-neutral-300">/</span>{" "}
                <span className="font-medium text-neutral-900">{active}</span>
              </p>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900 text-[9px] font-semibold text-white">
                AS
              </span>
            </div>

            {/* Mobile tab row */}
            <div className="flex gap-1 overflow-x-auto border-b border-neutral-200 px-3 py-2 sm:hidden">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => select(item.label)}
                  className={`shrink-0 cursor-pointer rounded-full px-2.5 py-1 text-[10px] transition-colors ${
                    item.label === active
                      ? "bg-neutral-900 text-white"
                      : "bg-neutral-100 text-neutral-500"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="p-4">
              <div key={active} className="panel-in">
                <Panel />
              </div>
            </div>
          </div>

          {/* Right column (large screens) */}
          <aside className="hidden w-52 shrink-0 border-l border-neutral-200 p-4 lg:block">
            <p className="text-[10px] font-medium text-neutral-500">
              Collection trend
            </p>
            <div className="mt-2 flex h-20 items-end gap-1.5">
              {chartBars.map((h, i) => (
                <div
                  key={i}
                  className={`anim-bar flex-1 rounded-sm ${
                    i >= 9 ? "bg-neutral-300" : "bg-emerald-500"
                  }`}
                  style={{
                    height: `${h}%`,
                    animationDelay: `${0.4 + i * 0.06}s`,
                  }}
                />
              ))}
            </div>
            <p className="mt-1 text-[10px] text-neutral-400">
              Last 9 months · dashed = forecast
            </p>

            <p className="mt-4 text-[10px] font-medium text-neutral-500">
              Recent activity
            </p>
            <ul className="mt-2 space-y-2">
              {activity.map((a) => (
                <li key={a.text} className="flex items-start gap-2">
                  <span
                    className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${a.dot}`}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-[11px] text-neutral-700">
                      {a.text}
                    </p>
                    <p className="text-[10px] text-neutral-400">{a.meta}</p>
                  </div>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </div>
  );
}
