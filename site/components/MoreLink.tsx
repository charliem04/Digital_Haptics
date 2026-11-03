import Link from "next/link";
import { isLive } from "@/lib/routes";

/**
 * The funnel link that closes a home band. Each section carries its own
 * route onward rather than making the visitor go back up to the nav.
 *
 * It renders nothing when the destination is not built yet, so a
 * phase-2 page can be linked from everywhere it belongs today and
 * simply switch on when `live` flips in the route registry — no dead
 * links in the meantime, and no forgotten wiring later.
 *
 * That gate only makes sense for routes this site owns. Anything with a
 * scheme — mailto:, tel:, an outside URL — is not in the registry and
 * never will be, so gating it means the link silently disappears with
 * no error anywhere. Those are passed straight through instead.
 */
export function MoreLink({
  href,
  children,
  tone = "ink",
  className,
}: {
  href: string;
  children: React.ReactNode;
  tone?: "ink" | "deep";
  className?: string;
}) {
  // mailto:, tel:, https: — off-site, so the registry has no opinion.
  const external = /^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith("//");
  // Same-page anchors and the home page are always reachable; anything
  // else has to be a live route in the registry.
  const path = href.split("#")[0];
  const reachable =
    external || path === "" || path === "/" || isLive(path);
  if (!reachable) return null;

  // Signal is never text on a light ground (PLAN §4.1).
  const colors = tone === "deep" ? "text-ice" : "text-ink";

  return (
    <Link
      href={href}
      className={`group inline-flex min-h-touch items-center gap-2 font-mono text-label uppercase tracking-label no-underline ${colors} ${
        className ?? ""
      }`}
    >
      {children}
      <span
        aria-hidden
        className="transition-transform duration-150 group-hover:translate-x-0.5 group-hover:translate-y-0.5"
      >
        ↘
      </span>
    </Link>
  );
}
