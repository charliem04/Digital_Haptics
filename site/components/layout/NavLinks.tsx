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
    <ul className="flex items-center gap-8 font-body text-[1rem]">
      {links.map((l) => {
        // Section match (/work/ is current on /work/some-case/), but "/"
        // only matches itself or it would match every page.
        const current = pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
        return (
          <li key={l.href}>
            <Link
              href={l.href}
              aria-current={current ? "page" : undefined}
              className="relative inline-flex min-h-touch min-w-[44px] items-center justify-center no-underline after:absolute after:inset-x-0 after:bottom-2 after:h-[2px] after:origin-left after:scale-x-0 after:transition-transform after:ease-brand hover:after:scale-x-100 aria-[current=page]:after:scale-x-100 text-text after:bg-amber after:duration-[160ms] active:text-muted"
            >
              {l.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
