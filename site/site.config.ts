/**
 * ════════════════════════════════════════════════════════════════════
 *  SITE CONFIG — business facts for digitalhaptics.dev, in one place.
 *
 *  Components read business info from here and never hard-code it
 *  (PLAN §2). Page-specific copy does NOT live here: it lives in
 *  data/*.ts or the page itself (PLAN §6).
 *
 *  Every value marked [PLACEHOLDER] is logged in CONTENT_TODO.md at the
 *  repo root. Never replace one with an invented value.
 *
 *  Everything in this file ships to the browser (static export), so no
 *  secrets: the automations webhook URL lives on the intake endpoint,
 *  not here (REFACTOR_AUDIT C5).
 * ════════════════════════════════════════════════════════════════════
 */

export const site = {
  // ── Identity ──────────────────────────────────────────────────────
  name: "Digital Haptics",
  /**
   * Operating as a sole proprietor until the LLC is filed. Change to
   * "Digital Haptics LLC" once the Louisiana filing goes through
   * (CONTENT_TODO.md).
   */
  legalName: "Charles Meyers",
  /** schema.org type for the site-wide JSON-LD (PLAN §8). */
  schemaType: "ProfessionalService",

  // ── Domain / SEO ──────────────────────────────────────────────────
  /** No trailing slash. */
  url: "https://digitalhaptics.dev",
  seo: {
    /** scripts/seo.mjs fails the build past 60 / 160 characters. */
    defaultTitle: "Digital Haptics — Websites for Acadiana trades",
    titleTemplate: "%s | Digital Haptics",
    defaultDescription:
      "Web design and local SEO for trades businesses in Acadiana, Louisiana. Sites built to load fast, rank locally and turn visitors into calls.",
    /**
     * Share image for pages that don't set their own. Per-page images
     * are /og/<path>.png (lib/meta.ts ogImageFor), rendered at build by
     * scripts/og.mjs from each page's own title.
     */
    ogImage: "/og/default.png",
  },

  // ── Contact ───────────────────────────────────────────────────────
  phone: {
    display: "(337) 412-5714",
    /** E.164, for tel: links. Empty hides every tel: link. */
    e164: "+13374125714",
  },
  /** Needs a mailbox or Email Routing rule before launch (CONTENT_TODO.md). */
  email: "charles@digitalhaptics.dev",

  // ── Location ──────────────────────────────────────────────────────
  /** Service-area business: no street address is published. */
  location: { region: "Acadiana", state: "LA", country: "US" },
  serviceArea: {
    label: "Acadiana, LA",
    /**
     * PLAN §3's list, confirmed 2026-11-03. A city page is only
     * published once it has unique content (PLAN §5).
     */
    cities: [
      "Lafayette",
      "Broussard",
      "Youngsville",
      "Scott",
      "Carencro",
      "New Iberia",
      "Breaux Bridge",
    ],
    /**
     * Also takes remote projects anywhere in the US. Used in structured
     * data only; site copy stays Acadiana-first per PLAN §3.
     */
    remoteCountry: "United States",
  },

  // ── Primary action ────────────────────────────────────────────────
  /** Every CTA on the site points here (PLAN §3). */
  cta: { label: "Start a Project", href: "/start/" },

  // ── Booking ───────────────────────────────────────────────────────
  booking: {
    /**
     * Public Cal.com booking page URL (https://cal.com/<user>/<event>).
     * Embedded on /start/ only. Empty hides the embed.
     * Not set up yet; deferred (CONTENT_TODO.md).
     */
    calUrl: "",
  },

  // ── Intake form ───────────────────────────────────────────────────
  intake: {
    /** Same-origin, in the site Worker (decision D1, revised). Built in Phase 4. */
    endpoint: "/api/intake",
    /** Public half of the Turnstile key; the secret lives server-side. */
    turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "",
    /** Thank-you page copy (PLAN §5). */
    responseTime: "one business day",
  },

  // ── Socials (empty string hides the link) ─────────────────────────
  // None yet; add each URL here when the account exists.
  socials: {
    googleBusiness: "",
    facebook: "",
    instagram: "",
    linkedin: "",
  },
} as const;

export type SiteConfig = typeof site;
