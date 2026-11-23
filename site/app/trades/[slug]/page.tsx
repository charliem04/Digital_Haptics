import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/meta";
import { getCases, getServices, getTrade, getTrades } from "@/lib/content";
import { PageHero } from "@/components/page/PageHero";
import { Section } from "@/components/layout/Section";
import { SectionHead } from "@/components/page/SectionHead";
import { CaseGrid } from "@/components/page/CaseGrid";
import { ServiceCard } from "@/components/page/ServiceCard";
import { CtaBand } from "@/components/page/CtaBand";
import { FaqList } from "@/components/FaqList";
import { Panel } from "@/components/ui/Panel";

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

      <Section tone="frost" className="border-y border-line" aria-labelledby="needs">
        <div className="flex flex-col gap-10">
          <SectionHead id="needs" label={t.name} title={t.needsTitle} />
          <ul className="grid gap-6 md:grid-cols-2">
            {t.needs.map((n) => (
              <li key={n.title} className="flex">
                <Panel
                  fill="raised"
                  className="w-full"
                  innerClassName="flex h-full flex-col gap-3 p-6 lg:p-8"
                >
                  <h3 className="font-body text-room-card font-medium">{n.title}</h3>
                  <p className="text-room-body text-muted">{n.body}</p>
                </Panel>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {project && (
        <Section aria-labelledby="trade-work">
          <div className="flex flex-col gap-10">
            <SectionHead
              id="trade-work"
              label="Real work"
              title={project.demo ? "A build for this trade" : "A site we run for this trade"}
            />
            <CaseGrid cases={[project]} />
          </div>
        </Section>
      )}

      <Section aria-labelledby="trade-services">
        <div className="flex flex-col gap-10">
          <SectionHead id="trade-services" label="Services" title="How we can help" />
          <ul className="grid gap-6 md:grid-cols-3">
            {getServices().map((s) => (
              <li key={s.slug}>
                <ServiceCard service={s} />
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <FaqList faqs={t.faq} heading={`${t.name} website questions`} />

      <CtaBand
        copy={{
          heading: "Tell us about your business.",
          body: "One short form, then a short call. Every project is quoted after the call.",
        }}
      />
    </>
  );
}
