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
 *    content/blog/*.mdx blog posts
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
import { about } from "@/data/about";
import { cities, type City } from "@/data/cities";
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

/**
 * Without the client's permission, nothing that identifies them leaves
 * this function: not the name, not the file-name slug (a URL such as
 * /work/douet-ac/ names the client by itself), not the live-site link
 * or screenshot. Preview URLs are noindex but publicly reachable, so
 * this applies to previews too. The MDX body is still shown so drafts
 * can be reviewed: keep the client's name out of it until permission
 * is recorded (CONTENT_TODO.md).
 */
function readCase(file: string): { meta: CaseStudy; body: string } {
  const raw = readFileSync(join(WORK_DIR, file), "utf8");
  const { data, content } = matter(raw);
  const fm = data as Frontmatter;
  const permitted = fm.permission === true;
  const publishable = fm.published === true && permitted;
  return {
    meta: {
      ...fm,
      slug: permitted ? file.replace(/\.mdx$/, "") : `draft-${fm.order}`,
      client: permitted ? fm.client : CLIENT_HELD,
      liveUrl: permitted ? fm.liveUrl || undefined : undefined,
      heroImage: permitted ? fm.heroImage : undefined,
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

/* ── About ───────────────────────────────────────────────────────── */

export function getAbout() {
  return about;
}

/* ── City pages ──────────────────────────────────────────────────── */

const slugOf = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export type CityPage = City & { slug: string; draft: boolean };

/**
 * Cities this build shows: `ready` ones (unique content, PLAN §5), plus
 * drafts on preview builds, marked, so the template can be reviewed.
 */
export function getCities(): CityPage[] {
  return cities
    .map((c) => ({ ...c, slug: slugOf(c.name), draft: !c.ready }))
    .filter((c) => !c.draft || IS_PREVIEW);
}

export function getCity(slug: string): CityPage | undefined {
  return getCities().find((c) => c.slug === slug);
}

/** Is this city's page emitted in this build? Drives its registry entry. */
export function cityVisible(name: string): boolean {
  return getCities().some((c) => c.name === name);
}

/* ── Blog ────────────────────────────────────────────────────────── */

const BLOG_DIR = join(process.cwd(), "content", "blog");

export type Post = {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  published: boolean;
  /** Computed: shown in this build but not published. */
  draft: boolean;
  /** Computed: minutes at ~220 words a minute. */
  readingMinutes: number;
};

function readPost(file: string): { meta: Post; body: string } {
  const { data, content } = matter(readFileSync(join(BLOG_DIR, file), "utf8"));
  const words = content.split(/\s+/).filter(Boolean).length;
  return {
    meta: {
      slug: file.replace(/\.mdx$/, ""),
      title: String(data.title ?? ""),
      description: String(data.description ?? ""),
      date: String(data.date ?? ""),
      author: String(data.author ?? site.name),
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      published: data.published === true,
      draft: data.published !== true,
      readingMinutes: Math.max(1, Math.round(words / 220)),
    },
    body: content,
  };
}

function allPosts(): { meta: Post; body: string }[] {
  let files: string[] = [];
  try {
    files = readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));
  } catch {
    return [];
  }
  return files.map(readPost).sort((a, b) => b.meta.date.localeCompare(a.meta.date));
}

/** Posts this build shows: published ones, plus drafts on previews. Newest first. */
export function getPosts(): Post[] {
  return allPosts()
    .filter((p) => !p.meta.draft || IS_PREVIEW)
    .map((p) => p.meta);
}

export function getPost(slug: string): { meta: Post; body: string } | undefined {
  const p = allPosts().find((x) => x.meta.slug === slug);
  if (!p || (p.meta.draft && !IS_PREVIEW)) return undefined;
  return p;
}

/** Up to three other posts, sharing a tag first (PLAN §5 "related posts"). */
export function getRelatedPosts(slug: string): Post[] {
  const posts = getPosts();
  const me = posts.find((p) => p.slug === slug);
  if (!me) return [];
  const others = posts.filter((p) => p.slug !== slug);
  const shared = others.filter((p) => p.tags.some((t) => me.tags.includes(t)));
  return [...shared, ...others.filter((p) => !shared.includes(p))].slice(0, 3);
}

/** Does this build have any post to show? Drives the Blog route. */
export function hasPosts(): boolean {
  return getPosts().length > 0;
}
