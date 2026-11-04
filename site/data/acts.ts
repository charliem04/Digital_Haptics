import type { FlagName } from "@/lib/flag-names";
import type { Act } from "@/content/types";

/**
 * Hero sidebar service items and footer lines (PLAN §4.5).
 *
 * Labels and flag states are PLAN §4.5 verbatim. The one-line blurbs
 * are the Hybrid mockup's copy, unchanged. Read through lib/content.ts,
 * which drops flagged items whose flag is off.
 */
export const acts: (Act & { flag?: FlagName })[] = [
  {
    code: "ACT.01",
    name: "Design",
    blurb: "Sites that look like the work you do: solid, square, built right.",
  },
  {
    code: "ACT.02",
    name: "Local SEO",
    blurb: "Found first when someone nearby searches for your trade.",
  },
  {
    code: "ACT.03",
    name: "Automate",
    blurb: "Every form and missed call gets a reply in seconds.",
    highlight: true,
    flag: "automations",
  },
];

/** The sidebar's footer line, per flag state (PLAN §4.5). */
export const actsFlowLine = {
  off: "( SEARCH ) → ( SITE ) → ( CALL )",
  on: "( FORM ) → ( SMS ) → ( BOOKED )",
};
