/**
 * ════════════════════════════════════════════════════════════════════
 *  NAV DATA — what the header, mobile menu, footer and sticky CTA show.
 *
 *  Built from the route registry (lib/routes.ts) on the server, as
 *  plain data. Only live links, with flagged ones already removed, so
 *  the client components that render them never import the registry.
 *  That matters for flags: the registry names every flagged page, and
 *  anything a client component imports ships in its JavaScript.
 *
 *  A link appears the moment its page goes `live` in the registry;
 *  nothing here needs editing per phase.
 * ════════════════════════════════════════════════════════════════════
 */
import { site } from "@/site.config";
import { CTA_HREF, auxRoutes, citySlug, isLive, liveChildren, liveNav } from "./routes";

export type NavLink = { href: string; label: string; children?: NavLink[] };

export type ContactLinks = {
  phone?: { display: string; href: string };
  email?: { display: string; href: string };
};

const real = (v: string) => v !== "" && !v.includes("[PLACEHOLDER");

/** Header items: Work · Services · Pricing · About (PLAN §3), live only. */
export function headerLinks(): NavLink[] {
  return liveNav().map((n) => ({
    href: n.href,
    label: n.label,
    children: liveChildren(n).map((c) => ({ href: c.href, label: c.label })),
  }));
}

/** The primary CTA, or null while /start isn't built (no dead links). */
export function ctaLink(): { href: string; label: string } | null {
  return isLive(CTA_HREF) ? { href: CTA_HREF, label: site.cta.label } : null;
}

/** Phone and email, skipping any still-placeholder value. */
export function contactLinks(): ContactLinks {
  return {
    ...(site.phone.e164 && real(site.phone.display)
      ? { phone: { display: site.phone.display, href: `tel:${site.phone.e164}` } }
      : {}),
    ...(real(site.email) ? { email: { display: site.email, href: `mailto:${site.email}` } } : {}),
  };
}

export type FooterData = {
  /** Core pages and Blog (PLAN §3), live only. */
  site: NavLink[];
  /** Service sub-pages, live only. */
  services: NavLink[];
  /** Every service-area city; `href` only once its page is live. */
  areas: { label: string; href?: string }[];
  areaLabel: string;
  contact: ContactLinks;
  legal: NavLink[];
  copyright: string;
};

/** Footer contents (PLAN §3): core pages, Blog, cities, contact, legal, ©. */
export function footerData(): FooterData {
  const nav = liveNav();
  const aux = (href: string) => auxRoutes.find((r) => r.href === href);
  const link = (href: string): NavLink[] => {
    const r = aux(href);
    return r && isLive(href) ? [{ href, label: r.label }] : [];
  };

  const services = nav.flatMap((n) =>
    liveChildren(n).map((c) => ({ href: c.href, label: c.label }))
  );

  const year = new Date().getFullYear();
  const owner = real(site.legalName) ? site.legalName : site.name;

  return {
    site: [
      ...nav.map((n) => ({ href: n.href, label: n.label })),
      ...link(CTA_HREF),
      ...link("/blog/"),
    ],
    services,
    areas: site.serviceArea.cities.map((city) => {
      const href = `/areas/${citySlug(city)}/`;
      return isLive(href) ? { label: city, href } : { label: city };
    }),
    areaLabel: site.serviceArea.label,
    contact: contactLinks(),
    legal: [...link("/privacy/"), ...link("/terms/")],
    copyright: `© ${year} ${owner}`,
  };
}
