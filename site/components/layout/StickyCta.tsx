"use client";

import { useEffect, useState } from "react";
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
  // On Home the bar waits until the hero's own button has scrolled away,
  // so a phone never shows the same button twice (VISUAL_GUIDE §8).
  const [heroCtaVisible, setHeroCtaVisible] = useState(pathname === "/");

  useEffect(() => {
    const heroCta = document.querySelector("[data-hero-cta]");
    if (!heroCta) {
      setHeroCtaVisible(false);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setHeroCtaVisible(entry.isIntersecting),
      { rootMargin: "0px 0px -57px 0px" }
    );
    observer.observe(heroCta);
    return () => observer.disconnect();
  }, [pathname]);

  if (!cta || pathname.startsWith(cta.href.replace(/\/$/, ""))) return null;

  return (
    <>
      <div
        aria-hidden
        className="h-[calc(57px+env(safe-area-inset-bottom))] bg-ink lg:hidden room:bg-surface"
      />
      <StickyBar cta={cta} hidden={heroCtaVisible} className="fixed inset-x-0 bottom-0 z-40" />
    </>
  );
}

/** The bar itself, also shown in place on /styleguide. */
export function StickyBar({
  cta,
  hidden = false,
  className,
}: {
  cta: { href: string; label: string };
  /** Not shown or focusable. A <noscript> rule in the layout undoes it. */
  hidden?: boolean;
  className?: string;
}) {
  return (
    <div
      data-track-loc="sticky"
      data-sticky-waiting={hidden || undefined}
      className={cn(
        "border-t border-ink bg-signal pb-[env(safe-area-inset-bottom)] lg:hidden room:border-line room:bg-amber",
        hidden && "invisible",
        className
      )}
    >
      <Button href={cta.href} block className="!min-h-[56px] !px-gutter-sm room:!rounded-none">
        {cta.label}
      </Button>
    </div>
  );
}
