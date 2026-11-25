import Link from "next/link";
import { pageMetadata } from "@/lib/meta";
import { getTrades } from "@/lib/content";
import { PageHero } from "@/components/page/PageHero";
import { Section } from "@/components/layout/Section";
import { CtaBand } from "@/components/page/CtaBand";
import { Panel } from "@/components/ui/Panel";
import { Arrow } from "@/components/ui/Arrow";

/** Trades hub: one card per trade page (data/trades.ts). */
export const metadata = pageMetadata({
  title: "Websites by trade",
  description:
    "Websites and local SEO shaped around how each trade really gets hired, for roofers, plumbers and dirt work contractors across Acadiana, Louisiana.",
  path: "/trades/",
});

export default function TradesPage() {
  return (
    <>
      <PageHero
        path="/trades/"
        label="Trades"
        title="Websites by trade"
        lead="A roofer after a storm and a plumber with an emergency call need different things from a website. Here's how we build for each."
        art="rise"
      />
      <Section spacing="tight" aria-label="Trades" className="pb-section-sm lg:pb-section">
        <ul className="grid gap-6 md:grid-cols-3">
          {getTrades().map((t) => (
            <li key={t.slug} className="flex">
              <Panel
                as={Link}
                href={`/trades/${t.slug}/`}
                fill="raised"
                widget
                hover
                className="flex w-full no-underline text-text"
                innerClassName="flex w-full flex-col gap-4 p-6 lg:p-8"
              >
                <h2 className="font-body text-room-card font-medium">{t.name}</h2>
                <p className="flex-1 text-room-body text-muted">{t.lead}</p>
                <span className="flex items-center justify-between gap-4 font-body text-room-small font-medium">
                  Websites for {t.audience}
                  <Arrow className="size-[15px] shrink-0 text-amber" />
                </span>
              </Panel>
            </li>
          ))}
        </ul>
      </Section>
      <CtaBand
        copy={{
          heading: "Don't see your trade?",
          body: "We work with trades of all kinds. Tell us what your business does.",
        }}
      />
    </>
  );
}
