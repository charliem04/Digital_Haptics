/**
 * Everything the Worker is given by Cloudflare (site/wrangler.jsonc).
 *
 * Bindings are optional where the site must keep working without them:
 * a missing rate limiter, analytics dataset or email key degrades one
 * feature, never the intake path. The one hard dependency is DB:
 * without it there is nowhere to write a lead down.
 *
 * Secrets (set with `wrangler secret put` or the dashboard, never in
 * a file): RESEND_API_KEY, TURNSTILE_SECRET_KEY, AUTOMATIONS_WEBHOOK_URL,
 * AUTOMATIONS_WEBHOOK_SECRET. scripts/harden.mjs fails the site build
 * if any of them ever reaches out/.
 */
export interface Env {
  /** The static site (out/), for anything that isn't /api/*. */
  ASSETS: Fetcher;
  /** The lead book (D1). Previews bind a separate database. */
  DB: D1Database;
  /** Conversion events (decision D2). */
  EVENTS?: AnalyticsEngineDataset;
  /** Per-IP limiter for the intake and demo endpoints. */
  LIMITER?: RateLimit;

  /** "production" or "preview" (wrangler.jsonc vars / previews.vars). */
  SITE_ENV?: string;

  /** Where lead notifications go, e.g. charles@digitalhaptics.dev. */
  LEAD_NOTIFY_TO?: string;
  /** Verified sender, e.g. "Digital Haptics <leads@digitalhaptics.dev>". */
  LEAD_NOTIFY_FROM?: string;
  RESEND_API_KEY?: string;

  TURNSTILE_SECRET_KEY?: string;

  /** 🚩 FEATURE_AUTOMATIONS: the speed-to-lead intake webhook. */
  AUTOMATIONS_WEBHOOK_URL?: string;
  AUTOMATIONS_WEBHOOK_SECRET?: string;
}
