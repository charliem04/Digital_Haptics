/**
 * Liquid hero settings (docs/VISUAL_GUIDE.md §6). Plain data, safe to
 * import from the page's first chunk: no WebGL code lives here.
 */

/** Shader array size. */
export const MAX_BLOBS = 16;

/** The colour ramp, from empty space to the core of a mass. */
export const RAMP: readonly { at: number; color: string }[] = [
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

export type LiquidSettings = {
  blobCount: number;
  renderScale: number;
  maxDpr: number;
};

export const DESKTOP: LiquidSettings = { blobCount: 9, renderScale: 0.3, maxDpr: 2 };
export const PHONE: LiquidSettings = { blobCount: 6, renderScale: 0.24, maxDpr: 1.5 };

/** The runtime step-down when a device is struggling (VISUAL_GUIDE §10.3). */
export const STEP_DOWN_SCALE = 0.2;

export const LOOK = {
  seed: 5,
  coverage: 0.46,
  flowSpeed: 0.7,
  viscosity: 0.7,
  warpAmount: 1,
  warpScale: 1,
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
} as const;
