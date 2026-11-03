"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavLink } from "@/lib/nav";

/**
 * Desktop nav links: mono 12px, .12em, 36px apart (mockup). The current
 * section gets aria-current and a 2px signal bar under it; hover shows
 * the same bar. Client-side only for the pathname.
 */
export function NavLinks({ links }: { links: NavLink[] }) {
  const pathname = usePathname() ?? "/";
  return (
    <ul className="flex items-center gap-9 font-mono text-label uppercase tracking-label">
      {links.map((l) => {
        // Section match (/work/ is current on /work/some-case/), but "/"
        // only matches itself or it would match every page.
        const current = pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
        return (
          <li key={l.href}>
            <Link
              href={l.href}
              aria-current={current ? "page" : undefined}
              className="relative inline-flex min-h-touch items-center text-ink no-underline after:absolute after:inset-x-0 after:bottom-2 after:h-[2px] after:origin-left after:scale-x-0 after:bg-signal after:transition-transform after:duration-[250ms] after:ease-brand hover:after:scale-x-100 active:text-steel-deep aria-[current=page]:after:scale-x-100"
            >
              {l.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
