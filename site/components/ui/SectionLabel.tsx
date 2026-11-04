import type { ReactNode } from "react";
import { cn, pad2 } from "@/lib/cn";

/**
 * Section micro-label (PLAN §4.4): `( 01 ) — WEB DESIGN · LOCAL SEO`.
 * Mono 12px, .16em. Steel on light grounds (6.46:1 on ice); `tone="ice"`
 * on ink slabs, where steel would fail (ice/70 is about 9:1).
 */
export function SectionLabel({
  index,
  tone = "steel",
  children,
  className,
}: {
  index?: number;
  tone?: "steel" | "ice";
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "font-mono text-label uppercase tracking-label-lg",
        tone === "ice" ? "text-ice/70" : "text-steel",
        className
      )}
    >
      {index !== undefined && <>( {pad2(index)} ) — </>}
      {children}
    </p>
  );
}
