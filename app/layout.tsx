import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "@fontsource/cal-sans";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL("https://hoacove.com"),
  title: {
    default: "HOAcove — Simple HOA management for self-managed boards",
    template: "%s — HOAcove",
  },
  description:
    "Dues tracking with per-unit ledgers, budget planning, meeting notices and a document archive — built for volunteer-run homeowners associations. Free for small boards.",
  openGraph: {
    type: "website",
    url: "https://hoacove.com",
    siteName: "HOAcove",
    title: "HOAcove — Simple HOA management for self-managed boards",
    description:
      "Dues, ledgers, budgets, meetings and documents in one place. Built for self-managed HOAs. Free for small boards.",
  },
  twitter: {
    card: "summary_large_image",
    title: "HOAcove — Simple HOA management for self-managed boards",
    description:
      "Dues, ledgers, budgets, meetings and documents in one place. Built for self-managed HOAs. Free for small boards.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} bg-white text-neutral-900 antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
