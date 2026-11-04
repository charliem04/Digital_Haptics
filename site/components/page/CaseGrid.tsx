import type { CaseStudy } from "@/content/types";
import { CaseCard } from "@/components/CaseCard";

/**
 * A grid of case cards. Drafts (shown on preview builds only) say so
 * in the card's status strip.
 */
export function CaseGrid({ cases }: { cases: CaseStudy[] }) {
  return (
    <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {cases.map((c, i) => (
        <li key={c.slug}>
          <CaseCard
            index={i + 1}
            href={`/work/${c.slug}/`}
            client={c.client}
            trade={c.trade}
            systems={c.systems.join(" / ")}
            result={c.results[0]?.value ?? "[RESULT]"}
            status={c.draft ? "Draft" : c.liveUrl ? "Live site" : "Case study"}
            image={c.heroImage}
          />
        </li>
      ))}
    </ul>
  );
}
