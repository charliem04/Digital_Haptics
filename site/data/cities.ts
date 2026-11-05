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
 *  Content comes from Charles's answers (docs/QUESTIONS.md §6). Nothing
 *  here is invented: until answered, every field is a placeholder.
 * ════════════════════════════════════════════════════════════════════
 */
export type City = {
  /** Must match a city in site.config.ts serviceArea.cities. */
  name: string;
  ready: boolean;
  /** Opening paragraph, about this town specifically. */
  intro: string;
  /** What the trades market looks like here. */
  market: string;
  /** Work nearby: projects or clients (with permission), or omit. */
  work?: string;
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
  draft("Lafayette"),
  draft("Broussard"),
  draft("Youngsville"),
  draft("Scott"),
  draft("Carencro"),
  draft("New Iberia"),
  draft("Breaux Bridge"),
];
