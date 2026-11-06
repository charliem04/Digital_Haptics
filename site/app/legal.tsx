import type { ReactNode } from "react";
import { site } from "@/site.config";
import { PageHero } from "@/components/page/PageHero";
import { Section } from "@/components/layout/Section";

/**
 * Shared shell for the legal pages: page hero, a review notice, and
 * readable prose. noindex comes from the route registry.
 */
export function LegalPage({
  title,
  path,
  updated,
  children,
}: {
  title: string;
  path: string;
  /** "Last updated" date, ISO. */
  updated: string;
  children: ReactNode;
}) {
  return (
    <>
      <PageHero path={path} label="Legal" title={title}>
        <p className="font-mono text-label uppercase tracking-label text-steel">
          {site.name} · Last updated {updated}
        </p>
        {/* Remove once an attorney has reviewed this page (QUESTIONS.md §20). */}
        <p className="self-start border border-ink bg-frost px-3 py-2 font-mono text-label uppercase tracking-label">
          [PLACEHOLDER: draft pending attorney review]
        </p>
      </PageHero>
      <Section spacing="tight" aria-label={title} className="pb-section-sm lg:pb-section">
        <div className="flex max-w-[720px] flex-col gap-4 text-body text-steel-deep [&_a]:text-ink [&_a]:underline [&_a]:decoration-signal [&_a]:decoration-2 [&_a]:underline-offset-4 [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-subheading [&_h2]:font-semibold [&_h2]:text-ink [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-ink">
          {children}
        </div>
      </Section>
    </>
  );
}
