/**
 * 🚩 FEATURE_AUTOMATIONS_DEMO — the messages the demo plays (PLAN §7).
 *
 * The lead is fake and the business is fictional ("Demo Plumbing Co.",
 * not a client). Every message says it's a demo (PLAN §7, required).
 * Returned by worker/demo.ts; the page also passes them to the demo UI
 * as its local-dev mock, only in builds with the flag on.
 *
 * `at` is seconds after submit, for the UI's timeline. DRAFT COPY.
 */
export type DemoMessage = {
  at: number;
  /** Who receives it: the visitor (as the customer) or the owner. */
  to: "customer" | "owner";
  body: string;
};

export const demoSequence: DemoMessage[] = [
  {
    at: 0,
    to: "customer",
    body: "Demo Plumbing Co.: Thanks for reaching out! We got your request and we'll call you shortly. (Demo text from digitalhaptics.dev. Reply STOP to opt out.)",
  },
  {
    at: 2,
    to: "owner",
    body: "DEMO lead: kitchen sink leak, Lafayette. Customer has been texted. Reply 1 to call them now.",
  },
  {
    at: 6,
    to: "customer",
    body: "Demo Plumbing Co.: Still need help with that leak? Reply with a good time and we'll call. (Demo.)",
  },
];
