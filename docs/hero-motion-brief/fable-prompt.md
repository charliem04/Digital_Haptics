# Prompt for Fable 5.2: Hero motion, round 2

You are continuing a real-time WebGL hero background lab in my repo. There are two jobs:

1. **Rebuild the motion and depth of Concept A (Wandering Feet).** It currently looks flat and robotic.
2. **Build Concept C (Liquid Metal)**, a new, separate component.

This brief is approved. Do not run a question round or write a separate design document. Build it, look at it, iterate on what you see, and report honestly.

---

## 1. Repo setup

- Repo root: `C:\Users\charl\OneDrive\Documents\Business\Digital_Haptics`. The app is in `site/` (Next 14 static export, React 18, TypeScript, three r187, tweakpane).
- The checkout may be on `refactor/phase-6`. Confirm there are no tracked changes, then `git switch hero-motion-lab` (tip `dba6276`, same as origin at the time of writing). Run `npm ci` in `site/`, because the branches have different dependencies.
- **Do not merge `refactor/phase-6` or `main`, push, open a PR, or integrate into the live hero.**
- `docs/hero-motion-brief/` is untracked and contains this prompt and the references. **Never commit it.** Stage explicit paths only; no `git add -A`.
- New code stays under `site/lab/hero-motion/` plus the existing dev-only `/lab` route (`site/app/lab/page.lab.tsx`). Do not edit any other existing component, page or global style.
- Read before designing: `site/lab/hero-motion/README.md`, `footprints/README.md`, `shared/stage.ts`, `shared/useStage.ts`, and all of `footprints/`.
- Commit after A works and again after C works.

### Tools

- Use the connected docs tool (Context7: `resolve-library-id`, then `query-docs`) for three r187 API questions, especially render targets and instancing. Don't rely on memory for GPU API details.
- Use the built-in browser pane with the `site-dev` launch config to view and measure your work.
- Use `superpowers:systematic-debugging` for shader bugs and `superpowers:verification-before-completion` before you report.
- **Do not install any skill, plugin or MCP server.** I reviewed the options and the tools above cover this build.
- Do not add npm dependencies. three and tweakpane are enough.

### Shared requirements (unchanged, for both)

Container-sized via the existing `Stage`, DPR capped at 2, pauses offscreen and in hidden tabs, one composed still frame under `prefers-reduced-motion`, `pointer-events: none`, SSR-safe with a static fallback, all props hot-update without remounting, `seed` is deterministic, no network assets, zero per-frame JS allocation in the engines, `className` and `paused` props. Same handle shape: `{ stats(), bench(), engine() }`.

### Known bug to diagnose first

Under the lab's "Preview reduced motion" toggle, Concept B's still frame rendered **far dimmer** than the same terrain while animating or on "Hold frame 0". I previously worked around this by picking a different `stillPhase`, which did not fix it. Find the real cause. It may be in shared `Stage`/`useStage` code, in which case it would affect C too. Fix it and show before and after.

---

## 2. Concept A: a body on the other side of the glass

### The mental model (everything follows from this)

**The screen is a sheet of frosted glass lying like a floor, and we are underneath it looking up.** Real 3D people are standing on the far side, perpendicular to the screen, with their bodies extending *away from the viewer* along Z. We never see them directly. We see only:

- **Impressions:** where a sole presses against the glass. Crisp, black, heavy halftone.
- **A cast shadow:** the legs and hips, falling onto the glass from a light on their side. The further a body part is from the glass, the **blurrier, lighter and wider** its shadow.

The whole illusion comes from that one physical relationship: *distance from the glass equals softness.* The current version fails because it draws a flat 2D figure pointing "up the page" with uniform edges and a dither pattern. **Delete that approach** (`drawBody`, the leg and waist sprites, the Bayer dither, the page-up orientation). Do not tune it.

**Reference: open `docs/hero-motion-brief/references/feet-poster.jpg` before designing.** Match its material and depth, but do not reuse its text or copy its layout. What to take from it:

- Pale icy blue-white paper under a fine, even black dot grid.
- Marks are **narrow, elongated and irregular**, more like pressed soles and smeared contact than clean shoe icons. Keep the print styles recognizable, but let pressure break up their edges.
- Each black mark dissolves on one side into a smoky, out-of-focus blue-grey shadow. Dots step down smoothly from heavy to fine through that falloff.
- Marks sit at varied angles and in loose pairs, with generous empty paper between them.
- Shadows look like smoke or breath on glass, not like shapes. No outlines, no visible limb edges.
- The flare is wider, hotter and softer than the current one: a saturated orange-pink vertical column with bright four-point crossings and pale yellow cores. Retune the existing flare toward this look while keeping its behavior.

### Simulate a real 3D skeleton

Replace the 2D walker with a small 3D procedural character per walker, with Z = height above the glass:

- Joints: pelvis, L/R hip, knee, ankle, ball of foot, toe, plus a mid-waist point. **Nothing above mid-waist is simulated or drawn.**
- **Two-bone analytic IK** for each leg, with a pole vector so knees point along the direction of travel. Legs should never hyperextend; keep a slight bend at full reach.
- **Planted feet must not slide, at all.** A stance foot is locked to its world position until toe-off.

### Make it move like a person

- **Full gait phases:** heel strike, foot flat, heel rise, toe-off, swing. The swing foot follows an arc: lifts, clears, reaches, dorsiflexes before landing.
- **Weight transfer:** pelvis shifts over the stance foot, drops on the swing side, bobs twice per stride (lowest at double support), and rotates about Z with the stride. The waist counter-rotates against the pelvis.
- **Overlapping action:** pelvis and waist follow through a damped spring, so starts, stops and turns have lag and settle.
- **Turning:** the body leads, then the feet follow. A pivot happens on the ball of the planted foot with small shuffles, not a heading snap.
- **Being alive when not walking:** a paused walker keeps breathing and shifting weight. It may rock, settle onto one hip, or adjust a foot. Nothing is ever frozen.
- **Individuality, from the seed:** height, leg length, hip width, cadence, stride, toe-out angle, sway amount, slight left/right asymmetry, and a temperament (brisk, ambling, hesitant). Speed changes stride and cadence together. Add slow low-amplitude noise so no two cycles match.
- Use a fixed-timestep simulation so results are deterministic and frame-rate independent.

### Pressure-driven impressions

- Prints are **pressed**, not stamped. Contact rolls along the foot: heel darkens first, then the outer edge and ball, then toes at push-off, while the heel lifts away.
- Ink density follows pressure, so weight transfer is visible in the print.
- After lift-off the mark lingers and fades with a little soft bleed. Keep `trailLength` behavior.
- **Keep all six print styles and `mixed`** (`sneaker`, `barefoot`, `boot`, `heel`, `oxford`, `sandal`). A heel shoe must press its forefoot and stiletto as separate contacts. Make sure each is distinguishable at default settings. They weren't clearly so before.

### The flare is the light

This is the signature depth cue. **Treat the flare as a point light above the walkers**, at `(flare.x, flare.y, lightHeight)`. Project each 3D point `P` onto the glass:

```
S.xy = P.xy + (P.xy - L.xy) * P.z / (L.z - P.z)
```

Moving the pointer makes every shadow **swing around its planted feet**, and shadows radiate away from the flare, longer the further away a walker is. Contact points have `z = 0`, so **impressions do not move when the light moves.** That difference is what sells the 3D. Clamp `P.z / (L.z - P.z)` so shadows never shoot off to infinity, and smooth the light's motion. The existing idle drift keeps the shadows moving subtly with no pointer.

### Rendering

- Replace the Canvas2D density pass with a GPU pass if it's the better option (my expectation): an instanced render into a small RGBA8 target at about 2× grid resolution.
- Draw each limb as several **tapered capsule segments**, each with an analytic soft edge whose **penumbra grows with that segment's height**. Combine so overlaps don't double up or show seams, e.g. `1 - (1 - a)(1 - b)` (multiply blending of the inverse).
- Suggested channels: R = contact pressure, G = near shadow, B = far/diffuse shadow. Your call.
- Opacity falls off with height and reaches **exactly zero at mid-waist**. Legs are clearly less dense than feet.
- Halftone: **continuous dot radius from tone, no dithering.** The fine dots should swell smoothly through the shadow. Blue-grey paper tint carries the far, blurred part, so the shadow reads through both the dots and the paper.
- Keep the overlay text, live coordinate readout and the flare's pointer behavior as they are. Only the flare's look changes, per the reference notes above.

### New or changed tunables (in the panel)

`lightHeight`, `shadowLength` (clamp), `penumbra`, `shadowOpacity`, `bodyHeight`, `gaitEnergy`, `swayAmount`, `individuality`. Remove controls that no longer apply, and keep the rest.

---

## 3. Concept C: Liquid Metal (`site/lab/hero-motion/liquid/`, component `LiquidMetal`)

### References

Open and study these before writing any shader:

- `docs/hero-motion-brief/references/liquid-1-saddle.jpg`: broad curved masses, glowing amber-to-red rims, deep maroon cores, teal between them.
- `docs/hero-motion-brief/references/liquid-2-filaments.jpg`: stretched, folded ribbons and a large soft mass on near-black.
- `docs/hero-motion-brief/references/liquid-3-sphere.jpg`: a detached glossy droplet on a stretched stream, in a deep, mostly empty dark space.

Do not reproduce any of them as a fixed composition. Capture the material, color, softness and grain.

### The feeling

**A sealed three-dimensional space filled with heavy, glowing liquid metal, drifting in low gravity.** Smooth, slow, warping and hypnotic, like a lava lamp with no glass and almost no gravity. Masses swell, stretch into necks and ribbons, pinch off into droplets, drift, and merge back. Nothing jitters, pops, snaps or moves at constant speed.

### Color (sampled from the references)

| Role | Hex |
| --- | --- |
| Void / background | `#181c21` |
| Deep teal | `#133236` |
| Teal mid | `#1c4345` |
| Sage transition | `#415a54` |
| Tan transition | `#987d57` |
| Amber / peach | `#ea843e` (hot rim up to about `#f5a254`) |
| Orange | `#f56c36` |
| Signal red | `#e22e20` |
| Crimson | `#871922` |
| Oxblood core | `#2b141a` |

The defining color behavior: **the bands follow the surface form in a fixed order**: void → teal → sage/tan → amber → orange → red → crimson → near-black core. Those thin hot rims with dark centers are the look. Build this as a **swappable 1D ramp**, indexed mainly by view-facing angle (fresnel) plus thickness and a slow warp. **Do not use physically based lighting or chrome reflections.** "Metal" comes from the fluid, glossy form and the hot rim. Keep most of the frame dark, roughly as in references 2 and 3, with a `coverage` control to go up to the fuller look of reference 1.

### Motion and simulation

- CPU sim of about 10–16 blobs in a 3D volume with fixed timestep: very weak gravity, buoyancy from a slow per-blob heat cycle (rise when hot, sink when cool), strong drag, soft cohesion and repulsion, a gentle containment force, and a slow divergence-free (curl-noise) current. Each blob's velocity stretches it along its motion.
- No hard respawns. Everything must stay continuous indefinitely.
- Timescales: large motion over 20–40 seconds. It should be visibly alive within 2 seconds of watching, but never busy.

### Rendering

- **Exploit the softness:** the image has no hard detail, so raymarch at low internal resolution (start about 1/3–1/4 of output, capped), then upscale with a bicubic or similarly smooth filter. Grain is added afterward at **full device resolution**, which hides the upscale.
- Raymarch a smooth-min union of stretched ellipsoids, with **low-frequency domain warp** applied to the field to produce ribbons, folds and necks. Target ≤ 32 steps with a bounded volume.
- **Depth cues are required:** perspective, depth of field (far and very near masses are softer; use the minimum distance along the ray for soft analytic edges instead of a hard hit), teal atmospheric falloff with depth, and masses visibly passing in front of one another.
- Very slow camera drift so parallax confirms the space is 3D.

### The grain ("grainy shader" look)

Non-negotiable, and it must match the references:

- Fine monochrome film grain at full device resolution, about **6–7 / 255 standard deviation** on average (measured from the references), stronger in midtones and gradients, less in pure black and hot highlights.
- Slightly clumped rather than per-pixel digital static.
- Re-seeded at about 12–18 fps, not every frame, so it reads as film.
- Grain also dithers the gradients. **There must be zero visible banding** in the dark teal falloffs.
- `grainAmount: 0` must remain possible for comparison.

### Tunables

`blobCount`, `coverage`, `viscosity` (blend softness), `warpAmount`, `warpScale`, `flowSpeed`, `gravity`, `buoyancy`, `stretch`, `rimWidth`, `depthOfField`, `fogAmount`, `cameraDrift`, `grainAmount`, `grainSize`, `grainFps`, `renderScale`, `palette`, `seed`.

Add C to `/lab` with its own panel, size presets, bench link (`?bench=liquid`), and export it from `index.ts`. Under reduced motion it holds one well-composed frame with static grain.

---

## 4. Verification (do this before you report)

Look at real output and keep iterating until it holds up. Passing a typecheck is not evidence that it looks good.

1. **Motion contact sheets.** Capture sequences of 8–12 frames for A and C and review them. For A, check one full stride: the foot stays planted, the heel rolls, the pelvis shifts, the shadow moves.
2. **Depth test for A.** Move the flare across the frame and confirm by screenshot that impressions stay put while shadows swing.
3. **Reference tests.** For A, view a frame next to `feet-poster.jpg` and compare mark shape, shadow falloff, dot gradation and flare. For C, view your frame next to each liquid reference at the same size and compare color order, rim thickness, darkness, and grain at 100% zoom.
4. **Screenshot caution.** The canvas fades in over 400 ms and the pane can scale the viewport, so take comparisons after it settles, at known size. Earlier tuning was misled by this.
5. **Frame time.** Use the existing `?bench=` mode at 2560×1440 on this machine's Intel Iris Xe. Target **≤ 12 ms** average per frame for each concept, including GPU sync. Also report the live rAF interval. The embedded pane previously capped at 30 fps at that buffer size, so don't claim 60 fps from it; state what you could and couldn't confirm.
6. **Regression checks.** Pause, offscreen, hidden tab, reduced motion, resize from full-bleed to small card, prop hot-update without remount, clicks passing through to content above the canvas, no console errors, and no JS heap growth over 60 seconds.
7. **Build gates.** In `site/`: `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm run build`. Confirm `/lab`, three and tweakpane are absent from `out/`.

## 5. Deliver

- Updated READMEs with final defaults, including how the depth model and the liquid pipeline work.
- For A and C, the **three tunables that most change the feel**, with suggested ranges.
- A short report: what changed, measured frame times and how you measured them, anything in this brief you changed and why, and anything you could not verify. Do not describe something as verified unless you actually observed it.
