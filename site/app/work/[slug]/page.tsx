import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/meta";
import { getCase, getCases, getNextCase } from "@/lib/content";
import { PageHero } from "@/components/page/PageHero";
import { Section } from "@/components/layout/Section";
import { SectionHead } from "@/components/page/SectionHead";
import { CtaBand } from "@/components/page/CtaBand";
import { Mdx } from "@/components/page/Mdx";
import { Chip } from "@/components/ui/Chip";
import { BoxedLabel } from "@/components/ui/BoxedLabel";
import { CutFrame } from "@/components/ui/CutFrame";
import { Marker } from "@/components/ui/Marker";
import { Arrow } from "@/components/ui/Arrow";

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
          <p className="self-start border border-ink bg-frost px-3 py-2 font-mono text-label uppercase tracking-label">
            Draft: not published. Shown on preview builds only.
          </p>
        )}
        <dl className="grid gap-x-10 gap-y-4 border-t border-ink pt-6 font-mono text-label uppercase tracking-label sm:grid-cols-[auto_1fr]">
          <dt className="text-steel">Trade</dt>
          <dd>{meta.trade}</dd>
          <dt className="text-steel">Location</dt>
          <dd>{meta.location}</dd>
          <dt className="text-steel">Systems</dt>
          <dd className="flex flex-wrap gap-2">
            {meta.systems.map((s) => (
              <Chip key={s}>{s}</Chip>
            ))}
          </dd>
          {meta.liveUrl && (
            <>
              <dt className="text-steel">Live site</dt>
              <dd>
                <a
                  href={meta.liveUrl}
                  rel="noopener"
                  className="inline-flex min-h-touch items-center gap-2 normal-case text-ink underline decoration-signal decoration-2 underline-offset-4"
                >
                  {meta.liveUrl.replace(/^https?:\/\//, "")}
                  <Arrow className="size-3.5" />
                </a>
              </dd>
            </>
          )}
        </dl>
      </PageHero>

      {meta.heroImage && (
        <Section spacing="none" aria-label="Screenshot">
          <CutFrame size="lg" fill="white" innerClassName="overflow-hidden">
            <Image
              src={meta.heroImage.src}
              alt={meta.heroImage.alt}
              width={meta.heroImage.width}
              height={meta.heroImage.height}
              className="h-auto w-full"
            />
          </CutFrame>
        </Section>
      )}

      <Section aria-label="The project">
        <article className="max-w-[720px]">
          <Mdx source={body} />
        </article>
      </Section>

      <Section tone="frost" className="border-y border-ink" aria-labelledby="systems">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <SectionHead id="systems" label="Systems running" title="What's running now" />
            <ul className="flex flex-wrap gap-2">
              {meta.systems.map((s) => (
                <li key={s}>
                  <BoxedLabel size="md">{s}</BoxedLabel>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-6">
            <SectionHead id="results" label="Results" title="What changed" />
            <dl className="border-t border-ink font-mono text-label">
              {meta.results.map((r) => (
                <div
                  key={r.label}
                  className="flex justify-between gap-6 border-b border-hairline py-3"
                >
                  <dt className="uppercase text-steel">{r.label}</dt>
                  <dd className="flex items-center gap-2 font-medium">
                    <Marker size="dot" />
                    {r.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Section>

      {next && (
        <Section spacing="tight" aria-label="Next case study">
          <Link
            href={`/work/${next.slug}/`}
            className="group flex min-h-touch items-center justify-between gap-6 border-y border-ink py-6 text-ink no-underline active:text-steel-deep"
          >
            <span className="flex flex-col gap-1">
              <span className="font-mono text-label uppercase tracking-label text-steel">
                Next case study
              </span>
              <span className="font-display text-subheading font-semibold">
                {next.client} — {next.trade}
              </span>
            </span>
            <Arrow className="size-6 transition-transform duration-[250ms] ease-brand group-hover:translate-x-1 group-hover:translate-y-1" />
          </Link>
        </Section>
      )}

      <CtaBand
        copy={{
          heading: "Have a job like this?",
          body: "Tell us about your business and what it needs.",
        }}
      />
    </>
  );
}
