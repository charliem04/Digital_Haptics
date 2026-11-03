/**
 * ════════════════════════════════════════════════════════════════════
 *  CONVERSION TRACKING
 *
 *  PHASE 4 rewrites this module. Cloudflare Web Analytics has no
 *  custom-event API, so the PLAN §8 events (cta_click, form_start,
 *  form_submit, call_click, booking_complete; flagged demo_start and
 *  demo_complete) go to our own endpoint and into Workers Analytics
 *  Engine (decision D2).
 *
 *  Until then this is a no-op: nothing loads window.plausible any more.
 *
 *  Nothing here fires without a real user gesture, and no event carries
 *  anything identifying — just which action, on which page.
 * ════════════════════════════════════════════════════════════════════
 */

declare global {
  interface Window {
    plausible?: (event: string, opts?: { props?: Record<string, string> }) => void;
  }
}

export type ConversionEvent = "Call" | "Text" | "Book" | "Form submit";

export function trackEvent(
  event: ConversionEvent,
  props: Record<string, string> = {}
): void {
  if (typeof window === "undefined") return;
  try {
    window.plausible?.(event, {
      props: { path: window.location.pathname, ...props },
    });
  } catch {
    // Analytics must never break a phone call.
  }
}
