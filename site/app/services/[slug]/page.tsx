import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/meta";
import { isIndexable } from "@/lib/routes";
import { getCasesFor, getService, getServices, getTrades } from "@/lib/content";
import { PageHero } from "@/components/page/PageHero";
import { SectionHead } from "@/components/page/SectionHead";
import { CaseGrid } from "@/components/page/CaseGrid";
import { CtaBand } from "@/components/page/CtaBand";
import { FaqList } from "@/components/FaqList";
import { MoreLink } from "@/components/MoreLink";
import { AutomationsSections } from "@/components/automations/AutomationsSections";
import { PageLiquid } from "@/components/page/PageLiquid";
import { PagePane, PaneStack } from "@/components/page/PagePane";

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

      <PageLiquid />
      <PaneStack>
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          <PagePane labelledBy="included">
            <SectionHead
              id="included"
              label="Included"
              title={s.addOns ? "With every website" : "What you get"}
            />
            <ul className="flex flex-col border-t border-line">
              {s.included.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 border-b border-line py-3 text-body"
                >
                  {item}
                </li>
              ))}
            </ul>
          </PagePane>
          <PagePane labelledBy="for-who">
            <SectionHead id="for-who" label="Who it's for" title="A good fit if" />
            <ul className="flex flex-col border-t border-line">
              {s.forWho.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 border-b border-line py-3 text-body"
                >
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-auto">
              <MoreLink href="/pricing/">Where pricing starts</MoreLink>
            </div>
          </PagePane>
        </div>

        {s.addOns && (
          <PagePane labelledBy="add-ons">
            <SectionHead
              id="add-ons"
              label="Add-ons"
              title="Add when you need them"
              lede={`From ${s.priceFrom} ${s.priceUnit}, quoted after the call. Tool plans and card fees are billed to you by the provider.`}
            />
            <ul className="grid gap-3 sm:grid-cols-2">
              {s.addOns.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-4 rounded-field border border-dashed border-text/[0.2] p-4 text-body"
                >
                  <span aria-hidden className="font-medium text-amber">
                    +
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </PagePane>
        )}

        {/* 🚩 Flag off today. Its sections still use the full-width bands. */}
        {s.slug === "automations" && <AutomationsSections />}

        {s.slug === "web-design" && (
          <PagePane labelledBy="by-trade">
            <SectionHead id="by-trade" label="Trades" title="Built around your trade" />
            <ul className="flex flex-wrap gap-x-10 gap-y-3">
              {getTrades().map((t) => (
                <li key={t.slug}>
                  <MoreLink href={`/trades/${t.slug}/`}>Websites for {t.audience}</MoreLink>
                </li>
              ))}
            </ul>
          </PagePane>
        )}

        {cases.length > 0 && (
          <PagePane labelledBy="cases">
            <SectionHead id="cases" label="Work" title={`${s.name} projects`} />
            <CaseGrid cases={cases.slice(0, 3)} />
          </PagePane>
        )}

        <FaqList glass faqs={s.faq} heading={`${s.name} questions`} />

        <CtaBand
          glass
          copy={{
            heading: `Talk to us about ${s.name.toLowerCase()}.`,
            body: "A short form, then a short call. Every project is quoted after the call.",
          }}
        />
      </PaneStack>
    </>
  );
}
