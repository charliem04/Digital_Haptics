import { pageMetadata } from "@/lib/meta";
import { isIndexable } from "@/lib/routes";
import { getCases } from "@/lib/content";
import { PageHero } from "@/components/page/PageHero";
import { CaseGrid } from "@/components/page/CaseGrid";
import { CtaBand } from "@/components/page/CtaBand";
import { PageGlow } from "@/components/page/MoltenArt";
import { PagePane, PaneStack } from "@/components/page/PagePane";

/**
 * Work index (PLAN §5): a grid of case cards.
 *
 * Linked from nowhere until a case is publishable (the registry's Work
 * entry is live only then), and noindex until then. Trade filter chips
 * are optional in PLAN and left out until there are enough cases to
 * need them.
 */
export const metadata = pageMetadata(
  {
    title: "Work",
    description:
      "Case studies: websites, local SEO and lead systems built for trades businesses in Acadiana, Louisiana.",
    path: "/work/",
  },
  { noindex: !isIndexable("/work/") }
);

export default function WorkPage() {
  const cases = getCases();
  const drafts = cases.some((c) => c.draft);

  return (
    <>
      <PageHero
        path="/work/"
        label="Work"
        title="Case studies"
        lead="Sites and systems built for trades businesses: what wasn't working, what we built, and what changed."
      />
      <PageGlow />
      <PaneStack>
        <PagePane label="Case studies">
          {drafts && (
            <p className="font-body text-room-small text-muted">
              Preview build: drafts are shown and marked. Production shows only published cases with
              the client&rsquo;s permission.
            </p>
          )}
          {cases.length > 0 ? (
            <CaseGrid cases={cases} priority />
          ) : (
            <p className="text-room-body text-muted">No case studies are published yet.</p>
          )}
        </PagePane>
        <CtaBand
          glass
          copy={{
            heading: "Your job could be next.",
            body: "Tell us what the business needs and we'll take it from there.",
          }}
        />
      </PaneStack>
    </>
  );
}
