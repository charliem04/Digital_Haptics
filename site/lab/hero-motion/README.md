# Hero motion lab

Two interchangeable real-time hero backgrounds, built to be compared before one is chosen. Neither is wired into the live hero.

| Concept | Component                      | Details                                        |
| ------- | ------------------------------ | ---------------------------------------------- |
| A       | `footprints/WanderingFeet.tsx` | [footprints/README.md](./footprints/README.md) |
| B       | `terrain/TopoTerrain.tsx`      | [terrain/README.md](./terrain/README.md)       |

## Seeing it

```bash
npm run dev
```

Then open `http://localhost:3000/lab/`. Each concept has a tweakpane panel with every tunable, size presets (drag the stage's corner for any other size), a live frame-time readout and a bench button. "Preview reduced motion" shows the single still frame each concept holds under `prefers-reduced-motion`.

`/lab/?bench=terrain` and `/lab/?bench=feet` show one concept alone at a fixed 2560×1440 canvas (device pixel ratio forced to 1) and run the bench automatically.

## Using a component

```tsx
<section className="relative h-[640px]">
  <WanderingFeet seed={11} /> {/* or <TopoTerrain seed={7} /> */}
  <div className="relative">…hero content…</div>
</section>
```

Both fill their nearest positioned ancestor and share the same shape: `className`, `paused`, `seed`, then concept-specific props, all optional. A `ref` gives `{ stats(), bench(), engine() }`.

## What both do

- **Sized by the container.** A `ResizeObserver` on the root drives the canvas size. Device pixel ratio is capped at 2. A resize redraws inside the observer callback, so the cleared buffer is never painted.
- **Stop when not seen.** The loop runs only while the root intersects the viewport, the tab is visible and `paused` is off.
- **Reduced motion.** One composed frame, no loop.
- **Never in the way.** The root is `pointer-events: none`. Concept A listens for the pointer on its parent (the hero container), or on a `pointerTarget` ref.
- **Props hot-update.** Props go to the engine through `setParams` each render. The canvas and WebGL context are created once.
- **Server-safe.** The component renders a static CSS fallback and an empty canvas on the server. three.js and the engine are imported inside an effect, so they are never evaluated during server rendering and are split out of the page's first chunk.
- **Deterministic.** `seed` reproduces the terrain, or the walkers' starting layout and paths.
- **No network assets.** Everything is procedural. Concept B's optional heightmap is the only thing that can load a URL, and only if you pass one.
- **No per-frame allocation** in the engines. The one exception is Concept A's coordinate readout, which builds two short strings when the flare's third decimal changes.

## How this differs from the brief

The brief was written for a different repo layout. What changed, and why:

- **`site/lab/hero-motion/`, not `src/lab/hero-motion/`.** This project has no `src/`; the app root is `site/`.
- **Plain three.js, not React Three Fiber.** The repo had neither installed. Both concepts are a single draw call with a hand-run loop (pause, offscreen, still frames), which R3F would add a reconciler and a second dependency to without simplifying.
- **`/lab` is dev-only through a page extension.** The route file is `app/lab/page.lab.tsx`, and `next.config.mjs` adds `lab.tsx` to `pageExtensions` only under `next dev`. In `next build` the file is not a route at all, so `/lab`, three.js and tweakpane cannot reach `out/` or trip the CSP, SEO and route gates. That one config line is the only edit to an existing file besides `package.json`.
- **Overlay fonts are the site's** (Chakra Petch, Manrope, JetBrains Mono) rather than Inter.

## Dependencies added (all devDependencies)

| Package           | Why                                                   |
| ----------------- | ----------------------------------------------------- |
| `three`           | WebGL renderer, shader materials, texture loading.    |
| `@types/three`    | Types for it.                                         |
| `tweakpane`       | The lab's control panels. No dependencies of its own. |
| `@tweakpane/core` | Types tweakpane's own declarations import.            |

When one concept moves into the live hero, `three` moves to `dependencies` and the others stay where they are.

## Frame times

Measured on this project's dev machine: Intel Iris Xe (ANGLE, Direct3D 11), `next dev`, 2026-11-11.

| Concept | 2560×1440 canvas, avg | p95    | max     |
| ------- | --------------------- | ------ | ------- |
| B       | 4.4 ms                | 5.9 ms | 7.5 ms  |
| A       | 8.4 ms                | 9.5 ms | 16.3 ms |

**How:** `Stage.bench()` runs 300 frames back to back after 30 warm-up frames. Each sample is `performance.now()` around simulation update, render, and a 1-pixel `readPixels`, which blocks until the GPU has finished the frame. So the number is CPU plus GPU work per frame, not just the cost of submitting it, and it does not depend on rAF pacing.

**What it does not cover:** the browser compositing the canvas to the screen. In the embedded preview pane the live rAF interval read 16.5 ms (60 fps) at a 1938×1240 buffer and 33.3 ms (30 fps) at a 2560×1440 buffer, for both concepts identically, with 0.2–0.6 ms of JS per frame. Two concepts with different render costs landing on the same 33.3 ms points at the pane's presentation rather than the rendering, but that is an inference. Confirm in a normal browser window: the readout above each stage shows the live interval.
