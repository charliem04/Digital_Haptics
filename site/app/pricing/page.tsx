import Link from "next/link";
import { pageMetadata } from "@/lib/meta";
import { ctaLink } from "@/lib/nav";
import { getQuoteFactors, getQuoteStatement, getServices, getStartSteps } from "@/lib/content";
import { PageHero } from "@/components/page/PageHero";
import { Section } from "@/components/layout/Section";
import { SectionHead } from "@/components/page/SectionHead";
import { StepsStrip } from "@/components/page/StepsStrip";
import { CtaBand } from "@/components/page/CtaBand";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { Arrow } from "@/components/ui/Arrow";
import { cn, pad2 } from "@/lib/cn";

/**
 * ════════════════════════════════════════════════════════════════════
 *  PRICING (PLAN §5). No tiers: one "starting at" figure per service,
 *  what affects the quote, and the statement that every project is
 *  quoted after a short call. Figures are Charles's (data/services.ts).
 *
 *  The one place amber is used at full strength as a surface, by the
 *  owner's request (2026-11-23). The first card is the natural place to
 *  begin, so it carries it. No "most popular" badge: that would be a
 *  claim with nothing behind it.
 *
 *  // OPEN: page title "Pricing" vs "Investment" (PLAN §10). Default
 *  // "Pricing".
 * ════════════════════════════════════════════════════════════════════
 */
export const metadata = pageMetadata({
  title: "Pricing",
  description:
    "Where web design, local SEO and Google Business Profile pricing starts for trades businesses in Acadiana. Every project is quoted after a short call.",
  path: "/pricing/",
});

function Check({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 16 16"
      className={cn("mt-[0.2em] size-4 shrink-0", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 8.5 6.5 12 13 4.5" />
    </svg>
  );
}

export default function PricingPage() {
  const services = getServices();
  const statement = getQuoteStatement();
  const cta = ctaLink();

  return (
    <>
      <PageHero
        path="/pricing/"
        label="Pricing"
        title="Straight numbers"
        lead={`No packages to decode. Here's where each service starts. ${statement}`}
        art="arc"
      />

      <Section spacing="tight" aria-label="Starting prices" className="pb-section-sm lg:pb-section">
        <ul className={cn("grid items-stretch gap-6", services.length > 2 && "lg:grid-cols-3")}>
          {services.map((s, i) => {
            const lead = i === 0;
            return (
              <li key={s.slug}>
                <Panel
                  fill="raised"
                  widget
                  hover
                  className="h-full"
                  innerClassName={cn(
                    "flex h-full flex-col gap-6 p-7 lg:p-9",
                    lead && "!bg-amber text-on-amber"
                  )}
                >
                  <h2 className="font-body text-room-card font-medium">{s.name}</h2>

                  <div className="flex flex-col gap-1">
                    <p className={cn("font-body text-room-small", !lead && "text-muted")}>
                      Starting at
                    </p>
                    <p
                      className={cn(
                        "font-body text-[clamp(3.5rem,5.4vw,5.25rem)] font-medium leading-none tracking-[-0.04em]",
                        !lead && "text-amber"
                      )}
                    >
                      {s.priceFrom}
                    </p>
                    <p className={cn("font-body text-room-body", !lead && "text-muted")}>
                      {s.priceUnit}
                    </p>
                  </div>

                  <p className={cn("text-room-body", !lead && "text-muted")}>{s.short}</p>

                  <ul
                    className={cn(
                      "flex flex-col gap-3 border-t pt-6 text-room-small",
                      lead ? "border-on-amber/25" : "border-line text-text"
                    )}
                  >
                    {s.included.slice(0, 4).map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <Check className={lead ? "text-on-amber" : "text-amber"} />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto flex flex-col gap-3 pt-2">
                    {cta && (
                      <Button href={cta.href} block variant={lead ? "accent" : "primary"}>
                        {cta.label}
                      </Button>
                    )}
                    <Link
                      href={`/services/${s.slug}/`}
                      className={cn(
                        "inline-flex min-h-touch items-center gap-2 self-start font-body text-room-small font-medium underline underline-offset-[5px] hover:decoration-2",
                        lead ? "text-on-amber" : "text-text hover:decoration-amber"
                      )}
                    >
                      Everything included
                      <Arrow className="size-3.5" />
                    </Link>
                  </div>
                </Panel>
              </li>
            );
          })}
        </ul>
      </Section>

      <Section tone="frost" className="border-y border-line" aria-labelledby="quote-factors">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-16">
          <SectionHead
            id="quote-factors"
            label="Your quote"
            title="What affects your quote"
            lede="A starting price is where a simple version begins. These are what move it."
          />
          <ol className="grid gap-4 sm:grid-cols-2">
            {getQuoteFactors().map((f, i) => (
              <li key={f}>
                <Panel
                  fill="raised"
                  widget
                  className="h-full"
                  innerClassName="flex h-full flex-col gap-3 p-6"
                >
                  <p className="font-body text-[2rem] font-medium leading-none text-amber">
                    {pad2(i + 1)}
                  </p>
                  <p className="text-room-body">{f}</p>
                </Panel>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      <Section aria-labelledby="how-pricing-works">
        <div className="flex flex-col gap-12">
          <SectionHead
            id="how-pricing-works"
            label="How it works"
            title="From a short form to a real number"
          />
          <StepsStrip steps={getStartSteps()} />
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
