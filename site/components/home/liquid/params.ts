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
};

export const DESKTOP_MAX_DPR = 2;
export const PHONE_MAX_DPR = 1.5;

export const DESKTOP: LiquidSettings = { ...tuning.desktop, maxDpr: DESKTOP_MAX_DPR };
export const PHONE: LiquidSettings = { ...tuning.phone, maxDpr: PHONE_MAX_DPR };

/** Perf probe (lib/perf.ts): the base settings with any URL overrides. */
export function pickSettings(
  phone: boolean,
  overrides: Partial<Pick<LiquidSettings, "renderScale" | "blobCount" | "maxDpr">> & {
    tier?: "phone" | "desktop";
  } = {}
): LiquidSettings {
  const base = (overrides.tier ? overrides.tier === "phone" : phone) ? PHONE : DESKTOP;
  return {
    blobCount: Math.round(overrides.blobCount ?? base.blobCount),
    renderScale: overrides.renderScale ?? base.renderScale,
    maxDpr: overrides.maxDpr ?? base.maxDpr,
  };
}

/** The runtime step-down when a device is struggling (VISUAL_GUIDE §10.3). */
export const STEP_DOWN_SCALE = 0.2;

export type LiquidLook = typeof tuning.look;

export const LOOK: Readonly<LiquidLook> = tuning.look;
