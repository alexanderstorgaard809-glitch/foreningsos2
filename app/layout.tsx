import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "@fontsource/cal-sans";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "HOAcove — All-in-one for homeowners' associations",
  description:
    "Dues, meetings, minutes and maintenance — in one place. Built for volunteer boards.",
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
