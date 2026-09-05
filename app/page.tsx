import Landing from "@/components/landing";

const faqs = [
  {
    q: "Is HOAcove right for our association?",
    a: "HOAcove is built for self-managed homeowners' associations and volunteer boards. It brings everyday administration into one place: members, dues, meetings, documents, and maintenance requests.",
  },
  {
    q: "Does it collect payments from homeowners?",
    a: "HOAcove tracks payments manually. Your association receives dues using its existing payment method, then the treasurer marks payments as received in HOAcove. It shows what has been recorded and who still owes; it does not automatically process payments.",
  },
  {
    q: "What is included in the free plan?",
    a: "Associations with up to 25 homes can use all current features for free. There is no credit card requirement or trial countdown. Larger associations pay based on size, with plans starting at $9 per month.",
  },
  {
    q: "Can we import our existing member spreadsheet?",
    a: "Members can be added manually today. CSV import is on the roadmap. If you have an existing member list and want help getting started, contact the founder before moving your records.",
  },
  {
    q: "Do we need accounting experience?",
    a: "No accounting background is needed for everyday dues tracking. HOAcove helps your board keep track of its records; it is not a replacement for your accountant or professional tax and financial advice.",
  },
  {
    q: "Do we need to install an app?",
    a: "No. HOAcove runs in your browser on a laptop, tablet, or phone. There is no software to install.",
  },
  {
    q: "Who owns our association's data?",
    a: "Your association owns its data. HOAcove states that it does not sell or share it, and that you can export or delete your data. See the privacy policy for details.",
  },
];

const productJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "HOAcove",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "One workspace for your self-managed HOA. Organize members, track dues, and keep meetings and documents together. Free for up to 25 homes.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Free for up to 25 homes",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function Home() {
  return (
    <>
      <Landing />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </>
  );
}
