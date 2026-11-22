import { flags } from "@/lib/flags";
import { ctaLink } from "@/lib/nav";
import { isLive } from "@/lib/routes";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Button } from "@/components/ui/Button";
import { LeadFlowPanel } from "@/components/LeadFlowPanel";
import { LiquidBackdrop } from "./liquid/LiquidBackdrop";

/**
 * ════════════════════════════════════════════════════════════════════
 *  HOME HERO (PLAN §5 Home 1, docs/VISUAL_GUIDE.md §6, §10). Copy is
 *  PLAN §5 verbatim, both flag states.
 *
 *  Text never sits on the liquid. On phones the liquid is a band under
 *  the header and the copy starts where it has faded to solid `room`.
 *  From 1024px the copy holds the left column, capped so it always ends
 *  inside the solid part of the gradient (56% of the width).
 *
 *  The headline is the LCP element: server-rendered, never animated,
 *  and independent of the canvas.
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
    <section
      aria-labelledby="hero-title"
      data-track-loc="hero"
      className="room relative overflow-hidden"
    >
      <LiquidBackdrop className="inset-x-0 top-0 h-[45svh] lg:inset-0 lg:h-auto" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_0,transparent_32svh,rgb(var(--room))_45svh)] lg:bg-[linear-gradient(90deg,rgb(var(--room))_0,rgb(var(--room))_56%,transparent_80%)]"
      />

      <div className="page-x relative flex flex-col pb-14 pt-[45svh] lg:min-h-[calc(100svh-80px)] lg:justify-center lg:py-16">
        <div className="flex flex-col gap-[22px] lg:max-w-[min(700px,calc(56vw-88px))]">
          <SectionLabel>{COPY.label}</SectionLabel>
          <h1 id="hero-title" className="text-room-display">
            {/* One text block, so the whole headline is the LCP element. */}
            Websites that <br />
            book the job.
          </h1>
          <p className="max-w-[34em] text-room-lede">{COPY.subline}</p>
          <div data-hero-cta className="flex flex-wrap gap-3.5">
            {cta && <Button href={cta.href}>{cta.label}</Button>}
            {work && (
              <Button href="/work/" variant="ghost">
                See the Work
              </Button>
            )}
          </div>
          {/* 🚩 Flag on only (PLAN §5). */}
          <LeadFlowPanel />
        </div>
      </div>
    </section>
  );
}
