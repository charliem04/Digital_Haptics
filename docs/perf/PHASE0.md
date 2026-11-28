# Performance Phase 0: baseline and attribution

Branch `perf/phase-0`, cut from `main` at 81e7b3d, measured 2026-11-27.

## Tool

Add `?perf` to any URL. A HUD shows page frame rate and jank, long tasks,
and the liquid's frame rate, CPU and GPU time per frame (GPU timer query),
buffer sizes, step-down state and GPU name. "Record 10 s" makes a summary
to copy. Without `?perf` nothing loads. See `site/lib/perf.ts`.

- `off=liquid,grain,motion,trim,glow,blur` switches layers off.
- `scale=`, `blobs=`, `dpr=`, `fps=`, `gov=off`, `tier=phone` override
  the liquid for one visit.

## Setup

Production build (`npm run build`), served by `wrangler dev` on :8799.
Intel Iris Xe (no dedicated GPU), Chrome via the built-in browser pane,
device pixel ratio 2.25. Page fps is main-thread `requestAnimationFrame`,
5 s idle, then 5 s of scripted scrolling. "Janky" = frames over 25 ms.
Hidden panes throttle rAF, so only visible-pane runs are reported.

## Results

### Liquid GPU time per frame

| Case | Scene (march) | Canvas (present) | GPU ms |
|---|---|---|---|
| Home, 1009 px wide, current (scale 0.9) | 827×629 | 2018×1536 | 4.1 |
| same, scale 0.05 (≈ present pass alone) | 202×154 | 2018×1536 | 2.0 |
| same, scale 0.3, dpr 1 | 303×230 | 1009×768 | 2.4 |
| Phone 375×812, current (scale 0.9) | 490×1061 | 563×1218 | 2.5 |
| Phone, old scale 0.24 | 135×292 | 563×1218 | 0.76 |
| /services, 1536×864 | 957×543 | 3042×1728 | 6.2 |
| /services, 2560×1440 | 959×542 | 5090×2880 | 10.4 |

### Page smoothness

At 423 px and 1536×864 every page tested held 60 fps idle and scrolling.
The stress case, a 2560×1440 viewport (a large external monitor), on /services:

| Variant | Idle fps / janky | Scroll fps / janky | Liquid GPU ms |
|---|---|---|---|
| Current | 49.8 / 13% | 39.1 / 24% | 10.4 |
| `off=blur` | 54.0 / 8% | 35.9 / 27% | 9.8 |
| `off=grain` | 46.1 / 16% | 34.2 / 30% | 15.8 |
| `scale=0.2` | 51.0 / 13% | 37.6 / 24% | 14.8 |
| `dpr=1` | **60 / 0%** | **60 / 0%** | 4.9 |
| `fps=30` | **60 / 0%** | **60 / 0%** | 10.3 per drawn frame |
| `off=liquid` | 60 / 0% | 60 / 0% | n/a |

Home at 2560×1440 with the governor on: it stepped down to scale 0.2 and
still scrolled at 46 fps, 13% janky.

## Findings

1. **The liquid is the cost.** With it off, every other layer (glass blur,
   grain, embers, trims) fits comfortably in the frame budget. Blur and
   grain switches moved results only within run-to-run noise.
2. **The expensive part is the full-resolution present pass, not the
   ray-march.** The march is already capped at 520k pixels, so the render
   scale stops mattering on large screens. The present pass (bicubic
   upscale and grain) runs on every device pixel, every frame: 14.7M
   pixels at 2560×1440 and DPR 2. `dpr=1` alone removes the problem.
3. **The governor pulls the wrong lever.** Its step-down lowers the scene
   scale, which is capped anyway; it never lowers the canvas DPR or the
   frame rate. So a struggling device stays struggling.
4. **Phones: the tuning change from scale 0.24 to 0.9 (`tuning.json`)
   made the liquid 3.3× more expensive** (0.76 → 2.5 ms on Iris Xe). A
   phone GPU is several times weaker than Iris Xe, so this is the likely
   phone regression. Not yet confirmed on a real phone.
5. **The liquid now runs behind every inner page, full-screen**, for as
   long as the page is open. That is new since the original §10 budget.
6. **30 fps is enough.** Capping the liquid at 30 fps restored 60 fps
   scrolling at the stress size; the liquid moves slowly enough that 30 fps
   is hard to tell apart.

## Not yet measured

- A real phone (needs the build reachable on the LAN, or a preview deploy).
- Other browsers (Firefox, Safari) and battery or power-saving mode.
- Laptop at native full-screen resolution rather than an emulated viewport.

## Implications for Phase 1

The cheapest, least visible wins, in order:

1. Cap the liquid's canvas at DPR 1 (or about 1.25). The image is a soft,
   upscaled blur, so extra device pixels only sharpen the grain.
2. Cap the liquid at 30 fps.
3. Make the governor lower DPR and frame rate, not just scene scale, and
   cap the total canvas pixels the way the scene is already capped.
4. Revisit the phone render scale (0.9 → somewhere 0.3–0.5, judged by eye
   in /lab/liquid).

Glass blur, grain and motion trims can stay as they are for now.
