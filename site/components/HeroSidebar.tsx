import { CTA_HREF } from "@/lib/routes";
import { site } from "@/site.config";
import { cn } from "@/lib/cn";
import { getActs, getActsFlowLine } from "@/lib/content";
import { Button } from "./ui/Button";
import { BoxedLabel } from "./ui/BoxedLabel";
import { Marker } from "./ui/Marker";
import { cutPath } from "./ui/CutFrame";

/**
 * ════════════════════════════════════════════════════════════════════
 *  HERO SIDEBAR (PLAN §4.5, REFACTOR_AUDIT §3.6).
 *
 *  rail  Desktop (xl and up, R6): a 320px steel-panel column with a 1px
 *        ink left and bottom edge, an `xl` cut at the bottom-left and an
 *        8px marker where the cut meets the bottom edge. Holds the
 *        primary CTA, the ACT items and the flow line.
 *  band  Below xl: a full-width band under the hero with the ACT list.
 *        The hero body already carries the primary CTA there.
 *
 *  Flag off: ACT.01 + ACT.02, "( SEARCH ) → ( SITE ) → ( CALL )".
 *  Flag on:  adds ACT.03 — AUTOMATE (signal-filled) and
 *            "( FORM ) → ( SMS ) → ( BOOKED )". Both come from
 *  lib/content.ts, which filters by flag.
 * ════════════════════════════════════════════════════════════════════
 */
export function HeroSidebar({
  variant = "rail",
  ctaHref = CTA_HREF,
  className,
}: {
  variant?: "rail" | "band";
  /** Override only where the real destination can't be linked yet (styleguide). */
  ctaHref?: string;
  className?: string;
}) {
  const acts = getActs();
  const flowLine = getActsFlowLine();

  const list = (
    <ul
      className={cn(
        "font-mono",
        variant === "rail"
          ? "flex flex-col gap-10"
          : "grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3"
      )}
    >
      {acts.map((a) => (
        <li key={a.code} className="flex flex-col gap-1.5">
          <BoxedLabel active={a.highlight}>
            {a.code} — {a.name}
          </BoxedLabel>
          <p className="font-body text-body-xs text-steel-deep">{a.blurb}</p>
        </li>
      ))}
    </ul>
  );

  const footer = (
    <p className="border-t border-ink pt-5 font-mono text-label-sm tracking-label-sm text-steel">
      {flowLine}
    </p>
  );

  if (variant === "band") {
    // OPEN: mobile band color, ink or steel-panel (PLAN §10). Default
    // steel-panel, to match the desktop rail.
    return (
      <div className={cn("border-y border-ink bg-steel-panel", className)}>
        <div className="page-x flex flex-col gap-8 py-10">
          {list}
          {footer}
        </div>
      </div>
    );
  }

  const clip = { clipPath: cutPath("xl", ["bl"]) };

  // OPEN: whether the rail stays sticky while the hero scrolls
  // (PLAN §10). Default: not sticky.
  return (
    // No position class here: the caller places the rail (the hero pins
    // it absolute). The inner wrapper is the marker's positioned parent.
    <div className={cn("w-sidebar", className)} data-track-loc="hero-rail">
      <div className="relative h-full">
        {/* Edge layer: 1px ink on the left and bottom only (mockup). */}
        <div className="h-full bg-ink pb-px pl-px" style={clip}>
          <div
            className="flex h-full flex-col gap-16 bg-steel-panel px-8 pb-[calc(var(--cut-xl)+24px)] pt-6"
            style={clip}
          >
            <Button href={ctaHref} block className="!px-5">
              {site.cta.label}
            </Button>
            {list}
            {footer}
          </div>
        </div>
        {/* Marker centred where the cut meets the bottom edge. */}
        <Marker className="absolute -bottom-1 left-[calc(var(--cut-xl)-4px)]" />
      </div>
    </div>
  );
}
