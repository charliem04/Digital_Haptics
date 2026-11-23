/**
 * ════════════════════════════════════════════════════════════════════
 *  CITY PAGES (PLAN §5 /areas/[city], §6 cities.ts).
 *
 *  "Each page needs genuinely unique content … If unique content isn't
 *  available yet, only publish the cities that have it." So a city is
 *  published only when `ready` is true, which means its fields below are
 *  real, local and different from every other city's. Until then:
 *  production doesn't emit it or link it, and preview builds show it
 *  marked as a draft so the template can be reviewed.
 *
 *  Written from Charles's answers (2026-11-22). The work is remote, so
 *  these pages rest on real local projects and on his read of how local
 *  businesses show up online. No invented statistics or local claims.
 * ════════════════════════════════════════════════════════════════════
 */
export type City = {
  /** Must match a city in site.config.ts serviceArea.cities. */
  name: string;
  ready: boolean;
  /** Search result description, unique to this town (under 160 characters). */
  description?: string;
  /** Opening paragraph, about this town specifically. */
  intro: string;
  /** What the trades market looks like here. */
  market: string;
  /** Work nearby: projects or clients (with permission), or omit. */
  work?: string;
  /** Link to that work when it has no case study here. */
  workLink?: { label: string; href: string };
  /**
   * The case study from this town (its file name in content/work). Its
   * card appears only in builds where that case study is itself visible.
   */
  caseSlug?: string;
  /** Trades most worth reaching here. */
  trades: string[];
};

const draft = (name: string): City => ({
  name,
  ready: false,
  intro: `[PLACEHOLDER: what's specific about ${name} for trades businesses]`,
  market: `[PLACEHOLDER: the ${name} market: growth, housing, storm season, competition]`,
  work: `[PLACEHOLDER: work in or near ${name}, if any]`,
  trades: [`[PLACEHOLDER: trades to reach in ${name}]`],
});

export const cities: City[] = [
  {
    name: "Lafayette",
    ready: true,
    description:
      "Lafayette-based web design and local SEO for trades businesses, from a UL Lafayette computer science senior who grew up working jobs with his father.",
    intro:
      "Digital Haptics is based in Lafayette. I'm a computer science senior at UL Lafayette, and I build websites for the trades I grew up working around.",
    market:
      "Lafayette is the center of Acadiana, so a trade here is competing with every company that serves the area. A lot of good businesses still rely on word of mouth, a Facebook page or a site from years ago. When a customer searches instead of asking a neighbor, the company that shows up clearly gets the call.",
    // Named with Matt's OK, confirmed by Charles 2026-11-23.
    work: "We built the website for Matt Guidry Video & Animation, a Louisiana video producer whose work covers logo animation, documentary and motion graphics.",
    workLink: { label: "See Matt's site", href: "https://mattjyguidry.tv/" },
    trades: ["Roofing", "Plumbing", "HVAC", "General contracting", "Dirt work"],
  },
  {
    name: "Broussard",
    ready: true,
    description:
      "Web design and local SEO for Broussard trades, including a 20-plus-page roofing site demo with booking, financing tools and a local weather radar.",
    intro:
      "Broussard sits just southeast of Lafayette, and its contractors work across the whole area. A site for a company here has to do more than list services.",
    market:
      "For a roofer or general contractor, the website is where a homeowner checks you out after a storm, asks about financing and books an inspection. Many local sites were built when the business first went online and haven't kept up with how people search and hire now.",
    work: "We've built a 20-plus-page demo for a Broussard roofer, with booking, financing tools, a hiring portal and a local weather radar.",
    caseSlug: "ctl-pro-construction",
    trades: ["Roofing", "General contracting", "HVAC", "Plumbing"],
  },
  draft("Youngsville"),
  {
    name: "Scott",
    ready: true,
    description:
      "Web design and local SEO for Scott, LA trades. One local plumber's simple one-page site has brought in more than 30 new leads since May 2026.",
    intro:
      "Scott sits on the west side of Lafayette, and plenty of its trades serve both. Darren Aucoin's Plumbing is one of them, and its website is our work.",
    market:
      "A Facebook page and a Google listing can carry a local trade for a while, but they leave a customer with little to go on. A site doesn't need to be big to fix that. A clear page, a phone number and a form that reaches you can be enough.",
    work: "We built Darren Aucoin's Plumbing a one-page site with a lead form in May 2026. It has brought in more than 30 new leads since, and we handle its local SEO, hosting and maintenance.",
    caseSlug: "da-plumbing",
    trades: ["Plumbing", "HVAC", "Roofing", "General contracting"],
  },
  draft("Carencro"),
  {
    name: "New Iberia",
    ready: true,
    description:
      "Web design and local SEO for New Iberia trades, from a New Iberia native. See how a local dirt work company went from no web presence to fully handled.",
    intro:
      "I'm from New Iberia, so this one is personal. Some of the best contractors here are the hardest to find online, and fixing that is what we do.",
    market:
      "It's common for an established local company to have no website or Google profile at all. The work speaks for itself in person, but a new customer searching from a phone never sees it. Getting found starts with the basics, done properly and kept up.",
    work: "Coastal Construction Services had no website and no Google Business Profile. We built both, added guide pages, a flood zone lookup and a land buyer's checklist, and we keep it all running for the owner.",
    caseSlug: "coastal-construction-services",
    trades: ["Dirt work", "General contracting", "Roofing", "Plumbing"],
  },
  draft("Breaux Bridge"),
];
