import type { Metadata } from "next";
import { site } from "@/site.config";
import { IS_PREVIEW } from "@/lib/preview";
import type { PageMeta } from "@/content/types";

/**
 * Robots directive for a page that sets its own index policy (legal
 * pages, 404, flagged pages). Preview builds are always noindex.
 */
export function robotsFor(index: boolean): NonNullable<Metadata["robots"]> {
  if (IS_PREVIEW) return { index: false, follow: false };
  // noindex, follow: keep the page out of results but let its links count.
  return { index, follow: true };
}

/** A site-absolute path as a full URL; absolute URLs pass through. */
export function absoluteUrl(pathOrUrl: string): string {
  return /^https?:\/\//.test(pathOrUrl) ? pathOrUrl : `${site.url}${pathOrUrl}`;
}

/**
 * Per-page <head>, built from one PageMeta so title, description,
 * canonical and OG can't disagree. The site name is appended by the
 * title template in app/layout.tsx.
 */
export function pageMetadata(
  meta: PageMeta,
  /** Keep the page out of the index (flagged or not-yet-live pages). */
  opts: { noindex?: boolean } = {}
): Metadata {
  return {
    title: meta.title,
    ...(opts.noindex || IS_PREVIEW ? { robots: { index: false, follow: false } } : {}),
    description: meta.description,
    alternates: { canonical: absoluteUrl(meta.path) },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: absoluteUrl(meta.path),
      siteName: site.name,
      images: [{ url: site.seo.ogImage, width: 1200, height: 630 }],
      type: "website",
    },
  };
}
