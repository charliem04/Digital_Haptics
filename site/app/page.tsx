import Link from "next/link";
import type { ReactNode } from "react";
import { site } from "@/site.config";
import { flags } from "@/lib/flags";
import { pageMetadata } from "@/lib/meta";
import { contactLinks, ctaLink } from "@/lib/nav";
import { citySlug, isLive } from "@/lib/routes";
import { cn, pad2 } from "@/lib/cn";
import { getCombineNote, getCases, getPosts, getProcessSteps, getServices } from "@/lib/content";
import { Hero } from "@/components/home/Hero";
import { GlassPane } from "@/components/ui/GlassPane";
import { SectionHead } from "@/components/page/SectionHead";
import { formatDate } from "@/components/page/PostCard";
import { MoreLink } from "@/components/MoreLink";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Arrow } from "@/components/ui/Arrow";
import { CaseReel } from "@/components/page/CaseReel";

/**
 * ════════════════════════════════════════════════════════════════════
 *  HOME (PLAN §5 Home): hero · proof · services · live systems teaser 🚩
 *  · process · guides · service area · final CTA.
 *
 *  Below the hero, every block is a frosted glass pane (GlassPane) over
 *  the fixed liquid, laid out as a bento grid. The gaps between panes
 *  are where the liquid shows clearly, so there's no separate band.
 * ════════════════════════════════════════════════════════════════════
 */
export const metadata = pageMetadata({
  title: site.seo.defaultTitle,
  description: site.seo.defaultDescription,
  path: "/",
});

/** One glass block, announced as a region named by its heading. */
function Pane({
  id,
  className,
  innerClassName,
  track,
  children,
}: {
  id: string;
  className?: string;
  innerClassName?: string;
  track?: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} data-track-loc={track} className={cn("min-w-0", className)}>
      <GlassPane
        widget
        className="h-full"
        innerClassName={cn("flex h-full flex-col gap-8 p-6 lg:p-10", innerClassName)}
      >
        {children}
      </GlassPane>
    </section>
  );
}

const ROW_LINK =
  "group flex items-center justify-between gap-6 py-5 no-underline text-text transition-colors duration-[160ms] hover:text-text";

export default function Home() {
  // Every published case (Matt included), drifting in the reel.
  const work = getCases();
  const services = getServices();
  const steps = getProcessSteps();
  const posts = getPosts().slice(0, 3);
  const automations = isLive("/services/automations/");
  const cta = ctaLink();
  const { phone } = contactLinks();

  return (
    <>
      <Hero />

      <div className="page-x relative z-10 flex flex-col gap-6 pb-40 pt-room-section-sm lg:gap-8 lg:pb-[clamp(200px,28vh,320px)] lg:pt-room-section">
        {work.length > 0 && (
          <Pane id="proof">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <SectionHead id="proof" label="Work" title="Recent work" />
              <MoreLink href="/work/">All case studies</MoreLink>
            </div>
            <CaseReel cases={work} />
          </Pane>
        )}

        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          <Pane id="services" className="lg:col-span-7">
            <SectionHead
              id="services"
              label="Services"
              title="What we do"
              lede={getCombineNote()}
            />
            <ul className="flex flex-col border-t border-line">
              {services.map((s) => (
                <li key={s.slug} className="border-b border-line">
                  <Link href={`/services/${s.slug}/`} className={ROW_LINK}>
                    <div className="flex min-w-0 flex-col gap-1">
                      <h3 className="font-body text-room-step font-medium">{s.name}</h3>
                      <span className="text-room-small text-muted">{s.short}</span>
                      <span className="pt-1 font-body text-room-small font-medium text-amber">
                        From {s.priceFrom} {s.priceUnit}
                      </span>
                    </div>
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-control border border-line transition-colors duration-[160ms] group-hover:border-text group-hover:bg-room">
                      <Arrow className="size-3.5" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Pane>

          <Pane id="process" className="lg:col-span-5">
            <SectionHead id="process" label="Process" title="How a project runs" />
            <ol className="flex flex-col gap-6">
              {steps.map((step, i) => (
                <li key={step.name} className="flex gap-5">
                  <span className="w-8 shrink-0 font-body text-room-step font-medium text-amber">
                    {pad2(i + 1)}
                  </span>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-body text-room-step font-medium">{step.name}</h3>
                    <span className="text-room-small text-muted">{step.body}</span>
                  </div>
                </li>
              ))}
            </ol>
          </Pane>
        </div>

        {/* 🚩 Live systems teaser (PLAN §5 Home 4). Flag off: not rendered. */}
        {flags.automations && automations && (
          <Pane id="live-systems">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <SectionHead
                id="live-systems"
                label="Live systems"
                title="This site runs the same lead system you'd get"
                lede="Send the form on this site and you'll see it work: the instant reply, the owner alert, the follow-up. It's the system we build for clients."
              />
              <MoreLink href="/services/automations/">How automations work</MoreLink>
            </div>
          </Pane>
        )}

        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          {posts.length > 0 && (
            <Pane id="guides" className="lg:col-span-7">
              <SectionHead id="guides" label="Guides" title="Straight answers for trades owners" />
              <ul className="flex flex-col border-t border-line">
                {posts.map((p) => (
                  <li key={p.slug} className="border-b border-line">
                    <Link href={`/blog/${p.slug}/`} className={ROW_LINK}>
                      <div className="flex min-w-0 flex-col gap-1">
                        <h3 className="font-body text-room-step font-medium">{p.title}</h3>
                        <span className="text-room-small text-muted">
                          {formatDate(p.date)} · {p.readingMinutes} min read
                        </span>
                      </div>
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-control border border-line transition-colors duration-[160ms] group-hover:border-text group-hover:bg-room">
                        <Arrow className="size-3.5" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <div>
                <MoreLink href="/blog/">All guides</MoreLink>
              </div>
            </Pane>
          )}

          <Pane id="area" className={posts.length > 0 ? "lg:col-span-5" : "lg:col-span-12"}>
            <SectionHead
              id="area"
              label={`Local · ${site.serviceArea.label}`}
              title="Based in Acadiana, working statewide"
              lede="Based in Lafayette and raised in Acadiana. The work is remote, so we take on projects across Louisiana and beyond, and meet in person anywhere around here."
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
          </Pane>
        </div>

        {cta && (
          <Pane
            id="cta"
            track="cta-band"
            innerClassName="lg:flex-row lg:items-end lg:justify-between"
          >
            <div className="flex max-w-[720px] flex-col gap-4">
              <p className="text-room-small text-muted">Next step</p>
              <h2 id="cta" data-mt="" className="font-body text-room-cta font-medium">
                Tell us about the job.
              </h2>
              <p className="text-room-lede text-muted">
                One short form. We&rsquo;ll reach out within {site.intake.responseTime}.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Button href={cta.href}>{cta.label}</Button>
              {phone && (
                <a
                  href={phone.href}
                  className="inline-flex min-h-touch items-center no-underline font-body text-room-small text-text hover:text-amber active:text-muted"
                >
                  Or call {phone.display}
                </a>
              )}
            </div>
          </Pane>
        )}
      </div>
    </>
  );
}
