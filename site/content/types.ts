/**
 * ════════════════════════════════════════════════════════════════════
 *  CONTENT TYPES — the contract between content and components.
 *
 *  Everything lib/content.ts returns has one of these shapes. Service,
 *  City, case study and post types are added with their pages.
 * ════════════════════════════════════════════════════════════════════
 */

export type Photo = {
  src: string;
  alt: string;
  /** Intrinsic pixels, so the box is reserved before the image lands. */
  width: number;
  height: number;
  caption?: string;
};

export type Faq = {
  q: string;
  a: string;
};

/** The CTA band that closes a page, in that page's own words. */
export type CtaCopy = {
  heading: string;
  body: string;
};

/** Per-page <head> content. */
export type PageMeta = {
  title: string;
  description: string;
  /** Path with leading and trailing slash, e.g. "/services/web-design/". */
  path: string;
};

/**
 * A service item in the hero sidebar / mobile band (PLAN §4.5),
 * e.g. ACT.01 — DESIGN.
 */
export type Act = {
  code: string;
  name: string;
  blurb: string;
  /** The signal-filled one. */
  highlight?: boolean;
};

/** One step of the lead-flow panel (🚩 FEATURE_AUTOMATIONS). */
export type LeadFlowStep = {
  key: string;
  value: string;
};
