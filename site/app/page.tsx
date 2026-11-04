import Link from "next/link";
import { site } from "@/site.config";
import { flags } from "@/lib/flags";
import { pageMetadata } from "@/lib/meta";
import { citySlug, isLive } from "@/lib/routes";
import { getCombineNote, getFeaturedCases, getProcessSteps, getServices } from "@/lib/content";
import { Hero } from "@/components/home/Hero";
import { Section } from "@/components/layout/Section";
import { SectionHead } from "@/components/page/SectionHead";
import { ServiceCard } from "@/components/page/ServiceCard";
import { CaseGrid } from "@/components/page/CaseGrid";
import { StepsStrip } from "@/components/page/StepsStrip";
import { CtaBand } from "@/components/page/CtaBand";
import { MoreLink } from "@/components/MoreLink";
import { Chip } from "@/components/ui/Chip";
import { CutFrame } from "@/components/ui/CutFrame";
import { BoxedLabel } from "@/components/ui/BoxedLabel";

/**
 * ════════════════════════════════════════════════════════════════════
 *  HOME (PLAN §5 Home): hero · proof strip · services · live systems
 *  teaser 🚩 · process · service area · final CTA.
 *
 *  Section numbers count only the sections this build renders, so a
 *  hidden proof strip or teaser never leaves a gap in the sequence.
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

  let n = 1; // the hero is ( 01 )
  const next = () => ++n;

  return (
    <>
      <Hero />

      {featured.length > 0 && (
        <Section aria-labelledby="proof">
          <div className="flex flex-col gap-10">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <SectionHead id="proof" index={next()} label="Work" title="Recent work" />
              <MoreLink href="/work/">All case studies</MoreLink>
            </div>
            <CaseGrid cases={featured} />
          </div>
        </Section>
      )}

      <Section aria-labelledby="services">
        <div className="flex flex-col gap-10">
          <SectionHead
            id="services"
            index={next()}
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
                <ServiceCard service={s} highlight={s.slug === "automations"} />
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* 🚩 Live systems teaser (PLAN §5 Home 4). Flag off: not rendered. */}
      {flags.automations && automations && (
        <Section aria-labelledby="live-systems" tone="frost" className="border-y border-ink">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <SectionHead
              id="live-systems"
              index={next()}
              label="Live systems"
              title="This site runs the same lead system you'd get"
              lede="Send the form on this site and you'll see it work: the instant reply, the owner alert, the follow-up. It's the system we build for clients."
            />
            <MoreLink href="/services/automations/">How automations work</MoreLink>
          </div>
        </Section>
      )}

      <Section aria-labelledby="process">
        <div className="flex flex-col gap-12">
          <SectionHead id="process" index={next()} label="Process" title="How a project runs" />
          <StepsStrip steps={getProcessSteps()} />
        </div>
      </Section>

      <Section aria-labelledby="area">
        <CutFrame size="lg" fill="frost" innerClassName="flex flex-col gap-8 p-6 lg:p-12">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink pb-5">
            <BoxedLabel tone="ink">Service area</BoxedLabel>
            <span className="font-mono text-label uppercase tracking-label text-steel">
              {site.serviceArea.label}
            </span>
          </div>
          <SectionHead
            id="area"
            index={next()}
            label="Local"
            title="Built in Acadiana, for Acadiana"
            lede="We work with trades businesses across the parishes around Lafayette, and we know what people here search for when the AC quits in August."
          />
          <ul className="flex flex-wrap gap-2">
            {site.serviceArea.cities.map((city) => {
              const href = `/areas/${citySlug(city)}/`;
              return (
                <li key={city}>
                  {isLive(href) ? (
                    <Link
                      href={href}
                      className="inline-flex min-h-touch items-center border border-ink px-3 font-mono text-label-sm uppercase tracking-label text-ink no-underline hover:bg-ink hover:text-ice active:translate-y-px"
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
        </CutFrame>
      </Section>

      <CtaBand
        copy={{
          heading: "Tell us about the job.",
          body: `One short form. We'll reach out within ${site.intake.responseTime}.`,
        }}
      />
    </>
  );
}
