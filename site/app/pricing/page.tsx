import Link from "next/link";
import { pageMetadata } from "@/lib/meta";
import { getQuoteFactors, getQuoteStatement, getServices } from "@/lib/content";
import { PageHero } from "@/components/page/PageHero";
import { Section } from "@/components/layout/Section";
import { SectionHead } from "@/components/page/SectionHead";
import { CtaBand } from "@/components/page/CtaBand";
import { CutFrame } from "@/components/ui/CutFrame";
import { BoxedLabel } from "@/components/ui/BoxedLabel";
import { Marker } from "@/components/ui/Marker";
import { Arrow } from "@/components/ui/Arrow";

/**
 * ════════════════════════════════════════════════════════════════════
 *  PRICING (PLAN §5). No tiers: one "starting at" line per service,
 *  what affects the quote, and the statement that every project is
 *  quoted after a short call.
 *
 *  Figures are [PRICE] until you set them (PLAN: never invent prices).
 *  // OPEN: page title "Pricing" vs "Investment" (PLAN §10). Default
 *  // "Pricing".
 * ════════════════════════════════════════════════════════════════════
 */
export const metadata = pageMetadata({
  title: "Pricing",
  description:
    "Where web design and local SEO pricing starts for trades businesses in Acadiana. No packages to decode: every project is quoted after a short call.",
  path: "/pricing/",
});

export default function PricingPage() {
  const services = getServices();
  const statement = getQuoteStatement();

  return (
    <>
      <PageHero path="/pricing/" label="Pricing" title="Pricing" lead={statement} />

      <Section spacing="tight" aria-label="Starting prices" className="pb-section-sm lg:pb-section">
        <ul
          className={
            services.length > 2 ? "grid gap-6 lg:grid-cols-3" : "grid gap-6 md:grid-cols-2"
          }
        >
          {services.map((s) => (
            <li key={s.slug}>
              <CutFrame
                size="md"
                fill="white"
                className="h-full"
                innerClassName="flex h-full flex-col gap-5 p-6 lg:p-8"
              >
                <BoxedLabel active={s.slug === "automations"}>
                  {s.code} — {s.name}
                </BoxedLabel>
                <p className="font-display text-heading font-semibold">{s.price}</p>
                <p className="text-body-sm text-steel-deep">{s.short}</p>
                <Link
                  href={`/services/${s.slug}/`}
                  className="mt-auto inline-flex min-h-touch items-center gap-2 font-mono text-label uppercase tracking-label text-ink no-underline hover:underline hover:decoration-signal hover:decoration-2 hover:underline-offset-4 active:text-steel-deep"
                >
                  What&rsquo;s included
                  <Arrow className="size-3.5" />
                </Link>
              </CutFrame>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="frost" className="border-y border-ink" aria-labelledby="quote-factors">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <SectionHead
            id="quote-factors"
            label="Your quote"
            title="What affects your quote"
            lede={statement}
          />
          <ul className="flex flex-col border-t border-ink">
            {getQuoteFactors().map((f) => (
              <li
                key={f}
                className="flex items-start gap-3 border-b border-hairline py-4 text-body"
              >
                <Marker size="dot" className="mt-2.5" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <CtaBand
        copy={{
          heading: "Get a real number.",
          body: "Tell us what you need. We'll quote it after a short call.",
        }}
      />
    </>
  );
}
