import type { Option } from "@/content/types";

/** Intake form options (PLAN §5, /start). Read through lib/content.ts. */

/** PLAN §1's trades, plus Other. */
export const trades: Option[] = [
  { value: "roofing", label: "Roofing" },
  { value: "plumbing", label: "Plumbing" },
  { value: "hvac", label: "HVAC" },
  { value: "contracting", label: "General contracting" },
  { value: "dirt-work", label: "Dirt work" },
  { value: "other", label: "Other" },
];

/** Charles's options (QUESTIONS.md §12). */
export const timelines: Option[] = [
  { value: "asap", label: "As soon as possible" },
  { value: "2-weeks", label: "Within 2 weeks" },
  { value: "1-3-months", label: "In the next 1–3 months" },
  { value: "later", label: "Later this year" },
  { value: "exploring", label: "Just exploring" },
];

/**
 * 🚩 FEATURE_AUTOMATIONS: SMS consent on the intake form (PLAN §5, §7).
 * Passed to the form only when the flag is on. DRAFT wording: have it
 * checked against your SMS provider's and carrier requirements before
 * Phase 7 turns texting on (CONTENT_TODO.md).
 */
export const smsConsent = {
  legend: "Text messages",
  label:
    "I agree to receive text messages from Digital Haptics about my inquiry. Message and data rates may apply. Reply STOP to opt out, HELP for help.",
  error: "Tick the box to agree to texts.",
};

/** Charles's ranges (QUESTIONS.md §11). Optional field on the form. */
export const budgets: Option[] = [
  { value: "under-1k", label: "Under $1k" },
  { value: "1k-2k", label: "$1k–$2k" },
  { value: "2k-5k", label: "$2k–$5k" },
  { value: "5k-10k", label: "$5k–$10k" },
  { value: "10k-plus", label: "$10k+" },
];
