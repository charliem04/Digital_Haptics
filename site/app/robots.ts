import type { MetadataRoute } from "next";
import { site } from "@/site.config";
import { IS_PREVIEW } from "@/lib/preview";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  // A preview build turns every crawler away and advertises no sitemap.
  // The pages carry noindex too — this is the layer that stops a
  // well-behaved crawler before it ever fetches one.
  if (IS_PREVIEW) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    // Flagged and not-yet-live pages aren't emitted at all, and the
    // pages that exist but shouldn't be indexed carry noindex, so there
    // is nothing to disallow here.
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
