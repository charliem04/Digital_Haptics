import { flags } from "@/lib/flags";
import { cn } from "@/lib/cn";
import { getLeadFlowSteps } from "@/lib/content";
import { CutFrame } from "./ui/CutFrame";
import { Marker } from "./ui/Marker";
import { LeadFlowRows } from "./LeadFlowRows";

/**
 * ════════════════════════════════════════════════════════════════════
 *  LEAD-FLOW PANEL — 🚩 FLAGGED (FEATURE_AUTOMATIONS), PLAN §4.5.
 *
 *  Flag off: renders nothing. PLAN §5's off state for every placement
 *  (hero, thank-you page) is "no lead-flow panel".
 *
 *  Flag on: a 250px frost `md` cut panel. LEAD_FLOW header with a live
 *  dot, then 01 FORM RECEIVED / 02 TEXT SENT / 03 OWNER ALERTED /
 *  04 JOB BOOKED, the last row signal-filled.
 *
 *  This part is a server component on purpose: it checks the flag and
 *  hands the rows to the small client part that animates them, so a
 *  flag-off build ships none of this copy in its JavaScript.
 * ════════════════════════════════════════════════════════════════════
 */
export function LeadFlowPanel({ className }: { className?: string }) {
  const steps = getLeadFlowSteps();
  if (!flags.automations || steps.length === 0) return null;

  return (
    <CutFrame
      size="md"
      fill="frost"
      className={cn("w-[250px]", className)}
      innerClassName="flex flex-col gap-2.5 px-[18px] pb-[18px] pt-4 font-mono text-label-sm uppercase tracking-label-xs"
    >
      <div className="flex justify-between border-b border-ink pb-2">
        <span className="font-medium">Lead_flow</span>
        <span className="flex items-center gap-1.5">
          <Marker size="dot" />
          Live
        </span>
      </div>
      <LeadFlowRows steps={steps} />
    </CutFrame>
  );
}
