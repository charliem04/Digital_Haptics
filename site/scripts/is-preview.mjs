/**
 * Is this build a preview? (Anything not headed for digitalhaptics.dev.)
 *
 * Two ways to say yes:
 *  - NEXT_PUBLIC_PREVIEW=1, set by `npm run preview:build` or by hand.
 *  - Cloudflare building any branch other than production. Workers
 *    Builds sets WORKERS_CI=1 and WORKERS_CI_BRANCH (Pages, which this
 *    site used first, set CF_PAGES_BRANCH), so a branch preview is
 *    noindex without any dashboard variable. That matters because a
 *    missed or mis-scoped variable fails silently: the preview just
 *    gets indexed.
 *
 * Used by next.config.mjs (pages, robots.txt, sitemap) and
 * scripts/preview-headers.mjs (X-Robots-Tag), so both always agree.
 */
export const PRODUCTION_BRANCH = "main";

/** @param {NodeJS.ProcessEnv} env */
export function isPreviewBuild(env = process.env) {
  if (env.NEXT_PUBLIC_PREVIEW === "1") return true;
  const branch = env.WORKERS_CI_BRANCH || env.CF_PAGES_BRANCH;
  return !!branch && branch !== PRODUCTION_BRANCH;
}
