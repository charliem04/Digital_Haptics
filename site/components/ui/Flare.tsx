import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

/**
 * ════════════════════════════════════════════════════════════════════
 *  FLARE CROSSHAIR — hero only (PLAN §4.4, REFACTOR_AUDIT §3.5).
 *
 *  A 2px vertical and a 1px horizontal signal line with a soft glow,
 *  and a glowing node where they cross. Purely decorative: aria-hidden,
 *  pointer-events off. It fills its nearest positioned ancestor.
 *
 *  Positions are CSS lengths, so the hero can move the crossing per
 *  breakpoint with its own custom properties:
 *    x     left edge of the vertical line
 *    y     top edge of the horizontal line
 *    vEnd  where the vertical line stops (from the top)
 *    hEnd  inset of the horizontal line from the right, so it can stop
 *          at the sidebar edge as in the mockup
 *
 *  The glow pulses slowly (motion-safe only). The node is the one round
 *  shape on the site (decision D4): a light source, not UI.
 * ════════════════════════════════════════════════════════════════════
 */
export function Flare({
  x,
  y,
  vEnd = "100%",
  hEnd = "0px",
  className,
}: {
  x: string;
  y: string;
  vEnd?: string;
  hEnd?: string;
  className?: string;
}) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0", className)}>
      <span
        className="absolute top-0 w-[2px] bg-signal shadow-flare-v motion-safe:animate-flare-pulse"
        style={{ left: x, height: vEnd } as CSSProperties}
      />
      <span
        className="absolute left-0 h-px bg-signal shadow-flare-h motion-safe:animate-flare-pulse"
        style={{ top: y, right: hEnd } as CSSProperties}
      />
      <span
        className="absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-flare bg-flare-core shadow-flare-node"
        // Centre the node on the crossing: the lines are 2px and 1px.
        style={{ left: `calc(${x} + 1px)`, top: `calc(${y} + 0.5px)` } as CSSProperties}
      />
    </div>
  );
}
