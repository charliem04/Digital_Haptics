# Refactor audit: white-label trades template → digitalhaptics.dev

Status: **approved 2026-11-02, all defaults (D1–D6).** Phase 0 is on branch `refactor/phase-0`; how it differed from this map is in §8.

Sources read in full: `docs/PLAN.md`, `docs/design-reference/digital-haptics-design-system.zip` (which holds `Hybrid.dc.html` and `README.md`; see C1), and the codebase: `site/`, `workers/`, `docs/`, root files.

Legend: **Keep** = as-is. **Adapt** = keep the file and its mechanism, change its content or wiring. **Replace** = a new file does the job, written to PLAN §4/§5; the old one is deleted when that happens. **Delete** = no counterpart in the new site.

---

## 0. Summary

- The template's **infrastructure** fits PLAN well and mostly stays: the route registry, build gates (CSP / SEO / routes / harden), motion tokens, the lead-relay Worker (which already does "store in D1 first, forward second"), Turnstile, the Cal.com embed, metadata helpers.
- The **visual layer and all copy** go: every section component, the Fontsource fonts, the token block, placeholder images.
- **Feature-specific kit** with no place in the plan goes: careers and the résumé Worker, the Sanity gallery pipeline, Lenis smooth scroll, pinned and parallax motion, testimonials and stars.
- The **lead path flips.** Today the browser posts to Web3Forms and sends an un-awaited copy to the relay. PLAN makes our own endpoint the only path: validate → Turnstile → D1 → email. See C2.
- **Static export stays.** Nothing in PLAN needs server rendering, so `@opennextjs/cloudflare` isn't needed. See R1.
- **Six decisions need your call before Phase 0** (§7). Each has a default I'll build if you just say "approved".

---

## 1. File map

### 1.1 Root and repo

| File | Call | Reason |
|---|---|---|
| `README.md` | Replace | Describes the white-label template; rewrite for this site (stack, scripts, flags, deploy). |
| `PORTING.md` | Delete | History of extracting the template; nothing in it applies to this site. |
| `README-DEPLOY.md` | Adapt (Phase 6) | Go-live checklist is useful; strip the per-client steps, add PLAN §9 Phase 6 items. |
| `CLAUDE.md` | Keep | Project instructions. |
| `LICENSE` | **Decision D6** | MIT would license the agency's own copy and branding to anyone. Recommend removing it (all rights reserved). |
| `desktop.ini` | Delete | OneDrive/Windows artifact, committed by accident. Add `desktop.ini` to `.gitignore`. |
| `.gitattributes`, `.gitignore` | Keep | Add `desktop.ini` to `.gitignore`. |
| `.claude/launch.json` | Adapt | Rename config `white-label-dev` → `site-dev`. |
| `.github/workflows/ci.yml` | Adapt | Same gates. Drop `careers-upload` from the Worker matrix; add `format:check` once Prettier lands. |

### 1.2 docs/

| File | Call | Reason |
|---|---|---|
| `PLAN.md` | Keep | Source of truth. |
| `design-reference/digital-haptics-design-system.zip` | Keep, **plus extract** | CLAUDE.md and your brief point to `docs/design-reference/Hybrid.dc.html`, which only exists inside the zip. Phase 0 extracts `Hybrid.dc.html` and `README.md` beside it, without `support.js`/`vendor/`. |
| `CUTOVER.md` | Adapt (Phase 6) | DNS/email-survival runbook still applies; re-point at digitalhaptics.dev. |
| `LAUNCH-CREDENTIALS.md` | Adapt (Phase 4) | Rewrite for the new credential set: Turnstile, D1, Resend, Cal.com, CF Web Analytics. |
| `GALLERY-CMS.md` | Delete | No Sanity gallery. |
| `WEB3FORMS-SETUP.md` | Delete | Web3Forms leaves the lead path (C2). |
| `ROUTE-MAP.md` (generated) | n/a | `scripts/routes.mjs` writes it on every build. Keep the behavior. |

### 1.3 site/ config and tooling

| File | Call | Reason |
|---|---|---|
| `client.config.ts` | Replace → `site.config.ts` | PLAN §2 single-config pattern. Field map in §2. |
| `package.json` | Adapt | Rename. Remove `@fontsource/barlow-condensed`, `lenis`, `@sanity/image-url`. Drop `gallery.mjs` and `fonts.mjs` from `dev`/`build`. Add Prettier and `format`/`format:check`. Rename Pages projects in `deploy`/`preview:deploy`. |
| `package-lock.json` | Adapt | Regenerated. |
| `next.config.mjs` | Adapt | Keep `output: "export"`, `trailingSlash`, unoptimized images. Add the build-time flag inlining (see R4). `eslint.dirs` gains `data`. |
| `tailwind.config.ts` | Replace | New token set (§3). `colors` and `borderRadius` **replace** Tailwind's defaults rather than extend them, so a stray `rounded-lg` or `text-indigo-600` can't slip in. |
| `postcss.config.mjs`, `tsconfig.json`, `.nvmrc`, `.eslintrc.json`, `.gitignore` | Keep | Fine as-is. |
| `.env.example` | Replace | New variables: `FEATURE_*` flags, intake endpoint, Turnstile site key, CF Web Analytics token, preview flag. Web3Forms, Sanity, careers and Plausible variables go. |
| `scripts/check.mjs` | Keep | Advisory anti-default checker. Run it on the new UI. |
| `scripts/csp.mjs` | Adapt | Rewrite `INTEGRATIONS`. Add the intake endpoint, `challenges.cloudflare.com`, Cloudflare Web Analytics, Cal.com. Remove Web3Forms, Plausible, Sanity, Calendly. The drift check stays. |
| `scripts/seo.mjs` | Keep | 60/160 title/description gate. |
| `scripts/routes.mjs` | Keep | Dead-link gate. Doubles as proof that flag-off builds never link a flagged route. |
| `scripts/harden.mjs` | Keep | Secret, sourcemap and `.env` scan of `out/`. |
| `scripts/env-file.mjs` | Keep | `.env.local` loader for Node scripts. |
| `scripts/preview-build.mjs`, `scripts/preview-headers.mjs` | Adapt | Keep the noindex-on-preview mechanism; rename projects. |
| `scripts/fonts.mjs` | Delete | Injects Fontsource preloads. `next/font` preloads on its own. |
| `scripts/gallery.mjs` | Delete | Sanity gallery fetch and category drift check. |
| `public/_headers` | Adapt | Keep the HSTS reasoning and cache tiers. Drop the `/brand/*` tier if that folder goes. |
| `public/_redirects` | Adapt | Clear template examples. Add `/contact/ → /start/ 301` as a cheap guard. |
| `public/brand/*.svg` | Delete (`og.svg` stays until Phase 5) | Labelled template stand-ins. The logo is CSS (ink square + wordmark, PLAN §4.5). Phase 5 generates OG images. |

### 1.4 site/app/

| File | Call | Reason |
|---|---|---|
| `layout.tsx` | Adapt | Swap Fontsource for `next/font/google`. Drop UtilityBar, CallCard, SmoothScroll, PageTransition, PreviewBanner, CookieConsent (D3). Keep the `<noscript>` reveal fix and the preview-noindex logic. Header/footer/sticky CTA remount in Phase 2. |
| `globals.css` | Replace | New CSS variable block (§3), dot grid, focus ring, reduced-motion base. Keep the reduced-motion CSS that covers the first frame (see `useStillness`). |
| `page.tsx` | Replace | Home per PLAN §5. Phase 0 leaves a minimal token-styled placeholder so the build stays green. |
| `contact/page.tsx` | Delete | No contact page (PLAN §3). Its booking + form layout is the starting point for `/start/` in Phase 3. |
| `gallery/page.tsx` | Delete | Replaced by `/work/` with MDX case studies. |
| `services/page.tsx` | Replace (Phase 3) | Overview with 2 cards (3 when the flag is on). |
| `services/[slug]/page.tsx` | Adapt (Phase 3) | Keep the `generateStaticParams` pattern. Feed it from `data/services.ts` **filtered by flags** with `dynamicParams = false`, so `/services/automations/` isn't emitted at all when the flag is off (see R2). |
| `privacy/page.tsx`, `terms/page.tsx` | Adapt (Phase 5) | Wiring is right. Rewrite the processor list for this stack: Cloudflare (Pages, D1, Turnstile, Web Analytics), Resend, Cal.com. |
| `legal.tsx` | Adapt | Restyle. |
| `not-found.tsx` | Replace (Phase 5) | PLAN §5 terminal-style `NOT_FOUND` in a cut frame. |
| `robots.ts`, `sitemap.ts` | Keep | Already driven by the route registry and preview flag. They inherit flag filtering from `lib/routes.ts`. |

### 1.5 site/components/

| File | Call | Reason |
|---|---|---|
| `Hero.tsx` | Replace | New hero: flare, arrow block, sidebar, flag states (PLAN §5). |
| `Services.tsx` | Replace | ACT-labelled service blocks. |
| `About.tsx` | Delete | Home "about" band with stats. About becomes a page (Phase 5); a stats row would invite invented numbers. |
| `Testimonials.tsx`, `Stars.tsx` | Delete | No testimonials or ratings in PLAN. Hard rule: never invent them. |
| `Gallery.tsx`, `GalleryBrowser.tsx`, `Lightbox.tsx` | Delete | Photo gallery is out of scope. Case study screenshots use plain `next/image`. |
| `BeforeAfterSlider.tsx` | Delete | Not in PLAN. |
| `Contact.tsx` | Adapt → `IntakeForm` (Phase 3–4) | Keep the honeypot, `dialable()` phone check, inline validation and honest failure copy. Replace the fields with PLAN §5 /start's list, wire to the new endpoint, add Turnstile. Restyle with Input/CutFrame. |
| `CareersForm.tsx` | Delete | No careers. |
| `Turnstile.tsx` | Keep | Already the right shape (token lands in `FormData`). |
| `BookingEmbed.tsx` | Adapt | Moves to `/start/`. Restyle. Consent gate depends on D3. |
| `Button.tsx` | Replace | Primary / Accent / Ghost per PLAN §4.5 and the mockup (§3.6). |
| `Nav.tsx` | Adapt (Phase 2) | Keep registry-driven links and the keyboard handling. New visuals, full-screen mobile menu with a 48px ink button, no dropdowns. |
| `Footer.tsx` | Adapt (Phase 2) | Keep the registry projection. Add city links, phone, email, legal. |
| `StickyCTA.tsx` | Adapt (Phase 2) | From a Call/Text/Book bar to a single "Start a Project ↘", hidden on `/start/`. |
| `UtilityBar.tsx` | Delete | Not in PLAN. |
| `CallCard.tsx` | Delete | Desktop `tel:` fallback popover; not in PLAN. Plain `tel:` links plus a `call_click` event cover it. |
| `CtaBand.tsx` | Replace | Final CTA band in the new system. |
| `PageHero.tsx` | Replace | Interior page opener in the new system. |
| `SectionHead.tsx` | Replace | Its "seam mark" was a roofing motif. The new one is the `( 01 ) — …` section label plus a heading. |
| `FaqList.tsx` | Adapt | Keep the native `<details>` behavior and FAQPage JSON-LD. Restyle. |
| `Breadcrumbs.tsx` | Keep (restyle) | Registry-derived trail plus BreadcrumbList. |
| `JsonLd.tsx` | Adapt | `LocalBusiness` → `ProfessionalService` with `areaServed`. Read `site.config`. Must not mention automations when the flag is off. |
| `MoreLink.tsx` | Keep (restyle) | Renders nothing when its target isn't live, which is exactly the flag-off behavior we need. |
| `Icon.tsx` | Adapt | Keep the inline-SVG pattern; replace the trade icons with the hero arrow and the few glyphs we need. |
| `SocialIcons.tsx` | Keep (restyle) | Empty URL hides the link. |
| `Reveal.tsx` | Adapt | The fade/rise workhorse. Set travel to 8–16px (PLAN §4.6). |
| `RevealText.tsx` | Delete | Masked headline rise. The hero headline is the LCP element, so it must paint immediately (LCP < 2.0s). |
| `SmoothScroll.tsx` | Delete | Lenis wheel smoothing counts as scroll-jacking (PLAN §4.6). Also drop the `lenis` dependency. |
| `PinnedSteps.tsx` | Delete | Scroll pinning is scroll-jacking. The process strip is a plain row. |
| `Parallax.tsx`, `BandTransition.tsx` | Delete | "No parallax on content." |
| `PageTransition.tsx` | Delete | A full-screen wipe delays reading. |
| `ScrollProgress.tsx` | Delete | Not in PLAN. |
| `DrawRule.tsx` | Delete | Not needed; flare lines are static CSS. |
| `Mark.tsx` | Delete | Highlighter for financing fine print. |
| `Pending.tsx` | Delete | Dev-only gap marker. PLAN wants visible `[PLACEHOLDER]` text logged in `CONTENT_TODO.md`. |
| `PreviewBanner.tsx` | Delete | Built for pitching replicas of real businesses. Preview **noindex** stays in `lib/preview.ts`. |
| `CookieConsent.tsx` | **D3** | Delete if analytics stay cookieless. |
| `Analytics.tsx` | Replace | Cloudflare Web Analytics beacon instead of consent-gated Plausible. |
| `InteractionTracking.tsx` | Adapt (Phase 4) | Keep the single delegated listener; emit PLAN §8 events (`cta_click`, `call_click`, …). See D2. |
| **New (Phase 1)** | — | `CutFrame`, `DotGrid` (CSS utility), `Flare`, `Marker`, `BoxedLabel`, `Chip`, `SectionLabel`, `Input`/`Select`/`Checkbox`, `CaseCard`, `LeadFlowPanel` 🚩, `HeroSidebar`, `Logo`, plus a `/styleguide` route (noindex, out of sitemap). |

### 1.6 site/lib/

| File | Call | Reason |
|---|---|---|
| `routes.ts` | Adapt | **Central to flags.** Add `flag?: FlagName` to `RouteNode`; `isLive()` becomes `live && flagOn(flag)`. Nav, footer, sitemap, breadcrumbs, `MoreLink` and `routes.mjs` all inherit it. New tree per PLAN §3. `CTA_HREF = "/start/"`. |
| `content.ts` | Adapt | Keep it as the only door to content. Point it at `data/*.ts` and the MDX in `content/work` and `content/blog`. |
| `meta.ts` | Adapt | Read `site.config`. Add a `noindex` path for flagged pages. |
| `motion.ts` | Adapt | Keep the vocabulary and easing. Trim to fade/rise, flare pulse, lead-flow sequence, arrow nudge. Drop `PIN_MIN_WIDTH`/`TONES`. |
| `useScrollMotion.ts` | Adapt | Keep `useStillness()` (it prevents React #418 on static export). Drop `useStepMode`/`useScrollMotion` along with pinning and parallax. |
| `submitContact.ts` | Replace → `submitIntake.ts` (Phase 4) | Posts once to our endpoint and awaits it. Keep `scrub()`, the honeypot and honest failure copy. Web3Forms goes. |
| `submitApplication.ts` | Delete | Careers. |
| `booking.ts` | Keep | Scheduler table; Cal.com already supported. Trimming Calendly is optional. |
| `phone.ts` | Keep | `dialable()` and the nudge copy. |
| `tracking.ts` | Adapt (Phase 4) | New event names. Destination depends on D2. |
| `consent.ts` | **D3** | Delete with CookieConsent, unless kept for the Cal.com click-to-load. |
| `preview.ts` | Adapt | Keep `IS_PREVIEW` for noindex on `*.pages.dev`. Drop the replica copy. |
| **New** `flags.ts` | Phase 0 | Typed flags, default `false` (see R4). |

### 1.7 site/content/ → content/ + data/ (PLAN §6)

| File | Call | Reason |
|---|---|---|
| `types.ts` | Adapt | Keep `PageMeta`, `Faq`, `CtaCopy`. Drop gallery and icon trade types. Add `Service`, `City`, `CaseStudyFrontmatter`, `PostFrontmatter`. |
| `services.ts` | Replace → `data/services.ts` | Three services (Automations flagged), included items, FAQ. Copy marked `[PLACEHOLDER]` where PLAN gives none. |
| `contact.ts` | Delete | Becomes the `/start` page data (Phase 3). |
| `careers.ts` | Delete | Careers. |
| `gallery.ts`, `gallery.generated.json` | Delete | Gallery. |
| **New** | Phase 3/5 | `data/cities.ts`, `data/faq.ts`, `data/intake.ts` (form options), `content/work/*.mdx`, `content/blog/` (empty). |

### 1.8 workers/

| File | Call | Reason |
|---|---|---|
| `careers-upload/**` | Delete | Careers. **First** port its `verifyTurnstile()` into the intake endpoint (the relay has no Turnstile check today). |
| `lead-relay/src/index.ts` | Adapt → intake endpoint (Phase 4; dead routes removed in Phase 0) | Already has origin gate, per-IP rate limit, sanitising, store-before-forward, CSV export behind a token, and a cron retry sweep. Remove `/application`, `/resume/*` and the R2 binding (Phase 0, pure deletion). Phase 4 adds Turnstile verification and the email notification, and puts the webhook forward behind `FEATURE_AUTOMATIONS`. Where it runs depends on **D1**. |
| `lead-relay/src/crm/*` | Adapt | The "generic" adapter **is** the speed-to-lead webhook forward. Keep the seam; gate it on the flag. |
| `lead-relay/schema.sql` | Replace | New columns for the /start fields (business, trade, website, services, timeline, budget, sms_consent) plus `notify_status`. Drop role, answers, resume_key, urgency. It's a fresh database, so no migration is needed. |
| `lead-relay/wrangler.toml` | Adapt | New names. D1 dev/prod. No R2. Resend key and webhook as secrets. |
| `lead-relay/test/crm.test.ts` | Adapt | Keep; extend in Phase 4 for flag-gated forwarding. |
| `lead-relay/README.md` | Adapt | Rewrite for the new flow. |

### 1.9 What Phase 0 actually does to the tree

Moving to `site.config.ts` changes the fields almost every template component reads, so those components stop compiling. Phase 0 therefore:

1. Deletes everything marked **Delete** above.
2. Deletes **Replace** items whose replacement is a later phase, leaving a minimal placeholder home so `npm run build` stays green.
3. Re-points **Adapt** items at `site.config.ts` just enough to compile, and leaves them unmounted until their phase (Nav, Footer, BookingEmbed, FaqList and so on).

The Phase 0 site is a shell: layout, fonts, tokens, a placeholder home, legal stubs, 404, robots and sitemap.

---

## 2. `client.config.ts` → `site.config.ts`

`site.config.ts` holds **business facts only** (PLAN §2). Page-specific copy goes in `data/*.ts` or the page itself (PLAN §6). Any value PLAN doesn't give is a `[PLACEHOLDER]` logged in `CONTENT_TODO.md`.

| client.config field | site.config.ts | Value / note |
|---|---|---|
| `businessName` | `name` | `"Digital Haptics"` |
| `legalName` | `legalName` | `[PLACEHOLDER: legal entity name]` |
| `tagline`, `taglineEmphasis`, `subheadline` | — (moves to `data/home.ts`) | Hero copy is page-specific. Flag-off and flag-on variants come verbatim from PLAN §5. |
| `logoPath`, `logoAlt` | — | The logo is a component (ink square + wordmark). |
| `schemaType` | `schemaType` | `"ProfessionalService"` (PLAN §8). |
| `siteUrl` | `url` | `"https://digitalhaptics.dev"` |
| `metaTitle`, `metaDescription` | `seo.defaultTitle`, `seo.defaultDescription`, `seo.titleTemplate` | Drafted from PLAN §1 wording, within 60/160 characters. |
| `ogImagePath` | `seo.ogImage` | Template SVG until Phase 5 generates real images. |
| `phone`, `phoneHref` | `phone.display`, `phone.e164` | `[PLACEHOLDER: agency phone]` |
| `smsHref` | — | No "text us" action in PLAN. |
| `urgentPhone*` | — | Not applicable. |
| `email` | `email` | `[PLACEHOLDER: agency email]`. I won't use your personal address. |
| `address.*` | `location: { region: "Acadiana", state: "LA", country: "US" }` | Service-area business; PLAN gives no street address. Add one only if you want it in JSON-LD. |
| `hours`, `hoursShort`, `mapEmbedSrc` | — | Not in PLAN. |
| `bookingUrl` | `booking.calUrl` | `[PLACEHOLDER: Cal.com event URL]`. Embed only, on `/start/`. |
| `tracking.dniScriptUrl` | — | No call tracking in PLAN. |
| `socials.*` | `socials: { googleBusiness, facebook, instagram, linkedin }` | All `""` (hidden) until you supply them. |
| `form.serviceOptions`, `form.urgencyOptions` | — (moves to `data/intake.ts`) | Trade options come from PLAN §1 (Roofing, Plumbing, HVAC, General contracting, Dirt work, Other). **Timeline and budget options are `[PLACEHOLDER]`**: budget ranges are price claims. |
| `about.*`, `contactPhoto`, `testimonials`, `badges` | — | About moves to `data/about.ts` (Phase 5). Testimonials, badges and stats are never invented. |
| `copy.*` | `cta: { label: "Start a Project", href: "/start/" }` | Nav, sticky and hero CTA labels come from here. Other copy moves to data files. |
| *(new)* | `serviceArea: { label: "Acadiana, LA", cities: [...] }` | Seven cities from PLAN §3, with a note that the list needs confirming. City **pages** publish only with unique content. |
| *(new)* | `intake.endpoint` | Built from an env var at build time. Public by nature. |
| *(new)* | `intake.responseTime` | `[RESPONSE TIME]`, verbatim from PLAN §5. |
| *(new, PLAN §2)* "webhook URL" | **Not in site.config** | See C5. It's a secret on the endpoint side. |

---

## 3. Design tokens from `Hybrid.dc.html`

Values are verbatim from the mockup's inline styles. ★ = in the mockup but **not listed in PLAN**. Contrast ratios are measured with the WCAG formula.

### 3.1 Color

CSS variables hold RGB channels (`--ice: 228 238 244`) so Tailwind opacity modifiers work. Tailwind `colors` **replaces** the default palette and keeps only `transparent`, `current` and `inherit`.

| Token | Value | Tailwind key | Use (mockup) | Notes |
|---|---|---|---|---|
| ice | `#E4EEF4` | `ice` | Page ground, dot grid, ink-on text | |
| frost | `#F4F8FB` | `frost` | Section frame fill, lead-flow panel | |
| white | `#FFFFFF` | `white` | Case card, input | |
| steel-panel | `#CFDAE2` | `steel-panel` | Hero sidebar | |
| hairline | `#C9D5DE` | `hairline` | Case card row dividers | Decorative only (1.49:1 on white). |
| ink | `#0B0D10` | `ink` | Text, borders, slabs | 16.5:1 on ice, 18.2:1 on frost. |
| steel | `#4A5560` | `steel` | Labels, secondary text | 6.46 ice / 7.13 frost / 5.36 steel-panel / 7.61 white: AA everywhere. |
| signal | `#FF5A1F` | `signal` | Buttons, flare, markers | **Never text on light** (2.65 on ice, 3.12 on white). Ink on signal 6.24 ✓. Signal on ink 6.24 ✓ (arrows). |
| ★ steel-deep | `#3E4852` | `steel-deep` | Hero subline, sidebar descriptions | Not in PLAN. 6.56 on steel-panel, 7.91 on ice. |
| ★ flare-core | `#FFF4EC` | `flare-core` | Glowing node at the flare crossing | Decorative. |
| ★ signal-glow | `#FF5A1F` at alpha `0x73` = **0.45** | `signal/45` (via `--signal`) | Every flare `box-shadow` | Mockup computes `accent + '73'`. |

### 3.2 Typography

Fonts via `next/font/google`, exposed as `--font-display`, `--font-body`, `--font-mono`.

| Family | Weights to load | Fallback |
|---|---|---|
| Chakra Petch | 600, 700 (logo) | `system-ui, sans-serif` |
| Manrope | 400, 500 | `system-ui, sans-serif` |
| JetBrains Mono | 400 (row values), 500 | `ui-monospace, monospace` |

The mockup's `<link>` also requests Chakra 500 and Manrope 600, but no element uses them, so they're dropped.

| Role | Mockup value | Tailwind `fontSize` key | Value (desktop → mobile) |
|---|---|---|---|
| Display | Chakra 600, 112px, lh 0.9, ★ tracking −0.01em, uppercase | `display` | `clamp(3.375rem, 7.78vw, 7rem)`, lh .9, ls −.01em |
| Display small | Chakra 600, 70px, lh 0.9, uppercase | `display-sm` | `clamp(2.5rem, 4.86vw, 4.375rem)`, lh .9 |
| Heading | Chakra 600, 28px in tile (PLAN 36→28), ★ lh 1.1 | `heading` | `clamp(1.75rem, 2.5vw, 2.25rem)`, lh 1.1 |
| Subheading | Chakra 600, 24px, ★ tracking .04em, uppercase in the frame title | `subheading` | `clamp(1.25rem, 1.67vw, 1.5rem)`, lh 1.2 |
| Body large | ★ Manrope 19px, lh 1.55 (hero subline, max-w 520px) | `body-lg` | `clamp(1.0625rem, 1.32vw, 1.1875rem)` |
| Body | Manrope 17px, lh 1.55 | `body` | `clamp(1rem, 1.18vw, 1.0625rem)` |
| ★ Body small | Manrope 15px (frame meta) / 14px (sidebar desc) | `body-sm` / `body-xs` | 15px / 14px, lh 1.55 |
| Label lg | Mono 500 13px, tracking .1em (buttons) | `label-lg` | 13px |
| Label | Mono 12px (nav, section label, rows) | `label` | 12px |
| Label sm | Mono 11px (boxed labels, panel, chips) | `label-sm` | 11px |
| Logo | Chakra **700** 18px, ★ tracking .12em | `logo` | 18px |

★ **Letter-spacing scale** (`letterSpacing`): `tight` −0.01em, `label-xs` .08em (sidebar/lead-flow), `label-sm` .1em (buttons, sidebar footer), `label` .12em (nav, chips, case card), `label-md` .14em (type-tile boxed label), `label-lg` .16em (section label, input label, tags).

★ **Mono line-heights:** 1.7 (sidebar list), 1.6 (swatch captions).

### 3.3 Layout and spacing

| Token | Value | Tailwind key | Source |
|---|---|---|---|
| Base unit | 4px | default spacing scale (unchanged) | PLAN |
| Container max | 1440px | `maxWidth.page` | PLAN + mockup artboard |
| Gutter | 64px desktop / 20px mobile | `spacing.gutter`, `spacing.gutter-sm` | PLAN; mockup `padding-left: 64px` |
| Section padding | 96–120 / 48–64 | `spacing.section`, `spacing.section-sm` | PLAN |
| ★ Hero sidebar width | 320px | `width.sidebar` | Mockup |
| ★ Hero content right inset | 384px (= sidebar + gutter) | derived | Mockup |
| ★ Hero top padding / gap | 88px / 26px | literal in Hero | Mockup |
| ★ Header padding | 30px vertical; nav gap 36px; logo gap 10px | literal in Header | Mockup |
| ★ Section frame | margin 64px, inner padding 48px, gap 48px, header rule pb 20px | CutFrame props | Mockup |
| Border radius | 0 | `borderRadius: { none: "0", DEFAULT: "0" }` (replace) | PLAN |
| ★ Mobile breakpoint for hero sidebar | not specified | `xl` (1280px) | See R6 |

### 3.4 Cut corners (`clip-path`)

| Token | Value | Tailwind / CSS | Where in the mockup |
|---|---|---|---|
| `sm` | 10px | `--cut-sm` | Input (top-left only) |
| `md` | 16px | `--cut-md` | Case card, lead-flow panel (top-left + bottom-right) |
| `lg` | 24px | `--cut-lg` | Section frame (top-left + bottom-right) |
| ★ `xl` | **56px** | `--cut-xl` | Hero sidebar (bottom-left only) |
| ★ (12px) | 12px | not a token | Style-tile swatches only; illustrative |

The border technique matches the mockup: an outer layer filled `ink` with `padding: 1px` and the clip, and an inner layer with the fill and the **same** clip. The default corner pair is top-left + bottom-right. Polygon for both: `polygon(S 0, 100% 0, 100% calc(100% - S), calc(100% - S) 100%, 0 100%, 0 S)`.

### 3.5 Signature elements

| Element | Mockup value | Token / component |
|---|---|---|
| Dot grid | `radial-gradient(rgba(11,13,16,0.2) 1px, transparent 1.4px)` at 16px (PLAN: 14px mobile) | `bg-dots` utility; `--dot-size` 16/14 |
| ★ Dense dot grid | `rgba(11,13,16,0.3) 1.1px, transparent 1.5px` at **10px** (case card screenshot placeholder) | `bg-dots-dense` |
| Flare vertical | 2px wide, `box-shadow: 0 0 22px 5px glow` | `shadow-flare-v` |
| Flare horizontal | 1px tall, `box-shadow: 0 0 14px 3px glow`; stops at the sidebar edge | `shadow-flare-h` |
| ★ Flare node | 16px, `#FFF4EC`, `box-shadow: 0 0 36px 16px glow`, **circular** (`border-radius: 50%`) | `shadow-flare-node`; see C7 |
| Marker | 8px signal square | `<Marker />` |
| ★ Status dot | **7px** signal square (`LIVE`, `LIVE SITE`, result row) | `<Marker size="dot" />` |
| ★ Arrow block | 76px signal square; SVG ↘ 34px, ink stroke 3 (viewBox 30) | `<ArrowBlock />` |
| Boxed label | 1px ink border; sidebar: 11px, .08em, padding 4/8; type tile: 12px, 500, .14em, padding 6/10. Active: signal fill, no border | `<BoxedLabel size="sm|md" active />` |
| ★ Ink tag | ink fill, ice text, mono 11px, .16em, padding 6/12 (`SYSTEM D`) | `<BoxedLabel tone="ink" />` |
| Section label | Mono 12px, .16em, steel: `( 01 ) — …` | `<SectionLabel />` |

### 3.6 Components

| Component | Mockup anatomy |
|---|---|
| Button / Primary | Signal fill, ink text, mono 500 13px .1em, padding 0 24px (sidebar 0 20px), gap 12px, min-h **52px**, arrow ↘ at 17–18px |
| Button / Accent | Ink fill, ice text, signal ↘ |
| Button / Ghost | Transparent, 1px ink border, ink text, no arrow |
| ★ Button size sm | Style tile: min-h **48px**, 12px, padding 0 20px, arrow 16px → `size="sm"` |
| Input | Label mono 11px .16em, 8px gap; white fill, 1px ink via wrapper, top-left `sm` cut; min-h 48, padding 0 14px, Manrope 16px (16px also prevents iOS zoom) |
| Chip | Mono 11px .12em, padding 6/10, 1px ink; active = ink fill + ice text |
| Case card | `md` cut, white. Header strip padding 10/16/10/**24** (clears the cut), mono 11px .12em, `CASE.01` 500 + 7px dot `LIVE SITE` in steel. Screenshot area 140px, dense dots, ink bottom rule. Rows mono 12px, padding 10/16, hairline rules (CLIENT / TRADE / SYSTEMS / RESULT; RESULT gets a dot + 500 weight). Footer bar ink, ice text 11px .12em, signal ↘ 15px, padding 12/16 |
| Lead-flow panel 🚩 | 250px wide, `md` cut, frost; padding 16/18/18, gap 10, mono 11px .08em. Header `LEAD_FLOW` 500 + 7px dot `LIVE`, ink rule pb 8. Rows: steel key, ink value. Row 04 is signal-filled, bleeding 6px each side (margin 0 −6px, padding 4/6). Anchored 20px right and below the flare crossing |
| Hero sidebar | 320px, steel-panel, 1px ink left and bottom edge via wrapper, `xl` bottom-left cut, padding 24/32/0, gap 64. ACT list gap 40, item gap 6, descriptions Manrope 14px steel-deep. Footer line mono 11px .1em steel, ink top rule, pt 20. **8px marker** centered at the end of the cut's bottom edge. Height 840px: it runs **past** the 700px hero into the next section |
| Header | Logo = 14px ink square + gap 10 + "DIGITAL HAPTICS". Nav mono 12px .12em, gap 36. In the mockup the CTA lives in the sidebar, not the nav row |

---

## 4. Conflicts and proposed resolutions

| # | Conflict | Proposed resolution |
|---|---|---|
| C1 | CLAUDE.md and the brief point to `docs/design-reference/Hybrid.dc.html` and `README.md`, but only the zip is committed. | Phase 0 extracts those two files next to the zip (no `support.js`, no `vendor/`) so the documented path is real. |
| C2 | **Lead path.** The template's documented principle is "the revenue path must not depend on code we maintain": the browser posts to Web3Forms, and the relay gets an un-awaited copy. PLAN §2/§7 makes our endpoint the single path: validate → Turnstile → D1 → email. | Follow PLAN; drop Web3Forms. Recover the safety the template was buying: (a) **store first** and return 200 once D1 has the row; send email in `waitUntil` with a `notify_status` column so a Resend outage is a late email, not a lost lead; (b) on any non-200 the form shows the phone and email so the visitor can still reach you; (c) a D1 write failure is the only error the visitor sees. |
| C3 | Fonts: the template self-hosts Fontsource and uses `scripts/fonts.mjs` to inject preloads. PLAN says `next/font/google`. | Follow PLAN. `next/font` self-hosts at build and handles preload, so `font-src 'self'` in the CSP still holds. Delete `fonts.mjs` and `@fontsource`. Note: it needs network at build time (R5). |
| C4 | Radius: the template uses a 2px default plus `rounded`/`rounded-full` in components. PLAN says 0 everywhere. | Replace (not extend) `borderRadius` so every `rounded-*` is 0. Only the flare node is exempted (C7). |
| C5 | PLAN §2 lists "webhook URL" in `site.config.ts`. This is a static site, so the config ships to the browser, and forwarding happens server-side anyway. | Keep the webhook URL out of `site.config`: it's an endpoint secret (`AUTOMATIONS_WEBHOOK_URL`). `site.config` holds only the public intake endpoint. This keeps the single-config spirit without publishing a credential. |
| C6 | The mockup shows the **flag-on** state: `· AUTOMATIONS` label, ACT.03, lead-flow panel, `( FORM ) → ( SMS ) → ( BOOKED )`, automations subline. PLAN's deployed default is flag-off. | Build both. Flag-off output uses PLAN §4.5/§5 off-state copy verbatim; the mockup defines the flag-on visuals. With flags off, the flare stands alone (PLAN §5). |
| C7 | The mockup's flare node is a **circle** (`border-radius: 50%`); PLAN says radius 0 everywhere. | Keep it circular as the one documented exception: it's a light source, decorative and `aria-hidden`, not a shape in the UI. If you'd rather keep the rule absolute, make it a 16px square with the same glow. Default: circle, with a comment. |
| C8 | The mockup's swatch label says frost = "Panels, cards, inputs", but its case card and input actually use `#FFFFFF`. PLAN: frost = panels/frames, white = cards/inputs. | Follow PLAN, which matches what the mockup actually renders. |
| C9 | Button height: the mockup uses 52px in the hero and 48px in the component tile; PLAN says min 52px. | Default 52px (PLAN). Add `size="sm"` at 48px for dense spots (form rows, cards). Both clear 44px. |
| C10 | **Focus ring in signal (PLAN §4.5) fails non-text contrast.** Signal on ice is 2.65:1, below the 3:1 WCAG asks of focus indicators. Separately, `clip-path` **clips `outline`**, so a normal focus ring vanishes on CutFrame inputs and case cards. | Two-tone ring: 2px signal plus a 2px ink outer ring (ink on ice is 16.5:1), via `outline` + `box-shadow` on regular elements. Clipped elements get the ring on the outer wrapper: on `:focus-within` the frame layer becomes ink/signal and 3px thick, so the ring follows the cut. Signal stays visible, as PLAN wants. |
| C11 | **Form errors:** PLAN and the mockup define no error color, and signal can't be text on light. | Keep errors in the palette: ink error text, a 2px signal bar on the field's frame, and a mono `ERROR —` prefix; never color alone. Alternative: add an AA-safe red (for example `#B42318`, about 6.5:1 on white). Default: in-palette. |
| C12 | Token naming: the template uses semantic names (`brand`, `accent`, `surface`, `ink-soft`); PLAN uses palette names. | PLAN names as variables and Tailwind keys. Mockup extras (`steel-deep`, `flare-core`) are added and marked ★. |
| C13 | Content layout: the template keeps TS content in `content/`; PLAN puts TS in `data/` and MDX in `content/`. | Follow PLAN. `lib/content.ts` stays the only door, so components don't care. |
| C14 | Motion: the template ships Lenis, pinning, parallax, a page-wipe and masked headline reveals. PLAN §4.6 forbids scroll-jacking, content parallax and anything that delays reading. | Delete those. Keep `Reveal` (8–16px), `useStillness`, the easing token, and add flare pulse, lead-flow sequence and arrow nudge, all off under reduced motion. |
| C15 | Sticky CTA: the template's is Call/Text/Book. PLAN's is a single "Start a Project ↘", hidden on `/start`. | Follow PLAN. |
| C16 | PLAN §8 says Cloudflare Web Analytics **plus custom conversion events**. Cloudflare Web Analytics has no custom-event API. | Needs a decision: **D2**. |
| C17 | Feature flags live in two runtimes: the build (UI) and the endpoint (webhook forward, SMS consent handling). | **Revised with D1:** Workers Builds has build variables separate from runtime variables, so Phase 4 inlines the flags into the Worker at build time to keep one switch. Originally: with Pages Functions this is one setting per Pages environment. With a standalone Worker, `FEATURE_AUTOMATIONS` has to be set in **both** places, and the Phase 7 checklist must say so. |
| C18 | Git remote `origin` is `github.com/charliem04/Digital_Haptics`. Your brief says never push to the **template's** remote. | This looks like the new site's own repo, not the template. Please confirm. I won't push in any phase unless you ask. |

---

## 5. Risks

| # | Risk | Assessment / mitigation |
|---|---|---|
| R1 | **Static export vs `@opennextjs/cloudflare`.** | Stay on `output: "export"`. Every page in PLAN is static, MDX compiles at build, and the only server piece is the form endpoint, which PLAN already makes a Worker. Static export keeps the build gates (which read `out/`), the CSP generator and the perfect-cache model. OpenNext adds a runtime and cold starts and buys nothing here. Revisit only if a later feature needs per-request rendering (the SMS demo doesn't; it posts to an endpoint too). |
| R2 | **Flagged route 404s under static export.** Calling `notFound()` from a statically exported page doesn't reliably produce a 404 response on Cloudflare Pages. | Don't emit the page at all: `/services/[slug]` filters flagged slugs out of `generateStaticParams`, with `dynamicParams = false`. Pages then serves Next's `out/404.html` with a real 404 status. Phase 4 verifies with `curl -I` on a preview deploy. Pages only falls back to SPA mode when no `404.html` exists, and Next always emits one; I'll assert that in `harden.mjs`. |
| R3 | **Endpoint placement (D1).** A standalone Worker (the template's model) needs a CORS allow-list, and the template documents how fragile that is with per-deploy preview hashes; preview deploys also post into the production D1 unless you add a second database. Pages Functions (`site/functions/api/intake.ts`) are same-origin, get per-environment bindings and variables (a preview D1, flags in one dashboard), and need no CORS. They have no cron triggers, though. | Recommend **Pages Functions** for the intake endpoint, porting the relay's logic and tests. Retrying failed email/webhook sends then needs either a tiny companion cron Worker on the same D1 or a manual CSV export. With store-first, nothing is lost either way. See D1. |
| R4 | **Build-time flags in client components.** Non-`NEXT_PUBLIC_` env vars are `undefined` in browser bundles, so a client component reading a flag would always see `false`, or worse, server and client would disagree and cause hydration errors. | `lib/flags.ts` is the only reader. It parses strictly (only `"true"` is true) and `next.config.mjs` `env` inlines the three booleans at build, so server and client agree and dead branches are dropped. The values are booleans, not secrets. Components import `flags`; a lint rule (`no-restricted-syntax` on `process.env` outside `lib/`) enforces it. |
| R5 | `next/font/google` downloads fonts at build. | Cloudflare Pages and CI have network. Offline local builds would fail; acceptable. |
| R6 | The mockup is desktop-only at 1440px. The 112px display line plus the 320px sidebar doesn't fit below about 1280px. | Sidebar from `xl` (1280px) up; below that it becomes the full-width `steel-panel` band (PLAN §4.5 default). The flare scales with the hero. Validate in Phase 1 at 1024, 1280 and 1440. |
| R7 | Cal.com iframe: performance (Lighthouse 95+ on mobile) and third-party cookies. | Keep the template's lazy, near-viewport mount. With D3 = no cookie banner, show a click-to-load facade ("Load scheduler ↘") so nothing third-party loads unasked. |
| R8 | Turnstile and Resend need dashboard work: widget hostnames (`digitalhaptics.dev` plus the `*.pages.dev` preview), and a Resend sending domain (SPF/DKIM DNS records on digitalhaptics.dev). | Phase 4 runbook in `LAUNCH-CREDENTIALS.md`. The form shows phone/email fallback until both are configured. |
| R9 | Next 14.2.35 is a major version behind; `next lint` is deprecated in later versions. | Stay on 14 for this refactor (lowest risk; the template's gates are tested against it). Upgrade as its own phase after launch. |
| R10 | PLAN Phase 0 lists Prettier; the template has none. Formatting the whole repo would bury the real diff. | Add Prettier config and scripts in Phase 0, format only new and changed files, and run a repo-wide format as a separate commit when you want it. |
| R11 | `scripts/check.mjs` may flag new design choices as "inherited defaults" (it's tuned to the old skin). | It's advisory in CI. Tune rules in Phase 1 if it raises false positives. |
| R12 | The hero sidebar runs past the hero into the next section, and the flare is absolutely positioned. | Build the hero as one positioned block with the sidebar at its own height. Check for overlap on the next section at each breakpoint in Phase 1. |

---

## 6. Placeholders this introduces (will be logged in `CONTENT_TODO.md`)

`[PLACEHOLDER: legal entity name]`, `[PLACEHOLDER: agency phone]`, `[PLACEHOLDER: agency email]`, `[PLACEHOLDER: Cal.com event URL]`, `[RESPONSE TIME]`, `[PRICE]` ×3 (pricing; one flagged), `[RESULT]` (every case study), case study client permissions, timeline options, budget ranges, social URLs, city list confirmation, and per-city unique content.

---

## 7. Decisions needed before Phase 0

Each has a default. Reply "approved" to take all defaults, or name the ones to change.

| # | Decision | Default |
|---|---|---|
| D1 | **Revised 2026-11-03 → Worker with static assets** (see below). Original: intake endpoint: **Pages Functions** (same-origin, per-environment D1 and flags, no cron) or the **standalone Worker** the template uses (has cron retries; needs CORS allow-list and flags set in two places)? | **Pages Functions**, port the relay's code and tests, retries via a later cron Worker if needed |
| D2 | Custom conversion events, since Cloudflare Web Analytics can't record them: (a) post them to our own endpoint into Workers Analytics Engine; (b) add a cookieless tool such as Plausible; (c) pageviews only. | **(a)** own endpoint → Analytics Engine, with an `// OPEN:` comment |
| D3 | Cookie banner: drop it (CF Web Analytics is cookieless; Cal.com sits behind a click-to-load facade) or keep it? | **Drop it**, keep the facade |
| D4 | Flare node shape: circle (mockup) or square (zero-radius rule)? | **Circle**, documented exception |
| D5 | Form error styling: in-palette (ink text + signal bar + `ERROR —` prefix) or add a red token? | **In-palette** |
| D6 | `LICENSE` (MIT, from the template): remove (all rights reserved) or keep? | **Remove** |

Also please confirm C18: `origin` is your new repo, not the template's.

---

## 8. Phase 0 record (deviations from the map above)

- **C1 resolved by you:** the reference is unzipped at `docs/design-reference/digital-haptics-design-system/`. I diffed it against the copy this audit was written from and it is identical. CLAUDE.md now points there.
- **Nav, Footer and StickyCTA were deleted, not adapted in place.** Moving to `site.config.ts` removed most of what they read (logo image, phone CTA, urgent line, dropdowns), so keeping them compiling meant rewriting them twice. Phase 2 rebuilds them; the registry-driven link logic and Escape/outside-click handling are worth porting back from commit `838aaa8`.
- **Contact.tsx, Button.tsx, Icon.tsx, the services pages and `content/services.ts` were deleted early** for the same reason. Their replacements land in Phases 1 and 3. `Contact.tsx`'s honeypot, `dialable()` check and failure copy are in `838aaa8` for Phase 3–4 reference.
- **`workers/lead-relay` was left intact** rather than trimmed. With D1 = one Worker (revised, below), Phase 4 ports its logic and tests into that Worker's entry point and retires the standalone relay, so cutting the careers routes now was churn on code about to be replaced. `workers/careers-upload` was deleted as planned; its `verifyTurnstile()` is in `838aaa8` for the Phase 4 port.
- **`scripts/check.mjs` was kept but not tuned yet** (R11); that happens in Phase 1.
- **Prettier was applied repo-wide in its own commit** (R10), so `format:check` runs in CI from Phase 0 on and the substantive commit stays readable.
- **Fonts moved to `next/font/local` after Phase 0 (your call, 2026-11-02).** This supersedes C3 and R5. Next 14's Google loader crashed 2 of 5 builds on an unexpected Google Fonts response, so the four WOFF2 files (Google's latin subsets: Chakra Petch 600 and 700, Manrope variable, JetBrains Mono variable) and their OFL licenses are committed in `site/app/fonts/`. Builds no longer need network access for fonts, and the runtime result is unchanged.

## 9. D1 revised: Cloudflare Workers instead of Pages (2026-11-03)

Approved in chat after Phase 0 merged. One Worker (`digitalhaptics`) serves the static export as assets and, from Phase 4, the intake endpoint.

**Why:** Cloudflare puts new platform work into Workers and recommends it for new projects. This site needs cron triggers (retries, digests), and the automations webhook is best on Queues. Pages Functions lack the first and make the second awkward. One Worker also hosts D1, Analytics Engine (D2) and the relay port without a second project.

**What changed in the repo (branch `refactor/workers`):**
- `site/wrangler.jsonc`: assets from `out/`, `not_found_handling: "404-page"` (flagged routes stay real 404s, R2), `html_handling: "auto-trailing-slash"`. `wrangler` is pinned as a devDependency.
- `scripts/is-preview.mjs` reads `WORKERS_CI_BRANCH` (keeps `CF_PAGES_BRANCH` as a fallback).
- `scripts/harden.mjs`: Cloudflare's build metadata (`WRANGLER_CI_OVERRIDE_NAME` and friends) is declared public. The Worker's name, "digitalhaptics", is in every canonical URL, so the leak check fired on the site's own domain. `CLOUDFLARE_API_TOKEN` was added to the must-stay-secret list.
- `_headers`: **Workers applies only the last of several rules with the same pattern; Pages merged them.** The CSP and preview blocks used to be separate `/*` rules appended to the file, which would have silently dropped HSTS, nosniff and the rest. `scripts/headers-file.mjs` now adds generated headers inside the single `/*` rule. Verified with `wrangler dev`.

**Phase 4 must handle:**
- **Preview versions share production's runtime bindings.** On Pages, Preview had its own D1 and variables; a Worker preview version uses the same D1 database and secrets as production. The intake endpoint has to keep preview submissions out of the production table (separate D1 binding selected at build, or refuse writes when the build is a preview).
- Flags reach the endpoint by build-time inlining (C17).

## 10. Phase 1 record (design system, branch `refactor/phase-1`)

**Built:** `components/ui/` holds CutFrame (+ `cutPath`), Arrow/ArrowBlock, Button (primary/accent/ghost × md/sm), Field (TextField, TextAreaField, SelectField, Checkbox, CheckboxGroup), Chip/ChipButton, BoxedLabel, SectionLabel, Marker, Flare and Logo. In `components/`: CaseCard, HeroSidebar (rail + band) and LeadFlowPanel 🚩 (+ LeadFlowRows). `/styleguide/` is live, noindex, out of the sitemap and linked from nowhere.

**Deviations and decisions:**
- **Header, mobile menu and sticky CTA stay in Phase 2.** PLAN §4.5 lists them, but §9 schedules them in the layout shell. Phase 1 built their parts (Logo, Button).
- **The ↘ is an SVG, not a character.** The self-hosted JetBrains Mono latin subset has no U+2198, so a typed arrow fell back to a system font. MoreLink was switched too.
- **Focus ring on cut shapes (C10):** CutFrame `ring` draws two clipped layers outside the frame (signal at 2px, ink at 4px) that appear on `:focus-visible` or `:has(:focus-visible)`. There's no layout shift and the ring follows the cut. Verified with real Tab presses on a case card and an input.
- **Errors (D5):** "Error —" line in ink plus a 2px signal bar inside the bottom of the field. The bar is an element, because a box-shadow bar was removed by the focus style.
- **Flagged copy stays out of flag-off JavaScript.** LeadFlowPanel is a server component that checks the flag and passes rows to a client child, so a flag-off build ships none of its copy. Checked by grepping `out/`.
- **Hero geometry, for Phase 3 (R6/R12, measured in the styleguide assembly):**
  - The crossing sits at `calc(100% - 670px)`, 350px left of the rail as drawn (770px at 1440). A percentage put the flag-on panel 2px over the rail at 1280.
  - The headline is capped at xl with `min(7rem, (100vw - 548px) / 7.6)`. Uncapped, "Websites that" wrapped to three lines at 1280.
  - Below xl the crossing drops under the buttons, so the horizontal line never crosses body text, and the two headline lines use a 4px gap instead of 26px.
  - Measured: 1440 rail at 1105, panel 775–1025; 1280 panel ends 865, rail at 945; 1024 and 375 band, no horizontal overflow.
- **Press states:** Button and ChipButton nudge 1px on `:active`. Breadcrumbs, MoreLink and SocialIcons got press states too, which clears `check.mjs`'s no-active-state warnings.
- **`check.mjs` tuned (R11):** round-stat no longer fires on `100%` inside clip-path polygons, calc() or CSS length defaults.
- **Utility conflicts:** a component's default position or padding class can't be overridden by a caller's class, because Tailwind order decides, not class order. HeroSidebar no longer sets its own position. Overrides use `!` where needed.
- **Sidebar blurbs and lead-flow rows** are the mockup's copy verbatim (`data/acts.ts`, `data/leadFlow.ts`). Logged in CONTENT_TODO.md for your sign-off.

## 11. Phase 2 record (layout shell, branch `refactor/phase-2`)

**Built:**
- `components/layout/`:
  - SkipLink.
  - Header: server; HeaderView renders whatever it's given; NavLinks is the client part.
  - MobileMenu: native modal `<dialog>`.
  - Footer and FooterView: ink slab.
  - StickyCta.
  - Container and Section.
- `lib/nav.ts`: plain, flag-filtered link data built from the route registry.
- All of it is mounted in `app/layout.tsx`: skip link → header → `<main id="main">` → footer → sticky CTA.

**Decisions:**
- **Live links only.** Header, menu, footer and sticky CTA read `lib/nav.ts`, which includes a page only when its registry entry is `live` (and its flag is on), so no phase ships a dead link. Today that means the header is the logo plus the menu button, the footer has cities (as text), contact and legal links, and the sticky CTA waits for `/start`. Everything fills in as Phase 3 flips pages live, with no edits here.
- **No flagged copy in client JavaScript.** Client parts (NavLinks, MobileMenu, StickyCta) receive links as props and never import the registry, which names flagged pages.
- **Styleguide shows the full nav.** HeaderView and FooterView are rendered with every registry item, flag-filtered, hrefs pointed at `/`, so the shell can be reviewed before the pages exist.
- **Mobile menu = `<dialog>.showModal()`** gives the focus move, Tab containment, inert page and Escape from the browser, and returns focus to the trigger on close. It also closes on navigation, on a link to the current page, and when widening to lg. Page scroll is locked while open. Verified with real key presses.
- **Header is not sticky.** On mobile the sticky CTA covers PLAN §1's "one click from Start a Project". On desktop the header is at the top. Revisit in Phase 3 if wanted.
- **Home-page header inset is Phase 3.** The mockup's sidebar starts at the top of the page, so on `/` at xl the header needs a 384px right inset and drops its CTA (the rail has one). It's left for the home page build.
- **Footer contrast:** ice on ink 16.5:1; secondary text is ice/70 (about 9:1). Link hover goes signal, allowed on ink (6.24:1). Links are 44px tall; the cities are plain text until their pages are live.
- **Sticky CTA** is 56px plus a 1px rule, padded for the iPhone home indicator. A same-height ink spacer after the footer keeps it from covering the last links. Verified at 375.
- **Copyright** reads `© {year} {legalName}` (currently Charles Meyers) and switches automatically when the LLC name goes into `site.config.ts`.

## 12. Phase 3 record (core pages, branch `refactor/phase-3`)

**Built:**
- Pages: Home, Work index and `/work/[slug]` case study template, Services overview and `/services/[slug]` (Web Design, Local SEO; Automations 🚩), Pricing, Start a Project (intake form UI, booking slot, FAQ), and Thank-you.
- Data and content: `data/` (services, process, pricing, faq, intake), five case study drafts in `content/work/*.mdx`, and the getters in `lib/content.ts`.
- Page parts in `components/page/`: PageHero, SectionHead, StepsStrip, CtaBand, ServiceCard and CaseGrid.
- The home Hero in `components/home/`, and IntakeForm in `components/start/`.

**Decisions:**
- **Case studies ship as drafts (PLAN §10).**
  - Production shows a case only when `published` and `permission` are both true. Preview builds also show drafts, marked "Draft", with the client's name replaced by `[Client name]` until `permission` is true, because preview URLs are publicly reachable even though they're noindex. Without permission the slug also becomes `draft-{order}` (a file-name slug like `/work/douet-ac/` names the client), and `liveUrl` and `heroImage` are dropped. This was flagged by an automated security review before the branch was pushed.
  - Work's registry entry is `live: hasCases()`, so with nothing publishable, nothing links to Work: no nav item, no proof strip, no "See the Work" button.
  - Static export refuses a dynamic route with zero params, so `/work/[slug]` emits one placeholder, `/work/_/`, which renders the 404 page (noindex, unlinked). It disappears once a case is published.
- **MDX:** `next-mdx-remote` 6.0.0 (JavaScript expressions blocked by default) plus `gray-matter` 4.0.3, both pinned. Frontmatter follows PLAN §5's fields, plus `published`, `permission` and `summary`.
- **Flagged Automations page:** filtered out of `generateStaticParams`, so it's a real 404 with the flag off (R2, checked through `wrangler dev`). Its full page (modules, demo) is Phase 4.
- **Flagged copy in client JS (again):** the intake form's SMS consent text used to sit in the client component, so it shipped in the flag-off `/start` bundle. It's now a prop the server passes only with the flag on. The flag scan of `out/`, JavaScript included, is clean.
- **Home header:** `OnHome` insets the header 320px at xl on `/` and hides its CTA there, because the rail and flare start at the top of the page and run behind the header (`--header-h`, 88/108px). Measured at 1440: rail at 0–840, horizontal flare line at 470 stopping at the rail, nav ends at 1017.
- **Intake form:**
  - Validation is inline, in words, on blur and on submit.
  - A failed submit focuses an error summary (role alert) with a link to each field.
  - It also has a honeypot and Turnstile (shown once a key is set).
  - It posts JSON to `site.intake.endpoint`. Until Phase 4 builds the endpoint, a submit shows the failure message with phone and email. Verified in the browser: 8 errors on an empty submit, then a POST to `/api/intake/`, a 404, and the failure state.
  - **Phase 4 note:** with `trailingSlash`, the POST goes to `/api/intake/`. The Worker route must match both forms.
- **Budget field hidden** until ranges exist (they are prices). Timeline options are defaults with an `// OPEN:` comment.
- **Copy:** service, process, FAQ and CTA copy is DRAFT, written to describe the work only (no prices, stats, results, guarantees or client claims). All of it is listed in CONTENT_TODO.md for review.
- **Dev server caveat:** Next 14's dev server can wrongly report "missing generateStaticParams" on `/services/[slug]` after a client reload (production builds are unaffected). For checking real behaviour, `.claude/launch.json` gains `site-static`, which serves the built `out/` through `wrangler dev`.

## 13. Phase 4 record (systems, branch `refactor/phase-4`)

**Built:**
- `site/worker/` is the Worker entry (`wrangler.jsonc` `main`), with `run_worker_first: ["/api/*"]`. Everything else is served straight from `out/`.
  - `POST /api/intake`: same-origin, at most 16 KB, per-IP rate limit (`ratelimits` binding), then shared validation, Turnstile, D1, and email via Resend after the response (`ctx.waitUntil`).
  - `POST /api/event`: whitelisted conversion events into Analytics Engine (decision D2). No IP and no id.
  - 🚩 `POST /api/demo`: a 404 unless `FEATURE_AUTOMATIONS_DEMO` is on. Mock: it validates, stores nothing, and returns the sequence.
  - The cron (every 15 minutes) retries undelivered emails and, 🚩, webhooks.
- `lib/intake-rules.ts` holds the one set of validation rules, used by both the form and the Worker. The form maps the Worker's 400 field errors back inline, and shows distinct messages for 429 and 403.
- Analytics: `lib/tracking.ts` posts events with `sendBeacon`. `InteractionTracking`, mounted in the layout, records `cta_click` (with location from `data-track-loc` or the landmark) and `call_click`. The form records `form_start` and `form_submit`; the booking embed records `booking_complete`.
- 🚩 Automations page: problem, modules (AI voice "coming soon"), live demo (its own flag, mock in local dev via `lib/demo.ts`), voice call-in (FEATURE_VOICE, number placeholder), and add-on positioning.
- `workers/lead-relay` is retired: its store-first, retry-sweep and idempotent-delivery patterns are ported. CI now runs `npm test` (19 Worker tests with flags off; 18 more cases with flags on, 4 skipped per state) and no longer builds the relay.

**Decisions:**
- **Flags reach the Worker from the same build variables** (C17): `scripts/worker-flags.mjs` writes `worker/flags.generated.ts` (gitignored) at the start of `build` and `typecheck`. One switch per flag.
- **Previews get their own D1 database and analytics dataset** (the `previews` block), as §9 required. Emails from previews say `[PREVIEW]`.
- **D1 is provisioned by Wrangler** (no `database_id` in config), and the table is created on first use (`CREATE TABLE IF NOT EXISTS` in `worker/db.ts`), so there's no migration step. SETUP.md §3 covers the fallback if provisioning fails in Workers Builds.
- **Turnstile fails open only while unconfigured.** With no secret set, rows are marked `unconfigured` and the email says so. With a secret, a missing or bad token is a 403, and an unreachable Turnstile also fails closed.
- **Email errors:** 4xx spends an attempt (configuration problem; stops after 6), while 5xx, 429 and network errors retry free. An `Idempotency-Key` per lead prevents duplicate emails on retry.
- **No flagged copy in flag-off JavaScript**, again: the demo component gets every word as a prop and was renamed `LiveDemo` (the export name survived minification). The scan of `out/`, JavaScript included, is clean.
- **Verified end to end** under `wrangler dev` with the production build:
  - Turnstile, using Cloudflare's published test keys, loaded under the CSP and passed server-side.
  - The form's POST returned 200 and redirected to the thank-you page.
  - The row was in local D1: E.164 phone, `turnstile=passed`, `email_status=disabled`, `webhook_status=off`.
  - `form_start` and `form_submit` events returned 204.
  - curl: cross-origin 403, no token 403, unknown `/api` 404, demo 404, flagged page 404, cron 200.
- **Workers types** pinned to `5.20261016.1` rather than the release published that day.
- **Found in passing:** `/favicon.ico` 404s. The icon and OG images are Phase 5.

