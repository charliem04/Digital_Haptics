import type { MetadataRoute } from "next";
import { site } from "@/site.config";
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

  return livePaths().map(({ path, priority }) => ({
    url: `${site.url}${path}`,
    priority,
    changeFrequency: path === "/" ? "weekly" : "monthly",
  }));
}
