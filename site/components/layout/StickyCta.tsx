"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
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
      <div
        aria-hidden
        className="h-[calc(57px+env(safe-area-inset-bottom))] bg-ink lg:hidden room:bg-surface"
      />
      <StickyBar cta={cta} className="fixed inset-x-0 bottom-0 z-40" />
    </>
  );
}

/** The bar itself, also shown in place on /styleguide. */
export function StickyBar({
  cta,
  className,
}: {
  cta: { href: string; label: string };
  className?: string;
}) {
  return (
    <div
      data-track-loc="sticky"
      className={cn(
        "border-t border-ink bg-signal pb-[env(safe-area-inset-bottom)] lg:hidden room:border-line room:bg-amber",
        className
      )}
    >
      <Button href={cta.href} block className="!min-h-[56px] !px-gutter-sm room:!rounded-none">
        {cta.label}
      </Button>
    </div>
  );
}
