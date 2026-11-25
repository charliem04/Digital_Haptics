import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/meta";
import { getCase, getCases, getNextCase, getTradeByName } from "@/lib/content";
import { MoreLink } from "@/components/MoreLink";
import { PageHero } from "@/components/page/PageHero";
import { SectionHead } from "@/components/page/SectionHead";
import { CtaBand } from "@/components/page/CtaBand";
import { Mdx } from "@/components/page/Mdx";
import { Chip } from "@/components/ui/Chip";
import { cn } from "@/lib/cn";
import { Arrow } from "@/components/ui/Arrow";
import { PageGlow } from "@/components/page/MoltenArt";
import { PagePane, PaneStack } from "@/components/page/PagePane";

/**
 * ════════════════════════════════════════════════════════════════════
 *  CASE STUDY TEMPLATE (PLAN §5 Work):
 *    1. header: client, trade, location, systems chips, live-site link
 *    2. the problem          ┐ from the MDX body (## headings)
 *    3. what we built        ┘
 *    4. systems running
 *    5. results: placeholders only until real numbers are provided
 *    6. next case study + CTA
 *
 *  Only cases this build may show are emitted (lib/content.ts): in
 *  production, published AND permission; on previews, drafts too.
 * ════════════════════════════════════════════════════════════════════
 */
export const dynamicParams = false;

/**
 * Static export refuses a dynamic route with no params, and production
 * has no publishable case yet. With none, emit one placeholder slug that
 * renders the 404 page: unlinked, noindex, and gone the moment a real
 * case is published.
 */
const NONE = "_";

/** Screenshot frame: thin outline, squircle corners, like the case cards. */
const FRAME = "overflow-hidden rounded-panel border border-text/[0.14] bg-room";

export function generateStaticParams() {
  const slugs = getCases().map((c) => ({ slug: c.slug }));
  return slugs.length ? slugs : [{ slug: NONE }];
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const c = getCase(params.slug);
  if (!c) return {};
  return pageMetadata(
    {
      title: `${c.meta.client}: ${c.meta.trade}`,
      description: c.meta.summary,
      path: `/work/${c.meta.slug}/`,
    },
    { noindex: c.meta.draft }
  );
}

export default function CasePage({ params }: { params: { slug: string } }) {
  const c = getCase(params.slug);
  if (!c) notFound();
  const { meta, body } = c;
  const next = getNextCase(meta.slug);
  const trade = getTradeByName(meta.trade);

  return (
    <>
      <PageHero
        path={`/work/${meta.slug}/`}
        leafLabel={meta.client}
        label={`Case study — ${meta.trade}`}
        title={meta.client}
        lead={meta.summary}
      >
        {meta.draft && (
          <p className="self-start border px-3 py-2 rounded-notice border-line bg-surface font-body text-room-small">
            Draft: not published. Shown on preview builds only.
          </p>
        )}
        {meta.demo && (
          <p className="self-start border px-3 py-2 rounded-notice border-line bg-surface font-body text-room-small">
            Demo: a proposed redesign. This is not the business&rsquo;s live website.
          </p>
        )}
        <dl className="grid gap-x-10 gap-y-4 border-t pt-6 sm:grid-cols-[auto_1fr] border-line font-body text-room-body">
          <dt className="text-muted">Trade</dt>
          <dd>{meta.trade}</dd>
          <dt className="text-muted">Location</dt>
          <dd>{meta.location}</dd>
          <dt className="text-muted">Systems</dt>
          <dd className="flex flex-wrap gap-2">
            {meta.systems.map((s) => (
              <Chip key={s}>{s}</Chip>
            ))}
          </dd>
          {meta.liveUrl && (
            <>
              <dt className="text-muted">{meta.demo ? "Demo site" : "Live site"}</dt>
              <dd>
                <a
                  href={meta.liveUrl}
                  rel="noopener"
                  className="inline-flex min-h-touch items-center gap-2 underline decoration-2 underline-offset-4 text-text decoration-amber"
                >
                  {meta.liveUrl.replace(/^https?:\/\//, "")}
                  <Arrow className="size-3.5" />
                </a>
              </dd>
            </>
          )}
        </dl>
      </PageHero>

      <PageGlow />
      <PaneStack>
        {meta.heroImage && (
          <section
            aria-label="Screenshots"
            className="grid items-start gap-6 lg:grid-cols-[minmax(0,4fr)_minmax(0,1fr)]"
          >
            <div className={FRAME}>
              <Image
                src={meta.heroImage.src}
                alt={meta.heroImage.alt}
                width={meta.heroImage.width}
                height={meta.heroImage.height}
                className="h-auto w-full"
              />
            </div>
            {meta.mobileImage && (
              <div className={cn(FRAME, "mx-auto w-full max-w-[280px]")}>
                <Image
                  src={meta.mobileImage.src}
                  alt={meta.mobileImage.alt}
                  width={meta.mobileImage.width}
                  height={meta.mobileImage.height}
                  className="h-auto w-full"
                />
              </div>
            )}
          </section>
        )}

        <div className="grid items-start gap-6 lg:grid-cols-12 lg:gap-8">
          <PagePane label="The project" className="lg:col-span-8">
            <article className="max-w-[720px]">
              <Mdx source={body} />
              {trade && (
                <div className="mt-10">
                  <MoreLink href={`/trades/${trade.slug}/`}>Websites for {trade.audience}</MoreLink>
                </div>
              )}
            </article>
          </PagePane>

          {/* Results beside the story on desktop, as outlined tiles. */}
          <PagePane labelledBy="results" className="lg:sticky lg:top-24 lg:col-span-4">
            <SectionHead
              id="results"
              label={meta.demo ? "Status" : "Results"}
              title={meta.demo ? "Where it stands" : "What changed"}
            />
            <dl className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {meta.results.map((r) => (
                <div
                  key={r.label}
                  className="flex flex-col-reverse gap-2 rounded-panel border border-text/[0.14] p-5"
                >
                  <dt className="text-room-small text-muted">{r.label}</dt>
                  <dd className="font-body text-[clamp(1.375rem,2vw,1.75rem)] font-medium leading-tight text-amber">
                    {r.value}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="flex flex-col gap-4 border-t border-line pt-6">
              <h3 id="systems" className="text-room-small text-muted">
                {meta.demo ? "What's in the demo" : "What's running now"}
              </h3>
              <ul className="flex flex-wrap gap-2">
                {meta.systems.map((s) => (
                  <li key={s}>
                    <Chip>{s}</Chip>
                  </li>
                ))}
              </ul>
            </div>
          </PagePane>
        </div>

        {next && (
          <PagePane label="Next case study" innerClassName="py-2 lg:py-2">
            <Link
              href={`/work/${next.slug}/`}
              className="group flex min-h-touch items-center justify-between gap-6 py-4 no-underline text-text active:text-muted"
            >
              <span className="flex flex-col gap-1">
                <span className="font-body text-room-small text-muted">Next case study</span>
                <span className="font-body text-room-card font-medium">
                  {next.client} — {next.trade}
                </span>
              </span>
              <span className="flex size-12 shrink-0 items-center justify-center rounded-control border border-line transition-colors duration-[160ms] group-hover:border-text">
                <Arrow className="size-4" />
              </span>
            </Link>
          </PagePane>
        )}

        <CtaBand
          glass
          copy={{
            heading: "Have a job like this?",
            body: "Tell us about your business and what it needs.",
          }}
        />
      </PaneStack>
    </>
  );
}
