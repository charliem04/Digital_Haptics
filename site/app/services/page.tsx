import Link from "next/link";
import { pageMetadata } from "@/lib/meta";
import { getCombineNote, getProcessSteps, getServices, getTrades } from "@/lib/content";
import { PageHero } from "@/components/page/PageHero";
import { Section } from "@/components/layout/Section";
import { SectionHead } from "@/components/page/SectionHead";
import { ServiceCard } from "@/components/page/ServiceCard";
import { StepsStrip } from "@/components/page/StepsStrip";
import { CtaBand } from "@/components/page/CtaBand";
import { MoreLink } from "@/components/MoreLink";
import { Panel } from "@/components/ui/Panel";
import { Arrow } from "@/components/ui/Arrow";

/** Services overview (PLAN §5): service cards + the "combine" note. */
export const metadata = pageMetadata({
  title: "Services",
  description:
    "Web design, local SEO and Google Business Profile management for trades businesses in Acadiana, Louisiana: built for phones and made to get found.",
  path: "/services/",
});

export default function ServicesPage() {
  const services = getServices();

  return (
    <>
      <PageHero
        path="/services/"
        label="Services"
        title="What we do"
        lead={getCombineNote()}
        art="rise"
      />
      <Section spacing="tight" aria-label="Services" className="pb-section-sm lg:pb-section">
        <ul
          className={
            services.length > 2 ? "grid gap-6 md:grid-cols-3" : "grid gap-6 md:grid-cols-2"
          }
        >
          {services.map((s) => (
            <li key={s.slug}>
              <ServiceCard service={s} headingAs="h2" detailed />
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <MoreLink href="/pricing/">See where pricing starts</MoreLink>
        </div>
      </Section>

      <Section tone="frost" className="border-y border-line" aria-labelledby="by-trade">
        <div className="flex flex-col gap-10">
          <SectionHead
            id="by-trade"
            label="Trades"
            title="Built around how your trade gets hired"
            lede="A roofer after a storm and a plumber on an emergency call need different things from a website."
          />
          <ul className="grid gap-6 md:grid-cols-3">
            {getTrades().map((t) => (
              <li key={t.slug}>
                <Panel
                  as={Link}
                  href={`/trades/${t.slug}/`}
                  fill="raised"
                  widget
                  hover
                  className="block h-full no-underline text-text"
                  innerClassName="flex h-full items-center justify-between gap-4 p-6"
                >
                  <h3 className="font-body text-room-step font-medium">
                    Websites for {t.audience}
                  </h3>
                  <Arrow className="size-4 shrink-0 text-amber" />
                </Panel>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section aria-labelledby="service-process">
        <div className="flex flex-col gap-12">
          <SectionHead id="service-process" label="Process" title="How a project runs" />
          <StepsStrip steps={getProcessSteps()} />
        </div>
      </Section>

      <CtaBand
        copy={{
          heading: "Not sure what you need?",
          body: "Tell us about the business. We'll recommend what fits, and what doesn't.",
        }}
      />
    </>
  );
}
