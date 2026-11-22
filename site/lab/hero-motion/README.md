# Hero motion lab

Three interchangeable real-time hero backgrounds, built to be compared before one is chosen. None is wired into the live hero.

| Concept | Component                      | Details                                        |
| ------- | ------------------------------ | ---------------------------------------------- |
| A       | `footprints/WanderingFeet.tsx` | [footprints/README.md](./footprints/README.md) |
| B       | `terrain/TopoTerrain.tsx`      | [terrain/README.md](./terrain/README.md)       |
| C       | `liquid/LiquidMetal.tsx`       | [liquid/README.md](./liquid/README.md)         |

## Seeing it

```bash
npm run dev
```

Then open `http://localhost:3000/lab/`. Each concept has a tweakpane panel with every tunable, size presets (drag the stage's corner for any other size), a live frame-time readout and a bench button. "Preview reduced motion" shows the single still frame each concept holds under `prefers-reduced-motion`.

`/lab/?bench=feet`, `?bench=liquid` and `?bench=terrain` show one concept alone at a fixed 2560×1440 canvas (device pixel ratio forced to 1) and run the bench automatically.

## Using a component

```tsx
<section className="relative h-[640px]">
  <WanderingFeet seed={11} /> {/* or <LiquidMetal seed={5} />, <TopoTerrain seed={7} /> */}
  <div className="relative">…hero content…</div>
</section>
```

All three fill their nearest positioned ancestor and share the same shape: `className`, `paused`, `seed`, then concept-specific props, all optional. A `ref` gives `{ stats(), bench(), engine(), hold(), step() }`.

## What all three do

- **Sized by the container.** A `ResizeObserver` on the root drives the canvas size. Device pixel ratio is capped at 2. A resize redraws inside the observer callback, so the cleared buffer is never painted.
- **Stop when not seen.** The loop runs only while the root intersects the viewport, the tab is visible and `paused` is off.
- **Reduced motion.** One composed frame, no loop.
- **Never in the way.** The root is `pointer-events: none`. Concept A listens for the pointer on its parent (the hero container), or on a `pointerTarget` ref.
- **Props hot-update.** Props go to the engine through `setParams` each render. The canvas and WebGL context are created once.
- **Server-safe.** The component renders a static CSS fallback and an empty canvas on the server. three.js and the engine are imported inside an effect.
- **Deterministic.** `seed` reproduces the terrain, the walkers, or the liquid's starting arrangement. A and C simulate on a fixed timestep, so the same seed plays out the same way at any frame rate.
- **No network assets.** Everything is procedural. Concept B's optional heightmap is the only thing that can load a URL.
- **No per-frame allocation** in the engines. The one exception is Concept A's coordinate readout, which builds two short strings when the flare's third decimal changes.

## Reviewing motion: `window.__lab`

A screenshot of a live canvas catches one arbitrary frame at whatever scale the viewer is using, which is a poor way to judge motion. The lab installs review tools (`demo/debug.ts`) that take a stage off its clock and build contact sheets from the GL buffer:

```js
__lab.sheet("feet", { frames: 8, gap: 0.15, cols: 4, width: 250 }); // one stride
__lab.sheet("liquid", { frames: 9, gap: 7, cols: 3, width: 264 }); // one minute
__lab.frame("liquid", 1000); // a single frame
__lab.hide(); // or click the sheet
```

`__lab.handle("feet").hold(false)` hands the stage back to its own clock.

## How this differs from the original brief

- **`site/lab/hero-motion/`, not `src/lab/hero-motion/`.** This project has no `src/`; the app root is `site/`.
- **Plain three.js, not React Three Fiber.** Each concept is one or two draw calls with a hand-run loop.
- **`/lab` is dev-only through a page extension.** The route file is `app/lab/page.lab.tsx`, and `next.config.mjs` adds `lab.tsx` to `pageExtensions` only under `next dev`. In `next build` the file is not a route at all, so `/lab`, three.js and tweakpane cannot reach `out/`.
- **Overlay fonts are the site's** (Chakra Petch, Manrope, JetBrains Mono).

## Dependencies (all devDependencies)

| Package           | Why                                                   |
| ----------------- | ----------------------------------------------------- |
| `three`           | WebGL renderer, shader materials, render targets.     |
| `@types/three`    | Types for it.                                         |
| `tweakpane`       | The lab's control panels. No dependencies of its own. |
| `@tweakpane/core` | Types tweakpane's own declarations import.            |

Round 2 (the Concept A rebuild and Concept C) added none. When one concept moves into the live hero, `three` moves to `dependencies`.

## Frame times

Measured on this project's dev machine: Intel Iris Xe (ANGLE, Direct3D 11), `next dev`.

| Concept | 2560×1440 canvas, avg | p95     | max     | Measured   |
| ------- | --------------------- | ------- | ------- | ---------- |
| A       | 4.7 ms                | 5.6 ms  | 26.8 ms | 2026-11-22 |
| C       | 8.4 ms                | 10.5 ms | 13.8 ms | 2026-11-22 |
| B       | 4.4 ms                | 5.9 ms  | 7.5 ms  | 2026-11-11 |

Concept A was 8.4 ms before its rebuild: the Canvas2D density pass and its texture upload are gone. Its 26.8 ms maximum was a single frame out of 300.

**How:** `Stage.bench()` runs 300 frames back to back after 30 warm-up frames. Each sample is `performance.now()` around simulation update, render, and a 1-pixel `readPixels`, which blocks until the GPU has finished the frame. So the number is CPU plus GPU work per frame, and it does not depend on rAF pacing.

**What it does not cover:** the browser compositing the canvas to the screen. In the embedded preview pane, the live rAF interval read about 33 ms (30 fps) for all three concepts at a 1938×1240 buffer, including Concept B, whose frame costs a fraction of the others. Three different workloads landing on the same 33 ms points at the pane's presentation rate, not at rendering, but that is an inference. Sustained 60 fps has not been confirmed in a normal browser window: the readout above each stage shows the live interval there.

## A note on the "dim reduced-motion frame"

An earlier round reported Concept B's reduced-motion frame as far dimmer than the animated one. It is not. Read from the GL buffer, the still frame and the animated frame at the same loop phase are identical (mean brightness 9.88%, 17.02% of pixels lit, both ways), and the still frame looks correct when captured directly. The dimness was the preview pane downscaling a fine dot grid in some screenshots. No engine or `Stage` code was wrong, and none was changed for it.
