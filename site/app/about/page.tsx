import Image from "next/image";
import { site } from "@/site.config";
import { pageMetadata } from "@/lib/meta";
import { getAbout, getProcessSteps } from "@/lib/content";
import { PageHero } from "@/components/page/PageHero";
import { SectionHead } from "@/components/page/SectionHead";
import { StepsStrip } from "@/components/page/StepsStrip";
import { CtaBand } from "@/components/page/CtaBand";
import { SmallLabel } from "@/components/ui/SmallLabel";
import { Chip } from "@/components/ui/Chip";
import { pad2 } from "@/lib/cn";
import { PageLiquid } from "@/components/page/PageLiquid";
import { PagePane, PaneStack } from "@/components/page/PagePane";

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

      <PageLiquid />
      <PaneStack>
        <PagePane labelledBy="story">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-16">
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
              <div className="overflow-hidden rounded-panel border border-text/[0.14]">
                <Image
                  src={about.photo.src}
                  alt={about.photo.alt}
                  width={about.photo.width}
                  height={about.photo.height}
                  className="h-auto w-full"
                />
              </div>
            )}
          </div>
        </PagePane>

        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          <PagePane labelledBy="principles" className="lg:col-span-7">
            <SectionHead
              id="principles"
              label="How we work"
              title="What working together is like"
            />
            <ol className="grid gap-4 sm:grid-cols-2">
              {about.principles.map((p, i) => (
                <li key={p}>
                  <div className="flex h-full flex-col gap-3 rounded-panel border border-text/[0.14] p-6">
                    <p className="font-body text-[2rem] font-medium leading-none text-amber">
                      {pad2(i + 1)}
                    </p>
                    <p className="text-room-body">{p}</p>
                  </div>
                </li>
              ))}
            </ol>
          </PagePane>

          <PagePane labelledBy="local" className="lg:col-span-5">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
              <SmallLabel>Local</SmallLabel>
              <span className="font-body text-room-small text-muted">{site.serviceArea.label}</span>
            </div>
            <SectionHead id="local" label="Acadiana" title="Local, and remote" lede={about.local} />
            <ul className="mt-auto flex flex-wrap gap-2">
              {site.serviceArea.cities.map((c) => (
                <li key={c}>
                  <Chip>{c}</Chip>
                </li>
              ))}
            </ul>
          </PagePane>
        </div>

        <PagePane labelledBy="process">
          <SectionHead id="process" label="Process" title="How a project runs" />
          <StepsStrip steps={getProcessSteps()} />
        </PagePane>

        <CtaBand
          glass
          copy={{
            heading: "Let's talk about your business.",
            body: `Tell us what you need. We'll reach out within ${site.intake.responseTime}.`,
          }}
        />
      </PaneStack>
    </>
  );
}
