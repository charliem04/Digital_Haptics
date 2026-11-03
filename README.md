# digitalhaptics.dev

The Digital Haptics agency site: web design and local SEO for trades businesses in Acadiana, Louisiana.

- **Plan (source of truth):** [docs/PLAN.md](docs/PLAN.md)
- **Design reference:** [docs/design-reference/digital-haptics-design-system/Hybrid.dc.html](docs/design-reference/digital-haptics-design-system/Hybrid.dc.html)
- **Refactor audit, token table, decisions:** [docs/REFACTOR_AUDIT.md](docs/REFACTOR_AUDIT.md)
- **Open placeholders:** [CONTENT_TODO.md](CONTENT_TODO.md)
- **Cloudflare Pages + placeholder setup:** [docs/SETUP.md](docs/SETUP.md)

```
site/      Next.js App Router (static export) → Cloudflare Pages
workers/   lead-relay: reference for the Phase 4 intake endpoint
docs/      plan, audit, runbooks
```

## Stack

Next.js 14 (App Router, TypeScript, `output: "export"`), Tailwind CSS, Framer Motion, `next/font/local` (Chakra Petch, Manrope, JetBrains Mono; files and OFL licenses in `site/app/fonts/`). Hosted on Cloudflare Pages. The intake endpoint becomes a Pages Function backed by D1 in Phase 4.

## Working on it

Requires Node 20+ (`site/.nvmrc`).

```bash
cd site
cp .env.example .env.local
npm install
npm run dev
```

| Script | What it does |
|---|---|
| `npm run build` | `next build` → CSP generation and drift check → SEO title/description limits → dead-link check → secret/sourcemap scan. Any gate failing fails the build. |
| `npm run lint` / `typecheck` / `format:check` | Same checks CI runs. |
| `npm run check` | Advisory scan for inherited-default frontend patterns. |
| `npm run preview:build` | Build with `NEXT_PUBLIC_PREVIEW=1` (noindex everywhere). |

## Single config

Business facts live in [`site/site.config.ts`](site/site.config.ts). Components never hard-code them. Page-specific copy lives in `site/data/*.ts` or the page.

## Feature flags

`FEATURE_AUTOMATIONS`, `FEATURE_AUTOMATIONS_DEMO`, `FEATURE_VOICE`: read only through [`site/lib/flags.ts`](site/lib/flags.ts), resolved at build time, off unless set to exactly `true`. A flagged route is not emitted when its flag is off (Cloudflare Pages serves the 404), and the route registry in [`site/lib/routes.ts`](site/lib/routes.ts) keeps it out of nav, footer and sitemap. Every deployed environment builds with all flags off until PLAN §9 Phase 7.
