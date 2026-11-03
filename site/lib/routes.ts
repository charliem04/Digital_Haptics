/**
 * ════════════════════════════════════════════════════════════════════
 *  ROUTE REGISTRY — one source of truth for nav, footer, sitemap,
 *  breadcrumbs and robots.
 *
 *  A route is reachable only when it is `live` AND its `flag` (if any)
 *  is on. Everything that links, lists or indexes a page asks
 *  isLive()/isIndexable() here, so one switch hides a page everywhere:
 *
 *    · `live: false`  the page isn't built yet (phase work).
 *    · `flag`         the page is built but hidden behind a feature
 *                     flag (PLAN §2.1). With the flag off it is absent
 *                     from nav, footer, internal links, sitemap and
 *                     JSON-LD, and the page itself is not emitted.
 *
 *  A child inherits its parent's flag. scripts/routes.mjs fails the
 *  build on any internal link to a page that wasn't emitted, which is
 *  the backstop for anything this misses.
 * ════════════════════════════════════════════════════════════════════
 */
import { site } from "@/site.config";
import { isOn, type FlagName } from "./flags";

export type RouteNode = {
  href: string;
  label: string;
  /** Built and ready to link. */
  live: boolean;
  /** Hidden unless this feature flag is on. Children inherit it. */
  flag?: FlagName;
  children?: RouteNode[];
  /** Sitemap weight. */
  priority?: number;
  /**
   * Built and linked, but kept out of search: out of the sitemap and
   * sent noindex, from this one flag (legal pages, thank-you page).
   */
  noindex?: boolean;
};

/** Where every primary call to action goes (PLAN §3). */
export const CTA_HREF = site.cta.href;

/** "New Iberia" → "new-iberia". */
export const citySlug = (city: string) =>
  city
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/**
 * Header navigation (PLAN §3): Work · Services · Pricing · About, with
 * "Start a Project" as the separate primary button.
 */
export const nav: RouteNode[] = [
  { href: "/work/", label: "Work", live: false, priority: 0.9 },
  {
    href: "/services/",
    label: "Services",
    live: false,
    priority: 0.9,
    children: [
      { href: "/services/web-design/", label: "Web Design", live: false, priority: 0.8 },
      { href: "/services/local-seo/", label: "Local SEO", live: false, priority: 0.8 },
      {
        href: "/services/automations/",
        label: "Automations",
        live: false,
        flag: "automations",
        priority: 0.8,
      },
    ],
  },
  { href: "/pricing/", label: "Pricing", live: false, priority: 0.8 },
  { href: "/about/", label: "About", live: false, priority: 0.7 },
];

/** Routes that exist but aren't header items. */
export const auxRoutes: RouteNode[] = [
  { href: "/start/", label: "Start a Project", live: false, priority: 0.9 },
  { href: "/start/thanks/", label: "Thank you", live: false, noindex: true },
  { href: "/blog/", label: "Blog", live: false, priority: 0.6 },
  ...site.serviceArea.cities.map(
    (city): RouteNode => ({
      href: `/areas/${citySlug(city)}/`,
      label: city,
      // Each city goes live only once it has unique content (PLAN §5).
      live: false,
      priority: 0.7,
    })
  ),
  { href: "/privacy/", label: "Privacy policy", live: true, noindex: true },
  { href: "/terms/", label: "Terms of service", live: true, noindex: true },
];

type Found = { node: RouteNode; parent?: RouteNode };

function find(href: string): Found | undefined {
  for (const node of [...nav, ...auxRoutes]) {
    if (node.href === href) return { node };
    const child = node.children?.find((c) => c.href === href);
    if (child) return { node: child, parent: node };
  }
  return undefined;
}

/** Live and not switched off by its own or its parent's flag. */
function reachable({ node, parent }: Found): boolean {
  return node.live && isOn(node.flag) && (!parent || isOn(parent.flag));
}

/** May anything link to this path? */
export function isLive(href: string): boolean {
  const found = find(href);
  return found ? reachable(found) : false;
}

/** Children a nav item should actually render. */
export function liveChildren(node: RouteNode): RouteNode[] {
  if (!isOn(node.flag)) return [];
  return (node.children ?? []).filter((c) => c.live && isOn(c.flag));
}

/** Header items that are actually reachable. */
export function liveNav(): RouteNode[] {
  return nav.filter((n) => n.live && isOn(n.flag));
}

/**
 * Should this path be indexed? Pages read this for their robots meta,
 * so the tag and the sitemap can never disagree.
 */
export function isIndexable(href: string): boolean {
  const found = find(href);
  return found ? reachable(found) && !found.node.noindex : false;
}

/** Every path the sitemap lists: reachable, indexable, no anchors. */
export function livePaths(): { path: string; priority: number }[] {
  const out: { path: string; priority: number }[] = [{ path: "/", priority: 1 }];
  const walk = (nodes: RouteNode[], parent?: RouteNode) => {
    for (const n of nodes) {
      if (reachable({ node: n, parent }) && !n.noindex && !n.href.includes("#")) {
        out.push({ path: n.href, priority: n.priority ?? 0.5 });
      }
      if (n.children) walk(n.children, n);
    }
  };
  walk(nav);
  walk(auxRoutes);
  return out;
}

/**
 * Breadcrumb trail for a path, derived from the registry.
 *
 * `leafLabel` is for pages generated per content item (a case study, a
 * blog post) that the registry can't name: they hang off the longest
 * registered path that prefixes them.
 */
export function trailFor(
  path: string,
  leafLabel?: string
): { href: string; label: string }[] {
  const trail = [{ href: "/", label: "Home" }];

  const exact = find(path);
  if (exact) {
    if (exact.parent) trail.push({ href: exact.parent.href, label: exact.parent.label });
    trail.push({ href: exact.node.href, label: exact.node.label });
    return trail;
  }

  if (!leafLabel) return trail;

  let best: Found | undefined;
  for (const node of [...nav, ...auxRoutes]) {
    for (const cand of [node, ...(node.children ?? [])]) {
      if (cand.href === "/" || !path.startsWith(cand.href)) continue;
      if (best && cand.href.length <= best.node.href.length) continue;
      best = { node: cand, parent: cand === node ? undefined : node };
    }
  }
  if (!best) return trail;

  if (best.parent) trail.push({ href: best.parent.href, label: best.parent.label });
  trail.push({ href: best.node.href, label: best.node.label });
  trail.push({ href: path, label: leafLabel });
  return trail;
}
