"use client";

import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";

/**
 * Mobile sticky CTA (PLAN §4.5): a bottom-pinned "Start a Project ↘"
 * bar below lg, on every page except /start (where the form already
 * is). Pads for the iPhone home indicator.
 *
 * The spacer reserves the bar's height (56px + its 1px top rule) at the end of the page, so the
 * bar never covers the last lines of the footer.
 *
 * Rendered only when /start is live (the layout passes null otherwise).
 */
export function StickyCta({ cta }: { cta: { href: string; label: string } | null }) {
  const pathname = usePathname() ?? "/";
  if (!cta || pathname.startsWith(cta.href.replace(/\/$/, ""))) return null;

  return (
    <>
      <div aria-hidden className="h-[calc(57px+env(safe-area-inset-bottom))] bg-ink lg:hidden" />
      <div
        data-track-loc="sticky"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-ink bg-signal pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        <Button href={cta.href} block className="!min-h-[56px] !px-gutter-sm">
          {cta.label}
        </Button>
      </div>
    </>
  );
}
