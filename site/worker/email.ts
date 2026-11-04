import type { Env } from "./env.ts";
import type { LeadRow } from "./db.ts";

/**
 * The owner's lead notification, via Resend (PLAN §2).
 *
 * Plain text on purpose: it reads the same in every mail client and
 * there is nothing in it to escape wrongly. Reply-To is the lead, so
 * replying to the notification answers the person who asked.
 */
export type SendOutcome = { ok: true } | { ok: false; error: string; spendsAttempt: boolean };

export function emailConfigured(env: Env): boolean {
  return Boolean(env.RESEND_API_KEY && env.LEAD_NOTIFY_TO && env.LEAD_NOTIFY_FROM);
}

export function leadEmail(row: LeadRow): { subject: string; text: string } {
  const preview = row.site_env === "preview" ? "[PREVIEW] " : "";
  const lines = [
    `New project inquiry from ${row.name} (${row.business}).`,
    "",
    `Trade:     ${row.trade}`,
    `Phone:     ${row.phone}`,
    `Email:     ${row.email}`,
    `Website:   ${row.website ?? "none"}`,
    `Services:  ${row.services.join(", ")}`,
    `Timeline:  ${row.timeline}`,
    ...(row.budget ? [`Budget:    ${row.budget}`] : []),
    ...(row.smsConsent !== null ? [`SMS OK:    ${row.smsConsent ? "yes" : "no"}`] : []),
    "",
    "Message:",
    row.message,
    "",
    `Received ${row.received_at} · lead ${row.id}`,
    ...(row.turnstile === "unconfigured"
      ? ["(Turnstile not configured: spam check skipped.)"]
      : []),
  ];
  return {
    subject: `${preview}New inquiry: ${row.business} (${row.trade})`,
    text: lines.join("\n"),
  };
}

export async function sendLeadEmail(
  env: Env,
  row: LeadRow,
  fetcher: typeof fetch = fetch
): Promise<SendOutcome> {
  const { subject, text } = leadEmail(row);
  try {
    const res = await fetcher("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
        // Resend de-duplicates on this, so a retry after a timeout that
        // actually went through doesn't send twice.
        "Idempotency-Key": `lead-${row.id}`,
      },
      body: JSON.stringify({
        from: env.LEAD_NOTIFY_FROM,
        to: [env.LEAD_NOTIFY_TO],
        reply_to: row.email,
        subject,
        text,
      }),
    });
    if (res.ok) return { ok: true };
    const detail = (await res.text()).slice(0, 300);
    // 4xx is a configuration problem (bad key, unverified sender): it
    // spends an attempt so it stops retrying eventually and stays
    // visible as failed. 429/5xx are Resend's problem: free retry.
    const spends = res.status < 500 && res.status !== 429;
    return { ok: false, error: `resend ${res.status}: ${detail}`, spendsAttempt: spends };
  } catch (e) {
    return { ok: false, error: `resend unreachable: ${String(e)}`, spendsAttempt: false };
  }
}
