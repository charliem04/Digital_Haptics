import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { site } from "@/site.config";
import { pageMetadata } from "@/lib/meta";
import Link from "next/link";
import { getCases, getCities, getCity, getServices, getTradeByName } from "@/lib/content";
import { CaseGrid } from "@/components/page/CaseGrid";
import { MoreLink } from "@/components/MoreLink";
import { PageHero } from "@/components/page/PageHero";
import { SectionHead } from "@/components/page/SectionHead";
import { ServiceCard } from "@/components/page/ServiceCard";
import { CtaBand } from "@/components/page/CtaBand";
import { Chip } from "@/components/ui/Chip";
import { PageLiquid } from "@/components/page/PageLiquid";
import { PagePane, PaneStack } from "@/components/page/PagePane";

/**
 * ════════════════════════════════════════════════════════════════════
 *  CITY PAGE (PLAN §5 /areas/[city]), from data/cities.ts.
 *
 *  Only cities with genuinely unique content (`ready`) are emitted in
 *  production; previews also show drafts, marked, for review. With none
 *  ready, static export still needs one param, so a placeholder `_` is
 *  emitted that renders the 404 page (unlinked, noindex), as /work/ does.
 * ════════════════════════════════════════════════════════════════════
 */
export const dynamicParams = false;

const NONE = "_";

export function generateStaticParams() {
  const slugs = getCities().map((c) => ({ city: c.slug }));
  return slugs.length ? slugs : [{ city: NONE }];
}

export function generateMetadata({ params }: { params: { city: string } }): Metadata {
  const c = getCity(params.city);
  if (!c) return {};
  return pageMetadata(
    {
      title: `Web design in ${c.name}, ${site.location.state}`,
      description:
        c.description ??
        `Websites and local SEO for trades businesses in ${c.name}, Louisiana: built for phones, made to rank locally and turn visitors into calls.`,
      path: `/areas/${c.slug}/`,
    },
    { noindex: c.draft }
  );
}

export default function CityPage({ params }: { params: { city: string } }) {
  const c = getCity(params.city);
  if (!c) notFound();
  // getCases() applies the publish and permission rules for this build.
  const project = getCases().find((x) => x.slug === c.caseSlug);

  return (
    <>
      <PageHero
        path={`/areas/${c.slug}/`}
        label={`Service area — ${c.name}, ${site.location.state}`}
        title={`Websites for ${c.name} trades`}
        lead={c.intro}
      >
        {c.draft && (
          <p className="self-start border px-3 py-2 rounded-notice border-line bg-surface font-body text-room-small">
            Draft: not published until this city has its own content. Preview builds only.
          </p>
        )}
      </PageHero>

      <PageLiquid />
      <PaneStack>
        <PagePane labelledBy="market">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <SectionHead id="market" label={c.name} title="The local market" lede={c.market} />
            <div className="flex flex-col gap-6">
              {c.work && (
                <SectionHead
                  id="work-nearby"
                  label="Nearby"
                  title="Work in the area"
                  lede={c.work}
                />
              )}
              {c.workLink && (
                <div>
                  <MoreLink href={c.workLink.href}>{c.workLink.label}</MoreLink>
                </div>
              )}
              <div className="flex flex-col gap-3">
                <p className="font-body text-room-small text-muted">Trades we work with here</p>
                <ul className="flex flex-wrap gap-2">
                  {c.trades.map((t) => {
                    const page = getTradeByName(t);
                    return (
                      <li key={t}>
                        {page ? (
                          <Link
                            href={`/trades/${page.slug}/`}
                            className="inline-flex min-h-touch items-center border no-underline active:translate-y-px rounded-control border-line px-4 font-body text-room-small text-text hover:bg-raised hover:text-text"
                          >
                            {t}
                          </Link>
                        ) : (
                          <Chip>{t}</Chip>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </PagePane>

        {project && (
          <PagePane labelledBy="city-work">
            <SectionHead id="city-work" label="Local work" title={`Our work in ${c.name}`} />
            <CaseGrid cases={[project]} />
          </PagePane>
        )}

        <PagePane labelledBy="city-services">
          <SectionHead id="city-services" label="Services" title={`What we do in ${c.name}`} />
          <ul className="grid gap-4 md:grid-cols-2 lg:gap-6 xl:grid-cols-4">
            {getServices().map((s) => (
              <li key={s.slug}>
                <ServiceCard service={s} />
              </li>
            ))}
          </ul>
        </PagePane>

        <CtaBand
          glass
          copy={{
            heading: `Work in ${c.name}? Let's talk.`,
            body: `Tell us about your business. We'll reach out within ${site.intake.responseTime}.`,
          }}
        />
      </PaneStack>
    </>
  );
}
