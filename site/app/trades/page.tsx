import Link from "next/link";
import { pageMetadata } from "@/lib/meta";
import { getTrades } from "@/lib/content";
import { PageHero } from "@/components/page/PageHero";
import { CtaBand } from "@/components/page/CtaBand";
import { Panel } from "@/components/ui/Panel";
import { Arrow } from "@/components/ui/Arrow";
import { PageGlow } from "@/components/page/MoltenArt";
import { PagePane, PaneStack } from "@/components/page/PagePane";

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
      />
      <PageGlow />
      <PaneStack>
        <PagePane label="Trades">
          <ul className="grid gap-4 md:grid-cols-3 lg:gap-6">
            {getTrades().map((t) => (
              <li key={t.slug} className="flex">
                <Panel
                  as={Link}
                  href={`/trades/${t.slug}/`}
                  fill="clear"
                  widget
                  className="flex w-full rounded-panel border border-text/[0.14] no-underline text-text transition-colors duration-200 hover:border-text/40"
                  innerClassName="flex w-full flex-col gap-4 p-6 lg:p-8"
                >
                  <h2 className="font-body text-room-card font-medium">{t.name}</h2>
                  <p className="flex-1 text-room-body text-muted">{t.lead}</p>
                  <span className="flex items-center justify-between gap-4 font-body text-room-small font-medium">
                    Websites for {t.audience}
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-control border border-line transition-colors duration-[160ms] group-hover/panel:border-text">
                      <Arrow className="size-3.5" />
                    </span>
                  </span>
                </Panel>
              </li>
            ))}
          </ul>
        </PagePane>
        <CtaBand
          glass
          copy={{
            heading: "Don't see your trade?",
            body: "We work with trades of all kinds. Tell us what your business does.",
          }}
        />
      </PaneStack>
    </>
  );
}
