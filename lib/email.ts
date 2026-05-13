/**
 * Transactional email via Resend HTTP API.
 * Set RESEND_API_KEY and optionally RESEND_FROM (e.g. PartyFinder <onboarding@resend.dev>).
 */

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export async function sendTransactionalEmail(input: SendEmailInput): Promise<{ ok: true } | { ok: false; reason: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, reason: "RESEND_API_KEY not set" };
  }
  const from = process.env.RESEND_FROM ?? "PartyFinder <onboarding@resend.dev>";
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject: input.subject,
        html: input.html,
        text: input.text ?? stripHtml(input.html),
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      return { ok: false, reason: body || res.statusText };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : String(e) };
  }
}

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
