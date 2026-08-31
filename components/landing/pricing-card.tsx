"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const options = [
  { label: "Up to 25 homes", price: 9 },
  { label: "Up to 50 homes", price: 15 },
  { label: "Up to 100 homes", price: 25 },
  { label: "Up to 200 homes", price: 39 },
  { label: "200+ homes", price: 79 },
];

const features = [
  "Member directory",
  "Dues tracking & collection",
  "Meeting notices & minutes",
  "Document archive",
  "Maintenance requests",
  "CSV member import",
  "Email support",
];

/* Count-up animation for the price when the selection changes */
function useAnimatedNumber(target: number) {
  const [value, setValue] = useState(target);
  const fromRef = useRef(target);

  useEffect(() => {
    const from = fromRef.current;
    if (from === target) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      fromRef.current = target;
      setValue(target);
      return;
    }

    const duration = 650;
    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      const current = Math.round(from + (target - from) * eased);
      fromRef.current = current;
      setValue(current);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return value;
}

function CheckIcon() {
  return (
    <svg
      className="mt-0.5 shrink-0 text-emerald-500"
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

export function PricingCard() {
  const [selected, setSelected] = useState(1);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const price = useAnimatedNumber(options[selected].price);

  // Close the dropdown on outside click or Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative mx-auto max-w-md">
      <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-emerald-500 px-3 py-0.5 text-xs font-medium text-white">
        Every feature included
      </span>

      <div className="rounded-2xl bg-neutral-950 p-8 text-white shadow-xl shadow-neutral-900/20">
        <p className="font-heading text-lg font-semibold">
          One plan for your association
        </p>
        <p className="mt-1 text-sm text-neutral-400">
          All features for every board — you only pick the size.
        </p>

        {/* Animated price */}
        <div className="mt-6 flex items-end justify-center gap-1.5">
          <span className="font-heading text-6xl font-semibold tracking-tight">
            ${price}
          </span>
          <span className="pb-2 text-sm text-neutral-400">/month</span>
        </div>

        {/* Homes dropdown */}
        <div ref={rootRef} className="relative mt-6">
          <p className="mb-1.5 text-xs text-neutral-400">
            Homes in your association
          </p>
          <button
            aria-haspopup="listbox"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm text-white transition-colors hover:bg-white/10"
          >
            {options[selected].label}
            <svg
              className={`h-4 w-4 shrink-0 text-neutral-400 transition-transform duration-200 ${
                open ? "rotate-180" : ""
              }`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {open && (
            <ul
              role="listbox"
              className="absolute z-20 mt-2 w-full overflow-hidden rounded-lg border border-neutral-200 bg-white py-1 shadow-xl"
            >
              {options.map((o, i) => (
                <li key={o.label}>
                  <button
                    role="option"
                    aria-selected={i === selected}
                    onClick={() => {
                      setSelected(i);
                      setOpen(false);
                    }}
                    className={`flex w-full cursor-pointer items-center justify-between px-4 py-2.5 text-left text-sm transition-colors ${
                      i === selected
                        ? "bg-neutral-100 font-medium text-neutral-900"
                        : "text-neutral-600 hover:bg-neutral-50"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {i === selected && <CheckIcon />}
                      {o.label}
                    </span>
                    <span className="font-medium text-neutral-900">
                      ${o.price}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Features — same for every size */}
        <ul className="mt-6 space-y-2 border-t border-white/10 pt-6">
          {features.map((f) => (
            <li
              key={f}
              className="flex items-start gap-2 text-sm text-neutral-300"
            >
              <CheckIcon />
              {f}
            </li>
          ))}
        </ul>

        <div className="mt-7">
          <Button variant="inverted" href="/signup" className="w-full">
            Get started
          </Button>
        </div>
        <p className="mt-3 text-center text-xs text-neutral-500">
          Free during early access · Cancel anytime
        </p>
      </div>
    </div>
  );
}
