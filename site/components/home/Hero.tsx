import type { ReactNode } from "react";
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
 *  The hero is an opening onto the page's fixed liquid layer. It pulls
 *  up under the transparent header, so the liquid runs to the top.
 *  At every size the copy sits directly on the liquid, with no shade
 *  behind it (owner's calls, 2026-11-25: desktop, then tablets, then
 *  phones). On phones and tablets it starts under the top of the
 *  liquid; from 1024px it holds the left column. KNOWN TRADE-OFF:
 *  when the bright amber passes behind the copy it drops below WCAG AA
 *  (muted label about 1.2:1, headline about 1.9:1 at worst). The owner
 *  was told and chose the bare look. See VISUAL_GUIDE §6.
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

export function Hero({ backdrop = <LiquidBackdrop /> }: { backdrop?: ReactNode }) {
  const cta = ctaLink();
  const work = isLive("/work/");

  return (
    <section
      aria-labelledby="hero-title"
      data-track-loc="hero"
      data-liquid-opening
      className="relative -mt-20 overflow-hidden"
    >
      {backdrop}

      <div className="page-x relative flex flex-col pb-14 pt-[45svh] lg:min-h-[100svh] lg:justify-center lg:pb-16 lg:pt-36">
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
