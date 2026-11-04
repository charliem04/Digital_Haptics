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

// OPEN: timeline options (CONTENT_TODO.md). These defaults ask when,
// not how much, so they claim nothing.
export const timelines: Option[] = [
  { value: "asap", label: "As soon as possible" },
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

/**
 * Budget ranges are prices, which PLAN says never to invent. Empty
 * hides the (optional) budget field until you provide the ranges
 * (CONTENT_TODO.md).
 */
export const budgets: Option[] = [];
