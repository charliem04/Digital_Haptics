/**
 * Keeps an unpublished case study's screenshots out of production.
 *
 * Next copies everything in public/ to out/, so a held client's images
 * would be reachable by URL even with no page linking them. Production
 * builds delete them here. Preview builds keep them so drafts can be
 * reviewed. Runs after `next build`.
 */
import { existsSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { isPreviewBuild } from "./is-preview.mjs";

const WORK = join("content", "work");

if (isPreviewBuild()) {
  console.log("[hold-images] preview build, drafts keep their images");
} else {
  let removed = 0;
  for (const file of readdirSync(WORK).filter((f) => f.endsWith(".mdx"))) {
    const { data } = matter(readFileSync(join(WORK, file), "utf8"));
    if (data.published === true && data.permission === true) continue;
    for (const image of [data.heroImage, data.cardImage, data.mobileImage]) {
      if (!image?.src) continue;
      const built = join("out", image.src);
      if (existsSync(built)) {
        rmSync(built);
        removed++;
      }
    }
  }
  console.log(`[hold-images] removed ${removed} unpublished case image(s)`);
}
