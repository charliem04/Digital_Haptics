import { flags } from "@/lib/flags";
import { cn } from "@/lib/cn";
import { getLeadFlowSteps } from "@/lib/content";
import { Panel } from "./ui/Panel";
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
    <Panel
      fill="raised"
      className={cn("w-[250px]", className)}
      innerClassName="flex flex-col gap-2.5 px-[18px] pb-[18px] pt-4 !bg-raised font-body text-room-small"
    >
      <div className="flex justify-between border-b pb-2 border-line">
        <span className="font-medium">Lead_flow</span>
        <span className="flex items-center gap-1.5">Live</span>
      </div>
      <LeadFlowRows steps={steps} />
    </Panel>
  );
}
