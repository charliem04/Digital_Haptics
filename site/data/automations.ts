/**
 * ════════════════════════════════════════════════════════════════════
 *  🚩 AUTOMATIONS PAGE (PLAN §5 Services, §7). Read only by
 *  app/services/[slug] when slug is "automations", which is only ever
 *  emitted with FEATURE_AUTOMATIONS on.
 *
 *  DRAFT COPY, for review before Phase 7. No statistics: PLAN's "slow
 *  lead response loses jobs" is stated as the problem, not quantified.
 * ════════════════════════════════════════════════════════════════════
 */

export const problem = {
  title: "Slow replies lose jobs",
  body: "When someone needs a roofer or a plumber, they contact a few at once and hire whoever answers first. If you're on a job when the form comes in, that's rarely you. Automations answer for you, right away, every time.",
};

/** The modules (PLAN §5), each with one line. */
export const modules: { name: string; body: string; soon?: boolean }[] = [
  {
    name: "Form capture",
    body: "Every website inquiry lands in one place, with nothing lost to a full inbox.",
  },
  {
    name: "Instant SMS reply",
    body: "The customer gets a text within seconds saying you got their request.",
  },
  {
    name: "Owner alert",
    body: "You get a text with the lead's details, so you can call back from the truck.",
  },
  {
    name: "Missed-call text-back",
    body: "Miss a call and the caller gets a text, instead of calling the next listing.",
  },
  {
    name: "Lead dashboard",
    body: "Every lead, where it came from and whether anyone has called it back.",
  },
  {
    name: "Escalation",
    body: "If a lead sits unanswered, it gets louder until somebody picks it up.",
  },
  {
    name: "AI voice receptionist",
    body: "Answers calls you can't take and books the job.",
    soon: true,
  },
];

export const addOn = {
  title: "An add-on, not a rebuild",
  body: "Automations work with a site we build for you or the one you already have. Start with the instant reply and add modules as you need them.",
};

/** 🚩 FEATURE_AUTOMATIONS_DEMO: the demo's labels and the consent line. */
export const demoCopy = {
  label: "Live demo",
  title: "Try it on your own phone",
  lede: "Enter your mobile number and submit a fake lead for Demo Plumbing Co., a fictional business. You'll see the texts the customer and the owner would get.",
  notice:
    "This is a demo. Demo messages are marked as demos, and your number is only used to send them.",
  consent:
    "I agree to receive demo text messages from digitalhaptics.dev at this number. Message and data rates may apply. Reply STOP to opt out, HELP for help.",
  submit: "Send me the demo",
  sending: "Starting…",
  phoneLabel: "Your mobile number",
  consentLegend: "Consent",
  consentError: "Tick the box to receive the demo texts.",
  failed: "Error — the demo didn't start. Try again in a minute.",
  customer: "To the customer (you)",
  owner: "To the owner",
  done: "That's the whole sequence. Your site would run the same thing for every lead.",
};

/** 🚩 FEATURE_VOICE: the call-in section. */
export const voiceCopy = {
  label: "AI receptionist",
  title: "Call it and see",
  body: "Call this number and talk to the AI receptionist we set up for clients.",
  number: "[PLACEHOLDER: voice demo number]",
};
