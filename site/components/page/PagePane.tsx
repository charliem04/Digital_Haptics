import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { GlassPane } from "@/components/ui/GlassPane";

/**
 * One section of a main inner page as a frosted glass pane, the same
 * block Home is built from. It fades in with the widget cascade.
 *
 * Named by its heading (`labelledBy`, the SectionHead id) or, when it has
 * no heading of its own, by `label`.
 */
export function PagePane({
  labelledBy,
  label,
  track,
  className,
  innerClassName,
  children,
}: {
  labelledBy?: string;
  label?: string;
  track?: string;
  className?: string;
  innerClassName?: string;
  children: ReactNode;
}) {
  return (
    <section
      aria-labelledby={labelledBy}
      aria-label={labelledBy ? undefined : label}
      data-track-loc={track}
      className={cn("min-w-0", className)}
    >
      <GlassPane
        widget
        className="h-full"
        innerClassName={cn("flex h-full flex-col gap-8 p-6 lg:p-10", innerClassName)}
      >
        {children}
      </GlassPane>
    </section>
  );
}

/** The stack of panes under a PageHero, with room above the footer. */
export function PaneStack({ children }: { children: ReactNode }) {
  return (
    <div className="page-x relative z-10 flex flex-col gap-6 pb-32 lg:gap-8 lg:pb-[clamp(160px,22vh,260px)]">
      {children}
    </div>
  );
}
