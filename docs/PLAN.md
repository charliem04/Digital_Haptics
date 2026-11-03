# digitalhaptics.dev — Website Build Plan

> **For Claude Code:** This is the source of truth for building the Digital Haptics agency site. Read it fully before writing code. Build in the phase order at the bottom. Never invent statistics, client results, testimonials, or prices. Use bracketed placeholders like `[RESULT]` or `[PRICE]` and list them in `CONTENT_TODO.md`. When a decision below is marked **OPEN**, build the default described and leave a `// OPEN:` comment. Anything marked **🚩 FLAGGED** is built and kept in the codebase but switched off in every deployed environment (see §2.1).

---

## 1. Project overview

**Business:** Digital Haptics, a web design and development agency for local trades businesses (roofers, plumbers, HVAC, contractors, dirt work) in Acadiana, Louisiana.

**Domain:** digitalhaptics.dev

**Audience:** Trades business owners, often on a phone between jobs, plus larger clients who want proof of capability.

**Site goals, in priority order:**
1. Convert qualified visitors into project inquiries (intake form or booked call).
2. Prove capability through case studies.
3. *(Later, behind a flag)* Showcase the automation systems by running them live on this site, once the SMS and AI voice tools are production-ready.
4. Rank locally for web design and SEO searches in Acadiana.

**Principles:**
- Robust where it matters, simple to navigate. A visitor should never be more than one click from "Start a Project."
- Cybercore aesthetic in the framing (hero, dividers, frames, hover states). Plain, highly legible content (case studies, pricing, forms).
- Mobile first. The primary buyer is on a phone.

---

## 2. Tech stack

- **Framework:** Next.js (App Router, TypeScript)
- **Styling:** Tailwind CSS with design tokens defined in the Tailwind config and CSS variables
- **Motion:** Framer Motion; respect `prefers-reduced-motion` everywhere
- **Content:** MDX for case studies and blog posts; typed TS data files for services, cities, and FAQ
- **Hosting:** Cloudflare Pages. Prefer static generation for every page. If any route needs server rendering, use the `@opennextjs/cloudflare` adapter.
- **Forms/API:** a Cloudflare Worker endpoint that receives form posts, validates them, stores the lead in Cloudflare D1, and emails a lead notification to the owner (via a transactional email provider such as Resend). Forwarding to the speed-to-lead intake webhook exists in code but only runs when `FEATURE_AUTOMATIONS` is on.
- **Spam protection:** Cloudflare Turnstile on every form
- **Booking:** Cal.com embed
- **Analytics:** Cloudflare Web Analytics, plus custom conversion events (see §8)
- **Config pattern:** mirror the white-label trades template by putting business info (name, phone, email, service area, socials, Cal.com link, webhook URL) in one `site.config.ts`. Never hard-code these in components.

### 2.1 Feature flags

The AI voice receptionist and SMS auto-response are **not implemented yet**. Everything that showcases them is scaffolded now and switched off until the tools are solid.

| Flag | Controls | Local dev (`.env.local`) | Preview deploys | Production |
|---|---|---|---|---|
| `FEATURE_AUTOMATIONS` | Automations page, automations copy and UI across the site, webhook forwarding, SMS consent fields | `true` (opt-in) | `false` | `false` |
| `FEATURE_AUTOMATIONS_DEMO` | The interactive SMS demo on the Automations page | `true` (opt-in) | `false` | `false` |
| `FEATURE_VOICE` | AI voice receptionist call-in section | `false` | `false` | `false` |

**Implementation rules:**
- Read flags from one typed module (`lib/flags.ts`). Components never read `process.env` directly.
- Flags are **build-time** values (`NEXT_PUBLIC_`-free where possible, resolved at build) so disabled code is excluded from static output.
- Set the values in the Cloudflare Pages dashboard for **both** the Production and Preview environments. Default to `false` when a flag is missing, so a misconfigured environment never exposes unfinished features.
- When a flag is off, a flagged route must:
  - return `notFound()` (404) in the deployed build
  - be excluded from navigation, footer, internal links, `sitemap.xml`, and structured data
  - carry `robots: noindex` as a second safety net
- Every flagged UI element has a defined **off state** (listed in the page specs below). Never leave an empty gap or a "coming soon" teaser unless a spec calls for it.
- Turning a flag on later should require no code changes beyond flipping the environment value and redeploying.

---

## 3. Sitemap

### Core pages
| Route | Page | Purpose |
|---|---|---|
| `/` | Home | Sort visitors: what we do, proof, route to Work / Services / Start a Project |
| `/work` | Work index | Grid of case study cards |
| `/work/[slug]` | Case study (template) | Problem → what we built → systems running → results |
| `/services` | Services overview | Three services, each linking to its page |
| `/services/web-design` | Web Design | |
| `/services/local-seo` | Local SEO | |
| `/services/automations` | Automations 🚩 FLAGGED | The future differentiator page. Scaffolded, 404 in deployed builds until `FEATURE_AUTOMATIONS` is on (§7) |
| `/pricing` | Pricing | "Starting at" figures, no tiers (§5) |
| `/start` | Start a Project | Single intake form + Cal.com booking + FAQ |

### Supporting pages
| Route | Page |
|---|---|
| `/about` | About |
| `/blog`, `/blog/[slug]` | Blog index + post template |
| `/areas/[city]` | City location pages (Lafayette, Broussard, Youngsville, Scott, Carencro, New Iberia, Breaux Bridge; confirm list) |
| `/privacy`, `/terms` | Legal |
| `/start/thanks` | Thank-you page (post-submit) |
| `404` | Custom not-found page |

### Navigation
- **Header:** `Work · Services · Pricing · About` + primary button **Start a Project ↘**
- **Footer:** all core pages, Blog, service-area city links, phone, email, legal links, copyright
- There is only one intake path (`/start`). No separate contact page. Every CTA on the site points to `/start`.

---

## 4. Design system

Reference: the Round 2 "Hybrid" artboards (desktop + mobile). This combines Direction A's ground and color, Direction B's type and buttons, and Direction C's cut-corner frames.

### 4.1 Color tokens
| Token | Hex | Use |
|---|---|---|
| `ice` | `#E4EEF4` | Page background, with the dot grid |
| `frost` | `#F4F8FB` | Panels, section frames |
| `white` | `#FFFFFF` | Cards, inputs |
| `steel-panel` | `#CFDAE2` | Hero sidebar, secondary bands |
| `hairline` | `#C9D5DE` | Row dividers inside cards |
| `ink` | `#0B0D10` | Text, borders, accent fills |
| `steel` | `#4A5560` | Secondary text, labels |
| `signal` | `#FF5A1F` | Primary actions, flare lines, markers |

**Contrast rule:** `signal` orange is never used for text on light backgrounds (it fails contrast). Use it for fills, lines, markers, and button backgrounds with `ink` text. All text must meet WCAG AA (4.5:1 body, 3:1 at 24px+).

### 4.2 Typography
| Role | Font | Weight | Size (desktop → mobile) | Notes |
|---|---|---|---|---|
| Display | Chakra Petch | 600 | 112px → 54px (use `clamp`) | Uppercase, line-height 0.9 |
| Display small | Chakra Petch | 600 | 70px → 40px | Uppercase |
| Heading | Chakra Petch | 600 | 36px → 28px | Sentence case |
| Subheading | Chakra Petch | 600 | 24px → 20px | |
| Body | Manrope | 400/500 | 17–19px → 16–17px | line-height 1.55 |
| Label | JetBrains Mono | 500 | 11–13px | Uppercase, tracking 0.1–0.16em |

Load fonts with `next/font/google`. Fallback stacks: `system-ui, sans-serif` and `ui-monospace, monospace`.

### 4.3 Layout and spacing
- 4px base spacing scale
- 12-column grid, max width 1440px, 64px side margins on desktop, 20px on mobile
- Section vertical padding: 96–120px desktop, 48–64px mobile
- Border radius: **0 everywhere**. Shape language comes from cut corners, not rounding.

### 4.4 Signature visual elements
- **Dot grid:** `radial-gradient(rgba(11,13,16,0.2) 1px, transparent 1.4px)` at 16px (14px mobile) on the `ice` background
- **Flare crosshair (hero only):** a 2px vertical and 1px horizontal `signal` line with a soft glow (`box-shadow`), and a glowing node where they cross. Decorative: `aria-hidden`, and no animation if reduced motion is on.
- **Cut corners:** 45° clipped corners via `clip-path`. Build a `<CutFrame>` component that takes `size` (`sm` 10px, `md` 16px, `lg` 24px), `corners` (which corners to cut), `fill`, and `border` (renders a 1px ink border with the wrapper technique: outer ink layer, inner fill layer with the same clip). Use it for section frames, case cards, the lead-flow panel, and inputs.
- **Marker squares:** 8px `signal` squares placed at line intersections and cut-corner ends, sparingly
- **Boxed labels:** mono uppercase labels in a 1px ink box (e.g., `ACT.01 — DESIGN`). The active or highlighted one gets a `signal` fill.
- **Section numbering:** mono micro-labels like `( 01 ) — WEB DESIGN · LOCAL SEO · AUTOMATIONS`

### 4.5 Components
- **Button / Primary:** `signal` fill, `ink` text, mono label, trailing `↘` arrow, min height 52px
- **Button / Accent:** `ink` fill, `ice` text, `signal` arrow
- **Button / Ghost:** transparent, 1px `ink` border, `ink` text, no arrow. Use it for the secondary action next to a primary button (e.g., hero "See the Work").
- **Input:** white fill, 1px ink border, top-left cut corner (`sm`), label above in mono caps, min height 48px. Visible focus ring in `signal`.
- **Chip:** mono caps in a 1px ink box; active chip is ink-filled
- **Case card:** cut-corner frame (`md`). Header strip (`CASE.01` + `● LIVE SITE`), screenshot area, key/value rows (CLIENT / TRADE / SYSTEMS / RESULT), and a black "Read case study ↘" footer bar. White background.
- **Lead-flow panel 🚩 FLAGGED:** only renders when `FEATURE_AUTOMATIONS` is on. A small frost cut-corner panel (hero, Automations page, thank-you page) listing `01 FORM RECEIVED / 02 TEXT SENT / 03 OWNER ALERTED / 04 JOB BOOKED`, with the last row highlighted in `signal`. Optionally animate the rows in sequence.
- **Hero sidebar (desktop):** a 320px `steel-panel` column on the right side of the hero with a 1px ink left edge and a cut bottom-left corner ending in a marker square. It contains the primary CTA and the ACT service items. **Flag off:** two items (ACT.01 — DESIGN, ACT.02 — LOCAL SEO) and the footer line `( SEARCH ) → ( SITE ) → ( CALL )`. **Flag on:** adds ACT.03 — AUTOMATE (signal-filled) and switches the footer line to `( FORM ) → ( SMS ) → ( BOOKED )`. **OPEN:** decide whether it stays sticky while scrolling the hero; default is not sticky.
- **Header:** logo (ink square + "DIGITAL HAPTICS" in Chakra Petch 700), mono nav links, primary CTA
- **Mobile header:** logo + 48px ink menu button opening a full-screen menu
- **Mobile sticky CTA:** a bottom-pinned "Start a Project ↘" bar on every page except `/start`
- **Mobile hero sidebar:** becomes a full-width band under the hero with the ACT list. **OPEN:** band color, `ink` or `steel-panel`; default `steel-panel` to match desktop.

### 4.6 Motion
- Subtle and purposeful: fade/slide-in on scroll (8–16px), flare glow pulse, lead-flow rows sequencing in, button hover arrow nudge
- No scroll-jacking, no parallax on content, nothing that delays reading
- Everything disabled or reduced under `prefers-reduced-motion`

---

## 5. Page specs

### Home `/`
1. **Hero:** section label, arrow block + display headline "Websites that book the job.", Primary "Start a Project ↘" + Ghost "See the Work", flare crosshair, desktop sidebar
   - **Flag off:** section label `( 01 ) — WEB DESIGN · LOCAL SEO — ACADIANA, LA`; subline "Design and local SEO for trades businesses. Built to load fast, rank locally and turn visitors into calls."; no lead-flow panel (the flare crosshair stands alone)
   - **Flag on:** label adds `· AUTOMATIONS`; subline "Design, local SEO and lead automations for trades businesses. Built to load fast, rank locally and follow up with every lead automatically."; lead-flow panel appears at the flare intersection
2. **Proof strip:** 2–3 featured case cards linking to `/work/[slug]`
3. **Services:** blocks with boxed ACT labels, each linking to its service page. **Flag off:** two blocks (Design / Local SEO). **Flag on:** adds Automations.
4. **Live systems teaser 🚩 FLAGGED:** short explanation that this site runs the same lead system clients get, linking to `/services/automations`. **Flag off:** section not rendered.
5. **Process strip:** 3–4 steps (Call → Build → Launch → Grow)
6. **Service area:** short local statement + city links
7. **Final CTA band**

### Work `/work` and `/work/[slug]`
- Index: grid of case cards, filterable by trade via chips (optional)
- Case study template (MDX frontmatter: `client`, `trade`, `location`, `systems[]`, `liveUrl`, `heroImage`, `results[]`, `featured`, `order`)
  1. Header: client, trade, location, systems chips, live-site link
  2. The problem
  3. What we built (screenshots, desktop + mobile)
  4. Systems running (which automations are active)
  5. Results. **Placeholders only until real numbers are provided.**
  6. Next case study link + CTA
- **Candidate case studies (confirm permission with each client before publishing):** CTL Pro Construction (roofing), Douet A/C (HVAC), DA Plumbing, Coastal Construction Services (dirt work), Stan's Tire and Automotive

### Services `/services` and sub-pages
- Overview: service cards + "most clients combine both" note (**flag on:** three cards, "combine all three")
- Each sub-page: what it is, what's included, who it's for, relevant case studies, FAQ, CTA
- **Automations 🚩 FLAGGED** (will be the heaviest page; scaffold fully now, off in deployed builds): the problem (slow lead response loses jobs), the modules (form capture, instant SMS to customer, owner alert, missed-call text-back, lead dashboard, escalation; AI voice receptionist marked "coming soon"), the **interactive demo** (§7), add-on positioning, CTA

### Pricing `/pricing`
- **No tiers.** One section per service with a "starting at" figure: `Websites from [PRICE]`, `Local SEO from [PRICE]/mo`. **Flag on:** adds `Automations from [PRICE]/mo`
- "What affects your quote" list: page count, integrations, content/copywriting help, number of locations (**flag on:** adds automation modules)
- Statement: every project is quoted after a short call
- CTA to `/start`
- **OPEN:** page title "Pricing" vs "Investment"; default "Pricing"

### Start a Project `/start`
- Short "how it works" strip (3 steps)
- **Intake form:** name, business name, trade (select), phone, email, current website (optional), services interested in (checkboxes: Web Design / Local SEO; **flag on:** adds Automations), timeline (select), budget range (select, optional), message. Turnstile. Clear inline validation.
- **Or book a call:** Cal.com embed
- FAQ accordion
- **Flag on only:** SMS consent checkbox and consent language
- On success, redirect to `/start/thanks`

### Thank-you `/start/thanks`
- **Flag off:** confirmation, "We'll reach out within [RESPONSE TIME]," next steps, link to Work
- **Flag on:** adds the lead-flow panel and the line "That text you just got? That's the same system we build for clients."

### About `/about`
- Who runs Digital Haptics, the construction background (worked construction alongside family, so understands the trades), how the agency works, local focus, CTA

### City pages `/areas/[city]`
- Generated from a typed `cities.ts` data file
- **Each page needs genuinely unique content** (local context, relevant work nearby, service notes). Do not generate thin duplicate pages. If unique content isn't available yet, only publish the cities that have it.

### Blog
- MDX posts, index with cards, post template with author/date, reading time, related posts, CTA at the end
- Start with 0 posts; build the template only

### 404
- On-brand error screen (terminal-style "NOT_FOUND" label in the cut-corner frame), links back to Home / Work / Start

---

## 6. Content model

```
/content
  /work/*.mdx          case studies
  /blog/*.mdx          blog posts
/data
  services.ts          service definitions, included items, FAQ
  cities.ts            city pages
  faq.ts               general FAQ
site.config.ts         business info, phone, email, links, webhook, Cal.com
```

Keep all copy that isn't page-specific in data files so it can be edited without touching components.

---

## 7. Live systems (dogfooding)

The long-term plan is for this site to be the first client of the speed-to-lead product. **Right now the SMS auto-response and AI voice receptionist are not implemented**, so nothing that depends on them ships until they're solid and efficient.

| System | Behavior | Status |
|---|---|---|
| Intake form | `/start` form → Cloudflare Worker → stored in D1 + email notification to owner | **Launch** |
| Booking | Cal.com embed on `/start` | **Launch** |
| Webhook forwarding | Worker also forwards the lead to the speed-to-lead intake webhook | 🚩 `FEATURE_AUTOMATIONS` |
| SMS auto-response | Prospect gets an instant SMS confirmation; owner gets an SMS alert | 🚩 `FEATURE_AUTOMATIONS` (not implemented) |
| Missed-call text-back | Missed calls to the agency number trigger a text-back | 🚩 Off (configured on the phone side when ready; no site changes needed) |
| Automations demo | Visitor enters a phone number, submits a fake lead for a fictional plumbing company, and receives the real SMS sequence | 🚩 `FEATURE_AUTOMATIONS_DEMO` |
| AI voice receptionist | "Call this number and talk to our AI receptionist" section | 🚩 `FEATURE_VOICE` (not implemented) |

**Scaffolding now:** build the Automations page, demo UI, lead-flow panel, and webhook-forwarding code path completely, with realistic placeholder states. Wire the demo to a mock handler in local dev so the UI can be developed without the real SMS backend.

**Before turning `FEATURE_AUTOMATIONS_DEMO` on (required):** Turnstile, per-IP and per-number rate limits, a clear "this is a demo" label, a consent checkbox for receiving texts, demo messages clearly identified as a demo, and no storage of demo numbers beyond what rate limiting needs.

**Before turning any SMS feature on:** consent checkbox and consent language on every form that triggers texts, with STOP/HELP handling on the messaging side.

---

## 8. SEO, analytics, performance, accessibility

**SEO**
- Unique `title`/`description` per page via Next.js metadata; canonical URLs
- JSON-LD: `ProfessionalService` (with `areaServed`) site-wide, `BreadcrumbList`, `Article` for posts, `FAQPage` where there's a FAQ
- `sitemap.xml` and `robots.txt` generated at build time
- Open Graph images per page (generated, on-brand)
- Submit to Google Search Console at launch; set up a Google Business Profile for the agency

**Analytics (Cloudflare Web Analytics + custom events)**
- `cta_click` (with location), `form_start`, `form_submit`, `call_click`, `booking_complete`
- Flagged: `demo_start`, `demo_complete` (only fire when the demo flag is on)

**Performance budget**
- Lighthouse 95+ across all categories on mobile
- LCP < 2.0s, CLS < 0.05
- Images through `next/image` or pre-optimized AVIF/WebP; decorative effects in CSS, not images

**Accessibility**
- Semantic HTML, real buttons and links, labeled inputs
- Visible focus states on everything interactive
- Keyboard-operable menu, accordions, and forms
- Decorative elements (`dot grid`, `flare`, markers) are `aria-hidden`
- Touch targets ≥ 44px

---

## 9. Build phases

**Phase 0 — Setup**
- Next.js + TypeScript + Tailwind + Framer Motion project, ESLint/Prettier
- `site.config.ts`, Tailwind tokens (§4.1–4.3), fonts via `next/font`
- `lib/flags.ts` with all flags defaulting to `false` (§2.1)
- Cloudflare Pages deploy pipeline on a preview branch, with flag values set to `false` for both Preview and Production

**Phase 1 — Design system**
- Build all components in §4.5, plus `<CutFrame>`, dot grid background, flare, marker, boxed label
- A hidden `/styleguide` route showing every token and component (remove from sitemap, `noindex`)

**Phase 2 — Layout shell**
- Header, mobile menu, footer, mobile sticky CTA, page container, section wrapper

**Phase 3 — Core pages**
- Home, Work index + case study template, Services + three sub-pages, Pricing, Start a Project, Thank-you

**Phase 4 — Systems**
- Cloudflare Worker form endpoint → D1 storage + email notification, Turnstile, Cal.com embed
- Scaffold the flagged pieces: Automations page, demo UI with a mock handler, lead-flow panel, webhook-forwarding code path, flag-on copy variants
- Verify flag-off behavior: flagged routes 404, absent from nav/sitemap/schema, off-state copy renders everywhere
- Analytics events

**Phase 5 — Supporting pages + SEO**
- About, Blog template, City page template, Legal, 404
- Metadata, JSON-LD, sitemap, robots, OG images

**Phase 6 — Launch**
- Run the agency's own launch checklist (performance, accessibility, forms end-to-end, SMS delivery, DNS, SSL, redirects, Search Console)
- Fill every placeholder in `CONTENT_TODO.md` or hide the section it belongs to
- Confirm all flags are `false` in the Production and Preview environments

**Phase 7 — Automations launch (later, when the tools are ready)**
- Complete the demo safeguards and SMS compliance items in §7
- Turn on `FEATURE_AUTOMATIONS`, then `FEATURE_AUTOMATIONS_DEMO`, in Preview first; test end to end; then Production
- `FEATURE_VOICE` follows the same path once the voice agent ships

---

## 10. Open decisions

| Decision | Default until decided |
|---|---|
| When to enable automations features | Off until the SMS and voice tools are solid; enable per flag, Preview before Production |
| Hero sidebar sticky on scroll | Not sticky |
| Mobile service band color | `steel-panel` |
| Pricing page name | "Pricing" |
| Starting-at price figures | `[PRICE]` placeholders |
| Case study results and client permissions | Placeholders; unpublished until confirmed |
| City page list | Publish only cities with unique content |
