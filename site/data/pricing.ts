import type { FlagName } from "@/lib/flag-names";

/**
 * Pricing page (PLAN §5). No tiers. Figures stay [PRICE] until you set
 * them (PLAN: never invent prices). The per-service "from" lines live
 * on each service in data/services.ts.
 */
export const quoteFactors: { label: string; flag?: FlagName }[] = [
  { label: "How many pages the site needs" },
  { label: "Integrations, such as booking, payments or a CRM" },
  { label: "How much help you want with content and copywriting" },
  { label: "How many locations or service areas you cover" },
  { label: "Which automation modules you add", flag: "automations" },
];

export const quoteStatement = "Every project is quoted after a short call.";
