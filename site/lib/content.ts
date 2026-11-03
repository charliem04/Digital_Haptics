/**
 * ════════════════════════════════════════════════════════════════════
 *  CONTENT LOADER — the only door to content.
 *
 *  Pages and components import content through here, never from
 *  data/* or content/* directly, so the storage can change (TS module,
 *  MDX, a CMS) without touching a component. Every getter returns the
 *  shapes in content/types.ts.
 *
 *  Layout per PLAN §6:
 *    data/*.ts          typed data: services, cities, FAQ, form options
 *    content/work/*.mdx case studies
 *    content/blog/*.mdx blog posts
 *
 *  Getters are added with the pages that read them (Phase 3 onward).
 *  Flag filtering happens here, so a flagged item (the Automations
 *  service, for example) never reaches a page with its flag off.
 * ════════════════════════════════════════════════════════════════════
 */
import { flags, isOn } from "@/lib/flags";
import { acts, actsFlowLine } from "@/data/acts";
import { leadFlowSteps } from "@/data/leadFlow";
import type { Act, LeadFlowStep } from "@/content/types";

/** Hero sidebar items, with flagged ones removed when their flag is off. */
export function getActs(): Act[] {
  return acts.filter((a) => isOn(a.flag)).map(({ flag: _flag, ...act }) => act);
}

/** The sidebar footer line for this build's flag state. */
export function getActsFlowLine(): string {
  return flags.automations ? actsFlowLine.on : actsFlowLine.off;
}

/** Lead-flow rows. Empty with the flag off, so nothing can render them. */
export function getLeadFlowSteps(): LeadFlowStep[] {
  return flags.automations ? leadFlowSteps : [];
}
