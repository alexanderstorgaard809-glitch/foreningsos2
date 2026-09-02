import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const fromEmail =
  process.env.ANNOUNCE_FROM_EMAIL ?? "HOAcove <onboarding@resend.dev>";

export type SendResult = {
  sent: number;
  failed: number;
  error?: string;
};

export async function sendAnnouncementEmail(
  recipients: { email: string; name: string }[],
  subject: string,
  body: string,
  associationName: string,
  contactEmail: string
): Promise<SendResult> {
  if (!apiKey) {
    return {
      sent: 0,
      failed: recipients.length,
      error: "Email sending is not configured (missing API key)",
    };
  }

  const resend = new Resend(apiKey);

  const footer = [
    "",
    "",
    "—",
    `${associationName}`,
    contactEmail.trim() ? `Contact: ${contactEmail.trim()}` : "",
    "You are receiving this because you are a member of this association.",
  ]
    .filter(Boolean)
    .join("\n");

  const failed: string[] = [];
  let sent = 0;

  // Resend allows up to 100 recipients per request — batch to be safe
  const batchSize = 50;
  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);
    try {
      const replyTo = contactEmail.trim();
      const result = await resend.emails.send({
        from: fromEmail,
        ...(replyTo ? { replyTo } : {}),
        to: batch.map((r) => r.email),
        subject,
        text: `${body}${footer}`,
      });
      if (result.error) {
        failed.push(...batch.map((r) => r.email));
      } else {
        sent += batch.length;
      }
    } catch {
      failed.push(...batch.map((r) => r.email));
    }
  }

  return {
    sent,
    failed: failed.length,
    error: failed.length > 0 ? `Failed for: ${failed.join(", ")}` : undefined,
  };
}

export function isEmailConfigured(): boolean {
  return Boolean(apiKey);
}
