/**
 * ════════════════════════════════════════════════════════════════════
 *  THE BOOKING IFRAME: what it loads and who it talks to.
 *
 *  Kept in one place so BookingEmbed's preconnect and its iframe src
 *  can't disagree about which origin is involved.
 *
 *  The scheduler is Cal.com (PLAN §2), embedded on /start/ only. Its
 *  document origin must also be listed in INTEGRATIONS.frame in
 *  scripts/csp.mjs; the CSP drift check fails the build otherwise.
 * ════════════════════════════════════════════════════════════════════
 */
import { site } from "@/site.config";

/** Widened: site.config.ts is `as const`, so this is a literal type. */
const bookingUrl: string = site.booking.calUrl;

/**
 * Per-provider embed parameters, keyed by document origin.
 *
 * Cal.com: `embed` and `embedType` are what its own embed.js appends;
 * with them the page drops its standalone chrome and renders as a bare
 * calendar. Brand color is a Cal.com account setting (Settings →
 * Appearance), not a URL parameter: set it to signal #FF5A1F.
 *
 * A scheduler not in this table still works: the iframe loads the bare
 * URL.
 */
const SCHEDULERS: Record<string, { name: string; params?: Record<string, string> }> = {
  "https://cal.com": {
    name: "Cal.com",
    params: { embed: "", embedType: "inline", layout: "month_view", theme: "light" },
  },
};

function originOf(url: string): string {
  try {
    return new URL(url).origin;
  } catch {
    return "";
  }
}

/** Origins the iframe connects to: just the document origin for Cal.com. */
export function bookingOrigins(): string[] {
  const origin = originOf(bookingUrl);
  return origin ? [origin] : [];
}

/** Who hosts the calendar, by name, for the load button and privacy page. */
export function schedulerName(): string {
  if (!bookingUrl) return "";
  const origin = originOf(bookingUrl);
  return (
    SCHEDULERS[origin]?.name ?? (origin ? new URL(origin).hostname : "a third-party scheduler")
  );
}

/** The URL the iframe loads: the booking URL plus the provider's params. */
export function bookingEmbedSrc(): string {
  if (!bookingUrl) return "";
  const spec = SCHEDULERS[originOf(bookingUrl)];
  if (!spec?.params) return bookingUrl;
  const params = new URLSearchParams(spec.params);
  return `${bookingUrl}${bookingUrl.includes("?") ? "&" : "?"}${params}`;
}
