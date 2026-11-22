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
| `room` | `#12161A` | Page ground, header, input fill |
| `surface` | `#1A2025` | Alternate sections, form panel, footer |
| `raised` | `#232C30` | Service and case cards, disabled fills |
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

Each cell shows the flat ratio, then the ratio against the brightest grain speck on that surface (+12 levels). AA for body text is 4.5:1.

| Text | on `room` | on `surface` | on `raised` |
|---|---|---|---|
| `text` | 15.97 / 14.06 | 14.45 / 12.41 | 12.51 / 10.53 |
| `muted` | 8.60 / 7.58 | 7.78 / 6.68 | 6.74 / 5.67 |
| `amber` | 8.81 / 7.76 | 7.97 / 6.84 | 6.90 / 5.81 |
| `error` | 9.04 / 7.96 | 8.18 / 7.02 | 7.08 / 5.96 |

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

Static surfaces carry the film grain, so the identity continues where the liquid does not.

- **Method:** one inline SVG `feTurbulence` tile, 128×128, painted as the background image of each solid surface (`.room`, `.room-surface`, `.room-raised`). It sits under the text and needs no fixed overlay or extra compositor layer. It is about 460 bytes and decoded and rasterised in about 3 ms on the development machine.
- **Rejected:** a pre-rendered noise image. Random noise barely compresses: 26 KB as WebP and 29 KB as PNG at the same size.
- **Strength on content surfaces:** `0.08`, built into the tile's alpha channel, normal blending. Measured standard deviation 2.55/255, brightest speck +12 levels. The contrast table above includes that speck.
- **Strength around the liquid:** the canvas draws its own grain (6.5/255). Do not stack the CSS layer over it.
- **Do not** use `overlay` blending on these dark surfaces. It measured 0.15/255 at the same opacity, which is invisible.
- The layer does not animate. Check scroll performance on a real phone in R1, and drop it from phones if it costs frames.

## 6. The liquid

### 6.1 Ramp

`#181c21` 0 · `#133236` 0.10 · `#1c4345` 0.20 · `#415a54` 0.27 · `#987d57` 0.32 · `#f5a254` 0.37 · `#ea843e` 0.43 · `#f56c36` 0.54 · `#e22e20` 0.66 · `#871922` 0.82 · `#2b141a` 1

### 6.2 Where it appears

| Page | Treatment |
|---|---|
| Home | **Live.** One fixed canvas seen through the hero and final CTA |
| Pricing, Work, case study, Services, About, Blog, cities | **None** by default. Final CTA is a solid `surface` band |
| `/start`, thanks | **None.** Nothing competes with the form |
| Legal, 404 | **None** |
| Open Graph images | **Still** (R7) |

The Stage 1 demo also opened the CTA on Pricing and the case study. This guide narrows live liquid to Home, so those pages load no WebGL at all. That follows "rare and expensive" and protects the plain-content pages.

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

- **Desktop hero:** copy sits in the left column. A gradient runs solid `room` to 56% of the width, then fades to transparent at 80%. Measured at 1440px: copy ends at 764px and the solid area ends at 798px.
- **Phone hero:** the liquid fills the band under the header. A vertical gradient reaches solid `room` at 45vh, and the copy starts there.
- **Final CTA:** copy sits on a solid `room` plate with a 28px radius.
- **Header:** always solid `room`.
- A two-minute frame scan peaked at luma 190 on the amber rim, where `text` would fail. So the rule is structural: no scrim-over-liquid text, at any opacity.

## 7. Motion

| What moves | Timing | Reduced motion |
|---|---|---|
| Liquid | Continuous, `flowSpeed` 0.7 | One still frame, no loop |
| Canvas cross-fade over poster | 600ms ease-out, once | None |
| Button colour and press (1px) | 160ms | Instant |
| Arrow nudge on hover | 160ms | None |
| Accordion and menu | Opens in response to the visitor, 250ms at most | Instant |

The existing `Reveal` entrance is removed from content. Headlines and body are present on first paint. There is no scroll-jacking and no parallax on content.

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
| Service card | `raised`, 28px radius, 28px padding | Link only | n/a | n/a | Name, price, short line, link |
| Case card | `raised`, image area, key/value rows, footer link | Footer underline | 1px down | n/a | Draft and anonymised rules unchanged |
| Header | Solid `room`, 80px, logo with round amber mark | Nav underline in `amber` | n/a | n/a | Inset logic for the old hero rail is removed |
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
| Data saver | `navigator.connection.saveData` or `prefers-reduced-data` | Poster, renderer not downloaded |
| Low-power device | `deviceMemory` below 4 or `hardwareConcurrency` of 4 or fewer | Poster, renderer not downloaded |
| Struggling at runtime | Average frame interval over 24ms across 90 frames | Drop to scale 0.20. Freeze on a still only if it then averages over 40ms, so a steady 30 fps low-power mode keeps moving |
| Context lost | `webglcontextlost` | Fade back to poster, stop the loop |
| Offscreen or hidden tab | IntersectionObserver, `visibilitychange` | Loop stops |

### 10.4 Phone settings

Tested on the laptop at phone viewport sizes with the renderer below. This is **emulation, not a real device.** R4 must test at least one mid-range Android phone and one iPhone.

| Setting at 390×844 | Avg | p95 |
|---|---|---|
| 2x, scale 0.30, 9 masses | 4.1 ms | 7.1 ms |
| 2x, scale 0.24, 6 masses | 4.5 ms | 7.7 ms |
| **1.5x, scale 0.24, 6 masses (chosen)** | 3.9 ms | 8.6 ms |
| 1.5x, scale 0.20, 6 masses (runtime step-down) | 3.9 ms | 8.2 ms |

The laptop GPU cannot separate these settings, so they are chosen for fill-rate on phones rather than from a measured phone win.

### 10.5 CSP

**No CSP change was needed.** The renderer is same-origin JavaScript, uses no workers, `eval` or external assets, and the grain is a `data:` image already allowed by `img-src`. In R4 the production build ran live under its generated policy, served by a local test server, with no violations. It has not yet been run through `wrangler dev` or a hosted preview.

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

**Still to prove:** sustained frame rate in a normal browser and on real phones, and the governor on a genuinely slow device.

**Placement until R5:** the canvas is confined to the hero, because Home's lower sections are not solid yet. R5 makes them solid, then extends it to the fixed layer and the final CTA opening in §6.2. On phones the canvas covers only the band above the copy, which halves its pixels.

### 10.7 Performance baseline (before R1)

Recorded 2026-11-22 from commit `a418a47`: production build, flags off, served locally with gzip. Mobile Lighthouse 13.6.0 with its default simulated throttling, in headless Edge on the development machine. Values are the median of three runs. Performance across the runs is shown in brackets.

| Page | Performance | Accessibility | Best practices | SEO | LCP | CLS | TBT | Weight |
|---|---|---|---|---|---|---|---|---|
| Home | 100 (97, 100, 100) | 100 | 100 | 100 | 784 ms | 0.005 | 9 ms | 255 KB |
| Pricing | 100 (100, 100, 100) | 100 | 100 | 100 | 773 ms | 0.001 | 9 ms | 274 KB |
| `/start` | 100 (100, 100, 99) | 100 | 100 | 100 | 770 ms | 0.005 | 56 ms | 257 KB |

Local serving has no real network latency, so compare later runs with this table rather than reading it as field performance.

## 11. Token migration

Add the new tokens under new names. Do not redefine old names, or `text-ink` would silently become a light colour mid-migration. Remove the old tokens at the end of R6.

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
