# Concept A — bodies on the other side of the glass

Pale paper under an even grid of small black dots. People walk across it, and we see them only two ways: where a sole presses against the glass, and the smoky shadow the rest of their body casts onto it. A thin orange cross flare follows the pointer. The flare is the light.

## The model

The screen is a sheet of frosted glass lying like a floor, and the viewer is underneath it looking up. Real 3D figures stand on the far side, with their bodies extending away from the viewer along z.

- **Impressions.** A sole in contact with the glass is at height zero. It is crisp, black and heavy.
- **Cast shadow.** Everything above the sole is lit by a point light on the walkers' side and throws a shadow down onto the glass. The higher a body part is, the further its shadow is thrown, the wider it gets and the more it blurs.

Each joint `P` is projected from the light `L` onto the glass:

```
S.xy = P.xy + (P.xy − L.xy) · k        k = P.z / (L.z − P.z)
```

`k` is zero on the glass and grows with height. Radius scales by `1 + k` (similar triangles), blur grows with height, and opacity falls with height to exactly zero at mid-waist. Nothing above mid-waist is simulated or drawn.

That one rule is the depth. Move the pointer and every shadow swings around its feet, longer the further a walker is from the light, while the prints themselves do not move at all, because they are at height zero.

## Per frame

1. **Walkers** (`walkers.ts`). A fixed 120 Hz simulation of 3D skeletons.
2. **Flare.** Eases toward the pointer on a critically damped spring, or drifts when idle. Its position is also the light's.
3. **Instances** (`engine.ts`). Every joint is projected; limbs become capsule instances, soles become print instances.
4. **Density pass** (`density.glsl.ts`). Those instances are drawn into a small render target, two texels per dot cell each way, with MAX blending so overlapping limbs form a union instead of a darker seam. Red is contact, green is shadow, blue is a much wider haze.
5. **Dot pass** (`dots.frag.glsl.ts`). One fullscreen quad. Dot radius is a continuous function of tone (contact or shadow), with no dithering. The haze tints the paper blue-grey, which carries the out-of-focus part of a shadow. The flare goes over the top.

## How a walker moves

Built from the ground up, each tick:

1. **Root.** A point with a heading and a speed. It wanders on two slow sines, steers round other walkers, eases into and out of motion.
2. **Feet.** A foot is either planted or swinging. A planted foot is locked to its position on the glass and cannot slide. It lifts only once the body has moved on past it, so cadence comes out of speed and stride rather than a clock. The swing follows an arc: the heel peels up, the foot clears the ground, the toes pull up before landing so the heel arrives first.
3. **Pelvis.** Rides on under-damped springs: it shifts over the standing foot, sinks when the legs are spread (the twice-per-stride bob comes from leg length, not a sine), turns with the stride, and tips toward the swinging side. The waist follows late and counter-rotates.
4. **Legs.** Two-bone IK from hip to ankle with the knee pointing along the direction of travel. Legs never fully straighten.

**Pressure.** A print is pressed, not stamped. Contact rolls along the sole: the heel inks first, then the rest as weight comes forward, then the heel lifts away while the ball and toes are still down. Ink density follows the share of weight on that foot. A lifted print keeps about half its ink, softens, and fades after `trailLength` further steps.

**Turning.** With chance `pivotChance` at a footfall, a walker stops. The body turns first, by 45–180°, and the feet shuffle round after it once they are twisted too far from the hips.

**Standing.** A paused walker still breathes, shifts weight slowly from hip to hip, and occasionally adjusts a foot.

**Individuality.** Each walker draws a temperament (brisk, ambling or hesitant) and a spread of leg length, hip width, stance, toe-out, sway, bounce, cadence and left/right asymmetry from the seed.

**Staying in frame.** Walkers enter from outside an edge and may leave. The last one in view is turned back before it can walk out, and the simulation runs eight seconds before the first frame.

## Print styles

`printStyle` picks the shoe: `sneaker`, `barefoot` (five separate toes), `boot` (square sole, block heel), `heel` (pointed forefoot and a stiletto dot, which press as two separate contacts), `oxford` or `sandal`. `mixed`, the default, gives each walker their own. Shapes live in one atlas (`sprites.ts`) with soft edges that the shader thresholds: lighter pressure leaves a thinner, more broken mark. Adding a style is a new entry in `PRINTS`, `PRINT_STYLES` and the `PrintStyleOption` type.

## Flare

- Follows the pointer over the hero container with `flareFollowLag` of smoothing; fades in over `flareFadeIn`, out over `flareFadeOut`; breathes ±15% on a 4 s period while hovering.
- With no pointer, and on touch devices, it drifts around a rest point and fades up and down every `flareIdleCycle` seconds. Because it is the light, that drift also keeps the shadows gently moving.
- A wide, soft orange-pink column with a thinner horizontal, a four-point star and a pale yellow core at the crossing. `secondaryLine` adds a fainter horizontal higher up, with a small flare where the column crosses it.
- `flareIntensity: 0` hides the flare but the light, and so the shadows, remain.

## Overlay

HTML, positioned over the canvas, driven by the `labels` prop: two year fragments, a title, a vertical line down the right edge, a `( from ) → ( to )` readout, the live `x / y` flare readout, and a mark slot. The shipped copy is placeholder.

## Final defaults

| Prop             | Default   | Notes                                           |
| ---------------- | --------- | ----------------------------------------------- |
| `gridSpacing`    | `9`       | CSS px between dots                             |
| `baseDotRadius`  | `0.8`     | CSS px                                          |
| `maxDotRadius`   | `4.1`     | CSS px                                          |
| `baseDotOpacity` | `0.34`    |                                                 |
| `dotColor`       | `#0b0d10` | the site's `ink`                                |
| `paperColor`     | `#dfe9ee` |                                                 |
| `haloColor`      | `#7f9fba` | what a shadow tints the paper                   |
| `haloBlur`       | `0.5`     | soft glow hugging each print; 0 removes it      |
| `walkers`        | `4`       | 1–12                                            |
| `walkSpeed`      | `120`     | cruising speed, CSS px per second               |
| `strideLength`   | `175`     | CSS px between footfalls at cruising speed      |
| `pivotChance`    | `0.06`    | per footfall                                    |
| `trailLength`    | `3`       | lifted prints kept                              |
| `footScale`      | `1`       | 1 = a print about 150 px long; the body follows |
| `printStyle`     | `"mixed"` |                                                 |
| `gaitEnergy`     | `1`       | cadence, acceleration, foot lift                |
| `swayAmount`     | `1`       | hip shift, turn and tip                         |
| `individuality`  | `1`       | how different the walkers are                   |
| `bodyHeight`     | `3.4`     | feet to mid-waist, in print lengths             |
| `lightHeight`    | `1150`    | CSS px above the glass                          |
| `shadowLength`   | `1.6`     | cap on `k`                                      |
| `penumbra`       | `0.13`    | blur per px of height                           |
| `shadowOpacity`  | `0.85`    |                                                 |
| `flareIntensity` | `1`       |                                                 |
| `flareFollowLag` | `250`     | ms                                              |
| `flareFadeIn`    | `600`     | ms                                              |
| `flareFadeOut`   | `900`     | ms                                              |
| `flareIdleCycle` | `9`       | seconds                                         |
| `secondaryLine`  | `true`    |                                                 |
| `seed`           | `11`      |                                                 |

Removed since the first version: `bodyDensity` (now `shadowOpacity`). `bodyHeight` changed meaning: it is now the real height of a 3D body, not the length of a flat silhouette.

## The three that change the feel most

| Prop          | Try        | What it does                                                                                                       |
| ------------- | ---------- | ------------------------------------------------------------------------------------------------------------------ |
| `lightHeight` | 600 – 2200 | Low: long raking shadows that swing hard as the pointer moves. High: short shadows tucked under the feet, flatter. |
| `penumbra`    | 0.05 – 0.3 | Low: legs read as distinct limbs. High: the body dissolves into smoke a few dots above the ankle.                  |
| `gaitEnergy`  | 0.6 – 1.6  | Low: slow, heavy, deliberate. High: quick steps with more lift and a livelier pelvis. Pair with `walkSpeed`.       |

## Notes on the brief

- **Stride is slower than life.** A body this size walking at a natural cadence would cross the hero in about two seconds. Defaults are an unhurried amble: roughly 0.7 steps per second.
- **Shuffle marks do not join the trail.** Turning on the spot would otherwise leave a rosette of near-identical prints, so marks made while pivoting fade at once, and a new mark replaces any older one it mostly covers.
- **Reduced motion ignores the pointer.** A still frame that redrew on every pointer move would be an animation loop by another name.
- **A bug found on the way.** The keep-in-frame rule steered a lone walker toward the centre unconditionally, which made it orbit the centre and stamp a ring of prints. It now only acts while the walker is actually heading out.
