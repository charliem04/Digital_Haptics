import type { Env } from "./env.ts";
import type { IntakeValue } from "../lib/intake-rules.ts";

/**
 * ════════════════════════════════════════════════════════════════════
 *  THE LEAD BOOK (D1).
 *
 *  Store first, deliver second (carried over from workers/lead-relay):
 *  the row is written before the email or webhook is attempted and never
 *  depends on either succeeding. A Resend outage, or an email key that
 *  isn't set up yet, costs a late notification, never a lead. The cron
 *  in worker/index.ts retries anything not yet delivered.
 *
 *  The schema is created on first use (CREATE … IF NOT EXISTS), so a
 *  freshly provisioned database needs no manual migration step.
 *
 *  Customer data: names, numbers, what people wrote. No read route is
 *  exposed; read it in the dashboard (D1 → Console) or with
 *  `wrangler d1 execute`. No IP address is stored.
 * ════════════════════════════════════════════════════════════════════
 */

/** Delivery state of one channel (email, webhook) for one lead. */
export type Delivery =
  | "pending" // written, not yet tried
  | "sent"
  | "failed" // tried and refused or unreachable; the cron retries
  | "disabled" // the channel isn't configured yet; delivered once it is
  | "off"; // the channel doesn't apply (webhook with the flag off)

export const MAX_ATTEMPTS = 6;

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS leads (
    id               TEXT PRIMARY KEY,
    received_at      TEXT NOT NULL,
    name             TEXT NOT NULL,
    business         TEXT NOT NULL,
    trade            TEXT NOT NULL,
    phone            TEXT NOT NULL,
    email            TEXT NOT NULL,
    website          TEXT,
    services         TEXT NOT NULL,
    timeline         TEXT NOT NULL,
    budget           TEXT,
    message          TEXT NOT NULL,
    sms_consent      INTEGER,
    turnstile        TEXT NOT NULL,
    site_env         TEXT NOT NULL,
    email_status     TEXT NOT NULL,
    email_attempts   INTEGER NOT NULL DEFAULT 0,
    email_error      TEXT,
    email_sent_at    TEXT,
    webhook_status   TEXT NOT NULL,
    webhook_attempts INTEGER NOT NULL DEFAULT 0,
    webhook_error    TEXT,
    webhook_sent_at  TEXT
  )`,
  `CREATE INDEX IF NOT EXISTS leads_received_idx ON leads (received_at DESC)`,
  `CREATE INDEX IF NOT EXISTS leads_email_idx ON leads (email_status, received_at)`,
  `CREATE INDEX IF NOT EXISTS leads_webhook_idx ON leads (webhook_status, received_at)`,
];

let ready: Promise<void> | null = null;

/** Create the table once per isolate. Safe to call on every request. */
export function ensureSchema(env: Env): Promise<void> {
  ready ??= env.DB.batch(SCHEMA.map((s) => env.DB.prepare(s)))
    .then(() => undefined)
    .catch((e) => {
      ready = null; // try again next time rather than caching a failure
      throw e;
    });
  return ready;
}

export type LeadRow = IntakeValue & {
  id: string;
  received_at: string;
  turnstile: "passed" | "unconfigured";
  site_env: string;
  email_status: Delivery;
  webhook_status: Delivery;
};

export async function insertLead(env: Env, row: LeadRow): Promise<void> {
  await ensureSchema(env);
  await env.DB.prepare(
    `INSERT INTO leads (
       id, received_at, name, business, trade, phone, email, website,
       services, timeline, budget, message, sms_consent, turnstile,
       site_env, email_status, webhook_status
     ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  )
    .bind(
      row.id,
      row.received_at,
      row.name,
      row.business,
      row.trade,
      row.phone,
      row.email,
      row.website,
      JSON.stringify(row.services),
      row.timeline,
      row.budget,
      row.message,
      row.smsConsent === null ? null : row.smsConsent ? 1 : 0,
      row.turnstile,
      row.site_env,
      row.email_status,
      row.webhook_status
    )
    .run();
}

/** Record one delivery attempt's outcome. */
export async function recordDelivery(
  env: Env,
  channel: "email" | "webhook",
  id: string,
  status: Delivery,
  error: string | null,
  spentAttempt: boolean
): Promise<void> {
  const col = channel === "email" ? "email" : "webhook";
  await env.DB.prepare(
    `UPDATE leads SET ${col}_status = ?,
            ${col}_attempts = ${col}_attempts + ?,
            ${col}_error = ?,
            ${col}_sent_at = CASE WHEN ? = 'sent' THEN ? ELSE ${col}_sent_at END
      WHERE id = ?`
  )
    .bind(
      status,
      spentAttempt ? 1 : 0,
      error?.slice(0, 1000) ?? null,
      status,
      new Date().toISOString(),
      id
    )
    .run();
}

/** Rows still owed a delivery on a channel, oldest first. */
export async function owed(env: Env, channel: "email" | "webhook", limit = 25): Promise<LeadRow[]> {
  await ensureSchema(env);
  const col = channel === "email" ? "email" : "webhook";
  const { results } = await env.DB.prepare(
    `SELECT * FROM leads
      WHERE ${col}_status IN ('pending', 'failed', 'disabled')
        AND ${col}_attempts < ?
      ORDER BY received_at ASC
      LIMIT ?`
  )
    .bind(MAX_ATTEMPTS, limit)
    .all<Record<string, unknown>>();
  return (results ?? []).map(fromDb);
}

function fromDb(r: Record<string, unknown>): LeadRow {
  return {
    id: String(r.id),
    received_at: String(r.received_at),
    name: String(r.name),
    business: String(r.business),
    trade: String(r.trade),
    phone: String(r.phone),
    email: String(r.email),
    website: (r.website as string | null) ?? null,
    services: JSON.parse(String(r.services ?? "[]")) as string[],
    timeline: String(r.timeline),
    budget: (r.budget as string | null) ?? null,
    message: String(r.message),
    smsConsent: r.sms_consent === null || r.sms_consent === undefined ? null : r.sms_consent === 1,
    turnstile: r.turnstile as LeadRow["turnstile"],
    site_env: String(r.site_env),
    email_status: r.email_status as Delivery,
    webhook_status: r.webhook_status as Delivery,
  };
}
