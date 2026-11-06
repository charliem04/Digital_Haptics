/**
 * Serialise structured data for a <script type="application/ld+json">.
 * Escapes "<" so no string inside (a post title, an FAQ answer) can
 * close the script tag early, even though every source is our own repo.
 */
export function jsonLd(data: unknown): { __html: string } {
  return { __html: JSON.stringify(data).replace(/</g, "\u003c") };
}
