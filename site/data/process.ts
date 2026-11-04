import type { ProcessStep } from "@/content/types";

/**
 * Process strip, Call → Build → Launch → Grow (PLAN §5, Home).
 * DRAFT COPY for your review (CONTENT_TODO.md).
 */
export const processSteps: ProcessStep[] = [
  {
    name: "Call",
    body: "A short call about your business, the area you cover and what the site needs to do for you.",
  },
  {
    name: "Build",
    body: "We design and write the site, and set up local search from the start. You review everything before it goes live.",
  },
  {
    name: "Launch",
    body: "We put it live on your domain and test every call button and form on a real phone.",
  },
  {
    name: "Grow",
    body: "We keep it fast and keep working on how you show up locally, month to month.",
  },
];

/** "How it works" on /start (PLAN §5: 3 steps). DRAFT COPY. */
export const startSteps: ProcessStep[] = [
  { name: "Tell us about the job", body: "The form below takes a couple of minutes." },
  { name: "We reach out", body: "We read it and get back to you to set up a short call." },
  { name: "You get a quote", body: "A clear quote after the call, for exactly what you need." },
];
