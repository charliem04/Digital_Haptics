# Performance Phase 2: glass and grain

Branch `perf/phase-0`. 2026-11-28.

## Why: the real-screen sweep

Phase 1 fixed the liquid, but the owner's laptop still scrolled /services
at 14–21 fps. The browser pane had missed this: it scales large emulated
viewports down to fit, so the browser never did the full-size compositing
a real screen needs. Phase 0's "blur and grain are free" was wrong.

`?perf&sweep` (added for this) ran on the real screen. Edge 158, Intel
Iris Xe, viewport 1699×935 at DPR 2.25 (3823×2104 device pixels):

| Variant | Page fps | Late frames (>25 ms) |
|---|---|---|
| As shipped (Phase 1) | 28.1 | 85% |
| No glass blur | 42.8 | 38% |
| No grain overlay | 32.0 | 74% |
| No blur and no grain | 56.1 | 7% |
| Liquid only (no blur, grain, motion, trims, glow) | 44.0 | 36% |
| No liquid | 31.3 | 80% |
| Liquid at 1× | 29.3 | 84% |
| Everything off | 59.5 | 1% |

On this screen the liquid hardly matters any more (2.5–5 ms GPU at
30 fps). The glass blur is the largest cost and the grain overlay the
next, and the two add up. Runs vary by up to ~10 fps ("liquid only"
should beat "no blur + grain"), so small gaps are noise.

## Changes

1. **Glass panes have no live blur** (`components/ui/GlassPane.tsx`).
   They keep the 70% room tint, border and shadow. The owner compared
   `?perf&off=blur` with the normal page and saw no difference. The opt-in
   refracting rim is untouched and still used by no page. The small
   desktop nav pill and the open mobile menu keep their blur.
2. **The grain overlay is a background image, not a mask**
   (`app/globals.css`). It's the same fixed layer and the same tile. The
   tile's pixels are already mid grey with the grain in alpha, so it
   draws what the mask on a grey fill drew. A mask needs its own
   full-screen pass every frame; an image is one textured draw.
   Checked: LCP is still text (the home `h1`, the /services lead).

## Results

The owner's sweep after both changes, same laptop and browser:

| Variant | Page fps | Late frames | Before Phase 2 |
|---|---|---|---|
| **As shipped** | **49.6** | **20%** | 28.1 / 85% |
| No glass blur (header pill only now) | 44.1 | 34% | 42.8 / 38% |
| No grain overlay | 59.5 | 0% | 32.0 / 74% |
| No blur and no grain | 43.4 | 37% | 56.1 / 7% |
| Liquid only | 59.6 | 0% | 44.0 / 36% |
| No liquid | 57.4 | 4% | 31.3 / 80% |
| Liquid at 1× | 54.5 | 10% | 29.3 / 84% |
| Everything off | 59.5 | 1% | 59.5 / 1% |

- Scrolling /services as shipped went from 28 to about 50 fps, and late
  frames from 85% to 20%.
- The grain overlay is still the largest remaining cost: rows without it
  run at 57–60 fps.
- The two rows at ~44 fps should not be slower than "no grain overlay";
  with the blur gone, their only extra switch affects the small header
  pill. They alternate with fast rows through the run, which looks like
  the laptop throttling between runs rather than a real cost. Treat
  single rows with care; the pattern across rows is what holds.
