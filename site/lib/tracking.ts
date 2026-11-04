/**
 * ════════════════════════════════════════════════════════════════════
 *  CONVERSION EVENTS (PLAN §8, decision D2).
 *
 *  Cloudflare Web Analytics counts pageviews but has no custom-event
 *  API, so these go to our own endpoint (worker/events.ts) and into
 *  Workers Analytics Engine.
 *  // OPEN: D2 alternative is a cookieless tool such as Plausible.
 *
 *  An event carries its name, an optional location ("hero", "footer")
 *  and the page path. Nothing identifying: no IP is stored, no cookie,
 *  no user id. Sent with sendBeacon so navigating away never waits.
 *
 *  Flagged events (demo_start, demo_complete) are only fired by the demo,
 *  which only exists with FEATURE_AUTOMATIONS_DEMO on; the Worker also
 *  refuses them while the flag is off.
 * ════════════════════════════════════════════════════════════════════
 */

export type ConversionEvent =
  | "cta_click"
  | "form_start"
  | "form_submit"
  | "call_click"
  | "booking_complete"
  | "demo_start"
  | "demo_complete";

export const EVENT_ENDPOINT = "/api/event";

export function trackEvent(event: ConversionEvent, location?: string): void {
  if (typeof window === "undefined") return;
  try {
    const body = JSON.stringify({
      e: event,
      loc: location?.slice(0, 40),
      path: window.location.pathname.slice(0, 200),
    });
    const blob = new Blob([body], { type: "application/json" });
    if (!navigator.sendBeacon?.(EVENT_ENDPOINT, blob)) {
      void fetch(EVENT_ENDPOINT, { method: "POST", body, keepalive: true }).catch(() => {});
    }
  } catch {
    // Analytics must never break a phone call or a form.
  }
}
