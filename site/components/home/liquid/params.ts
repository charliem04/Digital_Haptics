import tuning from "./tuning.json";

/**
 * Liquid hero settings (docs/VISUAL_GUIDE.md §6). Plain data, safe to
 * import from the page's first chunk: no WebGL code lives here.
 *
 * The tunable values live in tuning.json. Edit them with the tuner:
 * `npm run dev`, then open /lab/liquid/.
 */

/** Shader array size. */
export const MAX_BLOBS = 16;

export type RampStop = { at: number; color: string };

/** The colour ramp, from empty space to the core of a mass. */
export const RAMP: readonly RampStop[] = tuning.ramp;

export type LiquidSettings = {
  blobCount: number;
  renderScale: number;
  maxDpr: number;
  /**
   * Most device pixels the canvas may have. The final pass (upscale and
   * grain) runs on every one of them, every frame, so on a large or
   * high-density screen this is what decides the cost (docs/perf/PHASE0.md).
   * Past it, the canvas drops its pixel ratio, though never below 1.
   */
  maxCanvasPixels: number;
  /** Frames drawn per second. The liquid is slow; 30 reads the same as 60. */
  fps: number;
};

export const DESKTOP_MAX_DPR = 2;
export const PHONE_MAX_DPR = 1.5;
/** About a 1536 x 864 laptop at 1.5x, or 1080p at 1.25x. */
export const DESKTOP_MAX_CANVAS_PIXELS = 3_000_000;
export const PHONE_MAX_CANVAS_PIXELS = 1_000_000;
export const LIQUID_FPS = 30;

export const DESKTOP: LiquidSettings = {
  ...tuning.desktop,
  maxDpr: DESKTOP_MAX_DPR,
  maxCanvasPixels: DESKTOP_MAX_CANVAS_PIXELS,
  fps: LIQUID_FPS,
};
export const PHONE: LiquidSettings = {
  ...tuning.phone,
  maxDpr: PHONE_MAX_DPR,
  maxCanvasPixels: PHONE_MAX_CANVAS_PIXELS,
  fps: LIQUID_FPS,
};

/** Perf probe (lib/perf.ts): the base settings with any URL overrides. */
export function pickSettings(
  phone: boolean,
  overrides: Partial<
    Pick<LiquidSettings, "renderScale" | "blobCount" | "maxDpr" | "maxCanvasPixels" | "fps">
  > & {
    tier?: "phone" | "desktop";
  } = {}
): LiquidSettings {
  const base = (overrides.tier ? overrides.tier === "phone" : phone) ? PHONE : DESKTOP;
  return {
    blobCount: Math.round(overrides.blobCount ?? base.blobCount),
    renderScale: overrides.renderScale ?? base.renderScale,
    maxDpr: overrides.maxDpr ?? base.maxDpr,
    // An explicit ?perf&dpr= is a test of that ratio: lift the budget.
    maxCanvasPixels:
      overrides.maxCanvasPixels ?? (overrides.maxDpr ? Infinity : base.maxCanvasPixels),
    fps: overrides.fps ?? base.fps,
  };
}

/**
 * The runtime step-down when a device is struggling (VISUAL_GUIDE §10.3):
 * a smaller scene, the canvas at 1x and half the pixel budget. The pixel
 * ratio is the lever that matters; the scene is capped already.
 */
export const STEP_DOWN_SCALE = 0.2;
export const STEP_DOWN_DPR = 1;

export type LiquidLook = typeof tuning.look;

export const LOOK: Readonly<LiquidLook> = tuning.look;
