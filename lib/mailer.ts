import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const fromEmail =
  process.env.ANNOUNCE_FROM_EMAIL ?? "HOAcove <onboarding@resend.dev>";

export type SendResult = {
  sent: number;
  failed: number;
  error?: string;
};

export function buildAnnouncementHtml(
  body: string,
  associationName: string,
  contactEmail: string,
  subject: string
): string {
  // Escape HTML in the body, then honor line breaks
  const escaped = body
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const bodyHtml = escaped
    .split(/\n{2,}/)
    .map(
      (para) =>
        `<p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;color:#262626;">${para.replace(
          /\n/g,
          "<br />"
        )}</p>`
    )
    .join("");

  const contactLine = contactEmail.trim()
    ? `<p style="margin:4px 0;font-size:12px;color:#737373;">Questions? Contact: <a href="mailto:${contactEmail.trim()}" style="color:#737373;text-decoration:underline;">${contactEmail.trim()}</a></p>`
    : "";

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${subject.replace(/</g, "&lt;")}</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f5f5;padding:24px 12px;">
<tr>
<td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background-color:#ffffff;border:1px solid #e5e5e5;border-radius:8px;overflow:hidden;">

<!-- Header band -->
<tr>
<td style="background-color:#171717;padding:20px 28px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
<tr>
<td>
<table role="presentation" cellpadding="0" cellspacing="0" border="0">
<tr>
<td style="width:28px;height:28px;background-color:#ffffff;border-radius:6px;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;color:#171717;vertical-align:middle;">H</td>
<td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:600;color:#ffffff;padding-left:8px;">HOAcove</td>
</tr>
</table>
</td>
<td align="right" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:600;color:#ffffff;">${associationName.replace(/</g, "&lt;")}</td>
</tr>
</table>
</td>
</tr>

<!-- Subject line strip -->
<tr>
<td style="padding:20px 28px 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:600;color:#171717;">${subject.replace(/</g, "&lt;")}</td>
</tr>

<!-- Body -->
<tr>
<td style="padding:8px 28px 8px 28px;font-family:Arial,Helvetica,sans-serif;">
${bodyHtml}
</td>
</tr>

<!-- Footer -->
<tr>
<td style="padding:16px 28px 24px 28px;border-top:1px solid #f0f0f0;">
<p style="margin:0 0 4px 0;font-size:12px;font-weight:600;color:#737373;font-family:Arial,Helvetica,sans-serif;">${associationName.replace(/</g, "&lt;")}</p>
${contactLine}
<p style="margin:4px 0 0 0;font-size:12px;color:#a3a3a3;font-family:Arial,Helvetica,sans-serif;">You are receiving this because you are a member of this association. Sent via HOAcove.</p>
</td>
</tr>

</table>
</td>
</tr>
</table>
</body>
</html>`;
}

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

  const html = buildAnnouncementHtml(
    body,
    associationName,
    contactEmail,
    subject
  );

  const footer = [
    "",
    "",
    "—",
    `${associationName}`,
    contactEmail.trim() ? `Contact: ${contactEmail.trim()}` : "",
    "You are receiving this because you are a member of this association. Sent via HOAcove.",
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
        html,
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
