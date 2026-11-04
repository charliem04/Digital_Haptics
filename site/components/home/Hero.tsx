import { flags } from "@/lib/flags";
import { ctaLink } from "@/lib/nav";
import { isLive } from "@/lib/routes";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ArrowBlock } from "@/components/ui/Arrow";
import { Button } from "@/components/ui/Button";
import { Flare } from "@/components/ui/Flare";
import { HeroSidebar } from "@/components/HeroSidebar";
import { LeadFlowPanel } from "@/components/LeadFlowPanel";

/**
 * ════════════════════════════════════════════════════════════════════
 *  HOME HERO (PLAN §5 Home 1, §4.4, §4.5). Copy is PLAN §5 verbatim,
 *  both flag states.
 *
 *  Geometry (measured in Phase 1, REFACTOR_AUDIT §10):
 *    · xl+: the rail and the flare start at the top of the PAGE, behind
 *      the header (they're pulled up by --header-h; the header insets
 *      itself on `/`). The crossing sits 350px left of the rail; the
 *      horizontal line stops at the rail; the headline is capped so
 *      "Websites that" stays on one line beside the rail.
 *    · below xl: no rail. The ACT list becomes the steel-panel band
 *      under the hero, and the crossing drops below the buttons so the
 *      horizontal line never runs through text.
 *
 *  The headline is the LCP element and is never animated.
 * ════════════════════════════════════════════════════════════════════
 */
const COPY = flags.automations
  ? {
      label: "Web design · Local SEO · Automations — Acadiana, LA",
      subline:
        "Design, local SEO and lead automations for trades businesses. Built to load fast, rank locally and follow up with every lead automatically.",
    }
  : {
      label: "Web design · Local SEO — Acadiana, LA",
      subline:
        "Design and local SEO for trades businesses. Built to load fast, rank locally and turn visitors into calls.",
    };

export function Hero() {
  const cta = ctaLink();
  const work = isLive("/work/");

  return (
    <section aria-labelledby="hero-title">
      <div className="relative mx-auto max-w-page [--fh:0px] [--fx:86%] [--fy:calc(100%-40px)] xl:[--fh:320px] xl:[--fx:calc(100%-670px)] xl:[--fy:470px]">
        {/* Pulled up behind the header at xl, so the lines start at the
            top edge of the page as drawn. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 top-0 xl:top-[calc(-1*var(--header-h))]">
          <Flare x="var(--fx)" y="var(--fy)" hEnd="var(--fh)" />
        </div>

        <div className="relative flex flex-col gap-[26px] px-gutter-sm pb-16 pt-8 lg:px-gutter lg:pt-14 xl:min-h-[calc(840px-var(--header-h))] xl:pb-24 xl:pr-[384px] xl:pt-[88px]">
          <SectionLabel index={1}>{COPY.label}</SectionLabel>
          <h1
            id="hero-title"
            className="flex flex-col gap-1 font-display text-display font-semibold uppercase md:gap-[26px] xl:text-[min(7rem,calc((100vw-548px)/7.6))]"
          >
            <span className="flex items-center gap-5">
              <ArrowBlock />
              Websites that
            </span>
            <span>book the job.</span>
          </h1>
          <p className="max-w-lede text-body-lg text-steel-deep">{COPY.subline}</p>
          <div className="flex flex-wrap gap-3.5">
            {cta && <Button href={cta.href}>{cta.label}</Button>}
            {work && (
              <Button href="/work/" variant="ghost">
                See the Work
              </Button>
            )}
          </div>
          {/* 🚩 Flag on only: the panel at the flare crossing (PLAN §5). */}
          <LeadFlowPanel className="xl:absolute xl:left-[calc(100%-650px)] xl:top-[calc(470px-var(--header-h)+20px)]" />
        </div>

        {cta && (
          <HeroSidebar className="absolute right-0 top-[calc(-1*var(--header-h))] hidden h-[calc(100%+var(--header-h))] xl:block" />
        )}
      </div>
      <HeroSidebar variant="band" className="xl:hidden" />
    </section>
  );
}
