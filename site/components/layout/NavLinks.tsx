"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavLink } from "@/lib/nav";

/**
 * Desktop nav links, as pills inside the header's glass track. Hover
 * lights a soft pill; the current section gets aria-current and a
 * brighter pill. Client-side only for the pathname.
 */
export function NavLinks({ links }: { links: NavLink[] }) {
  const pathname = usePathname() ?? "/";
  return (
    <ul className="flex items-center gap-1 font-body text-[1rem]">
      {links.map((l) => {
        // Section match (/work/ is current on /work/some-case/), but "/"
        // only matches itself or it would match every page.
        const current = pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
        return (
          <li key={l.href}>
            <Link
              href={l.href}
              aria-current={current ? "page" : undefined}
              className="inline-flex min-h-touch min-w-[44px] items-center justify-center rounded-control px-4 no-underline text-text transition-colors duration-[160ms] ease-brand hover:bg-text/10 active:text-muted aria-[current=page]:bg-text/[0.14]"
            >
              {l.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
