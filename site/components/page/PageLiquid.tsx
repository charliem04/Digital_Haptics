import { LiquidBackdrop } from "@/components/home/liquid/LiquidBackdrop";

/** How much of the page colour lies over the liquid. */
export const PAGE_LIQUID_DIM = 0.7;

/**
 * ════════════════════════════════════════════════════════════════════
 *  PAGE LIQUID: Home's live liquid behind the main inner pages, dimmed
 *  (owner's pick, 2026-11-25), so the whole site shares one background.
 *
 *  The same renderer, colours and motion as Home (LiquidBackdrop): it
 *  loads after the page is idle, never holds up the headline, and falls
 *  back to the still poster with reduced motion or no WebGL2.
 *
 *  Dimmed with the page colour at 70%: the lightest level where muted
 *  text on it still reads at 4.5:1 or better over the liquid's brightest
 *  amber, so the inner pages' headings and leads stay readable.
 *
 *  Fixed behind everything (z-index -10). It marks itself as a liquid
 *  opening, so the liquid runs for as long as the page is open.
 * ════════════════════════════════════════════════════════════════════
 */
export function PageLiquid() {
  return (
    <div aria-hidden data-liquid-opening className="pointer-events-none fixed inset-0 -z-10">
      <LiquidBackdrop />
      <div
        className="absolute inset-0"
        style={{ backgroundColor: `rgb(var(--room) / ${PAGE_LIQUID_DIM})` }}
      />
    </div>
  );
}
