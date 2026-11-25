import Image from "next/image";
import Link from "next/link";
import { pageMetadata } from "@/lib/meta";
import {
  getCasesFor,
  getCombineNote,
  getProcessSteps,
  getServices,
  getTrades,
} from "@/lib/content";
import { cn } from "@/lib/cn";
import type { CaseStudy, Service } from "@/content/types";
import { PageHero } from "@/components/page/PageHero";
import { PageGlow } from "@/components/page/MoltenArt";
import { PagePane, PaneStack } from "@/components/page/PagePane";
import { SectionHead } from "@/components/page/SectionHead";
import { StepsStrip } from "@/components/page/StepsStrip";
import { CtaBand } from "@/components/page/CtaBand";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Arrow } from "@/components/ui/Arrow";

/**
 * ════════════════════════════════════════════════════════════════════
 *  SERVICES OVERVIEW (PLAN §5).
 *
 *  About the work, not the price (owner's request, 2026-11-25): each
 *  service gets its own pane with what it is, everything it delivers,
 *  and screenshots of real projects where it was delivered. Prices live
 *  on /pricing only, so the two pages don't repeat each other.
 * ════════════════════════════════════════════════════════════════════
 */
export const metadata = pageMetadata({
  title: "Services",
  description:
    "Web design, local SEO and Google Business Profile management for trades businesses in Acadiana, Louisiana: built for phones and made to get found.",
  path: "/services/",
});

const pad2 = (n: number) => String(n).padStart(2, "0");

/** A real project where this service was delivered. */
function WorkThumb({ c }: { c: CaseStudy }) {
  const image = c.cardImage ?? c.heroImage;
  return (
    <Link href={`/work/${c.slug}/`} className="group flex flex-col gap-3 no-underline text-text">
      <div className="relative aspect-[16/10] overflow-hidden rounded-panel border border-text/[0.14] bg-room transition-colors duration-200 group-hover:border-text/40">
        {image && (
          <Image
            src={image.src}
            alt=""
            width={image.width}
            height={image.height}
            sizes="(min-width: 1024px) 420px, 100vw"
            className="absolute inset-0 size-full object-cover object-top transition-transform duration-500 ease-brand group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        )}
      </div>
      <span className="flex items-center justify-between gap-4 px-1">
        <span className="flex min-w-0 flex-col">
          <span className="font-body text-room-small font-medium">{c.client}</span>
          <span className="font-body text-room-small text-muted">
            {c.location ? `${c.trade} · ${c.location}` : c.trade}
          </span>
        </span>
        <span className="flex size-9 shrink-0 items-center justify-center rounded-control border border-line transition-colors duration-[160ms] group-hover:border-text">
          <Arrow className="size-3" />
          <span className="sr-only">Read the {c.client} case study</span>
        </span>
      </span>
    </Link>
  );
}

function ServicePane({ s, index }: { s: Service; index: number }) {
  const work = getCasesFor(s).slice(0, 2);
  const headingId = `svc-${s.slug}`;
  const flip = index % 2 === 1;

  return (
    <PagePane labelledBy={headingId}>
      <div
        className={cn(
          "grid gap-10 lg:gap-14",
          work.length > 0 && "lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]"
        )}
      >
        <div className={cn("flex flex-col gap-8", flip && work.length > 0 && "lg:order-2")}>
          <div className="flex flex-col gap-4">
            <SectionLabel>
              {pad2(index + 1)} · {s.name}
            </SectionLabel>
            <h2 id={headingId} data-mt="" className="font-body text-room-section font-medium">
              {s.short}
            </h2>
            <p className="max-w-[640px] text-room-body text-muted">{s.lead}</p>
          </div>

          {/* The deliverables, numbered, so it reads as a list of things
              you get rather than a feature checklist. */}
          <div className="flex flex-col gap-4">
            <p className="font-body text-room-small text-muted">What you get</p>
            <ol className="grid gap-3 sm:grid-cols-2">
              {s.included.map((item, i) => (
                <li
                  key={item}
                  className="flex items-start gap-4 rounded-field border border-text/[0.14] p-4"
                >
                  <span className="font-body text-room-small font-medium text-amber">
                    {pad2(i + 1)}
                  </span>
                  <span className="text-room-small">{item}</span>
                </li>
              ))}
            </ol>
          </div>

          <Link
            href={`/services/${s.slug}/`}
            className="inline-flex min-h-touch items-center gap-2 self-start font-body text-room-small font-medium text-text underline underline-offset-[5px] hover:decoration-2 hover:decoration-amber"
          >
            More about {s.name}
            <Arrow className="size-3.5" />
          </Link>
        </div>

        {work.length > 0 && (
          <div className={cn("flex flex-col gap-4", flip && "lg:order-1")}>
            <p className="font-body text-room-small text-muted">In the work</p>
            <ul className="flex flex-col gap-6">
              {work.map((c) => (
                <li key={c.slug}>
                  <WorkThumb c={c} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </PagePane>
  );
}

export default function ServicesPage() {
  const services = getServices();

  return (
    <>
      <PageHero path="/services/" label="Services" title="What we do" lead={getCombineNote()}>
        {/* Jump to a service. */}
        <nav aria-label="Services on this page">
          <ul className="flex flex-wrap gap-2">
            {services.map((s) => (
              <li key={s.slug}>
                <a
                  href={`#svc-${s.slug}`}
                  className="inline-flex min-h-touch items-center rounded-control border border-line px-4 font-body text-room-small text-text no-underline transition-colors duration-[160ms] hover:border-text active:translate-y-px"
                >
                  {s.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </PageHero>
      <PageGlow />
      <PaneStack>
        {services.map((s, i) => (
          <ServicePane key={s.slug} s={s} index={i} />
        ))}

        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          <PagePane labelledBy="by-trade" className="lg:col-span-5">
            <SectionHead
              id="by-trade"
              label="Trades"
              title="Built around how your trade gets hired"
              lede="A roofer after a storm and a plumber on an emergency call need different things from a website."
            />
            <ul className="mt-auto flex flex-col border-t border-line">
              {getTrades().map((t) => (
                <li key={t.slug} className="border-b border-line">
                  <Link
                    href={`/trades/${t.slug}/`}
                    className="group flex min-h-touch items-center justify-between gap-6 py-5 no-underline text-text"
                  >
                    <span className="font-body text-room-step font-medium">
                      Websites for {t.audience}
                    </span>
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-control border border-line transition-colors duration-[160ms] group-hover:border-text">
                      <Arrow className="size-3.5" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </PagePane>

          <PagePane labelledBy="service-process" className="lg:col-span-7">
            <SectionHead id="service-process" label="Process" title="How a project runs" />
            <StepsStrip steps={getProcessSteps()} compact />
          </PagePane>
        </div>

        <CtaBand
          glass
          copy={{
            heading: "Not sure what you need?",
            body: "Tell us about the business. We'll recommend what fits, and what doesn't.",
          }}
        />
      </PaneStack>
    </>
  );
}
