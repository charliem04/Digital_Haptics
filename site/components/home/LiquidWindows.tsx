import { cn } from "@/lib/cn";

/**
 * Openings onto Home's fixed liquid layer. Decorative, with no text on
 * them. `data-liquid-opening` tells the renderer to keep running while
 * one is on screen and to pause when none are. Without WebGL they show
 * the static poster.
 */

/** A full-width break between two solid sections. */
export function LiquidBand() {
  return <div aria-hidden data-liquid-opening className="relative z-10 h-[42svh] min-h-[240px]" />;
}

/**
 * A rounded window inside a section. Its shadow paints the section's
 * fill around it (.liquid-cutout), so the section must be transparent,
 * clip its overflow and keep its content above this element.
 */
export function LiquidSideWindow({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      data-liquid-opening
      className={cn("liquid-cutout min-h-[280px] lg:min-h-[460px]", className)}
    />
  );
}
