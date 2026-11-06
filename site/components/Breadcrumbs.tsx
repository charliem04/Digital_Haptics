import { jsonLd } from "@/lib/json-ld";
import Link from "next/link";
import { site } from "@/site.config";
import { trailFor } from "@/lib/routes";

/**
 * Trail derived from the route registry, so it cannot disagree with the
 * nav. Emits BreadcrumbList structured data alongside it — the same
 * trail, stated twice, once for people and once for crawlers.
 */
export function Breadcrumbs({ path, leafLabel }: { path: string; leafLabel?: string }) {
  const trail = trailFor(path, leafLabel);
  if (trail.length < 2) return null;

  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.label,
      item: `${site.url}${t.href}`,
    })),
  };

  return (
    <>
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 p-0 font-mono text-label uppercase tracking-label text-steel">
          {trail.map((t, i) => {
            const last = i === trail.length - 1;
            return (
              <li key={t.href} className="flex items-center gap-2">
                {last ? (
                  <span aria-current="page" className="text-ink">
                    {t.label}
                  </span>
                ) : (
                  <Link
                    href={t.href}
                    className="no-underline underline-offset-4 hover:text-ink hover:underline active:text-steel-deep"
                  >
                    {t.label}
                  </Link>
                )}
                {!last && (
                  <span aria-hidden className="text-steel">
                    /
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(data)} />
    </>
  );
}
