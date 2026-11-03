/**
 * Is this build a preview? (Anything not headed for digitalhaptics.dev.)
 *
 * Two ways to say yes:
 *  - NEXT_PUBLIC_PREVIEW=1, set by `npm run preview:build` or by hand.
 *  - Cloudflare Pages building any branch other than production.
 *    Pages sets CF_PAGES=1 and CF_PAGES_BRANCH on every build, so a
 *    branch preview is noindex without any dashboard variable. That
 *    matters because a missed or mis-scoped variable fails silently:
 *    the preview just gets indexed.
 *
 * Used by next.config.mjs (pages, robots.txt, sitemap) and
 * scripts/preview-headers.mjs (X-Robots-Tag), so both always agree.
 */
export const PRODUCTION_BRANCH = "main";

/** @param {NodeJS.ProcessEnv} env */
export function isPreviewBuild(env = process.env) {
  if (env.NEXT_PUBLIC_PREVIEW === "1") return true;
  return env.CF_PAGES === "1" && !!env.CF_PAGES_BRANCH && env.CF_PAGES_BRANCH !== PRODUCTION_BRANCH;
}
