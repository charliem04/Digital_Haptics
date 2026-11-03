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
