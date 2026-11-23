# Digital Haptics: site-wide visual rehash

You are redesigning the look of digitalhaptics.dev around one thing the owner loves: **Concept C, the liquid metal animation** in `site/lab/hero-motion/liquid/`. It should stop being a background option and become the source of the whole visual identity.

The work has three stages, each ending in a hard stop for the owner's review:

1. **Demos:** three distinct directions, viewable locally.
2. **Guideline:** the chosen direction written up as the design rules.
3. **Final build:** the real site restyled to that guideline, one phase at a time.

Do not start a stage until the owner has approved the one before it. Do not touch a production page, shared component or global style during Stages 1 and 2.

## Read first

Repo: `C:\Users\charl\OneDrive\Documents\Business\Digital_Haptics`. The app is in `site/` (Next 14 static export, React 18, TypeScript, Tailwind, Framer Motion, Cloudflare Worker).

1. `CLAUDE.md`
2. `docs/PLAN.md`, especially §1, §2.1, §4, §5 and §8
3. `docs/REFACTOR_AUDIT.md` §3 (tokens and contrast)
4. `CONTENT_TODO.md`
5. `site/lab/hero-motion/README.md` and `site/lab/hero-motion/liquid/README.md`
6. `site/tailwind.config.ts`, `site/app/globals.css`, `site/components/ui/`, `site/components/layout/`, `site/components/home/Hero.tsx`
7. The liquid references, which are **untracked and exist only in the main checkout**: `C:\Users\charl\OneDrive\Documents\Business\Digital_Haptics\docs\hero-motion-brief\references\liquid-1-saddle.jpg`, `liquid-2-filaments.jpg`, `liquid-3-sphere.jpg`. Read them by that absolute path if you are in a worktree.

## Branch setup

- Create `visual-rehash` from the current `main`, then merge `hero-motion-lab` into it. `main` has 6 commits the lab lacks, and the lab has 9 that `main` lacks. A trial merge is clean.
- Use the local `hero-motion-lab`. Its newest commit (`2cb8e50`, the pants) is not on GitHub.
- Never merge into `main`, push, open a PR or deploy unless the owner asks in that moment. Cloudflare builds every pushed branch.
- Keep `/lab` local. The owner has decided not to expose it on hosted previews.
- Stage explicit paths only. Never `git add -A`. Never commit `docs/hero-motion-brief/` or `docs/visual-rehash-brief/`.
- Do not add npm dependencies or install skills, plugins or MCP servers without asking.

## What must survive the redesign

This is a visual rehash, not a rewrite.

- **Audience and goal.** Trades business owners, often on a phone between jobs. The site's first job is getting them to `/start`. A beautiful page that makes that harder has failed.
- **Legibility.** PLAN §1 calls for expressive framing and plain, highly legible content. Pricing, forms, case studies and legal text must be easy to read in any direction.
- **Copy and content.** Do not change wording, prices, case study content or placeholders. Never invent stats, results, testimonials, clients or prices. Demos must use the real copy from `site/data/`, `site/content/` and `site/site.config.ts`.
- **Function.** Do not change the intake form's logic, Turnstile, the Cal.com embed, the Worker, analytics events, routes, metadata, JSON-LD, or the draft and permission rules for case studies.
- **Feature flags.** Automations and voice stay off. Every flag-off state must still render correctly, with no gaps. Restyle flagged components so they are ready, but do not enable them.
- **Accessibility.** WCAG AA text contrast, visible focus, 44px touch targets, keyboard operation, decorative elements `aria-hidden`.
- **Reduced motion.** One composed still frame, no loop.
- **Performance budget (PLAN §8).** Mobile Lighthouse 95+, LCP under 2.0s, CLS under 0.05. The hero headline is the LCP element and must never wait for or be animated by WebGL.
- **Motion rules (PLAN §4.6).** No scroll-jacking, no parallax on content, nothing that delays reading.
- **Build gates.** CSP, SEO, routes, placeholder and harden checks must keep passing without being weakened.

These PLAN §4 items **may** change, but only through the approved guideline in Stage 2: palette, type, the dot grid, the flare, cut corners, radius, button and card styling.

## The visual source

Carry these qualities across the site, not just the animation itself:

- Heavy, slow, low-gravity liquid forms
- Near-black depth, teal haze, a thin hot amber rim falling through orange and red
- Fine film grain, measured at about 6.5/255 on the animation
- A sense of three-dimensional space behind the page

Current palette, sampled from the references (ramp position after each colour):

`#181c21` 0 · `#133236` 0.10 · `#1c4345` 0.20 · `#415a54` 0.27 · `#987d57` 0.32 · `#f5a254` 0.37 · `#ea843e` 0.43 · `#f56c36` 0.54 · `#e22e20` 0.66 · `#871922` 0.82 · `#2b141a` 1

The brand's `signal` orange `#FF5A1F` already sits close to this ramp. Decide deliberately whether it stays.

Avoid the cliché version of this look: neon vaporwave, purple gradients, glassmorphism cards, glowing text, or liquid behind every section. The animation should feel rare and expensive. Static surfaces should carry the identity everywhere else.

## Stage 1: demos

Build **three genuinely different directions**. They must differ in structure and surface, not only colour. Use these starting points, and replace one only if you have a stronger idea:

- **A. Molten Room.** Dark throughout. The site feels like one continuous space with the liquid behind it, and content sits on calm, solid dark surfaces.
- **B. Cold Steel, Hot Core.** Keeps a light, highly readable ground for content. Hero, section breaks, CTA bands and footer open into dark molten moments. This is the closest to PLAN's framing and content split.
- **C. Liquid Print.** Treats the liquid as printed matter: grainy, frozen, poster-like stills and duotone gradients, with WebGL only in the hero or not at all. The fastest option.

Each direction shows, at 1440px and 390px:

1. Full Home page
2. Pricing, as the plain-content test
3. `/start` with the form's default, focus, error and disabled states (visual only, no submission)
4. One case study layout, using the anonymised draft treatment
5. A component sheet: type scale, colour tokens, all button variants, inputs, chips, case card, header, mobile menu, sticky CTA, footer
6. How the liquid is used: where it is live, where it is a still, and how text sits over it

Implementation rules for demos:

- Put everything under `site/lab/rehash/`, with dev-only routes as `site/app/lab/rehash/**/page.lab.tsx`. The `.lab.tsx` extension keeps them out of production builds.
- **Tailwind does not scan `site/lab/`**, so classes used only there will not compile. Use scoped CSS (CSS Modules or a wrapper with local variables). Do not edit `tailwind.config.ts` or `globals.css` in this stage.
- Reuse `LiquidMetal` through its props. Do not fork the engine for a demo.
- Run at most one live canvas per viewport.
- Add an index at `/lab/rehash/` with a direction switcher, a page switcher and a desktop/phone width toggle, so the owner can compare the same page across directions in one click.

Before presenting, verify each direction:

- Check real contrast for every text and surface pair. For text over the liquid, measure against the **brightest** frame across a long run, including the amber rim.
- Capture desktop and mobile screenshots and look at them yourself.
- Measure the added JavaScript and frame time. Report what each direction would cost against the budget.

**Stop.** Tell the owner where to open the demos. For each direction give one paragraph on its feel, its main trade-off and its measured cost, then your recommendation. Iterate until they pick one or ask for a mix.

## Stage 2: the guideline

Write the approved direction to `docs/VISUAL_GUIDE.md`, so a future session could build from it alone:

- Colour tokens with hex values, roles and a measured contrast table
- Type: families, scale, weights, casing and spacing. Say why if any font changes.
- Surfaces, shape language, borders, spacing and elevation
- The liquid: which pages get a live canvas, a still or nothing, its settings per placement, and how text is protected over it
- Grain: how it is produced cheaply on static surfaces
- Motion: what moves, timing, and reduced-motion behaviour
- Every component's new spec, with all interactive states
- A page-by-page map of what changes, plus flag-on and flag-off states
- A delivery plan for the live hero (below)
- A token migration table, old to new
- Do and don't examples, as screenshots or live references

**Live hero delivery plan.** It must answer, with measurements:

- Static poster first: a small pre-rendered image or CSS gradient that matches the first frame, so LCP and CLS are unaffected
- WebGL loaded lazily after first paint and idle, then cross-faded in
- Whether to ship `three`, which is currently a devDependency, or port the small liquid renderer to plain WebGL2. Measure both and recommend one.
- Fallbacks for no WebGL, low-power devices, data saver, reduced motion and offscreen or hidden tabs
- Phone settings, tested at real phone viewport sizes
- Any CSP change required

Also draft the exact edits to `docs/PLAN.md` §4 and to `CLAUDE.md`'s visual reference line. **Do not apply them yet.**

**Stop.** Summarise the decisions and anything that departs from PLAN. On approval, apply the PLAN and CLAUDE.md edits.

## Stage 3: final build

Work one phase at a time. After each phase: run the gates, review the affected pages at 1440px and 390px, commit, report and **stop for review**.

- **R1. Tokens and foundations.** Tailwind tokens, CSS variables, fonts, grain, focus ring, selection, scrollbar.
- **R2. Components.** Everything in `site/components/ui/`, plus `/styleguide`.
- **R3. Layout shell.** Header, mobile menu, footer, sticky CTA, section wrappers.
- **R4. Live hero.** Production liquid hero per the delivery plan.
- **R5. Core pages.** Home, Work, case study, Services, Pricing, Start, Thanks.
- **R6. Supporting pages.** About, Blog, cities, legal, 404, flagged Automations page.
- **R7. Brand assets and final pass.** OG images (`site/scripts/og.mjs`), favicon, theme colour, a full route sweep, cross-browser check, final Lighthouse.

Gates, run from `site/`:

```
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
npm run check
```

`npm run check` is advisory. Also confirm:

- `/lab`, tweakpane and any lab code are absent from `site/out/`
- WebGL code is not in the initial JavaScript of any page
- Pages without a live canvas load no WebGL code
- Mobile Lighthouse on Home, Pricing and `/start` meets the budget, compared with a baseline you record **before R1**
- The intake form still validates and reaches its success path locally, with flags off

## Reporting

Be honest and specific in every stop:

- Lead with anything you could not verify.
- The embedded preview pane has previously capped at about 30 fps, so do not treat it as a real frame-rate measurement. Sustained 60 fps in a normal browser was never confirmed for the liquid.
- Commit `69039c0` on `hero-motion-lab` had a failed Cloudflare build whose log needs the owner's sign-in. The same commit built cleanly from a fresh clone. Do not assume hosted builds are healthy.
- Do not claim a direction "works on mobile" unless you tested at a phone viewport, and say that emulation is not a real device.
- Write to the owner in plain language. They care first about how it looks and feels.
