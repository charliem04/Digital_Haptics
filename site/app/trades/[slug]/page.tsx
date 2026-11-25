import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/meta";
import { getCases, getServices, getTrade, getTrades } from "@/lib/content";
import { PageHero } from "@/components/page/PageHero";
import { SectionHead } from "@/components/page/SectionHead";
import { CaseGrid } from "@/components/page/CaseGrid";
import { ServiceCard } from "@/components/page/ServiceCard";
import { CtaBand } from "@/components/page/CtaBand";
import { FaqList } from "@/components/FaqList";
import { PageLiquid } from "@/components/page/PageLiquid";
import { PagePane, PaneStack } from "@/components/page/PagePane";

/**
 * Trade landing page (data/trades.ts): what a site for this trade has
 * to do, the real project behind it, services, FAQ and CTA.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return getTrades().map((t) => ({ slug: t.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const t = getTrade(params.slug);
  if (!t) return {};
  return pageMetadata({
    title: t.title,
    description: t.description,
    path: `/trades/${t.slug}/`,
  });
}

export default function TradePage({ params }: { params: { slug: string } }) {
  const t = getTrade(params.slug);
  if (!t) notFound();
  const project = getCases().find((c) => c.slug === t.caseSlug);

  return (
    <>
      <PageHero
        path={`/trades/${t.slug}/`}
        label={`Trades — ${t.name}`}
        title={t.title}
        lead={t.lead}
      />

      <PageLiquid />
      <PaneStack>
        <PagePane labelledBy="needs">
          <SectionHead id="needs" label={t.name} title={t.needsTitle} />
          <ul className="grid gap-4 md:grid-cols-2 lg:gap-6">
            {t.needs.map((n) => (
              <li key={n.title} className="flex">
                <div className="flex w-full flex-col gap-3 rounded-panel border border-text/[0.14] p-6 lg:p-8">
                  <h3 className="font-body text-room-card font-medium">{n.title}</h3>
                  <p className="text-room-body text-muted">{n.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </PagePane>

        {project && (
          <PagePane labelledBy="trade-work">
            <SectionHead
              id="trade-work"
              label="Real work"
              title={project.demo ? "A build for this trade" : "A site we run for this trade"}
            />
            <CaseGrid cases={[project]} />
          </PagePane>
        )}

        <PagePane labelledBy="trade-services">
          <SectionHead id="trade-services" label="Services" title="How we can help" />
          <ul className="grid gap-4 md:grid-cols-2 lg:gap-6 xl:grid-cols-4">
            {getServices().map((s) => (
              <li key={s.slug}>
                <ServiceCard service={s} />
              </li>
            ))}
          </ul>
        </PagePane>

        <FaqList glass faqs={t.faq} heading={`${t.name} website questions`} />

        <CtaBand
          glass
          copy={{
            heading: "Tell us about your business.",
            body: "One short form, then a short call. Every project is quoted after the call.",
          }}
        />
      </PaneStack>
    </>
  );
}
