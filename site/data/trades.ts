import type { Faq } from "@/content/types";

/**
 * ════════════════════════════════════════════════════════════════════
 *  TRADE PAGES (/trades/[slug]): one landing page per trade, for
 *  searches like "websites for roofers".
 *
 *  A trade gets a page only when there's a real project behind it, so
 *  none of these is a thin keyword page. HVAC and general contracting
 *  can follow when a project exists. No statistics or guarantees.
 * ════════════════════════════════════════════════════════════════════
 */
export type Trade = {
  slug: string;
  /** Matches a case study's `trade` value. */
  name: string;
  /** "Websites for {audience}". */
  audience: string;
  title: string;
  /** Search result description, under 160 characters. */
  description: string;
  lead: string;
  needsTitle: string;
  needs: { title: string; body: string }[];
  caseSlug: string;
  faq: Faq[];
};

export const trades: Trade[] = [
  {
    slug: "roofing",
    name: "Roofing",
    audience: "roofers",
    title: "Websites for roofers in Acadiana",
    description:
      "Roofing websites built for storm season: inspection booking, financing information, project galleries and local SEO for roofers across Acadiana.",
    lead: "A homeowner with a damaged roof is stressed, on a phone and calling whoever looks trustworthy first. Your site has to earn that call quickly.",
    needsTitle: "What a roofing site has to do",
    needs: [
      {
        title: "Book inspections fast",
        body: "After a storm, people want a time on the calendar. A tap-to-call button and online booking catch them while they're still looking.",
      },
      {
        title: "Explain financing",
        body: "A new roof is a big bill. Clear financing information and a payment estimator answer the question many homeowners won't call to ask.",
      },
      {
        title: "Prove the work",
        body: "A gallery of real roofs, kept current without calling a developer, says more than any slogan.",
      },
      {
        title: "Help you hire",
        body: "Good crews are hard to find. A simple careers page gives them a way to reach you when the work picks up.",
      },
    ],
    caseSlug: "ctl-pro-construction",
    faq: [
      {
        q: "Can a roofing site include financing tools?",
        a: "Yes. We can build a financing page with a payment estimator. The rates and terms come from you or your lender, and the page makes clear that estimates aren't an offer of credit.",
      },
      {
        q: "Can I add new job photos myself?",
        a: "Yes. We can set up a gallery with a simple editor, so adding a finished roof takes a few minutes from your phone or computer.",
      },
    ],
  },
  {
    slug: "plumbing",
    name: "Plumbing",
    audience: "plumbers",
    title: "Websites for plumbers in Acadiana",
    description:
      "Plumbing websites that make it easy to call or request service from a phone. Simple, fast sites and local SEO for plumbers across Acadiana.",
    lead: "Nobody browses for a plumber. They have a leak, they pull out a phone, and they call the first company that looks real. A plumbing site can be simple, as long as it does that one job well.",
    needsTitle: "What a plumbing site has to do",
    needs: [
      {
        title: "Put the phone number first",
        body: "Someone with water on the floor shouldn't have to hunt. Your number and a call button stay within reach on every screen.",
      },
      {
        title: "Say what you handle",
        body: "Repairs, drains, water heaters, sewer lines, emergencies: a customer should know in seconds whether you do what they need.",
      },
      {
        title: "Catch the after-hours lead",
        body: "A short request form goes straight to your email, so a customer who can't reach you on a job can still get in line.",
      },
      {
        title: "Show up nearby",
        body: "Plumbing searches are local. Your site and Google Business Profile need to agree on who you are and where you work.",
      },
    ],
    caseSlug: "da-plumbing",
    faq: [
      {
        q: "Does a plumber need a big website?",
        a: "Often, no. Darren Aucoin's Plumbing runs on a clear one-page site with a lead form, and it has brought in more than 30 new leads since launching in May 2026.",
      },
      {
        q: "I already have a Facebook page. Is that enough?",
        a: "It helps, but you don't control how it shows up in search, and customers can't always find what they need on it. A simple site gives you a home base, and your Facebook page can point to it.",
      },
    ],
  },
  {
    slug: "dirt-work",
    name: "Dirt work",
    audience: "dirt work contractors",
    title: "Websites for dirt work contractors",
    description:
      "Websites and local SEO for dirt work and excavation contractors in Acadiana, with guide pages, flood zone tools and Google Business Profile setup.",
    lead: "People hiring for dirt work are usually in the middle of a bigger plan: buying land, building a house, fixing drainage. A good site helps them figure out what they need, then points them to you.",
    needsTitle: "What a dirt work site has to do",
    needs: [
      {
        title: "Answer questions before the call",
        body: "Most land buyers have never hired a dirt contractor. Guide pages explain the process and bring in people searching for those answers.",
      },
      {
        title: "Be useful for the land",
        body: "Tools like a flood zone lookup and a new land buyer's checklist give people a reason to visit, and to remember who helped.",
      },
      {
        title: "Show the equipment and jobs",
        body: "Photos of your machines on real sites tell a customer right away that you can handle the scale of their project.",
      },
      {
        title: "Exist on Google",
        body: "Many dirt contractors have no Google Business Profile at all. Setting one up is often the fastest way to start showing up nearby.",
      },
    ],
    caseSlug: "coastal-construction-services",
    faq: [
      {
        q: "My work comes from word of mouth. Why do I need a site?",
        a: "Even a referred customer usually looks you up before calling. If nothing comes up, some of them move on to a company they can find.",
      },
      {
        q: "Can you handle all of it for me?",
        a: "Yes. For Coastal Construction Services we built the site and Google Business Profile, and we handle SEO, hosting and maintenance so the owner doesn't have to.",
      },
    ],
  },
];
