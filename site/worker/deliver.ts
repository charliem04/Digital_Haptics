import type { Env } from "./env.ts";
import { owed, recordDelivery, type LeadRow } from "./db.ts";
import { emailConfigured, sendLeadEmail } from "./email.ts";
import { forwardLead, webhookConfigured } from "./webhook.ts";
import { flags } from "./flags.generated.ts";

/**
 * Try each channel a lead is owed, and record what happened. Used on
 * the request path (after the response is sent) and by the cron.
 * Never throws: a delivery problem is a row state, not a crash.
 */
export async function deliver(env: Env, row: LeadRow): Promise<void> {
  await Promise.all([deliverEmail(env, row), deliverWebhook(env, row)]);
}

async function deliverEmail(env: Env, row: LeadRow): Promise<void> {
  if (!["pending", "failed", "disabled"].includes(row.email_status)) return;
  if (!emailConfigured(env)) return; // stays 'disabled' until it is
  try {
    const out = await sendLeadEmail(env, row);
    await recordDelivery(
      env,
      "email",
      row.id,
      out.ok ? "sent" : "failed",
      out.ok ? null : out.error,
      out.ok || out.spendsAttempt
    );
    if (!out.ok) console.error(`[intake] email for ${row.id} failed: ${out.error}`);
  } catch (e) {
    console.error(`[intake] email for ${row.id} errored:`, e);
  }
}

async function deliverWebhook(env: Env, row: LeadRow): Promise<void> {
  // 🚩 Flag off: never forwarded, whatever the row says.
  if (!flags.automations) return;
  if (!["pending", "failed", "disabled"].includes(row.webhook_status)) return;
  if (!webhookConfigured(env)) return;
  try {
    const out = await forwardLead(env, row);
    await recordDelivery(
      env,
      "webhook",
      row.id,
      out.ok ? "sent" : "failed",
      out.ok ? null : out.error,
      out.ok || out.spendsAttempt
    );
    if (!out.ok) console.error(`[intake] webhook for ${row.id} failed: ${out.error}`);
  } catch (e) {
    console.error(`[intake] webhook for ${row.id} errored:`, e);
  }
}

/** The cron sweep: everything still owed, oldest first. */
export async function sweep(env: Env): Promise<number> {
  let n = 0;
  if (emailConfigured(env)) {
    for (const row of await owed(env, "email")) {
      await deliverEmail(env, row);
      n++;
    }
  }
  if (flags.automations && webhookConfigured(env)) {
    for (const row of await owed(env, "webhook")) {
      await deliverWebhook(env, row);
      n++;
    }
  }
  return n;
}
