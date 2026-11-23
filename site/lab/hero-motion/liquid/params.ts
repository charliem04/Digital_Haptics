/** Props and defaults for Concept C. Plain data: safe to import anywhere. */

export type LiquidStop = {
  /** Position on the ramp, 0 (empty space) to 1 (the core of a mass). */
  at: number;
  /** "#rrggbb" */
  color: string;
};

export type LiquidParams = {
  /** How many masses share the space, 3–16. */
  blobCount: number;
  /** How much of the frame the liquid fills, 0 (sparse) to 1 (full). */
  coverage: number;
  /** How readily masses fuse: 0 keeps them as separate beads, 1 is syrup. */
  viscosity: number;
  /** Strength of the slow lens-like warp that bends everything, 0–2. */
  warpAmount: number;
  /** Size of that warp's folds: higher is tighter. */
  warpScale: number;
  /** Speed of the background current that carries the masses. */
  flowSpeed: number;
  /** Downward pull. Keep it small: this is a low-gravity space. */
  gravity: number;
  /** How hard warm masses rise and cool ones sink. */
  buoyancy: number;
  /** How far a moving mass stretches along its direction of travel. */
  stretch: number;
  /** Width of the hot rim before the colour falls into the dark core, 0–1. */
  rimWidth: number;
  /** How much masses soften away from the focal plane, 0–1.5. */
  depthOfField: number;
  /** Teal haze that swallows distant masses, 0–1. */
  fogAmount: number;
  /** Slow camera sway, which is what makes the depth read as depth. */
  cameraDrift: number;
  /** Film grain strength. 1 matches the references; 0 turns it off. */
  grainAmount: number;
  /** Grain clump size, device px. */
  grainSize: number;
  /** How often the grain is re-drawn, per second. Film, not video. */
  grainFps: number;
  /** Fraction of the output resolution the liquid is rendered at. */
  renderScale: number;
  /** The colour ramp, from empty space to the core of a mass. */
  palette: LiquidStop[];
  seed: number;
};

/**
 * Sampled from the three reference images. The order is the look: space
 * → teal glow → a thin tan-to-amber rim → orange → red → a dark core.
 */
export const LIQUID_PALETTE: LiquidStop[] = [
  { at: 0, color: "#181c21" },
  { at: 0.1, color: "#133236" },
  { at: 0.2, color: "#1c4345" },
  { at: 0.27, color: "#415a54" },
  { at: 0.32, color: "#987d57" },
  { at: 0.37, color: "#f5a254" },
  { at: 0.43, color: "#ea843e" },
  { at: 0.54, color: "#f56c36" },
  { at: 0.66, color: "#e22e20" },
  { at: 0.82, color: "#871922" },
  { at: 1, color: "#2b141a" },
];

export const LIQUID_DEFAULTS: LiquidParams = {
  blobCount: 9,
  coverage: 0.32,
  viscosity: 0.7,
  warpAmount: 1,
  warpScale: 1,
  flowSpeed: 1,
  gravity: 0.3,
  buoyancy: 1,
  stretch: 1,
  rimWidth: 0.5,
  depthOfField: 0.7,
  fogAmount: 0.6,
  cameraDrift: 1,
  grainAmount: 1,
  grainSize: 1.6,
  grainFps: 15,
  renderScale: 0.3,
  palette: LIQUID_PALETTE,
  seed: 5,
};

/** Shader array size. `blobCount` is clamped to this. */
export const MAX_BLOBS = 16;
