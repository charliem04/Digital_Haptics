import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { RAMP } from "@/components/home/liquid/params";
import { posterBackground } from "@/components/home/liquid/poster";

/** Mass position and size for each page, so no two look the same. */
const COMPOSITIONS = {
  ember: { a: ["38%", "42%", "62%", "62%"], b: ["22%", "26%", "22%", "30%"] },
  rise: { a: ["34%", "40%", "42%", "72%"], b: ["24%", "22%", "76%", "32%"] },
  pool: { a: ["44%", "30%", "52%", "78%"], b: ["18%", "28%", "28%", "28%"] },
  arc: { a: ["30%", "48%", "72%", "46%"], b: ["26%", "20%", "30%", "72%"] },
  // The page glow: one mass up by the hero, one low on the other side.
  glow: { a: ["40%", "36%", "84%", "14%"], b: ["30%", "30%", "10%", "86%"] },
} as const;

export type MoltenComposition = keyof typeof COMPOSITIONS;

const layer = ([lw, lh, lx, ly]: readonly string[]) =>
  ({
    "--lw": lw,
    "--lh": lh,
    "--lx": lx,
    "--ly": ly,
    backgroundImage: posterBackground(RAMP),
  }) as CSSProperties;

/**
 * A slowly drifting view of the liquid for inner pages. CSS only, so those
 * pages stay free of WebGL (VISUAL_GUIDE §6.2). Decorative, and it pauses
 * while off screen.
 */
export function MoltenArt({
  composition = "ember",
  className,
}: {
  composition?: MoltenComposition;
  className?: string;
}) {
  const c = COMPOSITIONS[composition];
  return (
    <div aria-hidden data-motion-live="" className={cn("molten-art", className)}>
      <span style={layer(c.a)} />
      <span style={layer(c.b)} />
    </div>
  );
}

/**
 * The molten glow behind a main inner page (Work, Services, Pricing,
 * About...). Fixed to the viewport and dimmed, so the glass panes over it
 * have something to frost and bend, like Home's liquid but quieter. CSS
 * only: inner pages stay free of WebGL (VISUAL_GUIDE §6.2). Blog and
 * legal pages don't use it.
 */
export function PageGlow() {
  const c = COMPOSITIONS.glow;
  return (
    <div aria-hidden data-motion-live="" className="page-glow">
      {/* A cool wash of the liquid's blue-grey (deep teal, teal, sage)
          across the middle of the page, under the warm masses. */}
      <span className="page-glow-cool" style={{ backgroundImage: COOL }} />
      <span className="page-glow-warm" style={layer(c.a)} />
      <span className="page-glow-warm" style={layer(c.b)} />
    </div>
  );
}

const [, DEEP_TEAL, TEAL, SAGE] = RAMP.map((s) => s.color);
const COOL =
  `radial-gradient(55% 45% at 30% 42%, ${SAGE} 0%, ${TEAL} 38%, transparent 72%), ` +
  `radial-gradient(50% 50% at 74% 66%, ${TEAL} 0%, ${DEEP_TEAL} 45%, transparent 78%)`;
