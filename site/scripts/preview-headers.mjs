/**
 * Add the preview-only response headers to the built output.
 *
 * `public/_headers` is a static file copied verbatim into out/, so it
 * cannot branch on an env var the way robots.ts and the page metadata
 * can. This appends to the built copy instead, leaving the source file
 * as the single description of production headers.
 *
 * X-Robots-Tag is here rather than only in the pages because it covers
 * what a <meta> tag cannot: the PDFs, images and any non-HTML file
 * Google will happily index on its own.
 *
 * Called by scripts/preview-build.mjs. `npm run build` runs it with
 * --if-preview, which does nothing unless scripts/is-preview.mjs says
 * this is a preview, so a production build's out/_headers is exactly
 * public/_headers.
 */
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { isPreviewBuild } from "./is-preview.mjs";
import { addToAllPaths } from "./headers-file.mjs";

const FILE = "out/_headers";
// Removing this header is how a preview starts competing with
// digitalhaptics.dev in search.
const MARKER = "── preview build: keep every crawler off this deploy ──";
const LINES = ["X-Robots-Tag: noindex, nofollow, noarchive, nosnippet, noimageindex"];

/** @returns true on success, false if there was nothing to write to. */
export function applyPreviewHeaders() {
  if (!existsSync(FILE)) {
    console.error(
      `[preview] ${FILE} does not exist — run the build first, and check that public/_headers is still there.`
    );
    return false;
  }

  // Inside the existing /* block, not a new one (headers-file.mjs).
  const result = addToAllPaths(FILE, MARKER, LINES);
  if (result === "present") {
    console.log("[preview] headers already present, nothing to do");
    return true;
  }
  if (result === "no-block") {
    console.error(`[preview] ${FILE} has no /* rule to add X-Robots-Tag to.`);
    return false;
  }
  console.log("[preview] X-Robots-Tag: noindex added to out/_headers");
  return true;
}

// Run when invoked directly, stay quiet when imported.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.includes("--if-preview") && !isPreviewBuild()) {
    console.log("[preview] production build, headers unchanged");
    process.exit(0);
  }
  process.exit(applyPreviewHeaders() ? 0 : 1);
}
