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

/** A service (PLAN §5, §6): card, sub-page and pricing line. */
export type Service = {
  slug: string;
  /** Boxed label code, e.g. ACT.01. */
  code: string;
  name: string;
  /** One line for cards and the hero sidebar. */
  short: string;
  /** Sub-page opening paragraph. */
  lead: string;
  included: string[];
  forWho: string[];
  faq: Faq[];
  /** Pricing page line, e.g. "Websites from [PRICE]". */
  price: string;
  /** Case-study `systems` value that marks a case as relevant here. */
  system: string;
};

/** One step of a process strip (PLAN §5). */
export type ProcessStep = {
  name: string;
  body: string;
};

/** A key/value result on a case study. Placeholders until confirmed. */
export type CaseResult = {
  label: string;
  value: string;
};

/**
 * A case study (PLAN §5 Work, §6): frontmatter of content/work/*.mdx.
 *
 * Shown in production only when BOTH `published` and `permission` are
 * true (PLAN §10: unpublished until the client confirms). Preview
 * builds also show drafts, labelled, with the client name held back
 * until `permission` is true.
 */
export type CaseStudy = {
  slug: string;
  client: string;
  trade: string;
  location: string;
  systems: string[];
  liveUrl?: string;
  heroImage?: Photo;
  results: CaseResult[];
  featured: boolean;
  order: number;
  published: boolean;
  permission: boolean;
  summary: string;
  /** Computed: visible in this build but not publishable yet. */
  draft: boolean;
};

/** A select or checkbox option (PLAN §5, /start). */
export type Option = { value: string; label: string };
