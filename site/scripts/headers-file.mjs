/**
 * Add headers to the site-wide `/*` rule in out/_headers.
 *
 * Why not append a second `/*` block: on Workers static assets, when
 * one path matches several rules with the same pattern, only the last
 * one applies (Pages merged them). Appending a block for the CSP
 * silently dropped HSTS, nosniff and the rest. So generated headers go
 * INSIDE the existing `/*` block, under a marker comment.
 */
import { readFileSync, writeFileSync } from "node:fs";

/**
 * @param {string} file     path to the built _headers file
 * @param {string} marker   comment text identifying this addition
 * @param {string[]} lines  header lines, e.g. ["X-Robots-Tag: noindex"]
 * @returns {"added" | "present" | "no-block"}
 */
export function addToAllPaths(file, marker, lines) {
  const text = readFileSync(file, "utf8");
  if (text.includes(marker)) return "present";

  const eol = text.includes("\r\n") ? "\r\n" : "\n";
  const rows = text.split(/\r?\n/);
  const start = rows.findIndex((r) => r.trim() === "/*");
  if (start === -1) return "no-block";

  // The block is every indented line after the pattern.
  let end = start + 1;
  while (end < rows.length && /^\s+\S/.test(rows[end])) end++;

  rows.splice(end, 0, `  # ${marker}`, ...lines.map((l) => `  ${l}`));
  writeFileSync(file, rows.join(eol));
  return "added";
}
