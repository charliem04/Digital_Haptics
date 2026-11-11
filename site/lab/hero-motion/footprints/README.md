# Concept A — wandering feet on a halftone grid

Pale paper covered in an even grid of small dots. Shoe prints made of larger dots on the same grid walk in from the edges, wander, pivot and leave, each with a soft blue-grey halo. A thin orange cross flare follows the pointer.

## Per frame

1. **Walkers** (`walkers.ts`). Each walker is a point with a heading. Every `strideLength / walkSpeed` seconds it steps and leaves a print, alternating feet. Only the newest `trailLength` prints stay inked.
2. **Flare.** Its position eases toward the pointer with a critically damped spring, or toward a slowly drifting rest point when nothing is hovering.
3. **Density pass** (`engine.ts`, Canvas2D). A canvas with one pixel per dot cell is cleared and every inked print is stamped into it: a red foot sprite over a blue halo sprite, added together. At the default spacing a full-bleed hero is roughly 160×70 texels.
4. **Dot shader** (`dots.frag.glsl.ts`). One fullscreen quad. Each fragment finds its cell, reads print coverage from red at the cell centre and sizes its dot from it, reads the halo from blue to tint the paper, then lays the flare over the top.

Because the prints are only ever dot sizes, they stay locked to the grid as they move.

## Walker behaviour

- Heading drifts on two slow sines per walker, so paths curve gently.
- With chance `pivotChance` per step a walker stops and turns 45–180° over two or three short shuffle steps. Less often it simply pauses for a moment.
- Walkers steer away from anyone close and ahead of them.
- They spawn just outside a random edge heading inward and may walk out. When a walker's last print has faded it re-enters at another edge.
- The frame is never empty: the last walker in view is turned back toward the middle before it can leave, and the simulation is run forward eight seconds before the first frame.

## Flare

- Follows the pointer over the hero container with `flareFollowLag` of smoothing; fades in over `flareFadeIn`, out over `flareFadeOut`; breathes ±15% on a 4 s period while hovering.
- With no pointer, and on touch devices, it drifts around a rest point and fades up and down every `flareIdleCycle` seconds.
- `secondaryLine` adds a fainter horizontal line higher up.

## Overlay

HTML, positioned over the canvas, driven entirely by the `labels` prop: two year fragments, a title, a vertical line down the right edge, a `( from ) → ( to )` readout, the live `x / y` flare readout, and a mark slot. The shipped copy is placeholder (name, discipline, Lafayette's latitude and longitude, the current year). On small containers the title and edge line drop out.

## Final defaults

| Prop             | Default   | Notes                                 |
| ---------------- | --------- | ------------------------------------- |
| `gridSpacing`    | `9`       | CSS px between dots                   |
| `baseDotRadius`  | `0.8`     | CSS px                                |
| `maxDotRadius`   | `4.1`     | CSS px                                |
| `dotColor`       | `#0b0d10` | the site's `ink`                      |
| `paperColor`     | `#dfe9ee` |                                       |
| `haloColor`      | `#8ea8bd` |                                       |
| `haloBlur`       | `0.6`     | 0 removes the halo                    |
| `walkers`        | `5`       | 1–12                                  |
| `walkSpeed`      | `96`      | CSS px per second                     |
| `strideLength`   | `124`     | CSS px between footfalls              |
| `pivotChance`    | `0.07`    | per step                              |
| `trailLength`    | `4`       | prints kept                           |
| `footScale`      | `1`       | 1 = a print about 150 px long         |
| `flareIntensity` | `1`       | 0 hides it                            |
| `flareFollowLag` | `250`     | ms                                    |
| `flareFadeIn`    | `600`     | ms                                    |
| `flareFadeOut`   | `900`     | ms                                    |
| `flareIdleCycle` | `9`       | seconds                               |
| `secondaryLine`  | `true`    |                                       |
| `seed`           | `11`      |                                       |
| `baseDotOpacity` | `0.34`    | added: opacity of the background dots |

## The three that change the feel most

| Prop          | Try      | What it does                                                                                                                             |
| ------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `gridSpacing` | 7 – 14   | Fine spacing draws a recognisable shoe; coarse spacing turns prints into bold blocks. Scale `maxDotRadius` to a little under half of it. |
| `walkSpeed`   | 50 – 160 | A slow drift across the page, or a busy crossing.                                                                                        |
| `trailLength` | 2 – 8    | Two reads as a single person standing; eight reads as tracks left behind.                                                                |

## Notes on the brief

- **The flare is composited over the paper, not added to it.** Additive light is right on black. On `#dfe9ee` it only clips toward white and the orange never shows. The flare colour replaces the paper in proportion to its heat, which gives the same hot core and falloff and stays orange.
- **Prints are bigger and the grid finer than "tiny dots" suggests.** At a 12 px grid a 100 px print is 8×4 cells and reads as a blob. The defaults (9 px grid, 150 px print) give about 16×7 cells, enough to show sole, gap and heel.
- **Flare colours are the brief's** (`#fff3c4`, `#ff7a3d`, `#ff5a7a`), not the site's `signal` `#FF5A1F`. They are constants at the top of the fragment shader if the hero should match the brand orange.
- **Reduced motion ignores the pointer.** A still frame that redrew on every pointer move would be an animation loop by another name.
