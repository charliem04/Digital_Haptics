import type { Env } from "./env.ts";
import { insertLead, type LeadRow } from "./db.ts";
import { deliver } from "./deliver.ts";
import { emailConfigured } from "./email.ts";
import { webhookConfigured } from "./webhook.ts";
import { verifyTurnstile } from "./turnstile.ts";
import { json, limited, readJson, sameOrigin } from "./http.ts";
import { flags } from "./flags.generated.ts";
import { validateIntake, type IntakeOptions } from "../lib/intake-rules.ts";
import { budgets, smsConsent, timelines, trades } from "../data/intake.ts";
import { services } from "../data/services.ts";

/**
 * ════════════════════════════════════════════════════════════════════
 *  POST /api/intake — the launch path (PLAN §7):
 *  validate → Turnstile → D1 → email (→ 🚩 webhook).
 *
 *  1. Same-origin POST, JSON, at most 16 KB, per-IP rate limit.
 *  2. Validate with lib/intake-rules.ts, the rules the form itself uses.
 *     A 400 returns field errors the form shows inline.
 *  3. Turnstile, when its secret is configured (worker/turnstile.ts).
 *  4. Write the row. This is the only failure the visitor is told about,
 *     because it is the only one that means the lead isn't written down.
 *  5. Answer, then email (and forward, 🚩) after the response. A
 *     delivery that fails is retried by the cron.
 * ════════════════════════════════════════════════════════════════════
 */
const MAX_BODY = 16 * 1024;

/** What this build's form offers: the same lists, filtered by the same flags. */
export function intakeOptions(): IntakeOptions {
  return {
    trades: trades.map((o) => o.value),
    timelines: timelines.map((o) => o.value),
    budgets: budgets.map((o) => o.value),
    services: services.filter((s) => !s.flag || flags[s.flag]).map((s) => s.slug),
    smsConsentError: flags.automations ? smsConsent.error : undefined,
  };
}

export async function handleIntake(req: Request, env: Env, ctx: ExecutionContext) {
  if (req.method !== "POST") return json({ error: "method" }, 405);
  if (!sameOrigin(req)) return json({ error: "origin" }, 403);
  if (await limited(env.LIMITER, req, "intake")) return json({ error: "rate" }, 429);

  const body = await readJson(req, MAX_BODY);
  if (!body) return json({ error: "body" }, 400);

  const checked = validateIntake(body, intakeOptions());
  if (!checked.ok) return json({ error: "invalid", errors: checked.errors }, 400);

  const turnstile = await verifyTurnstile(env, body.turnstile, req.headers.get("CF-Connecting-IP"));
  if (turnstile === "failed") return json({ error: "turnstile" }, 403);

  const row: LeadRow = {
    ...checked.value,
    id: crypto.randomUUID(),
    // Server time, always: a timestamp the caller sets can be backdated.
    received_at: new Date().toISOString(),
    turnstile,
    site_env: env.SITE_ENV ?? "production",
    email_status: emailConfigured(env) ? "pending" : "disabled",
    webhook_status: !flags.automations ? "off" : webhookConfigured(env) ? "pending" : "disabled",
  };

  try {
    await insertLead(env, row);
  } catch (e) {
    console.error("[intake] could not store lead:", e);
    return json({ error: "store" }, 500);
  }

  // Answer now; deliver on the way out. The visitor never waits on
  // Resend or the webhook, and the row is already safe.
  ctx.waitUntil(deliver(env, row));
  return json({ ok: true, id: row.id });
}
