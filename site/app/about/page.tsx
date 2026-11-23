import Image from "next/image";
import { site } from "@/site.config";
import { pageMetadata } from "@/lib/meta";
import { getAbout, getProcessSteps } from "@/lib/content";
import { PageHero } from "@/components/page/PageHero";
import { Section } from "@/components/layout/Section";
import { SectionHead } from "@/components/page/SectionHead";
import { StepsStrip } from "@/components/page/StepsStrip";
import { CtaBand } from "@/components/page/CtaBand";
import { Panel } from "@/components/ui/Panel";
import { SmallLabel } from "@/components/ui/SmallLabel";
import { Chip } from "@/components/ui/Chip";

/**
 * ════════════════════════════════════════════════════════════════════
 *  ABOUT (PLAN §5): who runs Digital Haptics, the construction
 *  background, how the agency works, local focus, CTA.
 *
 *  Copy lives in data/about.ts, written from Charles's answers. The
 *  photo slot is hidden until there's a photo.
 * ════════════════════════════════════════════════════════════════════
 */
export const metadata = pageMetadata({
  title: "About",
  description:
    "Charles Meyers grew up working jobs with his tradesman father. Now he builds websites and local SEO for trades businesses across Louisiana.",
  path: "/about/",
});

export default function AboutPage() {
  const about = getAbout();

  return (
    <>
      <PageHero
        path="/about/"
        label="About"
        title="Built by someone who's worked the job"
        lead={about.lead}
      />

      <Section tone="frost" className="border-y border-line" aria-labelledby="story">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-16">
          <div className="flex flex-col gap-6">
            <SectionHead id="story" label="The short version" title="Why trades" />
            <div className="flex max-w-[640px] flex-col gap-4">
              {about.story.map((p) => (
                <p key={p} className="text-room-body text-muted">
                  {p}
                </p>
              ))}
            </div>
            <p className="font-body text-room-small">
              {about.name} · <span className="text-muted">{about.role}</span>
            </p>
          </div>
          {about.photo && (
            <Panel fill="raised" innerClassName="overflow-hidden">
              <Image
                src={about.photo.src}
                alt={about.photo.alt}
                width={about.photo.width}
                height={about.photo.height}
                className="h-auto w-full"
              />
            </Panel>
          )}
        </div>
      </Section>

      <Section aria-labelledby="principles">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <SectionHead id="principles" label="How we work" title="What working together is like" />
          <ul className="flex flex-col border-t border-line">
            {about.principles.map((p) => (
              <li key={p} className="flex items-start gap-3 border-b py-4 text-body border-line">
                {p}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section aria-labelledby="process">
        <div className="flex flex-col gap-12">
          <SectionHead id="process" label="Process" title="How a project runs" />
          <StepsStrip steps={getProcessSteps()} />
        </div>
      </Section>

      <Section aria-labelledby="local">
        <Panel fill="surface" innerClassName="flex flex-col gap-8 p-6 lg:p-12">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-5 border-line">
            <SmallLabel>Local</SmallLabel>
            <span className="font-body text-room-small text-muted">{site.serviceArea.label}</span>
          </div>
          <SectionHead id="local" label="Acadiana" title="Local, and remote" lede={about.local} />
          <ul className="flex flex-wrap gap-2">
            {site.serviceArea.cities.map((c) => (
              <li key={c}>
                <Chip>{c}</Chip>
              </li>
            ))}
          </ul>
        </Panel>
      </Section>

      <CtaBand
        copy={{
          heading: "Let's talk about your business.",
          body: `Tell us what you need. We'll reach out within ${site.intake.responseTime}.`,
        }}
      />
    </>
  );
}
