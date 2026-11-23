import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { SectionLabel } from "@/components/ui/SectionLabel";

/**
 * A section's label + heading (+ lede). The heading carries `id`, so
 * the <section> can point aria-labelledby at it.
 */
export function SectionHead({
  id,
  label,
  title,
  lede,
  className,
}: {
  id: string;
  label: ReactNode;
  title: ReactNode;
  lede?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <SectionLabel>{label}</SectionLabel>
      <h2 id={id} className="max-w-[15.024em] font-body text-room-section font-medium">
        {title}
      </h2>
      {lede && <p className="max-w-[640px] text-room-body text-muted">{lede}</p>}
    </div>
  );
}
