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
  // Static export: `npm run build` emits ./out for Cloudflare Pages.
  // The intake endpoint is a Pages Function beside it (decision D1),
  // so no page needs a server runtime.
  output: "export",
  images: {
    // Required for static export.
    unoptimized: true,
  },
  trailingSlash: true,
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
