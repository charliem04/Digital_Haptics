/**
 * ════════════════════════════════════════════════════════════════════
 *  PREVIEW MODE — builds deployed to a *.pages.dev preview URL.
 *
 *  A preview must never compete with digitalhaptics.dev in search. With
 *  NEXT_PUBLIC_PREVIEW=1, every page is noindex, robots.txt disallows
 *  everything, the sitemap is empty, and scripts/preview-headers.mjs
 *  adds an X-Robots-Tag header. Any one of these can be missed, and
 *  they cost nothing.
 *
 *  Set NEXT_PUBLIC_PREVIEW=1 in Cloudflare Pages → Settings →
 *  Environment variables → Preview. Leave it unset for Production.
 * ════════════════════════════════════════════════════════════════════
 */
export const IS_PREVIEW = process.env.NEXT_PUBLIC_PREVIEW === "1";
