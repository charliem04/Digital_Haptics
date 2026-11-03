import type { LeadFlowStep } from "@/content/types";

/**
 * Lead-flow panel rows (PLAN §4.5, 🚩 FEATURE_AUTOMATIONS). Split into
 * key and value as the mockup sets them: 01 FORM · RECEIVED.
 */
export const leadFlowSteps: LeadFlowStep[] = [
  { key: "01 Form", value: "Received" },
  { key: "02 Text", value: "Sent" },
  { key: "03 Owner", value: "Alerted" },
  { key: "04 Job", value: "Booked" },
];
