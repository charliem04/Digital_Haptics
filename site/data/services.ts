import type { FlagName } from "@/lib/flag-names";
import type { Service } from "@/content/types";

/**
 * ════════════════════════════════════════════════════════════════════
 *  SERVICES (PLAN §5, §6). Read through lib/content.ts, which removes
 *  flagged services when their flag is off.
 *
 *  DRAFT COPY: written in Phase 3 from what PLAN says each service is,
 *  for your review (CONTENT_TODO.md). It describes the work only: no
 *  prices, numbers, results or guarantees. `short` lines are the Hybrid
 *  mockup's, as in data/acts.ts. Prices are Charles's (QUESTIONS.md §10).
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
    price: "Websites from $1,000",
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
    price: "Local SEO from $100/mo",
    system: "SEO",
  },
  {
    slug: "google-business-profile",
    code: "ACT.03",
    name: "Google Business Profile",
    short: "Your listing on Google and Maps, set up right and kept current.",
    lead: "For a lot of customers, your Google listing is the first thing they see, before your website and before they call. We set it up, keep it accurate and keep it active, so it works for you while you're on the job.",
    included: [
      "A new profile created, or your existing one claimed",
      "Help getting through Google's verification",
      "Categories, services, service areas and hours filled in properly",
      "Real photos of your jobs, crew and equipment added and kept fresh",
      "An easy review link to text to happy customers",
      "Your details checked for unwanted or incorrect edits",
      "Your website and profile kept saying the same thing",
    ],
    forWho: [
      "Trades businesses with no Google listing yet",
      "Owners with a profile they set up once and never touched again",
      "Service-area businesses that work out of a truck, with no storefront",
    ],
    faq: [
      {
        q: "Who owns the profile?",
        a: "You do. It stays under your business, and we're added as a manager. If you ever stop working with us, you keep the profile, the photos and the reviews.",
      },
      {
        q: "I don't have a storefront. Can I still have a profile?",
        a: "Yes. Google calls this a service-area business. Your home address stays hidden, and the profile lists the towns you work in instead.",
      },
      {
        q: "Can you get rid of bad reviews?",
        a: "Not just because they're negative. We can help you report reviews that break Google's policies, and help you write a calm, professional reply to the rest. Google makes the final call.",
      },
      {
        q: "Can you guarantee the top spot on the map?",
        a: "No, and be careful of anyone who does. Where you show up depends on things like distance from the person searching. We make sure your profile is complete, accurate and active.",
      },
      {
        q: "Do I need a website too?",
        a: "A profile works on its own, but it works better when it links to a site that backs it up. If you don't have one, we can build that too.",
      },
    ],
    // Charles, 2026-11-23: also starting at $100 a month.
    price: "Google Business Profile from $100/mo",
    system: "Google Business Profile",
  },
  {
    // 🚩 FEATURE_AUTOMATIONS. The full page (modules detail, the demo)
    // is Phase 4; this entry gives it a card, a sub-page and a price.
    slug: "automations",
    code: "ACT.04",
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
    price: "Automations from $500/mo",
    system: "SMS",
    flag: "automations",
  },
];

/** The overview note (PLAN §5 Services), per flag state. */
export const combineNote = {
  off: "Most clients combine them: a site worth finding, the local search work that gets it found, and a Google listing kept current.",
  on: "Most clients combine them: a site worth finding, the local search work that gets it found, a Google listing kept current, and automations that answer every lead.",
};
