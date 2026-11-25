import Link from "next/link";
import { pageMetadata } from "@/lib/meta";
import { ctaLink } from "@/lib/nav";
import { getQuoteFactors, getQuoteStatement, getServices, getStartSteps } from "@/lib/content";
import { PageHero } from "@/components/page/PageHero";
import { SectionHead } from "@/components/page/SectionHead";
import { StepsStrip } from "@/components/page/StepsStrip";
import { CtaBand } from "@/components/page/CtaBand";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { Arrow } from "@/components/ui/Arrow";
import { cn, pad2 } from "@/lib/cn";
import { PageLiquid } from "@/components/page/PageLiquid";
import { PagePane, PaneStack } from "@/components/page/PagePane";

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
    "Where web design, local SEO, Google Business Profile and integration pricing starts for Acadiana trades businesses. Quoted after a short call.",
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
  // One-time project prices on the top row (Web Design, Integrations),
  // monthly services below (owner's call, 2026-11-25).
  const ORDER = ["web-design", "integrations", "local-seo", "google-business-profile"];
  const rank = (slug: string) => (ORDER.includes(slug) ? ORDER.indexOf(slug) : ORDER.length);
  const services = [...getServices()].sort((a, b) => rank(a.slug) - rank(b.slug));
  const statement = getQuoteStatement();
  const cta = ctaLink();

  return (
    <>
      <PageHero
        path="/pricing/"
        label="Pricing"
        title="Straight numbers"
        lead={`No packages to decode. Here's where each service starts. ${statement}`}
      />

      <PageLiquid />
      <PaneStack>
        <PagePane label="Starting prices">
          <ul
            className={cn(
              "grid items-stretch gap-4 lg:gap-6",
              // Four services read best as two rows of two.
              services.length === 4 ? "md:grid-cols-2" : services.length > 2 && "lg:grid-cols-3"
            )}
          >
            {services.map((s, i) => {
              const lead = i === 0;
              return (
                <li key={s.slug}>
                  <Panel
                    fill={lead ? "raised" : "clear"}
                    widget
                    hover={lead}
                    className={cn(
                      "h-full",
                      !lead &&
                        "rounded-panel border border-text/[0.14] transition-colors duration-200 hover:border-text/40"
                    )}
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
                      {s.pricingNote && (
                        <p
                          className={cn(
                            "pt-2 font-body text-room-small",
                            lead ? "text-on-amber" : "text-text"
                          )}
                        >
                          {s.pricingNote}
                        </p>
                      )}
                    </div>

                    <p className={cn("text-room-body", !lead && "text-muted")}>{s.short}</p>

                    <ul
                      className={cn(
                        "flex flex-col gap-3 border-t pt-6 text-room-small",
                        lead ? "border-on-amber/25" : "border-line text-text"
                      )}
                    >
                      {/* What the price buys: the add-ons, where a service has them. */}
                      {(s.addOns ?? s.included).slice(0, 4).map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <Check className={lead ? "text-on-amber" : "text-amber"} />
                          {item}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto flex flex-col gap-3 pt-2">
                      {cta && (
                        <Button href={cta.href} block variant={lead ? "glass" : "primary"}>
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
        </PagePane>

        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          <PagePane labelledBy="quote-factors" className="lg:col-span-7">
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
                    fill="clear"
                    className="h-full rounded-panel border border-text/[0.14]"
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
          </PagePane>

          <PagePane labelledBy="how-pricing-works" className="lg:col-span-5">
            <SectionHead
              id="how-pricing-works"
              label="How it works"
              title="From a short form to a real number"
            />
            <StepsStrip steps={getStartSteps()} compact />
          </PagePane>
        </div>

        <CtaBand
          glass
          copy={{
            heading: "Get a real number.",
            body: "Tell us what you need. We'll quote it after a short call.",
          }}
        />
      </PaneStack>
    </>
  );
}
