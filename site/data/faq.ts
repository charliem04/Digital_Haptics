import type { Faq } from "@/content/types";

/**
 * General FAQ for /start (PLAN §5). DRAFT COPY for your review.
 * `{responseTime}` and `{phone}` are filled in from site.config.ts by
 * lib/content.ts, so a change there can't leave this out of date.
 */
export const startFaq: Faq[] = [
  {
    q: "What happens after I send the form?",
    a: "We read it and reach out within {responseTime} to set up a short call.",
  },
  {
    q: "How much does it cost?",
    a: "It depends on the job. The pricing page shows where each service starts, and every project is quoted after a short call.",
  },
  {
    q: "Do I need a website already?",
    a: "No. If you have one, we look at it before we talk. If not, we start from scratch.",
  },
  {
    q: "Do you only work in Acadiana?",
    a: "We are based in Acadiana and that is where we focus, but we take remote projects anywhere in the US.",
  },
  {
    q: "Can I just call instead?",
    a: "Of course: {phone}.",
  },
];
