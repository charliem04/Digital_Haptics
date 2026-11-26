/**
 * Feature flags, resolved once at build time (PLAN §2.1, lib/flags.ts).
 *
 * Non-NEXT_PUBLIC_ variables are undefined in browser bundles, so a
 * client component reading a flag would always see "off", and the
 * server-rendered HTML could disagree with it. Listing them in `env`
 * inlines the same literal into server and client code. These are
 * booleans, not secrets.
 */
import { isPreviewBuild } from "./scripts/is-preview.mjs";

const flag = (name) => (process.env[name] === "true" ? "true" : "false");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export: `npm run build` emits ./out, served by the Worker.
  // The intake endpoint joins that Worker in Phase 4 (decision D1),
  // so no page needs a server runtime.
  //
  // Builds only. Under `next dev` (14.2), "export" plus
  // `dynamicParams = false` makes every [slug] page throw "missing
  // generateStaticParams()" even though it has one. Dev without it
  // serves the same pages, and still 404s an unknown slug.
  output: process.env.NODE_ENV === "development" ? undefined : "export",
  images: {
    // Required for static export.
    unoptimized: true,
  },
  trailingSlash: true,
  // Dev-only routes: a `page.lab.tsx` is a page under `next dev` and is
  // not a route file at all in `next build`, so /lab (and the three.js
  // it pulls in) can never reach ./out. See lab/hero-motion/README.md.
  pageExtensions: [
    ...(process.env.NODE_ENV === "development" ? ["lab.tsx"] : []),
    "tsx",
    "ts",
    "jsx",
    "js",
  ],
  env: {
    FEATURE_AUTOMATIONS: flag("FEATURE_AUTOMATIONS"),
    FEATURE_AUTOMATIONS_DEMO: flag("FEATURE_AUTOMATIONS_DEMO"),
    FEATURE_VOICE: flag("FEATURE_VOICE"),
    // Read through lib/preview.ts. Decided in scripts/is-preview.mjs.
    SITE_PREVIEW: isPreviewBuild() ? "1" : "0",
  },
  eslint: {
    // data/ holds typed content modules every page imports, so it gets
    // the same rules, in `npm run lint` and in `next build`.
    dirs: ["app", "components", "lib", "data", "content"],
  },
};

export default nextConfig;
