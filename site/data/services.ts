import type { FlagName } from "@/lib/flags";
import type { Service } from "@/content/types";

/**
 * ════════════════════════════════════════════════════════════════════
 *  SERVICES (PLAN §5, §6). Read through lib/content.ts, which removes
 *  flagged services when their flag is off.
 *
 *  DRAFT COPY: written in Phase 3 from what PLAN says each service is,
 *  for your review (CONTENT_TODO.md). It describes the work only: no
 *  prices, numbers, results or guarantees. `short` lines are the Hybrid
 *  mockup's, as in data/acts.ts. Prices stay [PRICE] (PLAN §5 Pricing).
 * ════════════════════════════════════════════════════════════════════
 */
export const services: (Service & { flag?: FlagName })[] = [
  {
    slug: "web-design",
    code: "ACT.01",
    name: "Web Design",
    short: "Sites that look like the work you do: solid, square, built right.",
    lead: "A website built for how your customers actually find you: on a phone, between other things, ready to call the first business that looks like it knows what it is doing.",
    included: [
      "Design and build for phones first, then desktop",
      "A call button and a short quote form on every page",
      "A page for each service you offer and each area you cover",
      "Your photos of real jobs, set up to load quickly",
      "Domain, hosting and security certificate set up for you",
      "Speed, accessibility and form checks before launch",
    ],
    forWho: [
      "Trades businesses with no site, or one that no longer brings in calls",
      "Owners who want a site they never have to think about",
      "Crews that do good work and need the website to show it",
    ],
    faq: [
      {
        q: "Do I have to write the content?",
        a: "No. We ask about your services, your area and how you work, and turn that into the copy. You review it before anything goes live.",
      },
      {
        q: "Can you work with my current site?",
        a: "We look at it before our first call. Sometimes it makes sense to keep the domain and rebuild, sometimes to start over. We tell you which, and why.",
      },
    ],
    price: "Websites from [PRICE]",
    system: "Site",
  },
  {
    slug: "local-seo",
    code: "ACT.02",
    name: "Local SEO",
    short: "Found first when someone nearby searches for your trade.",
    lead: "When someone in your area searches for your trade, local SEO is the work that puts your business in front of them, and gives them a reason to call you instead of the next listing.",
    included: [
      "Google Business Profile set up, filled in and kept current",
      "Service-area pages for the towns you actually work in",
      "Business listings kept consistent across the directories that matter",
      "Technical groundwork: speed, structured data, indexing",
      "A monthly report on calls, form leads and where you show up",
    ],
    forWho: [
      "Businesses that rely on calls from people nearby",
      "Owners whose competitors show up first on the map",
      "Anyone with a good site that nobody is finding",
    ],
    faq: [
      {
        q: "How long before I see results?",
        a: "It depends on your trade, your area and where you start from. We look at that on the first call and tell you what to expect, without promises nobody can keep.",
      },
      {
        q: "Do I need a new website for local SEO?",
        a: "Not always. If your current site is sound, we work with it. If it is holding you back, we say so.",
      },
    ],
    price: "Local SEO from [PRICE]/mo",
    system: "SEO",
  },
  {
    // 🚩 FEATURE_AUTOMATIONS. The full page (modules detail, the demo)
    // is Phase 4; this entry gives it a card, a sub-page and a price.
    slug: "automations",
    code: "ACT.03",
    name: "Automations",
    short: "Every form and missed call gets a reply in seconds.",
    lead: "Leads go cold while you are on a roof or under a sink. Automations reply to every form and missed call for you, alert you right away, and keep the lead warm until you can call back.",
    included: [
      "Form capture from your website",
      "An instant text to the customer when they reach out",
      "An alert to you with the lead's details",
      "Missed-call text-back",
      "A dashboard of every lead and where it stands",
      "Escalation when a lead has not been answered",
    ],
    forWho: [
      "Owners who can't answer the phone while they're on a job",
      "Businesses losing leads to whoever calls back first",
    ],
    faq: [],
    price: "Automations from [PRICE]/mo",
    system: "SMS",
    flag: "automations",
  },
];

/** The overview note (PLAN §5 Services), per flag state. */
export const combineNote = {
  off: "Most clients combine both: a site worth finding, and the local search work that gets it found.",
  on: "Most clients combine all three: a site worth finding, the local search work that gets it found, and automations that answer every lead.",
};
