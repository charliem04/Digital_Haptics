import type { CaseStudy } from "@/content/types";
import { CaseCard, type CaseCardProps } from "@/components/CaseCard";

/** The CaseCard props for a case: shared by the grid and the reel. */
export function caseCardProps(c: CaseStudy, i: number, priority = false): CaseCardProps {
  const image = c.cardImage
    ? { ...c.cardImage, alt: c.heroImage?.alt ?? c.cardImage.alt }
    : c.heroImage;
  return {
    index: i + 1,
    href: `/work/${c.slug}/`,
    client: c.client,
    trade: c.trade,
    location: c.location,
    result: c.results[0]?.value ?? "[RESULT]",
    status: c.draft ? "Draft" : c.demo ? "Demo" : c.liveUrl ? "Live site" : "Case study",
    image,
    priority,
  };
}

/**
 * A grid of case cards.
 * A grid of case cards. Drafts (shown on preview builds only) say so
 * in the card's status strip.
 *
 * `priority` is for a grid at the top of a page, where the first
 * screenshot is the largest thing on screen and shouldn't lazy-load.
 */
export function CaseGrid({ cases, priority = false }: { cases: CaseStudy[]; priority?: boolean }) {
  return (
    <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {cases.map((c, i) => (
        <li key={c.slug}>
          <CaseCard {...caseCardProps(c, i, priority && i === 0)} className="h-full" />
        </li>
      ))}
    </ul>
  );
}
