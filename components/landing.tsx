"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import Link from "next/link";
import { formatUsd } from "@/lib/format";
import styles from "@/app/page.module.css";

const TABS = ["dues", "meetings", "documents"] as const;
type TabId = (typeof TABS)[number];

const TAB_LABELS: Record<TabId, string> = {
  dues: "Dues",
  meetings: "Meetings",
  documents: "Documents",
};

const DEMO = {
  homes: 24,
  annualDues: 200,
  initialPaidHomes: 18,
};

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("dues");
  const [paymentRecorded, setPaymentRecorded] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  const navRef = useRef<HTMLElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Smooth scrolling + anchor offset, landing page only.
  useEffect(() => {
    const root = document.documentElement;
    root.style.scrollPaddingTop = "94px";
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root.style.scrollBehavior = "smooth";
    }
    return () => {
      root.style.scrollPaddingTop = "";
      root.style.scrollBehavior = "";
    };
  }, []);

  // Escape closes the mobile menu and returns focus to the button.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && menuOpen) {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  // Clicking outside the nav closes the mobile menu.
  useEffect(() => {
    if (!menuOpen) return;
    function onClick(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [menuOpen]);

  // Tidies focus when crossing the desktop breakpoint.
  useEffect(() => {
    const desktopMedia = window.matchMedia("(min-width: 801px)");
    function onChange() {
      setMenuOpen(false);
      if (
        !desktopMedia.matches &&
        navRef.current?.contains(document.activeElement)
      ) {
        menuButtonRef.current?.focus();
      }
    }
    desktopMedia.addEventListener("change", onChange);
    return () => desktopMedia.removeEventListener("change", onChange);
  }, []);

  const paidHomes = DEMO.initialPaidHomes + (paymentRecorded ? 1 : 0);
  const collected = paidHomes * DEMO.annualDues;
  const percentage = (paidHomes / DEMO.homes) * 100;

  function handleTabKeyDown(
    event: ReactKeyboardEvent<HTMLButtonElement>,
    index: number
  ) {
    let nextIndex: number;

    switch (event.key) {
      case "ArrowRight":
        nextIndex = (index + 1) % TABS.length;
        break;
      case "ArrowLeft":
        nextIndex = (index - 1 + TABS.length) % TABS.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = TABS.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    setActiveTab(TABS[nextIndex]);
    tabRefs.current[nextIndex]?.focus();
  }

  function recordPayment() {
    if (paymentRecorded) return;
    setPaymentRecorded(true);
    setAnnouncement(
      "Sample payment recorded. Total is now 3,800 dollars, with 19 of 24 homes paid. No real payment was processed."
    );
  }

  function resetDemo() {
    setPaymentRecorded(false);
    setActiveTab("dues");
    setAnnouncement(
      "Demo reset. Total is 3,600 dollars, with 18 of 24 homes paid."
    );
  }

  return (
    <div className={styles.page}>
      {/* Shared vector logo */}
      <svg
        width="0"
        height="0"
        aria-hidden="true"
        style={{ position: "absolute", overflow: "hidden" }}
      >
        <defs>
          <symbol id="logo-mark" viewBox="0 0 36 36">
            <rect width="36" height="36" rx="10" fill="#142b45" />
            <path
              d="M8 18 18 9l10 9M11 16v11h14V16"
              fill="none"
              stroke="#dcf590"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M17 27v-8h5v8"
              fill="none"
              stroke="#dcf590"
              strokeWidth="2.3"
            />
          </symbol>
        </defs>
      </svg>

      <a className={styles["skip-link"]} href="#main">
        Skip to content
      </a>

      <header className={styles.header}>
        <nav
          ref={navRef}
          className={`${styles.container} ${styles.nav}`}
          aria-label="Main navigation"
        >
          <Link className={styles.brand} href="/" aria-label="HOAcove home">
            <svg aria-hidden="true">
              <use href="#logo-mark" />
            </svg>
            HOAcove
          </Link>

          <button
            ref={menuButtonRef}
            className={styles["menu-button"]}
            type="button"
            aria-expanded={menuOpen}
            aria-controls="nav-links"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? "Close" : "Menu"}
          </button>

          <div
            id="nav-links"
            className={`${styles["nav-links"]}${menuOpen ? ` ${styles["is-open"]}` : ""}`}
            onClick={(event) => {
              if ((event.target as Element).closest("a")) setMenuOpen(false);
            }}
          >
            <a href="#features">The workspace</a>
            <a href="#getting-started">Getting started</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQs</a>
            <Link className={styles.login} href="/login">
              Log in
            </Link>
            <Link className={styles.button} href="/signup">
              Start free <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </nav>
      </header>

      <main id="main">
        {/* Hero */}
        <section
          className={styles["hero-section"]}
          aria-labelledby="hero-title"
        >
          <div className={`${styles.container} ${styles.hero}`}>
            <div className={styles["hero-copy"]}>
              <div className={styles.eyebrow}>
                For the neighbors running the neighborhood
              </div>

              <h1 id="hero-title">
                A better place<br />
                to run your<br />
                <span>neighborhood.</span>
              </h1>

              <p>
                One workspace for your HOA’s members, dues, meetings, and
                documents. Less piecing things together. More knowing
                where everything stands.
              </p>

              <div className={styles["hero-actions"]}>
                <Link
                  className={`${styles.button} ${styles["button-lime"]}`}
                  href="/signup"
                >
                  Start your free workspace <span aria-hidden="true">↗</span>
                </Link>
                <a className={styles["text-link"]} href="#product-demo">
                  Explore the demo <span aria-hidden="true">↓</span>
                </a>
              </div>

              <div className={styles["hero-note"]}>
                <span aria-hidden="true">✓</span>
                Free for up to 25 homes
                <span aria-hidden="true">·</span>
                No credit card
              </div>
            </div>

            <div className={styles["hero-product"]} id="product-demo">
              <div className={styles["product-shell"]}>
                <div className={styles["window-bar"]}>
                  <div className={styles["window-dots"]} aria-hidden="true">
                    <i /><i /><i />
                  </div>
                  <span>Your neighborhood workspace</span>
                  <span className={styles["window-label"]}>Concept demo</span>
                </div>

                <div className={styles["neighborhood-map"]}>
                  <div className={styles["map-title"]}>
                    Many homes. One place.
                    <span>A more connected board.</span>
                  </div>

                  {/* Animation runs once and stops within five seconds. */}
                  <svg
                    viewBox="0 0 520 235"
                    role="img"
                    aria-labelledby="map-title map-desc"
                  >
                    <title id="map-title">
                      A neighborhood connected by HOAcove
                    </title>
                    <desc id="map-desc">
                      Four houses connect to a central workspace.
                      Dues, documents, and meetings are organized around it.
                    </desc>

                    <defs>
                      <pattern
                        id="map-grid"
                        width="24"
                        height="24"
                        patternUnits="userSpaceOnUse"
                      >
                        <path
                          d="M24 0H0V24"
                          fill="none"
                          stroke="#dce4d4"
                          strokeWidth=".7"
                        />
                      </pattern>

                      <filter
                        id="map-shadow"
                        x="-30%"
                        y="-30%"
                        width="160%"
                        height="180%"
                      >
                        <feDropShadow
                          dx="0"
                          dy="4"
                          stdDeviation="4"
                          floodColor="#2c4524"
                          floodOpacity=".1"
                        />
                      </filter>

                      <symbol id="house" viewBox="0 0 90 90">
                        <ellipse
                          cx="45"
                          cy="77"
                          rx="35"
                          ry="8"
                          fill="#d6dfcb"
                        />
                        <path
                          d="M19 39 45 20l26 19v36H19Z"
                          fill="#fffef7"
                          stroke="#b7c1ae"
                          strokeWidth="1"
                        />
                        <path
                          d="m12 42 33-25 33 25"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path d="M60 27V17h7v16" fill="currentColor" />
                        <rect
                          x="29"
                          y="45"
                          width="12"
                          height="12"
                          rx="1"
                          fill="#d9e5ef"
                        />
                        <path
                          d="M35 45v12M29 51h12"
                          stroke="white"
                          strokeWidth="1.5"
                        />
                        <rect
                          x="50"
                          y="52"
                          width="12"
                          height="23"
                          rx="2"
                          fill="#b8c7a5"
                        />
                        <circle cx="58" cy="63" r="1" fill="#fff" />
                        <path d="M10 73V61" stroke="#819469" strokeWidth="2" />
                        <circle cx="10" cy="58" r="7" fill="#b3c794" />
                      </symbol>
                    </defs>

                    <rect width="520" height="235" fill="url(#map-grid)" />
                    <path
                      d="M40 153Q260 268 480 139"
                      stroke="#e0e6d7"
                      strokeWidth="25"
                      fill="none"
                    />

                    <path
                      className={styles["map-route"]}
                      d="M128 98Q190 92 260 128"
                    />
                    <path
                      className={styles["map-route"]}
                      d="M394 78Q326 80 260 128"
                    />
                    <path
                      className={styles["map-route"]}
                      d="M151 181Q203 199 260 128"
                    />
                    <path
                      className={styles["map-route"]}
                      d="M388 178Q321 202 260 128"
                    />

                    <g className={styles["map-house"]}>
                      <use
                        href="#house"
                        x="79"
                        y="38"
                        width="91"
                        height="91"
                        color="#7c91a4"
                      />
                    </g>
                    <g className={`${styles["map-house"]} ${styles.two}`}>
                      <use
                        href="#house"
                        x="350"
                        y="20"
                        width="91"
                        height="91"
                        color="#b58c6e"
                      />
                    </g>
                    <g className={`${styles["map-house"]} ${styles.three}`}>
                      <use
                        href="#house"
                        x="103"
                        y="120"
                        width="91"
                        height="91"
                        color="#b58c6e"
                      />
                    </g>
                    <g className={`${styles["map-house"]} ${styles.four}`}>
                      <use
                        href="#house"
                        x="343"
                        y="116"
                        width="91"
                        height="91"
                        color="#7a9270"
                      />
                    </g>

                    <g
                      className={styles["map-hub"]}
                      filter="url(#map-shadow)"
                    >
                      <circle
                        cx="260"
                        cy="126"
                        r="43"
                        fill="#dbe8c9"
                        stroke="#c1d1ac"
                        strokeWidth="1"
                      />
                      <rect
                        x="230"
                        y="96"
                        width="60"
                        height="60"
                        rx="18"
                        fill="#142b45"
                      />
                      <path
                        d="m242 124 18-16 18 16M247 120v24h26v-24"
                        fill="none"
                        stroke="#dcf590"
                        strokeWidth="2.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M257 144v-13h7v13"
                        fill="none"
                        stroke="#dcf590"
                        strokeWidth="2.7"
                      />
                    </g>

                    <g
                      fontFamily="Segoe UI, Arial, sans-serif"
                      fontSize="9"
                      fill="#506248"
                      textAnchor="middle"
                    >
                      <rect
                        x="222"
                        y="42"
                        width="76"
                        height="24"
                        rx="12"
                        fill="#fffef7"
                        stroke="#d3ddc8"
                      />
                      <text x="260" y="57">Documents</text>

                      <rect
                        x="24"
                        y="153"
                        width="56"
                        height="24"
                        rx="12"
                        fill="#fffef7"
                        stroke="#d3ddc8"
                      />
                      <text x="52" y="168">Dues</text>

                      <rect
                        x="425"
                        y="112"
                        width="72"
                        height="24"
                        rx="12"
                        fill="#fffef7"
                        stroke="#d3ddc8"
                      />
                      <text x="461" y="127">Meetings</text>
                    </g>

                    <g fill="#afc58e">
                      <circle cx="206" cy="211" r="4" />
                      <circle cx="309" cy="193" r="6" />
                      <circle cx="463" cy="191" r="5" />
                      <circle cx="57" cy="111" r="5" />
                    </g>
                  </svg>
                </div>
                {/* Sample dashboard head */}
                <div className={styles["dashboard-head"]}>
                  <div>
                    <strong>Maple Grove HOA</strong>
                    <small>24 homes · Sample data</small>
                  </div>
                  <div className={styles.avatar} aria-hidden="true">
                    MG
                  </div>
                </div>

                <div
                  className={styles.tabs}
                  role="tablist"
                  aria-label="Sample workspace areas"
                >
                  {TABS.map((tabId, index) => (
                    <button
                      key={tabId}
                      ref={(node) => {
                        tabRefs.current[index] = node;
                      }}
                      id={`tab-${tabId}`}
                      className={styles.tab}
                      type="button"
                      role="tab"
                      aria-selected={activeTab === tabId}
                      aria-controls={`panel-${tabId}`}
                      tabIndex={activeTab === tabId ? 0 : -1}
                      onClick={() => setActiveTab(tabId)}
                      onKeyDown={(event) => handleTabKeyDown(event, index)}
                    >
                      {TAB_LABELS[tabId]}
                    </button>
                  ))}
                </div>

                {/* Dues panel */}
                <div
                  id="panel-dues"
                  role="tabpanel"
                  aria-labelledby="tab-dues"
                  className={styles["demo-panel"]}
                  hidden={activeTab !== "dues"}
                >
                  <div className={styles["demo-metric"]}>
                    <p>
                      Dues collected
                      <strong>{formatUsd(collected)}</strong>
                    </p>
                    <small>
                      of {formatUsd(DEMO.homes * DEMO.annualDues)} expected
                    </small>
                  </div>

                  <div
                    className={styles.progress}
                    role="progressbar"
                    aria-label="Homes paid"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={percentage.toFixed(1)}
                    aria-valuetext={`${paidHomes} of ${DEMO.homes} homes paid; ${formatUsd(collected)} recorded`}
                  >
                    <div
                      className={styles["progress-fill"]}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className={styles["demo-row"]}>
                    <div className={styles["row-avatar"]}>AL</div>
                    <div className={styles["row-name"]}>Alex Lee</div>
                    <span
                      className={`${styles.status} ${styles["status-neutral"]}`}
                    >
                      Unpaid
                    </span>
                    <button
                      className={styles["record-button"]}
                      type="button"
                      disabled={paymentRecorded}
                      onClick={recordPayment}
                      aria-label={
                        paymentRecorded
                          ? "Sample payment recorded for Alex Lee"
                          : "Demo: record a 200 dollar payment for Alex Lee"
                      }
                    >
                      {paymentRecorded ? "✓ Recorded" : "Mark $200 paid"}
                    </button>
                  </div>

                  <div className={styles["demo-row"]}>
                    <div className={styles["row-avatar"]}>PP</div>
                    <div className={styles["row-name"]}>Priya Patel</div>
                    <span className={styles.status}>Paid</span>
                  </div>

                  <div className={styles["demo-row"]}>
                    <div className={styles["row-avatar"]}>SO</div>
                    <div className={styles["row-name"]}>Sam Ortiz</div>
                    <span className={styles.status}>Paid</span>
                  </div>
                </div>

                {/* Meetings panel */}
                <div
                  id="panel-meetings"
                  role="tabpanel"
                  aria-labelledby="tab-meetings"
                  className={styles["demo-panel"]}
                  hidden={activeTab !== "meetings"}
                >
                  <div className={styles["meeting-card"]}>
                    <div className={styles["date-tile"]}>
                      <small>OCT</small>
                      <strong>15</strong>
                    </div>
                    <div>
                      <h3>Fall community meeting</h3>
                      <p>7:00 PM · Clubhouse</p>
                    </div>
                  </div>

                  <div className={styles["demo-row"]}>
                    <div className={styles["row-avatar"]}>01</div>
                    <div className={styles["row-name"]}>
                      2027 budget preview
                    </div>
                    <span className={styles.status}>Ready</span>
                  </div>

                  <div className={styles["demo-row"]}>
                    <div className={styles["row-avatar"]}>02</div>
                    <div className={styles["row-name"]}>
                      Playground repair quotes
                    </div>
                    <span className={styles.status}>Ready</span>
                  </div>

                  <div className={styles["demo-row"]}>
                    <div className={styles["row-avatar"]}>03</div>
                    <div className={styles["row-name"]}>Open board seat</div>
                    <span
                      className={`${styles.status} ${styles["status-neutral"]}`}
                    >
                      Discuss
                    </span>
                  </div>
                </div>

                {/* Documents panel */}
                <div
                  id="panel-documents"
                  role="tabpanel"
                  aria-labelledby="tab-documents"
                  className={styles["demo-panel"]}
                  hidden={activeTab !== "documents"}
                >
                  <div className={styles["demo-metric"]}>
                    <p>
                      Archived documents
                      <strong style={{ fontSize: "1.35rem" }}>
                        12 documents
                      </strong>
                    </p>
                    <small>Bylaws · Budgets · Minutes</small>
                  </div>

                  <div className={styles["demo-row"]}>
                    <div className={styles["row-avatar"]}>PDF</div>
                    <div className={styles["row-name"]}>Community bylaws</div>
                    <span className={styles.status}>Current</span>
                  </div>

                  <div className={styles["demo-row"]}>
                    <div className={styles["row-avatar"]}>PDF</div>
                    <div className={styles["row-name"]}>2026 annual budget</div>
                    <span className={styles.status}>Approved</span>
                  </div>

                  <div className={styles["demo-row"]}>
                    <div className={styles["row-avatar"]}>PDF</div>
                    <div className={styles["row-name"]}>
                      Spring meeting minutes
                    </div>
                    <span className={styles.status}>New</span>
                  </div>
                </div>

                <div className={styles["demo-footer"]}>
                  <span>Sample data · Nothing is saved</span>
                  <button
                    className={styles["reset-button"]}
                    type="button"
                    onClick={resetDemo}
                  >
                    Reset demo
                  </button>
                </div>
              </div>

              <p className={styles["demo-caption"]}>
                <span aria-hidden="true">↳</span>
                Try the tabs. Record a sample payment.
              </p>

              <div
                className={styles["sr-only"]}
                role="status"
                aria-live="polite"
                aria-atomic="true"
              >
                {announcement}
              </div>

              <noscript>
                <p className={styles["demo-caption"]}>
                  Enable JavaScript to try the interactive preview.
                </p>
              </noscript>
            </div>
          </div>

          <div className={`${styles.container} ${styles["hero-bottom"]}`}>
            <strong>
              Built for volunteer boards. Not enterprise bureaucracy.
            </strong>
            <div className={styles["hero-bottom-items"]}>
              <span>Self-managed HOAs</span>
              <span>Browser-based</span>
              <span>Early access</span>
            </div>
          </div>
        </section>

        {/* Positioning */}
        <section
          className={`${styles.container} ${styles.section} ${styles.intro}`}
          aria-labelledby="intro-title"
        >
          <div className={styles["intro-copy"]}>
            <div className={styles.eyebrow}>
              A familiar problem. A simpler answer.
            </div>
            <h2 id="intro-title">
              Your board shouldn’t run on “I think it’s in an email.”
            </h2>
            <p>
              Spreadsheets work. Until there are three versions, a new
              treasurer, and a meeting tomorrow. Give the everyday work
              one reliable home.
            </p>
          </div>

          <div
            className={styles.comparison}
            role="table"
            aria-label="Typical board administration compared with HOAcove"
          >
            <div className={styles["comparison-head"]} role="row">
              <span role="columnheader">The scattered way</span>
              <span role="columnheader">The HOAcove way</span>
            </div>

            <div className={styles["comparison-row"]} role="row">
              <div role="cell">“Who still owes dues?”</div>
              <div role="cell">A clear paid / unpaid view</div>
            </div>
            <div className={styles["comparison-row"]} role="row">
              <div role="cell">Contacts in someone’s spreadsheet</div>
              <div role="cell">One member directory</div>
            </div>
            <div className={styles["comparison-row"]} role="row">
              <div role="cell">Minutes buried in an inbox</div>
              <div role="cell">Meeting records in one place</div>
            </div>
            <div className={styles["comparison-row"]} role="row">
              <div role="cell">“Who has the latest bylaws?”</div>
              <div role="cell">An organized document archive</div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section
          className={`${styles.container} ${styles.section} ${styles["features-section"]}`}
          id="features"
          aria-labelledby="features-title"
        >
          <div className={styles["section-head"]}>
            <div>
              <div className={styles.eyebrow}>
                Meet your new board workspace
              </div>
              <h2 id="features-title">
                The essentials.<br />Finally, together.
              </h2>
            </div>
            <p>
              The things your board actually does, organized around
              the people doing them.
            </p>
          </div>

          <div className={styles["features-grid"]}>
            <article className={`${styles.feature} ${styles["feature-main"]}`}>
              <div>
                <span className={styles["feature-number"]}>01 / DUES</span>
                <h3>Know where the money stands.</h3>
                <p>
                  Set annual dues and record payments as they arrive.
                  See what’s collected and who still owes without
                  rebuilding a spreadsheet.
                </p>
              </div>

              <div
                className={styles.ledger}
                aria-label="Example dues summary: 3,600 dollars recorded, 18 of 24 homes paid"
              >
                <div className={styles["ledger-heading"]}>
                  <span>Annual dues overview</span>
                  <span aria-hidden="true">↗</span>
                </div>
                <strong>$3,600</strong>
                <div className={styles.progress} aria-hidden="true">
                  <div className={styles["progress-fill"]} />
                </div>
                <p>18 of 24 homes paid · Sample data</p>
              </div>
            </article>

            <article className={styles.feature}>
              <span className={styles["feature-number"]}>02 / MEMBERS</span>
              <h3>Every home has a place.</h3>
              <p>
                Keep owners, homes, and contact details in one searchable
                directory.
              </p>

              <div className={styles["feature-art"]} aria-hidden="true">
                <div className={styles["member-stack"]}>
                  <span>EC</span>
                  <span>JM</span>
                  <span>AL</span>
                  <span>+21</span>
                  <small>One neighborhood</small>
                </div>
              </div>
            </article>

            <article className={`${styles.feature} ${styles["feature-blue"]}`}>
              <span className={styles["feature-number"]}>03 / MEETINGS</span>
              <h3>Pick up where you left off.</h3>
              <p>
                Keep notices, agendas, and minutes together.
                Give the next board a record—not a guessing game.
              </p>

              <div
                className={styles["file-chip"]}
                style={{ marginTop: 25 }}
                aria-hidden="true"
              >
                <span>Annual meeting minutes</span>
                <span>PDF ↗</span>
              </div>
            </article>

            <article className={styles.feature}>
              <span className={styles["feature-number"]}>04 / DOCUMENTS</span>
              <h3>Less searching. More finding.</h3>
              <p>
                A central archive for bylaws, budgets, and reports.
                Not another folder only one person knows about.
              </p>

              <div
                className={styles["file-chip"]}
                style={{ marginTop: 25 }}
                aria-hidden="true"
              >
                <span>Community bylaws</span>
                <span>PDF ↗</span>
              </div>
            </article>

            <article className={`${styles.feature} ${styles["feature-dark"]}`}>
              <span className={styles["feature-number"]}>05 / MAINTENANCE</span>
              <h3>Keep the small things moving.</h3>
              <p>
                Bring repair requests into one queue, instead of
                following a trail of messages.
              </p>

              <div className={styles["request-pill"]}>
                One place for open requests
              </div>
            </article>
          </div>
        </section>

        {/* Getting started */}
        <section
          className={`${styles.section} ${styles["start-section"]}`}
          id="getting-started"
          aria-labelledby="start-title"
        >
          <div className={styles.container}>
            <div className={styles["start-head"]}>
              <div className={styles.eyebrow}>Start with what you have</div>
              <h2 id="start-title">
                A fresh start.<br />Not a whole new job.
              </h2>
              <p>
                You don’t need to organize everything at once.
                Start with your members and dues. Build from there.
              </p>
            </div>

            <ol className={styles.steps}>
              <li>
                <h3>Bring your members together.</h3>
                <p>
                  Add your association’s homes and contact details.
                  Give your board one reliable starting point.
                </p>
              </li>
              <li>
                <h3>Set the annual amount.</h3>
                <p>
                  Enter dues per member and see what your association
                  expects to collect.
                </p>
              </li>
              <li>
                <h3>Make it part of your routine.</h3>
                <p>
                  Record payments, store documents, and keep meeting
                  records up to date as your board works.
                </p>
              </li>
            </ol>
          </div>
        </section>

        {/* Pricing */}
        <section
          className={`${styles.container} ${styles.section} ${styles["pricing-layout"]}`}
          id="pricing"
          aria-labelledby="pricing-title"
        >
          <div className={styles["pricing-copy"]}>
            <div className={styles.eyebrow}>Small board. Sensible price.</div>
            <h2 id="pricing-title">
              Your neighborhood has enough expenses.
            </h2>
            <p>
              HOAcove is free for associations with up to 25 homes.
              All current features included. No trial clock and no
              credit card to get started.
            </p>

            <div className={styles["help-note"]}>
              <span className={styles.avatar} aria-hidden="true">
                AS
              </span>
              <div>
                <p>Want a hand setting up your board?</p>
                <a href="mailto:alexanderstorgaard809@gmail.com?subject=Help%20setting%20up%20HOAcove">
                  Email Alexander, the founder <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>
          </div>

          <div className={styles["pricing-card"]}>
            <div className={styles["plan-banner"]}>
              For the boards doing it themselves.
            </div>

            <div className={styles["plan-body"]}>
              <div className={styles["plan-top"]}>
                <h3>Your HOA workspace</h3>
                <span>Up to 25 homes</span>
              </div>

              <div className={styles.price}>
                <strong>$0</strong>
                <span>/ month</span>
              </div>
              <p className={styles["plan-description"]}>
                Free, not a free trial.
              </p>

              <ul className={styles["plan-list"]}>
                <li>Member directory</li>
                <li>Manual dues tracking</li>
                <li>Meeting notices, agendas, and minutes</li>
                <li>Document archive</li>
                <li>Maintenance requests</li>
                <li>Email support</li>
              </ul>

              <Link className={styles.button} href="/signup">
                Create your free workspace <span aria-hidden="true">↗</span>
              </Link>
              <p className={styles["plan-note"]}>No credit card required.</p>
            </div>

            <div className={styles["larger-plan"]}>
              More than 25 homes? Plans start at $9/month.{" "}
              <a href="mailto:alexanderstorgaard809@gmail.com?subject=Pricing%20for%20a%20larger%20HOA">
                Ask about pricing ↗
              </a>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section
          className={`${styles.container} ${styles.faq}`}
          id="faq"
          aria-labelledby="faq-title"
        >
          <div className={styles["faq-intro"]}>
            <div className={styles.eyebrow}>Before you move in</div>
            <h2 id="faq-title">
              Good questions.<br />Straight answers.
            </h2>
            <p>
              Need something more specific?{" "}
              <a href="mailto:alexanderstorgaard809@gmail.com">Just ask.</a>
            </p>
          </div>

          <div className={styles["faq-list"]}>
            <details>
              <summary>Is HOAcove right for our association?</summary>
              <p>
                HOAcove is built for self-managed homeowners’ associations
                and volunteer boards. It brings everyday administration
                into one place: members, dues, meetings, documents, and
                maintenance requests.
              </p>
            </details>

            <details>
              <summary>Does it collect payments from homeowners?</summary>
              <p>
                HOAcove tracks payments manually. Your association receives
                dues using its existing payment method, then the treasurer
                marks payments as received in HOAcove. It shows what has
                been recorded and who still owes; it does not automatically
                process payments.
              </p>
            </details>

            <details>
              <summary>What is included in the free plan?</summary>
              <p>
                Associations with up to 25 homes can use all current features
                for free. There is no credit card requirement or trial
                countdown. Larger associations pay based on size, with
                plans starting at $9 per month.
              </p>
            </details>

            <details>
              <summary>Can we import our existing member spreadsheet?</summary>
              <p>
                Members can be added manually today. CSV import is on
                the roadmap. If you have an existing member list and want
                help getting started, contact the founder before moving
                your records.
              </p>
            </details>

            <details>
              <summary>Do we need accounting experience?</summary>
              <p>
                No accounting background is needed for everyday dues
                tracking. HOAcove helps your board keep track of its
                records; it is not a replacement for your accountant or
                professional tax and financial advice.
              </p>
            </details>

            <details>
              <summary>Do we need to install an app?</summary>
              <p>
                No. HOAcove runs in your browser on a laptop, tablet, or
                phone. There is no software to install.
              </p>
            </details>

            <details>
              <summary>Who owns our association’s data?</summary>
              <p>
                Your association owns its data. HOAcove states that it
                does not sell or share it, and that you can export or
                delete your data. See the{" "}
                <Link href="/privacy">privacy policy</Link> for details.
              </p>
            </details>
          </div>
        </section>

        {/* Closing CTA */}
        <section
          className={`${styles.container} ${styles.closing}`}
          aria-labelledby="closing-title"
        >
          <div>
            <div className={styles.eyebrow}>More neighborhood. Less admin.</div>
            <h2 id="closing-title">
              You stepped up for your community.<br />
              We’ll help with the paperwork.
            </h2>
            <p>
              Give your next board meeting a more organized starting point.
            </p>
          </div>

          <div className={styles["closing-action"]}>
            <Link
              className={`${styles.button} ${styles["button-lime"]}`}
              href="/signup"
            >
              Get started free <span aria-hidden="true">↗</span>
            </Link>
            <small>Up to 25 homes. No credit card.</small>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={`${styles.container} ${styles.footer}`}>
        <div className={styles["footer-top"]}>
          <div>
            <Link className={styles.brand} href="/" aria-label="HOAcove home">
              <svg aria-hidden="true">
                <use href="#logo-mark" />
              </svg>
              HOAcove
            </Link>
            <p>A better place to run your neighborhood.</p>
          </div>

          <nav className={styles["footer-links"]} aria-label="Footer navigation">
            <Link href="/about">About</Link>
            <Link href="/template">Free dues template</Link>
            <Link href="/privacy">Privacy</Link>
            <a href="mailto:alexanderstorgaard809@gmail.com">Contact</a>
          </nav>
        </div>

        <div className={styles["footer-bottom"]}>
          <span>© {new Date().getFullYear()} HOAcove.</span>
          <span>Made for the people who care for their communities.</span>
        </div>
      </footer>
    </div>
  );
}
