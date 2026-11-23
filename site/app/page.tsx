import Link from "next/link";
import { site } from "@/site.config";
import { flags } from "@/lib/flags";
import { pageMetadata } from "@/lib/meta";
import { citySlug, isLive } from "@/lib/routes";
import { getCombineNote, getFeaturedCases, getProcessSteps, getServices } from "@/lib/content";
import { Hero } from "@/components/home/Hero";
import { LiquidBand, LiquidSideWindow } from "@/components/home/LiquidWindows";
import { Section } from "@/components/layout/Section";
import { SectionHead } from "@/components/page/SectionHead";
import { ServiceCard } from "@/components/page/ServiceCard";
import { CaseGrid } from "@/components/page/CaseGrid";
import { StepsStrip } from "@/components/page/StepsStrip";
import { CtaBand } from "@/components/page/CtaBand";
import { MoreLink } from "@/components/MoreLink";
import { Chip } from "@/components/ui/Chip";
import { Panel } from "@/components/ui/Panel";
import { SmallLabel } from "@/components/ui/SmallLabel";

/**
 * ════════════════════════════════════════════════════════════════════
 *  HOME (PLAN §5 Home): hero · proof strip · services · live systems
 *  teaser 🚩 · process · service area · final CTA.
 * ════════════════════════════════════════════════════════════════════
 */
export const metadata = pageMetadata({
  title: site.seo.defaultTitle,
  description: site.seo.defaultDescription,
  path: "/",
});

export default function Home() {
  const featured = getFeaturedCases();
  const services = getServices();
  const automations = isLive("/services/automations/");

  return (
    <>
      <Hero />

      {/* Solid, in front of the fixed liquid layer. */}
      <div className="relative z-10 bg-room">
        {featured.length > 0 && (
          <Section aria-labelledby="proof">
            <div className="flex flex-col gap-10">
              <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
                <SectionHead id="proof" label="Work" title="Recent work" />
                <MoreLink href="/work/">All case studies</MoreLink>
              </div>
              <CaseGrid cases={featured} />
            </div>
          </Section>
        )}
      </div>

      {/* Wide window. Skipped without a proof section, so it never sits
          directly under the hero's own opening. */}
      {featured.length > 0 && <LiquidBand />}

      <div className="relative z-10 bg-room">
        <Section ambient aria-labelledby="services">
          <div className="flex flex-col gap-10">
            <SectionHead
              id="services"
              label="Services"
              title="What we do"
              lede={getCombineNote()}
            />
            <ul
              className={
                services.length > 2 ? "grid gap-6 md:grid-cols-3" : "grid gap-6 md:grid-cols-2"
              }
            >
              {services.map((s) => (
                <li key={s.slug}>
                  <ServiceCard service={s} />
                </li>
              ))}
            </ul>
          </div>
        </Section>

        {/* 🚩 Live systems teaser (PLAN §5 Home 4). Flag off: not rendered. */}
        {flags.automations && automations && (
          <Section aria-labelledby="live-systems" tone="frost" className="border-y border-line">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <SectionHead
                id="live-systems"
                label="Live systems"
                title="This site runs the same lead system you'd get"
                lede="Send the form on this site and you'll see it work: the instant reply, the owner alert, the follow-up. It's the system we build for clients."
              />
              <MoreLink href="/services/automations/">How automations work</MoreLink>
            </div>
          </Section>
        )}
      </div>

      {/* Side window. This section is transparent: LiquidSideWindow paints
          its solid fill and the copy sits above that. */}
      <Section ambient={false} className="z-10 overflow-hidden" aria-labelledby="process">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-stretch lg:gap-16">
          <div className="relative z-[1] flex flex-col justify-center gap-12">
            <SectionHead id="process" label="Process" title="How a project runs" />
            <StepsStrip steps={getProcessSteps()} compact />
          </div>
          <LiquidSideWindow />
        </div>
      </Section>

      <div className="relative z-10 bg-room">
        <Section aria-labelledby="area">
          <Panel fill="surface" innerClassName="flex flex-col gap-8 p-6 lg:p-12">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-5 border-line">
              <SmallLabel>Service area</SmallLabel>
              <span className="font-body text-room-small text-muted">{site.serviceArea.label}</span>
            </div>
            <SectionHead
              id="area"
              label="Local"
              title="Based in Acadiana, working statewide"
              lede="Digital Haptics is based in Lafayette and grew up in Acadiana. The work is remote, so we take on projects across Louisiana and beyond, and meet in person anywhere around here."
            />
            <ul className="flex flex-wrap gap-2">
              {site.serviceArea.cities.map((city) => {
                const href = `/areas/${citySlug(city)}/`;
                return (
                  <li key={city}>
                    {isLive(href) ? (
                      <Link
                        href={href}
                        className="inline-flex min-h-touch items-center border no-underline active:translate-y-px rounded-control border-line px-4 font-body text-room-small text-text hover:bg-raised hover:text-text"
                      >
                        {city}
                      </Link>
                    ) : (
                      <Chip>{city}</Chip>
                    )}
                  </li>
                );
              })}
            </ul>
          </Panel>
        </Section>
      </div>

      <CtaBand
        opening
        copy={{
          heading: "Tell us about the job.",
          body: `One short form. We'll reach out within ${site.intake.responseTime}.`,
        }}
      />
    </>
  );
}
