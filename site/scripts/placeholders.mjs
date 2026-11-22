#!/usr/bin/env node
/**
 * Nothing bracketed reaches production (PLAN §9, Phase 6).
 *
 * Reads the built files rather than the source, because the source is
 * full of placeholders that are correctly hidden: unpublished case
 * studies, unready cities, flagged copy. What matters is what shipped.
 *
 * The styleguide is exempt. PLAN §9 keeps it as a hidden, noindex route
 * and its sample values are bracketed on purpose (CONTENT_TODO.md).
 *
 * Previews skip all of this: showing drafts is what they are for.
 */
import { existsSync, readFileSync, readdirSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";
import { loadEnvFile } from "./env-file.mjs";
import { isPreviewBuild } from "./is-preview.mjs";

loadEnvFile();

const OUT = "out";
const EXEMPT_DIRS = new Set([join(OUT, "styleguide")]);
const TEXT_FILE = /\.(html|js|css|json|txt|xml|svg)$/;
const PLACEHOLDER = /\[(?:PLACEHOLDER\b|PRICE\b|RESULT\b|Client name\]|Timeline options\])/;

/** Built files that still contain a placeholder. */
export function findPlaceholders(dir = OUT) {
  const hits = [];
  const walk = (d) => {
    for (const name of readdirSync(d)) {
      const p = join(d, name);
      if (statSync(p).isDirectory()) {
        if (!EXEMPT_DIRS.has(p)) walk(p);
      } else if (TEXT_FILE.test(name) && PLACEHOLDER.test(readFileSync(p, "utf8"))) hits.push(p);
    }
  };
  walk(dir);
  return hits;
}

export function guardPlaceholders(env = process.env) {
  if (isPreviewBuild(env)) {
    console.log("[placeholders] preview build, skipped");
    return true;
  }
  if (!existsSync(OUT)) {
    console.error(`[placeholders] ${OUT}/ is missing — did the build run?`);
    return false;
  }
  // Empty dynamic routes need one generated param to export, and that
  // page is served as a 200. Removing it makes the URL a real 404.
  for (const section of ["areas", "blog", "work"]) {
    rmSync(join(OUT, section, "_"), { recursive: true, force: true });
  }
  const hits = findPlaceholders();
  if (hits.length) {
    console.error(
      `[placeholders] ${hits.length} built file(s) still contain a placeholder:\n` +
        hits.map((p) => `      · ${p}`).join("\n") +
        "\n      Fill it, or hide the section it belongs to (CONTENT_TODO.md)."
    );
    return false;
  }
  console.log("[placeholders] clean");
  return true;
}

if (process.argv[1] && process.argv[1].endsWith("placeholders.mjs")) {
  process.exit(guardPlaceholders() ? 0 : 1);
}
