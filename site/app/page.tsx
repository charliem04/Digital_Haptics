import { flags } from "@/lib/flags";

/**
 * PHASE 0 PLACEHOLDER. The real home page (PLAN §5) is built in
 * Phase 3. This exists so the build has a page, and doubles as a check
 * that the fonts, tokens and flag wiring work.
 *
 * Copy is verbatim from PLAN §5 (hero, both flag states). Nothing here
 * is invented.
 */
const hero = flags.automations
  ? {
      label: "( 01 ) — WEB DESIGN · LOCAL SEO · AUTOMATIONS — ACADIANA, LA",
      subline:
        "Design, local SEO and lead automations for trades businesses. Built to load fast, rank locally and follow up with every lead automatically.",
    }
  : {
      label: "( 01 ) — WEB DESIGN · LOCAL SEO — ACADIANA, LA",
      subline:
        "Design and local SEO for trades businesses. Built to load fast, rank locally and turn visitors into calls.",
    };

export default function Home() {
  return (
    <section className="page-x section-y flex flex-col gap-[26px]">
      <p className="font-mono text-label uppercase tracking-label-lg text-steel">{hero.label}</p>
      <h1 className="font-display text-display font-semibold uppercase">
        Websites that book the job.
      </h1>
      <p className="max-w-lede text-body-lg text-steel-deep">{hero.subline}</p>
    </section>
  );
}
