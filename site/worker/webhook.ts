import type { Env } from "./env.ts";
import type { LeadRow } from "./db.ts";
import type { SendOutcome } from "./email.ts";

/**
 * ════════════════════════════════════════════════════════════════════
 *  🚩 FEATURE_AUTOMATIONS — forward the lead to the speed-to-lead
 *  intake webhook (PLAN §2, §7).
 *
 *  Never runs with the flag off: worker/intake.ts stores the row with
 *  webhook_status 'off' and the cron only sweeps 'pending' / 'failed' /
 *  'disabled'. With the flag on but no AUTOMATIONS_WEBHOOK_URL yet, rows
 *  are 'disabled' and go out once the URL is set.
 *
 *  The URL is a secret (REFACTOR_AUDIT C5): it lives on the Worker,
 *  never in site.config.ts or the browser.
 * ════════════════════════════════════════════════════════════════════
 */
export function webhookConfigured(env: Env): boolean {
  return Boolean(env.AUTOMATIONS_WEBHOOK_URL);
}

export function webhookPayload(row: LeadRow) {
  return {
    id: row.id,
    receivedAt: row.received_at,
    source: "digitalhaptics.dev",
    env: row.site_env,
    lead: {
      name: row.name,
      business: row.business,
      trade: row.trade,
      phone: row.phone,
      email: row.email,
      website: row.website,
      services: row.services,
      timeline: row.timeline,
      budget: row.budget,
      message: row.message,
      smsConsent: row.smsConsent,
    },
  };
}

export async function forwardLead(
  env: Env,
  row: LeadRow,
  fetcher: typeof fetch = fetch
): Promise<SendOutcome> {
  try {
    const res = await fetcher(env.AUTOMATIONS_WEBHOOK_URL as string, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": `lead-${row.id}`,
        ...(env.AUTOMATIONS_WEBHOOK_SECRET
          ? { "X-Webhook-Secret": env.AUTOMATIONS_WEBHOOK_SECRET }
          : {}),
      },
      body: JSON.stringify(webhookPayload(row)),
    });
    if (res.ok) return { ok: true };
    const spends = res.status < 500 && res.status !== 429;
    return { ok: false, error: `webhook ${res.status}`, spendsAttempt: spends };
  } catch (e) {
    // The URL is a secret, and a network error's text can include it.
    // Only the error's kind goes to the log and the database.
    const kind = e instanceof Error ? e.name : "Error";
    return { ok: false, error: `webhook unreachable (${kind})`, spendsAttempt: false };
  }
}
