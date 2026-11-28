# Digital Haptics visual guide: Molten Room

Status: **approved by the owner on 2026-11-22.** This is the design system (`docs/PLAN.md` §4). The production site moves to it phase by phase (R1–R7).

Live reference: run `npm run dev` in `site/` and open `/lab/rehash/?d=a&p=home`. Switch **Page** for Pricing, Start, Case study, Components and Liquid use.

## 1. The idea

The site is one dark room with heavy liquid drifting in it. Visitors see the liquid through two openings: the Home hero and the final call to action. Everything else is a calm, solid surface in front of it.

Four rules decide most questions:

1. **The liquid is rare.** It appears live on Home only. If a page needs decoration, it does not get liquid.
2. **Text never sits on liquid.** Text sits on a solid surface, every time.
3. **Amber means act.** Amber is reserved for the primary action, focus-adjacent emphasis and small brand marks.
4. **The job comes first.** A trades owner on a phone must reach `/start` without waiting for, or reading around, anything decorative.

## 2. Colour

### 2.1 Tokens

| Token | Hex | Role |
|---|---|---|
| `room` | `#12161A` | Page ground, input fill |
| `surface` | `#1A2025` | Alternate sections, form panel, footer |
| `raised` | `#232C30` | Service cards, disabled fills |
| `line` | `#3B4847` | Decorative dividers only |
| `text` | `#EEF1EE` | Headings, body, focus ring |
| `muted` | `#A9B5B2` | Secondary text, input borders, placeholders |
| `amber` | `#F5A254` | Primary button, sticky CTA, logo mark, step rule |
| `amber-hover` | `#F9B878` | Primary button hover |
| `on-amber` | `#171310` | Text and icons on amber |
| `error` | `#FF9D8A` | Error text and error field border |

The liquid keeps its own 11-stop ramp (§6.1). Those colours are not UI tokens.

**`signal` (`#FF5A1F`) is retired.** It is close to the ramp's orange but competes with amber. Amber also gives better button contrast: 8.95:1 with `on-amber`, against 5.92:1 on `signal`.

### 2.2 Measured contrast (WCAG)

Each cell shows the flat ratio, then the worst case under the old grain layer (removed 2026-11-28, §5), where its strongest speck (11% grey) covered both the text and its surface. AA for body text is 4.5:1.

| Text | on `room` | on `surface` | on `raised` |
|---|---|---|---|
| `text` | 15.97 / 12.61 | 14.45 / 11.30 | 12.51 / 9.79 |
| `muted` | 8.60 / 7.14 | 7.78 / 6.39 | 6.74 / 5.54 |
| `amber` | 8.81 / 7.26 | 7.97 / 6.50 | 6.90 / 5.63 |
| `error` | 9.04 / 7.43 | 8.18 / 6.65 | 7.08 / 5.76 |

| Other pair | Ratio | Result |
|---|---|---|
| `on-amber` on `amber` | 8.95 | Pass |
| `on-amber` on `amber-hover` | 10.69 | Pass |
| `muted` border on `room` | 8.60 | Pass (3:1 needed) |
| `line` on `room` / `surface` | 1.91 / 1.73 | **Decorative only.** Never the only edge of a control |
| `text` on liquid amber `#F5A254` | 1.81 | **Fails.** This is why text never sits on liquid |
| `text` on liquid red `#E22E20` | 3.97 | **Fails** |

## 3. Type

| Role | Family | Weight | Size (phone → desktop) | Line height | Tracking |
|---|---|---|---|---|---|
| Display (Home hero) | Manrope | 500 | `clamp(3rem, 6.6vw, 6.5rem)` | 1 | -0.035em |
| Page title | Manrope | 500 | `clamp(2.7rem, 6vw, 5.6rem)` | 0.98 | -0.035em |
| CTA heading | Manrope | 500 | `clamp(2rem, 3.6vw, 3.25rem)` | 1.02 | -0.03em |
| Section heading | Manrope | 500 | `clamp(1.9rem, 3vw, 2.9rem)` | 1.08 | -0.025em |
| Form and prose heading | Manrope | 500 | 30px | 1.1 | 0 |
| Card title | Manrope | 500 | 26px | 1.1 | 0 |
| Step title | Manrope | 500 | 21px | 1.6 | 0 |
| Price | Manrope | 500 | 20px | 1.6 | 0 |
| Lede | Manrope | 400 | 19px | 1.6 | 0 |
| Body | Manrope | 400 | 17px | 1.6 | 0 |
| Small, labels | Manrope | 400/500 | 15px | 1.6 | 0 |
| Caption | Manrope | 400 | 14px, the minimum | 1.6 | 0 |
| Logo | Chakra Petch | 700 | 18px | 1 | 0 |

- **Casing:** sentence case everywhere. CSS never uppercases text.
- **Why the fonts change:** large, soft Manrope matches the liquid's rounded forms. Chakra Petch's squared letters belong to the old cut-corner language, so it stays only in the logo.
- **Files:** keep `manrope-variable.woff2` and `chakra-petch-700.woff2`. Remove `chakra-petch-600.woff2` and `jetbrains-mono-variable.woff2` from the site's font loading. `scripts/og.mjs` has its own TTFs and is handled in R7.
- Keep body line length under about 75 characters.

## 4. Surfaces, shape and space

| Item | Rule |
|---|---|
| Panels and cards | Radius 28px, solid fill, no border, no shadow |
| Case frames | Case cards and case-page screenshots: clear, 1px `text` at 14% outline (40% on hover) |
| Corner shape | Squircle on every section, panel, card, glass pane, field and notice (`corner-shape: squircle` where supported; radius tokens rise to 48 / 20 / 17px, glass 60px, so they read the same size). Elsewhere plain 28 / 12 / 10px, glass 36px. Buttons, chips and pills stay fully round |
| Buttons, chips, menu button | Fully round (`999px`) |
| Inputs, selects, textareas | Radius 12px, 1px `muted` border, `room` fill |
| Small notices | Radius 10px, 1px `line` border |
| Elevation | Expressed by the step `room` → `surface` → `raised`. No drop shadows, blur or glass |
| Page container | Max 1440px, gutters 20px phone and 64px from 1024px |
| Section padding | 56px phone, 104px from 1024px |
| Spacing | 4px base scale |

**Retired:** dot grid, flare crosshair, cut corners and `CutFrame`, marker squares, boxed labels, `( 01 )` section numbers.

Numbers stay only where the content is a real sequence, such as process steps.

## 5. Grain

**Removed from the page, 2026-11-28 (owner's pick, perf Phase 2).** The liquid draws its own grain (6.5/255), so the identity carries wherever the liquid shows, which is Home and every main inner page. Flat surfaces it doesn't reach (the footer, solid bands, `/start`, the blog and the legal pages) are now clean.

The page-wide layer (`.room-grain`, a fixed 128px `feTurbulence` tile at 0.08 over everything) cost a full-screen draw on every frame, because the page scrolls under it over a moving liquid. On an Iris Xe laptop at 3823×2104 device pixels, /services scrolled at about 50 fps with it and 60 without (docs/perf/PHASE2.md).

If grain comes back on flat surfaces:
- Never as a fixed full-screen layer.
- Never as a card's background image: in R5 Lighthouse took a textured card as Pricing's main content and reported a 2.0s LCP.
- Do not use `overlay` blending on these dark surfaces. It measured 0.15/255 at the same opacity, which is invisible.

## 6. The liquid

### 6.1 Ramp

`#181c21` 0 · `#133236` 0.10 · `#1c4345` 0.20 · `#415a54` 0.27 · `#987d57` 0.32 · `#f5a254` 0.37 · `#ea843e` 0.43 · `#f56c36` 0.54 · `#e22e20` 0.66 · `#871922` 0.82 · `#2b141a` 1

### 6.2 Where it appears

| Page | Treatment |
|---|---|
| Home | **Live.** One fixed canvas seen through the hero, a wide band after Work, a side window beside Process, and the final CTA (owner's choice, 2026-11-23) |
| Work, case studies, Services and service pages, Pricing, About, Trades, cities | **Live, dimmed** (owner's pick, 2026-11-25): Home's own liquid (`PageLiquid` wraps `LiquidBackdrop`), fixed behind the page with `room` at 70% over it. That is the lightest dim where muted text still reads 4.6:1 over the brightest amber (headings 8.5:1). Loads after idle like Home; Lighthouse stays 98–100. Every section is a squircle glass pane (`PagePane`) in a stack with room above the footer (`PaneStack`), cards are hairline, and the final CTA is a glass pane. The older CSS-only `PageGlow` stays in the code, unused |
| Blog, posts | **None.** Plain `room` ground and the solid `surface` CTA band |
| `/start`, thanks | **None.** Nothing competes with the form |
| Legal, 404 | **None** |
| Open Graph images | **Still** (R7) |

The Stage 1 demo also opened the CTA on Pricing and the case study. This guide narrows live liquid to Home, so those pages load no WebGL at all. That followed "rare and expensive"; since 2026-11-25 the main inner pages share Home's liquid (dimmed), and only blog, legal, `/start` and 404 stay without it.

### 6.3 Settings

| Prop | Desktop | Phone (≤640px) |
|---|---|---|
| `seed` | 5 | 5 |
| `coverage` | 0.46 | 0.46 |
| `flowSpeed` | 0.7 | 0.7 |
| `blobCount` | 9 | 6 |
| `renderScale` | 0.30 | 0.24 |
| Device pixel ratio cap | 2 | 1.5 |
| All other props | Defaults | Defaults |

### 6.4 How text is protected

- **Desktop hero:** the liquid fills the whole hero, edge to edge and up under the header. Copy sits in the left column directly on the liquid, with no shade (owner's call, 2026-11-25). **Known accessibility trade-off:** when bright amber passes behind the copy, contrast drops below WCAG AA (muted label about 1.2:1, headline about 1.9:1 at worst). The owner was shown this and chose the bare look; a soft full-height fade from the left edge is the fix if it is revisited.
- **Phone and tablet hero:** the liquid fills the whole hero, behind the header, and the copy starts 45vh down, directly on the liquid with no solid block behind it (owner's call, 2026-11-25). Same readability trade-off as the desktop hero.
- **Final CTA:** copy sits on a solid `room` plate with a 28px radius.
- **Header:** transparent "islands": logo free on the left, links in one glass pill in the centre, "Start a Project" free on the right (owner's pick, 2026-11-25). On Home it floats over the liquid; elsewhere over `room`. It is sticky and turns into one glass bar once you scroll (§7).
- A two-minute frame scan peaked at luma 190 on the amber rim, where `text` would fail. So the rule is structural: no scrim-over-liquid text, at any opacity.

## 7. Motion

| What moves | Timing | Reduced motion |
|---|---|---|
| Liquid | Continuous, `flowSpeed` 0.7 | One still frame, no loop |
| Canvas cross-fade over poster | 600ms ease-out, once | None |
| Button colour and press (1px) | 160ms | Instant |
| Arrow nudge on hover | 160ms | None |
| Accordion and menu | Opens in response to the visitor, 250ms at most | Instant |
| Page transition: glide (View Transition; header, sticky bar and grain stay put, the page eases up and out and the new one rises in) | 200ms out, 460ms in; a soft fade where View Transitions are missing | None |
| Section headings and ledes: light sweep | 950ms, once, on entering view | Static |
| Toned sections: rising embers, at the outer edges | Continuous, only while on screen | None |
| Section dividers: heat seam | 4.2s loop, only while on screen | Static line |
| Widgets: soft cascade | Cards and Home's glass panes fade in over 900ms with a 14px drift up. Everything that arrives together goes one after another, 110ms apart, top to bottom and left to right (longest wait 660ms) (owner's pick, 2026-11-25) | Shown at once |
| Home Recent work: case reel | Every published case drifts sideways in an endless loop, about 37px a second, with soft fades at the pane edges. Drag it with the mouse or swipe it with a thumb; it glides briefly after release. It holds still under the mouse, while a card has keyboard focus, while off screen, and for about 2s after a swipe. No pause button (owner's call, 2026-11-25). The looped copy is hidden from screen readers and the keyboard | Doesn't drift; can still be dragged |
| Header: shrink on scroll | Sticky. Scrolling down shrinks it into a tiny 40px glass capsule 10px below the top edge (400px wide on desktop, 96px on phones): the logo folds to its amber dot, the links shrink to 13px type, "Start a Project" folds to a round amber arrow and the phone menu button to 32px. All stay clickable, with targets of 24px or more and their full names for screen readers; scrolling up grows it back to a full-width 64px glass bar; at the top of the page it opens out again. 560ms ease-out; the header's 80px box never changes, so nothing moves (owner's pick, 2026-11-25) | Changes without animating |

**Owner's picks, 2026-11-22.** `site/motion.config.ts` selects them. All 16 options stay built in `site/app/motion.css` and `site/components/motion/`, and can be compared at `/lab/motion` under `npm run dev`.

The home headline and anything on screen at first load paint immediately and never animate. Text is hidden only by JavaScript, so it stays visible if scripts fail. There is no scroll-jacking and no parallax on content.

## 8. Components

Every interactive element has a visible focus state: a **3px `text` outline with a 3px offset**. Touch targets are at least 44px.

| Component | Default | Hover | Active | Disabled | Notes |
|---|---|---|---|---|---|
| Button, primary | `amber` fill, `on-amber` text, arrow, 52px, pill | `amber-hover` | 1px down | `raised` fill, `line` border, `muted` text | Manrope 500, 16px |
| Button, accent | `text` fill, `room` text, arrow | `muted` fill | 1px down | As above | Secondary emphasis |
| Button, ghost | Transparent, 1px `text` border, no arrow | `raised` fill | 1px down | As above | "See the Work" |
| Text link | Underlined, 44px target | Thicker underline | `muted` | n/a | Never colour alone |
| Input, select, textarea | §4, 48px, 16px text | Border `text` | n/a | `raised` fill, dashed border, `muted` text | 16px prevents iOS zoom |
| Field error | 2px `error` border plus the existing `Error —` line in `error` | n/a | n/a | n/a | Never colour alone. Keeps existing wording and error summary |
| Checkbox | 22px, `amber` accent, 44px row | n/a | n/a | Native | |
| Chip | 1px `line` border, pill, 15px | `raised` fill if a link | 1px down | n/a | Static city chips do not react |
| Service card | `surface`, 28px radius | Link underline | n/a | n/a | Name, short line, link. Prices stay on Pricing, as they do today |
| Case card | Clear with a hairline outline and squircle corners; screenshot edge to edge on top, then fixed rows so cards line up: trade · town (one line), client name (a two-line slot), and the result in amber with the round arrow pinned to the bottom above a hairline | Outline brightens, screenshot zooms 3% | n/a | n/a |
| Header | Transparent, 80px; logo with round amber mark; links in a glass pill (`room` at 55%, blur, 12% `text` outline) | Link lights as a `text` 10% pill; current page 14% | n/a | n/a | Mobile: logo and round menu button |
| Mobile menu | Keeps native `<dialog>`, `surface`, 22px links, 52px rows | n/a | n/a | n/a | Keyboard behaviour unchanged |
| Sticky CTA | Full-width `amber`, 56px, phone only | n/a | n/a | n/a | Hidden on `/start` and while the hero's button is visible |
| Footer | `surface`, five columns collapsing to one | Link turns `amber` | n/a | n/a | All links unchanged |
| FAQ | Native `<details>`, `line` rows, 56px summary | Underline | n/a | n/a | JSON-LD unchanged |
| Lead-flow panel 🚩 | `raised` panel, plain rows, last row `amber` | n/a | n/a | n/a | Restyled, flag stays off |

## 9. Page map

| Page | What changes | Flag off | Flag on |
|---|---|---|---|
| Home | Live hero, solid sections, opening at final CTA | Two services, no teaser, no lead-flow panel | Three services, teaser section, lead-flow panel in hero copy column |
| Work index | Case cards on `room` | Not linked while no case is published | Same |
| Case study | Plain reading column, no liquid | Draft rules unchanged | Same |
| Services | Service cards, plain sub-pages | Two cards | Three cards |
| Automations 🚩 | Restyled modules and demo | Real 404, as now | Renders |
| Pricing | Two cards, factor list, solid CTA | Two prices | Three prices, extra factor |
| Start | `surface` form panel, contact aside, FAQ | No SMS consent | SMS consent |
| Thanks | Plain confirmation | No lead-flow panel | Lead-flow panel and extra line |
| About, Blog, cities | New surfaces and type | Live/draft rules unchanged | Same |
| Legal | Plain reading column | Unchanged content | SMS section |
| 404 | Calm message on `room`, links to Home, Work and Start. The "terminal-style" treatment goes | Work link follows existing rule | Same |

## 10. Live hero delivery plan

### 10.1 Renderer: port to plain WebGL2

Measured with the same shaders, simulation and settings. The prototype is `site/lab/rehash/delivery/plainEngine.ts`, and the harness is `/lab/rehash/delivery/`.

| | `three` | Plain WebGL2 |
|---|---|---|
| Added JavaScript (minified) | 538.9 KB | **21.4 KB** |
| Added JavaScript (gzip) | 136.7 KB | **8.2 KB** |
| Frame, 1440×900 at 2x (avg, two runs) | 9.0 ms | 8.0–10.0 ms |
| Frame, 390×844 at 2x | 4.1–4.3 ms | 3.2–3.9 ms |
| Frame, 390×844 at 3x | 7.6–8.5 ms | 7.3–7.6 ms |
| Picture difference | n/a | Mean 0, max 1 of 255 levels |

**Recommendation: ship the plain renderer and keep `three` as a devDependency.** Frame cost is the same within noise, the picture matches, and it is about 94% less JavaScript. The cost is that this project then owns roughly 350 lines of WebGL code.

Frame times come from one Intel Iris Xe laptop in `next dev`, and varied between runs. An earlier in-page reading was higher (about 15 ms). Treat them as relative, not as proof of 60 fps.

### 10.2 Load sequence

1. **First paint:** HTML, headline and a CSS gradient poster built from the ramp. No image, no JavaScript dependency, and no effect on layout.
2. **After `load`, then `requestIdleCallback`** (2s timeout): check the gates in §10.3.
3. Dynamically import the renderer. It must not be in any page's initial JavaScript.
4. Render the first frame, then cross-fade the canvas in over 600ms.
5. Pause when neither opening is on screen or the tab is hidden.

The canvas has fixed, reserved dimensions, so it cannot cause layout shift. The headline never waits for WebGL.

**Poster image, if the gradient is not close enough:** a 640×400 WebP measures 4.8 KB. A large image can become the LCP element, so if one is used, draw it into a canvas after first paint and confirm LCP is still the headline in R4.

### 10.3 Fallbacks

| Condition | Detection | Result |
|---|---|---|
| Reduced motion | `prefers-reduced-motion` | Poster or one composed still, no loop |
| No WebGL2 or shader failure | Context or compile error | Poster stays, no error shown |
| No hardware GPU | Renderer reports SwiftShader, llvmpipe or similar | Poster stays. Software rendering cost 638 ms of blocking time in Lighthouse |
| Data saver | `navigator.connection.saveData` or `prefers-reduced-data` | Poster, renderer not downloaded |
| Low-power device | `deviceMemory` below 4 or `hardwareConcurrency` of 4 or fewer | Poster, renderer not downloaded |
| Large or dense screen | Canvas would exceed 3M device pixels (1M on phones) | Canvas pixel ratio lowered to fit, never below 1 (docs/perf/PHASE0.md) |
| Struggling at runtime | Average frame interval over the 30 fps target + 8ms (about 24 fps) across 90 frames | Canvas to 1x, half the pixel budget, scene scale 0.20. Freeze on a still only below about 11 fps |
| Context lost | `webglcontextlost` | Fade back to poster, stop the loop |
| Offscreen or hidden tab | IntersectionObserver, `visibilitychange` | Loop stops |

**Frame rate (perf Phase 1, 2026-11-27):** the liquid draws at 30 fps on every device. It moves slowly enough that 30 reads the same as 60, and it halves the GPU work. Page scrolling and the rest of the page still run at the display's own rate.

### 10.4 Phone settings

Tested on the laptop at phone viewport sizes with the renderer below. This is **emulation, not a real device.** R4 must test at least one mid-range Android phone and one iPhone.

| Setting at 390×844 | Avg | p95 |
|---|---|---|
| 2x, scale 0.30, 9 masses | 4.1 ms | 7.1 ms |
| 2x, scale 0.24, 6 masses | 4.5 ms | 7.7 ms |
| **1.5x, scale 0.24, 6 masses (chosen)** | 3.9 ms | 8.6 ms |
| 1.5x, scale 0.20, 6 masses (runtime step-down) | 3.9 ms | 8.2 ms |

The laptop GPU cannot separate these settings, so they are chosen for fill-rate on phones rather than from a measured phone win.

**Update (perf Phase 1, 2026-11-27):** the phone scale had been tuned up to 0.9. It is now 0.5: side by side at 375×812 it looks the same as 0.9 after the bicubic upscale, and it halves the liquid's GPU time (4.3 → 2.3 ms on Iris Xe). See docs/perf/PHASE1.md.

### 10.5 CSP

**Update, 2026-11-22:** the renderer now runs in a same-origin Web Worker through OffscreenCanvas, because it intermittently blocked the main thread for about a second in Edge. After the move, 24 of 24 Edge Lighthouse runs scored 100, with a worst blocking time of 9 ms. `worker-src` falls back to `script-src 'self'`, so the policy is unchanged. Browsers without OffscreenCanvas use the main-thread path, and any worker failure keeps the poster.

**No CSP change was needed.** The renderer is same-origin JavaScript, uses no `eval` or external assets, and the grain is a `data:` image already allowed by `img-src`. In R4 the production build ran live under its generated policy, served by a local test server, with no violations. In R7 it ran through the real Worker under `wrangler dev`, with the live canvas in Firefox and no violations. It has not yet run on a hosted preview.

### 10.6 R4 results

Measured on the production build, flags off, in headless Edge on the development machine.

| Check | Result |
|---|---|
| WebGL code | One 21.9 KB chunk (8.6 KB gzip), referenced by no page's initial HTML |
| Pages loading it | Home only. Pricing, `/start`, Services and About load none |
| LCP element | The `h1` at 1440px and 390px |
| CLS on Home | 0.0001 desktop, 0 phone |
| Reduced motion, data saver, low memory, 4 cores | Poster stays, renderer not downloaded |
| WebGL2 context unavailable | Poster stays, no error |
| Context lost | Fades to poster, loop stops |
| Offscreen or hidden tab | No draws |
| Sticky CTA | Hidden while the hero button is visible, shown after |

**Lighthouse on Home, seven runs:** performance was 100 in six and 96 in one. LCP was about 760 ms in six and 2,558 ms in one. With the WebGL chunk blocked, two of seven runs showed the same slow LCP, so the liquid is not its cause. The slow runs also appear on the pre-R1 baseline. Their cause is not yet known.

**Final pass (R7), production build, five mobile Lighthouse runs per page:**

| Page | Performance | LCP | CLS | Weight |
|---|---|---|---|---|
| Home | 99–100 | 764–786 ms | 0 | 222 KB |
| Pricing | 99–100 | 776–780 ms | 0 | 231 KB |
| `/start` | 100 | 771–783 ms | 0.032 | 215 KB |

`/start`'s shift comes from its headline wrapping differently once Manrope replaces the fallback at one phone width. The per-weight fallback in `globals.css` reduced such re-wraps from 10 to 7 across 70 page views, and the remainder stay within the 0.05 budget.

Tested in Edge 157 and Firefox 155 through the local Worker, including a full form submission to a local database.

**Still to prove:** Safari, sustained frame rate on real phones, the governor on a genuinely slow device, and a hosted preview.

**Placement from R5:** one fixed canvas sits behind Home and shows through the hero and final CTA, as in §6.2. It stops drawing whenever neither opening is on screen.

**What Lighthouse does and does not measure:** its test browser has no GPU, so it now scores Home's poster path. Its scores do not show the cost of the live canvas on a real device.

### 10.7 Performance baseline (before R1)

Recorded 2026-11-22 from commit `a418a47`: production build, flags off, served locally with gzip. Mobile Lighthouse 13.6.0 with its default simulated throttling, in headless Edge on the development machine. Values are the median of three runs. Performance across the runs is shown in brackets.

| Page | Performance | Accessibility | Best practices | SEO | LCP | CLS | TBT | Weight |
|---|---|---|---|---|---|---|---|---|
| Home | 100 (97, 100, 100) | 100 | 100 | 100 | 784 ms | 0.005 | 9 ms | 255 KB |
| Pricing | 100 (100, 100, 100) | 100 | 100 | 100 | 773 ms | 0.001 | 9 ms | 274 KB |
| `/start` | 100 (100, 100, 99) | 100 | 100 | 100 | 770 ms | 0.005 | 56 ms | 257 KB |

Local serving has no real network latency, so compare later runs with this table rather than reading it as field performance.

## 11. Token migration

**Completed in R6.** The old tokens, the temporary `room:` variant, Chakra Petch 600 and JetBrains Mono are gone. `CutFrame` is now `Panel` and `BoxedLabel` is now `SmallLabel`. The compact `text-body`, `text-body-sm` and `text-body-xs` sizes stay because lists, notes and form rows still use them.

| Old | New | Note |
|---|---|---|
| `ice` | `room` | Page ground |
| `frost` | `surface` | |
| `white` (cards) | `raised` | |
| `white` (inputs) | `room` | |
| `steel-panel` | `raised` | |
| `hairline` | `line` | |
| `ink` (text) | `text` | Polarity flips |
| `ink` (slabs) | `surface` | |
| `ink` (text on signal) | `on-amber` | |
| `steel`, `steel-deep` | `muted` | |
| `signal` | `amber` | |
| `flare-core` | removed | |
| `font-display` | `font-body` | Chakra stays as `font-logo` |
| `font-mono` | `font-body` | |
| `bg-dots`, `bg-dots-dense` | removed | Replaced by grain layer |
| `--cut-*`, `CutFrame` | `rounded-panel`, `rounded-field`, `rounded-control` | |
| `shadow-flare-*` | removed | |
| `animate-flare-pulse` | removed | |

## 12. Do and don't

| Do | Don't |
|---|---|
| Put copy on a solid surface ([Home](http://localhost:3000/lab/rehash/?d=a&p=home)) | Lay text or a translucent scrim over the liquid |
| Keep Pricing plain ([Pricing](http://localhost:3000/lab/rehash/?d=a&p=pricing)) | Add liquid to Pricing, forms, case studies or legal pages |
| Show one amber action per view | Use amber for headings or decoration |
| Show errors with a border and words ([Start](http://localhost:3000/lab/rehash/?d=a&p=start)) | Signal an error by colour alone |
| Separate surfaces by tone | Add glass, blur, glow, neon or drop shadows |
| Use sentence case | Uppercase labels or add eyebrows above every heading |

The links need the dev server. Its port may differ from 3000.

## 13. Departures from PLAN

1. **Palette:** light ground replaced by a dark room. `signal` retired for `amber`.
2. **Type:** Manrope for headings. Chakra Petch only in the logo. JetBrains Mono removed.
3. **Signature elements:** dot grid, flare, cut corners, markers, boxed labels and section numbering retired.
4. **Radius:** PLAN's "0 everywhere" replaced by §4.
5. **Hero sidebar removed.** Its service blurbs already appear in the Services section. **Its line `( SEARCH ) → ( SITE ) → ( CALL )` would no longer appear anywhere.** No wording is edited, but this needs the owner's approval.
6. **Section labels:** the hero's `Web design · Local SEO — Acadiana, LA` stays, in sentence-style casing. The `( 01 )` prefix goes.
7. **Motion:** flare pulse and scroll reveals removed. PLAN §4.6's limits still hold.
8. **404:** PLAN §5's terminal-style label in a cut-corner frame becomes a calm message.
