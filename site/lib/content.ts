/**
 * ════════════════════════════════════════════════════════════════════
 *  CONTENT LOADER — the only door to content.
 *
 *  Pages and components import content through here, never from
 *  data/* or content/* directly, so the storage can change (TS module,
 *  MDX, a CMS) without touching a component. Every getter returns the
 *  shapes in content/types.ts.
 *
 *  Layout per PLAN §6:
 *    data/*.ts          typed data: services, process, pricing, FAQ, form
 *    content/work/*.mdx case studies
 *    content/blog/*.mdx blog posts (Phase 5)
 *
 *  Two rules live here and nowhere else:
 *    · Flags. A flagged item (the Automations service, ACT.03, a quote
 *      factor) never reaches a page with its flag off.
 *    · Case-study visibility. Production shows a case only when it is
 *      published AND the client has given permission (PLAN §10).
 *      Preview builds also show drafts, marked as drafts, with the
 *      client's name held back until permission is recorded.
 *
 *  Server-only: it reads content/ from disk at build time.
 * ════════════════════════════════════════════════════════════════════
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { site } from "@/site.config";
import { flags, isOn } from "@/lib/flags";
import { IS_PREVIEW } from "@/lib/preview";
import { acts, actsFlowLine } from "@/data/acts";
import { leadFlowSteps } from "@/data/leadFlow";
import { combineNote, services } from "@/data/services";
import { processSteps, startSteps } from "@/data/process";
import { quoteFactors, quoteStatement } from "@/data/pricing";
import { startFaq } from "@/data/faq";
import { budgets, smsConsent, timelines, trades } from "@/data/intake";
import type {
  Act,
  CaseStudy,
  Faq,
  LeadFlowStep,
  Option,
  ProcessStep,
  Service,
} from "@/content/types";

/* ── Hero sidebar, lead flow ─────────────────────────────────────── */

/** Hero sidebar items, with flagged ones removed when their flag is off. */
export function getActs(): Act[] {
  return acts.filter((a) => isOn(a.flag)).map(({ flag: _flag, ...act }) => act);
}

/** The sidebar footer line for this build's flag state. */
export function getActsFlowLine(): string {
  return flags.automations ? actsFlowLine.on : actsFlowLine.off;
}

/** Lead-flow rows. Empty with the flag off, so nothing can render them. */
export function getLeadFlowSteps(): LeadFlowStep[] {
  return flags.automations ? leadFlowSteps : [];
}

/* ── Services, pricing, process ──────────────────────────────────── */

export function getServices(): Service[] {
  return services.filter((s) => isOn(s.flag)).map(({ flag: _flag, ...s }) => s);
}

export function getService(slug: string): Service | undefined {
  return getServices().find((s) => s.slug === slug);
}

export function getCombineNote(): string {
  return flags.automations ? combineNote.on : combineNote.off;
}

export function getQuoteFactors(): string[] {
  return quoteFactors.filter((f) => isOn(f.flag)).map((f) => f.label);
}

export function getQuoteStatement(): string {
  return quoteStatement;
}

export function getProcessSteps(): ProcessStep[] {
  return processSteps;
}

export function getStartSteps(): ProcessStep[] {
  return startSteps;
}

/* ── FAQ and intake ──────────────────────────────────────────────── */

/** Fill {responseTime} and {phone} from site.config.ts. */
function fill(text: string): string {
  return text
    .replaceAll("{responseTime}", site.intake.responseTime)
    .replaceAll("{phone}", site.phone.display);
}

export function getStartFaq(): Faq[] {
  return startFaq.map((f) => ({ q: fill(f.q), a: fill(f.a) }));
}

export function getIntakeOptions(): {
  trades: Option[];
  timelines: Option[];
  budgets: Option[];
  services: Option[];
  sms?: { legend: string; label: string; error: string };
} {
  return {
    trades,
    timelines,
    budgets,
    services: getServices().map((s) => ({ value: s.slug, label: s.name })),
    ...(flags.automations ? { sms: smsConsent } : {}),
  };
}

/* ── Case studies ────────────────────────────────────────────────── */

const WORK_DIR = join(process.cwd(), "content", "work");

/** The client name as this build may show it. */
const CLIENT_HELD = "[Client name]";

type Frontmatter = Omit<CaseStudy, "slug" | "draft">;

function readCase(file: string): { meta: CaseStudy; body: string } {
  const raw = readFileSync(join(WORK_DIR, file), "utf8");
  const { data, content } = matter(raw);
  const fm = data as Frontmatter;
  const publishable = fm.published === true && fm.permission === true;
  return {
    meta: {
      ...fm,
      slug: file.replace(/\.mdx$/, ""),
      client: fm.permission ? fm.client : CLIENT_HELD,
      liveUrl: fm.liveUrl || undefined,
      draft: !publishable,
    },
    body: content,
  };
}

function allCases(): { meta: CaseStudy; body: string }[] {
  let files: string[] = [];
  try {
    files = readdirSync(WORK_DIR).filter((f) => f.endsWith(".mdx"));
  } catch {
    return [];
  }
  return files.map(readCase).sort((a, b) => a.meta.order - b.meta.order);
}

/** Cases this build shows: publishable ones, plus drafts on previews. */
export function getCases(): CaseStudy[] {
  return allCases()
    .filter((c) => !c.meta.draft || IS_PREVIEW)
    .map((c) => c.meta);
}

/** One case with its MDX body, or undefined if this build hides it. */
export function getCase(slug: string): { meta: CaseStudy; body: string } | undefined {
  const c = allCases().find((x) => x.meta.slug === slug);
  if (!c || (c.meta.draft && !IS_PREVIEW)) return undefined;
  return c;
}

/** Featured cases for the home proof strip (PLAN §5: 2–3). */
export function getFeaturedCases(): CaseStudy[] {
  return getCases()
    .filter((c) => c.featured)
    .slice(0, 3);
}

/** Cases that used a service, for its sub-page. */
export function getCasesFor(service: Service): CaseStudy[] {
  return getCases().filter((c) => c.systems.includes(service.system));
}

/** The case after this one, wrapping, for "Next case study". */
export function getNextCase(slug: string): CaseStudy | undefined {
  const cases = getCases();
  if (cases.length < 2) return undefined;
  const i = cases.findIndex((c) => c.slug === slug);
  return cases[(i + 1) % cases.length];
}

/** Does this build have any case to show? Drives the Work route. */
export function hasCases(): boolean {
  return getCases().length > 0;
}
