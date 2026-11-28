# Performance Phase 1: the liquid's frame budget

Branch `perf/phase-0`, after the Phase 0 commit. Measured 2026-11-27 on
the same machine and method as docs/perf/PHASE0.md (Intel Iris Xe,
production build, `wrangler dev`, built-in browser, DPR 2.25).

## Changes

All in `site/components/home/liquid/`.

1. **Canvas pixel budget** (`params.ts`, `engine.ts`). The canvas may have
   at most 3M device pixels on desktop and 1M on phones. Past that, its
   pixel ratio drops to fit, never below 1. A 1536×864 laptop goes from
   2× to 1.5×; a 2560×1440 monitor from 2× to 1×. Small screens are
   unchanged.
2. **30 fps liquid** (`params.ts`, `liquidLoop.ts`). The liquid draws on
   every second display frame. Scrolling and everything else on the page
   still run at the display's rate.
3. **A governor that pulls the right lever** (`liquidLoop.ts`,
   `engine.ts`). It now judges against the 30 fps target (step down below
   about 24 fps). The step-down sets the canvas to 1×, halves the pixel
   budget and drops the scene to 0.20. It still freezes only below about
   11 fps.
4. **Phone render scale 0.9 → 0.5** (`tuning.json`). The one change to a
   tuned value: side by side at 375×812 it looks the same.

The tuner (`lab/liquid-tuner/Stage.tsx`) uses the same pixel caps as the
live site.

## Results

| Case | Before | After |
|---|---|---|
| /services, 2560×1440: page scroll | 39 fps, 24% janky | **60 fps, 0% janky** |
| /services, 2560×1440: page idle | 50 fps, 13% janky | **60 fps, 0%** |
| Home, 2560×1440, governor on: scroll | 46 fps, 13% janky | **60 fps, 0%** |
| /services, 2560×1440: liquid GPU per second | 10.4 ms × 60 = 624 ms | 5.2 ms × 30 = **156 ms** |
| Phone 375×812: liquid GPU per frame | 4.3 ms (scale 0.9) | **2.3 ms** (scale 0.5) |
| Forced worst case (no budget, 60 fps) | no recovery | stepped down in ~3 s, 60 fps scroll |

GPU load from the liquid at the stress size is about a quarter of what
it was.

## What it costs visually

- **Motion at 30 fps.** The liquid is slow, so the difference is hard to
  see, but it's a judgement for your eyes on your own screen.
- **Grain on large screens.** The shader's film grain is drawn per canvas
  pixel. Where the canvas drops below the screen's density, that grain is
  slightly coarser. The fixed CSS grain overlay on top is unchanged.
- **Phone silhouettes.** Scale 0.5 is softer than 0.9 in theory; in a
  side-by-side screenshot it is not distinguishable.

The browser pane downscales screenshots, so it can't show grain
fineness. Compare on your own screen:

- Before: `/?perf&px=50000000&fps=60&scale=0.9`
- After: `/?perf`

Use `&tier=phone` to see the phone settings on desktop.

## Not done in Phase 1

- A real phone. Every phone figure is laptop emulation.
- Other browsers and battery saver.
- Glass blur, grain overlay and motion trims: Phase 0 showed they fit the
  budget once the liquid is under control, so they are untouched.
