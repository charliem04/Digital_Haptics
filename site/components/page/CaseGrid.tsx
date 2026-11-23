import type { CaseStudy } from "@/content/types";
import { CaseCard } from "@/components/CaseCard";

/**
 * A grid of case cards. Drafts (shown on preview builds only) say so
 * in the card's status strip.
 *
 * `priority` is for a grid at the top of a page, where the first
 * screenshot is the largest thing on screen and shouldn't lazy-load.
 */
export function CaseGrid({ cases, priority = false }: { cases: CaseStudy[]; priority?: boolean }) {
  return (
    <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {cases.map((c, i) => {
        const image = c.cardImage
          ? { ...c.cardImage, alt: c.heroImage?.alt ?? c.cardImage.alt }
          : c.heroImage;
        return (
          <li key={c.slug}>
            <CaseCard
              index={i + 1}
              href={`/work/${c.slug}/`}
              client={c.client}
              trade={c.trade}
              systems={c.systems.join(" / ")}
              result={c.results[0]?.value ?? "[RESULT]"}
              status={c.draft ? "Draft" : c.demo ? "Demo" : c.liveUrl ? "Live site" : "Case study"}
              image={image}
              priority={priority && i === 0}
              className="h-full"
            />
          </li>
        );
      })}
    </ul>
  );
}
