import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { SectionLabel } from "@/components/ui/SectionLabel";

/**
 * A section's label + heading (+ lede). The heading carries `id`, so
 * the <section> can point aria-labelledby at it.
 */
export function SectionHead({
  id,
  index,
  label,
  title,
  lede,
  tone = "light",
  className,
}: {
  id: string;
  index?: number;
  label: ReactNode;
  title: ReactNode;
  lede?: ReactNode;
  /** "dark" on an ink slab: the label goes ice/70 (steel fails on ink). */
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <SectionLabel index={index} tone={tone === "dark" ? "ice" : "steel"}>
        {label}
      </SectionLabel>
      <h2 id={id} className="max-w-[24ch] font-display text-heading font-semibold">
        {title}
      </h2>
      {lede && (
        <p
          className={cn(
            "max-w-[640px] text-body",
            tone === "dark" ? "text-ice/70" : "text-steel-deep"
          )}
        >
          {lede}
        </p>
      )}
    </div>
  );
}
