/**
 * ════════════════════════════════════════════════════════════════════
 *  PREVIEW MODE — builds of any branch except main.
 *
 *  A preview must never compete with digitalhaptics.dev in search. In a
 *  preview build every page is noindex, robots.txt disallows
 *  everything, the sitemap is empty, and scripts/preview-headers.mjs
 *  adds an X-Robots-Tag header. Any one of these can be missed, and
 *  they cost nothing.
 *
 *  Which builds count as previews: scripts/is-preview.mjs (any
 *  Cloudflare branch build except main, or NEXT_PUBLIC_PREVIEW=1).
 *  next.config.mjs inlines the answer as SITE_PREVIEW.
 * ════════════════════════════════════════════════════════════════════
 */
export const IS_PREVIEW = process.env.SITE_PREVIEW === "1";
