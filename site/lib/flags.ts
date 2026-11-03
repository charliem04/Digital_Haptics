/**
 * ════════════════════════════════════════════════════════════════════
 *  FEATURE FLAGS — the only place the site reads them (PLAN §2.1).
 *
 *  Components import `flags` (or `isOn`) from here and never touch
 *  process.env. ESLint enforces that for app/ and components/.
 *
 *  Flags are BUILD-TIME values. next.config.mjs inlines all three into
 *  both server and client bundles, so server and client always agree
 *  (no hydration mismatch) and code behind a false flag is dropped from
 *  the output.
 *
 *  Only the exact string "true" turns a flag on. Missing, empty, "1",
 *  "TRUE" or anything else is off, so a misconfigured environment never
 *  exposes unfinished features.
 *
 *  Turning a flag on in Cloudflare Pages: set it under Settings →
 *  Environment variables (Preview first, then Production) and redeploy.
 *  With intake as a Pages Function (decision D1), the same variable
 *  also reaches the endpoint, so there is one switch per environment.
 * ════════════════════════════════════════════════════════════════════
 */

const on = (value: string | undefined): boolean => value === "true";

const automations = on(process.env.FEATURE_AUTOMATIONS);

export const flags = {
  /** Automations page, copy and UI, webhook forwarding, SMS consent. */
  automations,
  /**
   * Interactive SMS demo on the Automations page. The demo lives on a
   * page that only exists when `automations` is on, so it needs both.
   */
  automationsDemo: automations && on(process.env.FEATURE_AUTOMATIONS_DEMO),
  /** AI voice receptionist call-in section. */
  voice: on(process.env.FEATURE_VOICE),
} as const;

export type FlagName = keyof typeof flags;

/** `isOn(undefined)` is true: an element with no flag is always shown. */
export function isOn(flag: FlagName | undefined): boolean {
  return flag === undefined ? true : flags[flag];
}
