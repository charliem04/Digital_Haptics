import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Mono uppercase label in a 1px ink box (PLAN §4.4), e.g. ACT.01 — DESIGN.
 *
 *   size sm   11px, .08em, padding 4/8     (hero sidebar)
 *   size md   12px 500, .14em, padding 6/10 (type tile)
 *   active    signal fill, ink text (6.24:1). The highlighted one only.
 *   tone ink  ink slab, ice text, .16em    (the mockup's SYSTEM D tag)
 *
 * Not interactive. For a filter control use <ChipButton>.
 */
export function BoxedLabel({
  children,
  size = "sm",
  active = false,
  tone = "outline",
  className,
}: {
  children: ReactNode;
  size?: "sm" | "md";
  active?: boolean;
  tone?: "outline" | "ink";
  className?: string;
}) {
  const sizing =
    tone === "ink"
      ? "px-3 py-1.5 text-label-sm tracking-label-lg"
      : size === "md"
        ? "px-2.5 py-1.5 text-label font-medium tracking-label-md"
        : "px-2 py-1 text-label-sm tracking-label-xs";
  const colors =
    tone === "ink"
      ? "border-ink bg-ink text-ice"
      : active
        ? "border-signal bg-signal text-ink"
        : "border-ink text-ink";

  return (
    <span
      className={cn(
        "inline-block self-start border font-mono uppercase leading-[1.7]",
        sizing,
        colors,
        className
      )}
    >
      {children}
    </span>
  );
}
