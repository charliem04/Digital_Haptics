# Concept B — topographic dot terrain

A grid of points over a height field, seen from nearly straight above, scrolling in a loop that ends exactly where it starts.

## Per frame

1. JS computes `phase = (time mod loopDuration) / loopDuration` and writes one uniform.
2. The vertex shader samples the height for each point, lifts it along the camera's up axis, sets its size and passes the elevation on.
3. The fragment shader draws a square or round point and looks its colour up in a 256-texel ramp built from `palette`. Blending is additive, depth test off.

Geometry, camera and ramp are rebuilt only when a prop or the container size changes.

## Why the loop is seamless

- The terrain is 4D gradient noise (fBm plus a ridged term) sampled on a torus, `(cos u, sin u, cos v, sin v)`. It wraps on both tile axes with no seam.
- `scrollDirection` is a whole number of tiles per loop on each axis, so after one loop the terrain is back where it began.
- The wave is defined in screen space and advances whole turns per loop.

"Verify loop" in the lab renders phase 0 and phase 1 and compares every pixel. They are identical. (Before the shader wrapped its phase terms with `fract`, 45 of 1.8 million pixels differed, from float32 rounding in `cos(x + 2π)`.)

`scrollDirection` is therefore an integer vector, not an angle. An arbitrary angle cannot loop.

## Constant density at any size

World units are CSS pixels and the camera sits where one unit at the centre is one pixel, so `pointSpacingPx` holds at any container size. The grid is anchored to the centre: a resize slides the lattice, it does not re-flow it. `maxPoints` widens the spacing if a large container would exceed it.

## Real heightmaps

Pass `heightmap` (grayscale PNG, JPG or WebP; `.exr` loads through three's `EXRLoader`). A real DEM does not tile, so it is mirror-repeated and scrolled along one axis, the dominant one in `scrollDirection`, by two tiles per loop (a mirrored texture repeats every two tiles).

The tradeoff: the loop is seamless and there is no hard edge, but a mirror line passes through the frame once per tile, where the terrain is visibly symmetrical. The brief asked for a crossfade at the wrap seam. With mirroring there is no seam to crossfade, and a crossfade would not hide the symmetry, so there isn't one. If the mirror line bothers you on a real tile, the fix is to make the tile itself periodic before export.

## Final defaults

| Prop              | Default                                                     | Notes                                    |
| ----------------- | ----------------------------------------------------------- | ---------------------------------------- |
| `pointSpacingPx`  | `6`                                                         | CSS px between points                    |
| `pointSize`       | `2`                                                         | CSS px                                   |
| `pointShape`      | `"square"`                                                  | or `"round"`                             |
| `heightScale`     | `64`                                                        | CSS px of lift at a peak                 |
| `noiseScale`      | `3.2`                                                       | base features per tile                   |
| `octaves`         | `5`                                                         | 1–6                                      |
| `ridgeMix`        | `0.55`                                                      | 0 soft, 1 ridged                         |
| `scrollDirection` | `[1, 1]`                                                    | whole tiles per loop                     |
| `loopDuration`    | `20`                                                        | seconds                                  |
| `waveAmplitude`   | `0.05`                                                      | fraction of full elevation               |
| `waveFrequency`   | `2.5`                                                       | crests per 1000 px                       |
| `cameraTilt`      | `14`                                                        | degrees off top-down                     |
| `fov`             | `22`                                                        | degrees                                  |
| `palette`         | `#0f5b4a` 0 · `#2fd1a6` 0.42 · `#d8f08a` 0.76 · `#8a5a33` 1 | elevation stops                          |
| `heightmap`       | `null`                                                      | procedural terrain                       |
| `seed`            | `7`                                                         |                                          |
| `aspectFit`       | `"cover"`                                                   | or `"contain"`                           |
| `maxPoints`       | `160000`                                                    |                                          |
| `tileSizePx`      | `1800`                                                      | added: size of one terrain tile          |
| `grain`           | `0.22`                                                      | added: per-point brightness jitter       |
| `debugFrame`      | `null`                                                      | `"start"` / `"end"` hold a loop endpoint |

## The three that change the feel most

| Prop             | Try        | What it does                                                                  |
| ---------------- | ---------- | ----------------------------------------------------------------------------- |
| `heightScale`    | 30 – 110   | Flat map at the low end; tall, streaked ridges at the high end.               |
| `ridgeMix`       | 0.2 – 0.85 | Rolling dunes to sharp mountain spines.                                       |
| `pointSpacingPx` | 4 – 10     | Dense, photographic field to a sparse, graphic grid. Also the main cost dial. |

## Notes on the brief

- **Displacement axis.** As specified, points lift along the camera's up axis. That makes `cameraTilt` control perspective convergence only; the streak length is `heightScale`.
- **Tile repetition.** A container wider than `tileSizePx` shows the terrain repeating. Raise `tileSizePx` (and `noiseScale` with it, to keep feature size) for very wide heroes; the scroll speed rises with it, since one loop is one tile.
