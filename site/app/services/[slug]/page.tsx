import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/meta";
import { isIndexable } from "@/lib/routes";
import { getCasesFor, getService, getServices } from "@/lib/content";
import { PageHero } from "@/components/page/PageHero";
import { Section } from "@/components/layout/Section";
import { SectionHead } from "@/components/page/SectionHead";
import { CaseGrid } from "@/components/page/CaseGrid";
import { CtaBand } from "@/components/page/CtaBand";
import { FaqList } from "@/components/FaqList";
import { Marker } from "@/components/ui/Marker";
import { MoreLink } from "@/components/MoreLink";
import { AutomationsSections } from "@/components/automations/AutomationsSections";

/**
 * ════════════════════════════════════════════════════════════════════
 *  SERVICE SUB-PAGE (PLAN §5): what it is, what's included, who it's
 *  for, relevant case studies, FAQ, CTA.
 *
 *  Flagged services are filtered out of generateStaticParams, so with
 *  FEATURE_AUTOMATIONS off /services/automations/ is never emitted and
 *  the Worker serves the real 404 (REFACTOR_AUDIT R2). Its own sections
 *  (problem, modules, demo, voice, add-on) come from AutomationsSections.
 * ════════════════════════════════════════════════════════════════════
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return getServices().map((s) => ({ slug: s.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const s = getService(params.slug);
  if (!s) return {};
  const path = `/services/${s.slug}/`;
  return pageMetadata(
    { title: s.name, description: s.lead.slice(0, 155).replace(/\s+\S*$/, "") + "…", path },
    { noindex: !isIndexable(path) }
  );
}

export default function ServicePage({ params }: { params: { slug: string } }) {
  const s = getService(params.slug);
  if (!s) notFound();
  const cases = getCasesFor(s);

  return (
    <>
      <PageHero
        path={`/services/${s.slug}/`}
        label={`${s.code} — ${s.name}`}
        title={s.name}
        lead={s.lead}
      />

      <Section tone="frost" className="border-y border-ink" aria-labelledby="included">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-6">
            <SectionHead id="included" label="Included" title="What you get" />
            <ul className="flex flex-col border-t border-ink">
              {s.included.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 border-b border-hairline py-3 text-body"
                >
                  <Marker size="dot" className="mt-2.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-6">
            <SectionHead id="for-who" label="Who it's for" title="A good fit if" />
            <ul className="flex flex-col border-t border-ink">
              {s.forWho.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 border-b border-hairline py-3 text-body"
                >
                  <Marker size="dot" className="mt-2.5" />
                  {item}
                </li>
              ))}
            </ul>
            <div>
              <MoreLink href="/pricing/">Where pricing starts</MoreLink>
            </div>
          </div>
        </div>
      </Section>

      {s.slug === "automations" && <AutomationsSections />}

      {cases.length > 0 && (
        <Section aria-labelledby="cases">
          <div className="flex flex-col gap-10">
            <SectionHead id="cases" label="Work" title={`${s.name} projects`} />
            <CaseGrid cases={cases.slice(0, 3)} />
          </div>
        </Section>
      )}

      <FaqList faqs={s.faq} heading={`${s.name} questions`} />

      <CtaBand
        copy={{
          heading: `Talk to us about ${s.name.toLowerCase()}.`,
          body: "A short form, then a short call. Every project is quoted after the call.",
        }}
      />
    </>
  );
}
