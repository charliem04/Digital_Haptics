import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";
import type { LeadFlowStep } from "@/content/types";

/**
 * The lead-flow rows, sequencing in once (PLAN §4.6). CSS only
 * (.lead-flow in app/motion.css), so flag-off pages load no animation
 * library for a panel they never render. Still under reduced motion.
 * Only ever rendered by <LeadFlowPanel>, which owns the flag check.
 */
export function LeadFlowRows({ steps }: { steps: LeadFlowStep[] }) {
  const last = steps.length - 1;

  return (
    <ol className="lead-flow flex flex-col gap-2.5">
      {steps.map((s, i) => (
        <li
          key={s.key}
          style={{ "--i": i } as CSSProperties}
          className={cn(
            "flex justify-between",
            i === last && "-mx-1.5 px-1.5 py-1 rounded-notice bg-amber text-on-amber"
          )}
        >
          <span className={i === last ? undefined : "text-muted"}>{s.key}</span>
          <span className={i === last ? "font-medium" : undefined}>{s.value}</span>
        </li>
      ))}
    </ol>
  );
}
