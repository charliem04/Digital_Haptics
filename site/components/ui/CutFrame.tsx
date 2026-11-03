import type { CSSProperties, ElementType, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * ════════════════════════════════════════════════════════════════════
 *  CUT FRAME — 45° clipped corners (PLAN §4.4, REFACTOR_AUDIT §3.4).
 *
 *  The border is the mockup's wrapper technique: an outer ink layer with
 *  1px padding and the clip, and an inner fill layer with the SAME clip.
 *  A CSS border can't follow a clip-path; this can.
 *
 *  Focus (REFACTOR_AUDIT C10): clip-path also clips `outline`, so a
 *  normal focus ring disappears on anything inside a frame. With `ring`,
 *  the frame draws its own two-tone ring OUTSIDE the clip, following the
 *  cut: 2px signal next to the border, then 2px ink (16.5:1 on ice).
 *  It shows when the frame itself is focused (as a link) or when
 *  anything inside it is (an input).
 * ════════════════════════════════════════════════════════════════════
 */

export type CutSize = "sm" | "md" | "lg" | "xl";
export type Corner = "tl" | "tr" | "br" | "bl";

/** Top-left + bottom-right: the mockup's default pair. */
export const DEFAULT_CORNERS: readonly Corner[] = ["tl", "br"];

const FILLS = {
  frost: "bg-frost",
  white: "bg-white",
  ice: "bg-ice",
  "steel-panel": "bg-steel-panel",
  ink: "bg-ink",
  signal: "bg-signal",
} as const;

export type CutFill = keyof typeof FILLS;

/**
 * The clip-path polygon for a cut size and set of corners.
 *
 * `grow` is for the focus ring, which sits outside the frame: a 45° cut
 * pushed out by d pixels needs a cut about 0.59·d larger to stay
 * parallel, rounded up here.
 */
export function cutPath(size: CutSize, corners: readonly Corner[] = DEFAULT_CORNERS, grow = 0) {
  const s = grow ? `calc(var(--cut-${size}) + ${grow}px)` : `var(--cut-${size})`;
  const has = (c: Corner) => corners.includes(c);
  const pts: string[] = [];
  pts.push(has("tl") ? `${s} 0` : "0 0");
  if (has("tr")) pts.push(`calc(100% - ${s}) 0`, `100% ${s}`);
  else pts.push("100% 0");
  if (has("br")) pts.push(`100% calc(100% - ${s})`, `calc(100% - ${s}) 100%`);
  else pts.push("100% 100%");
  if (has("bl")) pts.push(`${s} 100%`, `0 calc(100% - ${s})`);
  else pts.push("0 100%");
  if (has("tl")) pts.push(`0 ${s}`);
  return `polygon(${pts.join(", ")})`;
}

type CutFrameProps = {
  size?: CutSize;
  corners?: readonly Corner[];
  fill?: CutFill;
  /** 1px ink border that follows the cut. */
  border?: boolean;
  /** Draw a focus ring that follows the cut (see header). */
  ring?: boolean;
  /** Element or component to render as the outer layer (e.g. next/link). */
  as?: ElementType;
  /** Classes for the innermost (fill) layer: padding, layout. */
  innerClassName?: string;
  children?: ReactNode;
  href?: string;
} & Omit<HTMLAttributes<HTMLElement>, "children">;

export function CutFrame({
  size = "md",
  corners = DEFAULT_CORNERS,
  fill = "frost",
  border = true,
  ring = false,
  as: Tag = "div",
  className,
  innerClassName,
  children,
  ...rest
}: CutFrameProps) {
  const clip: CSSProperties = { clipPath: cutPath(size, corners) };
  const inner = (
    <div className={cn("h-full", FILLS[fill], innerClassName)} style={clip}>
      {children}
    </div>
  );

  return (
    <Tag
      className={cn(
        "group/cut relative isolate",
        // The ring below replaces the global outline, which the clip
        // would cut off anyway.
        ring && "focus-visible:shadow-none focus-visible:outline-none",
        className
      )}
      {...rest}
    >
      {ring && (
        <>
          <span
            aria-hidden
            className="pointer-events-none absolute -inset-[4px] -z-10 bg-ink opacity-0 group-focus-visible/cut:opacity-100 group-has-[:focus-visible]/cut:opacity-100"
            style={{ clipPath: cutPath(size, corners, 3) }}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -inset-[2px] -z-10 bg-signal opacity-0 group-focus-visible/cut:opacity-100 group-has-[:focus-visible]/cut:opacity-100"
            style={{ clipPath: cutPath(size, corners, 1) }}
          />
        </>
      )}
      {border ? (
        <div className="h-full bg-ink p-px" style={clip}>
          {inner}
        </div>
      ) : (
        inner
      )}
    </Tag>
  );
}
