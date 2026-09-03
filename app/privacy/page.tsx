import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "What HOAcove collects, what it never does with your data, and how to get it deleted. Short, plain-language, no dark patterns.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-heading text-4xl font-semibold tracking-tight text-neutral-900">
        Privacy
      </h1>
      <p className="mt-2 text-sm text-neutral-500">
        Plain language, deliberately short. Last updated September 2026.
      </p>

      <div className="mt-8 space-y-8">
        <section>
          <h2 className="font-heading text-lg font-semibold text-neutral-900">
            What we collect
          </h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-neutral-600">
            <li>
              <strong className="text-neutral-900">Account data</strong> — your
              name, email and password (hashed; we can't read it) when you
              create an account.
            </li>
            <li>
              <strong className="text-neutral-900">Association records</strong>
              — the member, dues, charge, budget, meeting, maintenance and
              document data your board enters.
            </li>
            <li>
              <strong className="text-neutral-900">Lead email</strong> — if you
              download the free dues template, we store your email to know
              who's interested. Nothing else.
            </li>
            <li>
              <strong className="text-neutral-900">Usage analytics</strong> —
              anonymous page-view counts via Vercel Analytics. No cookies for
              advertising, ever.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold text-neutral-900">
            What we never do
          </h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-neutral-600">
            <li>Sell, rent or share your data with advertisers or data brokers.</li>
            <li>Email your members anything — announcements are sent by your
              board, from your association, and replies go to your board.</li>
            <li>Train AI models on your association's records.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold text-neutral-900">
            Third parties we rely on
          </h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-neutral-600">
            <li>
              <strong className="text-neutral-900">Neon</strong> — hosts the
              database (your association records).
            </li>
            <li>
              <strong className="text-neutral-900">Vercel</strong> — hosts the
              application and serves the site.
            </li>
            <li>
              <strong className="text-neutral-900">Resend</strong> — delivers
              email on behalf of your board (announcements you choose to send).
            </li>
          </ul>
          <p className="mt-3 text-neutral-600">
            These providers process data only to run the service. Your
            association's records are not used for their own purposes.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold text-neutral-900">
            Deleting your data
          </h2>
          <p className="mt-3 text-neutral-600">
            Want everything gone — account, members, records, the lot? Email{" "}
            <a
              href="mailto:alexanderstorgaard809@gmail.com"
              className="font-medium text-neutral-900 underline"
            >
              alexanderstorgaard809@gmail.com
            </a>{" "}
            from the address on the account and it will be deleted, confirmed
            in writing.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold text-neutral-900">
            Contact
          </h2>
          <p className="mt-3 text-neutral-600">
            Questions about any of this:{" "}
            <a
              href="mailto:alexanderstorgaard809@gmail.com"
              className="font-medium text-neutral-900 underline"
            >
              alexanderstorgaard809@gmail.com
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
