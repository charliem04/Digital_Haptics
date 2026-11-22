import { readFileSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { site } from "@/site.config";
import {
  getActs,
  getActsFlowLine,
  getCombineNote,
  getIntakeOptions,
  getProcessSteps,
  getQuoteFactors,
  getQuoteStatement,
  getServices,
  getStartFaq,
  getStartSteps,
} from "@/lib/content";
import { contactLinks, ctaLink, footerData, headerLinks } from "@/lib/nav";

/**
 * Server-only. Everything the demos show comes from the real data files,
 * with flags as this build has them. The case study always uses the
 * anonymised draft treatment, whatever its permission state.
 */
export function getRehashContent() {
  const raw = readFileSync(join(process.cwd(), "content", "work", "da-plumbing.mdx"), "utf8");
  const { data, content } = matter(raw);
  const sections = content
    .split(/^## /m)
    .slice(1)
    .map((block) => {
      const [title, ...rest] = block.split("\n");
      return { title: title.trim(), body: rest.join("\n").trim() };
    });

  return {
    hero: {
      label: "Web design · Local SEO — Acadiana, LA",
      line1: "Websites that",
      line2: "book the job.",
      subline:
        "Design and local SEO for trades businesses. Built to load fast, rank locally and turn visitors into calls.",
    },
    services: getServices().map(({ slug, code, name, short, lead, price }) => ({
      slug,
      code,
      name,
      short,
      lead,
      price,
    })),
    combineNote: getCombineNote(),
    process: getProcessSteps(),
    startSteps: getStartSteps(),
    factors: getQuoteFactors(),
    statement: getQuoteStatement(),
    faq: getStartFaq(),
    options: getIntakeOptions(),
    acts: getActs(),
    flow: getActsFlowLine(),
    nav: headerLinks().map(({ href, label }) => ({ href, label })),
    cta: ctaLink() ?? { href: site.cta.href, label: site.cta.label },
    contact: contactLinks(),
    footer: footerData(),
    cities: [...site.serviceArea.cities],
    areaLabel: site.serviceArea.label,
    responseTime: site.intake.responseTime,
    areaLede:
      "Digital Haptics is based in Lafayette and grew up in Acadiana. The work is remote, so we take on projects across Louisiana and beyond, and meet in person anywhere around here.",
    caseStudy: {
      client: "[Client name]",
      trade: String(data.trade),
      location: String(data.location),
      systems: (data.systems as string[]) ?? [],
      summary: String(data.summary),
      results: (data.results as { label: string; value: string }[]) ?? [],
      sections,
    },
  };
}

export type RehashContent = ReturnType<typeof getRehashContent>;
