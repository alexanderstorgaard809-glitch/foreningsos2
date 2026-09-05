import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "@fontsource/cal-sans";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL("https://hoacove.com"),
  title: {
    default: "HOAcove — A better place to run your neighborhood.",
    template: "%s — HOAcove",
  },
  description:
    "One workspace for your self-managed HOA. Organize members, track dues, and keep meetings and documents together. Free for up to 25 homes.",
  openGraph: {
    type: "website",
    url: "https://hoacove.com",
    siteName: "HOAcove",
    title: "HOAcove — A better place to run your neighborhood.",
    description:
      "One workspace for your self-managed HOA. Organize members, track dues, and keep meetings and documents together. Free for up to 25 homes.",
  },
  twitter: {
    card: "summary_large_image",
    title: "HOAcove — A better place to run your neighborhood.",
    description:
      "One workspace for your self-managed HOA. Organize members, track dues, and keep meetings and documents together. Free for up to 25 homes.",
  },
  robots: { index: true, follow: true },
  verification: {
    google: "yaJuYUzuFJ4BF0AC6TFETiYWvRNzvLhsFP9_bRre9M8",
  },
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
