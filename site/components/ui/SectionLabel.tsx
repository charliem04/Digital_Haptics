import type { ReactNode } from "react";
import { cn, pad2 } from "@/lib/cn";

/**
 * Section micro-label (PLAN §4.4): `( 01 ) — WEB DESIGN · LOCAL SEO`.
 * Mono 12px, .16em, steel (6.46:1 on ice).
 */
export function SectionLabel({
  index,
  children,
  className,
}: {
  index?: number;
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("font-mono text-label uppercase tracking-label-lg text-steel", className)}>
      {index !== undefined && <>( {pad2(index)} ) — </>}
      {children}
    </p>
  );
}
