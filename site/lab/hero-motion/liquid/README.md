# Concept C — liquid metal in low gravity

A sealed room of heavy, glowing liquid, drifting. Masses swell, stretch into necks, pass in front of one another and fuse. A thin hot rim falls away through orange and red into a near-black core; teal haze fills the space between. Fine film grain sits over everything.

## Per frame

1. **Blobs** (`blobs.ts`). A CPU simulation of up to 16 masses on a fixed 60 Hz timestep.
2. **Camera.** Sways on two slow, unrelated periods, always looking at the middle of the room, so near and far masses slide past each other.
3. **March** (`marchFrag`). The liquid is drawn into a small half-float target, by default 30% of the output each way and never more than about 520,000 pixels.
4. **Present** (`presentFrag`). That target is enlarged with a bicubic filter, and film grain is added at the screen's full device resolution.

The picture has no fine detail by design, so step 3 can be small. The grain is the only thing drawn at full resolution, and it is what the eye reads as sharpness.

## The simulation: a lava lamp without the glass

- **Heat.** Each mass has a temperature. Near the floor it slowly warms; near the ceiling it slowly cools. Warm masses rise and cool ones sink, which is the slow cycle everything else rides on.
- **Current.** A divergence-free flow (an ABC flow: each component depends only on the other two axes) stirs the room without piling liquid up anywhere. Its wavelength is shorter than the room, so different regions move differently.
- **Chains.** Masses come in threes: a head and two smaller followers tied to it. Moving, a chain strings out into a tapering stream; at rest it draws back into one body. Masses in a chain attract each other; different chains keep a wide, gentle distance, so the room holds several bodies rather than one.
- **Drag** is heavy and gravity is weak. Nothing coasts, bounces or snaps.
- **Stretch.** A moving mass elongates along its direction of travel.

Nothing is removed or respawned, so it runs indefinitely. The simulation runs 45 seconds before the first frame.

## Finding the surface

Each mass is a soft density, `exp(K · (1 − |M(p − c)|² / r²))`, where `M` squashes space along the mass's stretch axis. The surface is where all the densities sum to 1, which is what makes masses fuse into necks and bridges.

Along a straight ray, `|M(p − c)|²` is a quadratic in the ray parameter, so each mass's density along the ray is exactly a 1D Gaussian. Its amplitude, centre and width are worked out once per mass per pixel. Marching the ray then costs one `exp` per mass per step, with 22 steps and a short bisection, and no distance field. The amplitude alone already says how closely the ray passes each mass, which gives the glow outside the surface for free, so nothing has a hard edge.

`viscosity` sets `K`: a shallow falloff fuses neighbours from further away.

## Colour

A 256-texel ramp built from `palette`, in a fixed order: space → teal → sage → tan → hot amber rim → orange → red → crimson → near-black core.

- A ray that misses is coloured by how close it came, from space up to the rim.
- A ray that hits is coloured from the rim inward by how squarely the surface faces the camera, scaled by how thick the body is there. A droplet or thin stream never reaches the dark core; a big mass does.
- If a nearer mass grazed the ray before it hit something further away, that near-miss is laid over as a glow, so a mass in front has a lit edge against the one behind.

There is no lighting model and no reflection. "Metal" is the glossy form and the hot rim.

## Depth

Perspective, the camera sway, masses occluding each other, teal haze that swallows distant masses (`fogAmount`), and focus: rims and glows spread wider on masses away from the focal plane (`depthOfField`). A slow lens-like warp bends every ray slightly (`warpAmount`), and each mass's outline swells and tucks in slow lobes, so shapes shear and fold instead of reading as ellipsoids.

## Grain

- Added in the present pass at full device resolution, so it hides the upscale.
- Two layers: fine per-grain noise and a coarser clumping.
- Strongest through midtones and gradients, held back in the blacks and on the hottest highlights.
- Re-seeded `grainFps` times a second, not every frame.
- Measured on a default frame: 6.5/255 standard deviation against a local average. The three references measure 6.4–7.5.
- The scene target is half-float, so the dark teal falloffs are still smooth when the grain dithers them. With `grainAmount: 0` a one-step dither remains.

## Final defaults

| Prop           | Default | Notes                                               |
| -------------- | ------- | --------------------------------------------------- |
| `blobCount`    | `9`     | 3–16; three chains of three                         |
| `coverage`     | `0.32`  | about half the frame stays dark; 1 is the full look |
| `viscosity`    | `0.7`   | 0 separate beads, 1 syrup                           |
| `warpAmount`   | `1`     | 0–2                                                 |
| `warpScale`    | `1`     | higher is tighter folds                             |
| `flowSpeed`    | `1`     |                                                     |
| `gravity`      | `0.3`   |                                                     |
| `buoyancy`     | `1`     |                                                     |
| `stretch`      | `1`     |                                                     |
| `rimWidth`     | `0.5`   | 0–1                                                 |
| `depthOfField` | `0.7`   | 0–1.5                                               |
| `fogAmount`    | `0.6`   | 0–1                                                 |
| `cameraDrift`  | `1`     | 0 locks the camera                                  |
| `grainAmount`  | `1`     | 1 matches the references                            |
| `grainSize`    | `1.6`   | device px                                           |
| `grainFps`     | `15`    |                                                     |
| `renderScale`  | `0.3`   | fraction of output resolution, capped               |
| `palette`      | below   | space → core                                        |
| `seed`         | `5`     |                                                     |

Palette, sampled from the references: `#181c21` 0 · `#133236` 0.10 · `#1c4345` 0.20 · `#415a54` 0.27 · `#987d57` 0.32 · `#f5a254` 0.37 · `#ea843e` 0.43 · `#f56c36` 0.54 · `#e22e20` 0.66 · `#871922` 0.82 · `#2b141a` 1.

## The three that change the feel most

| Prop        | Try        | What it does                                                                                        |
| ----------- | ---------- | --------------------------------------------------------------------------------------------------- |
| `coverage`  | 0.15 – 0.8 | Low: a few bodies adrift in a dark room. High: the frame fills with broad curved masses and rims.   |
| `viscosity` | 0.3 – 0.95 | Low: distinct droplets that touch and part. High: everything bridges and flows as one thick liquid. |
| `flowSpeed` | 0.4 – 2.5  | The pace of the whole room. Below 1 it is meditative; above 2 it starts to feel stirred.            |

## Notes on the brief

- **The warp is a lens, not a warped field.** Warping the density field itself would break the exact-Gaussian property the march depends on. Bending the rays, plus per-mass lobes and chains, gets the folds and necks at a fraction of the cost.
- **Step count is 22 plus 4 bisection steps**, under the 32 asked for.
- **Volume is not conserved when a mass stretches.** It gets longer without getting thinner. In motion this reads as the liquid surging; it is a deliberate simplification.
- **Reduced motion** holds one frame with one fixed grain pattern.
