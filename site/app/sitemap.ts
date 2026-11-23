import type { MetadataRoute } from "next";
import { site } from "@/site.config";
import { getCases, getPosts } from "@/lib/content";
import { livePaths } from "@/lib/routes";
import { IS_PREVIEW } from "@/lib/preview";

export const dynamic = "force-static";

/**
 * Generated from the route registry, so a page that is live (and whose
 * feature flag is on) is listed and nothing else is. The sitemap can't
 * drift from the nav because they read the same source.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  // Nothing to offer from a preview host: every URL here points at the
  // production domain.
  if (IS_PREVIEW) return [];

  const pages: MetadataRoute.Sitemap = livePaths().map(({ path, priority }) => ({
    url: `${site.url}${path}`,
    priority,
    changeFrequency: path === "/" ? "weekly" : "monthly",
  }));

  // Case studies are content, not registry routes. getCases() returns
  // only published, permitted ones in a production build.
  const cases: MetadataRoute.Sitemap = getCases().map((c) => ({
    url: `${site.url}/work/${c.slug}/`,
    priority: 0.7,
    changeFrequency: "monthly",
  }));

  const posts: MetadataRoute.Sitemap = getPosts().map((p) => ({
    url: `${site.url}/blog/${p.slug}/`,
    lastModified: p.date,
    priority: 0.6,
    changeFrequency: "monthly",
  }));

  return [...pages, ...cases, ...posts];
}
