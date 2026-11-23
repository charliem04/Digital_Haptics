/**
 * The shape and limits of components/home/liquid/tuning.json. Used by the
 * tuner's sliders and by its save endpoint, so a bad value can never
 * reach the file the homepage reads.
 */

export type Range = { min: number; max: number; step: number };

export const LOOK_RANGES = {
  seed: { min: 0, max: 999, step: 1 },
  coverage: { min: 0, max: 1, step: 0.01 },
  flowSpeed: { min: 0, max: 4, step: 0.01 },
  viscosity: { min: 0, max: 1, step: 0.01 },
  warpAmount: { min: 0, max: 2, step: 0.01 },
  warpScale: { min: 0.3, max: 3, step: 0.01 },
  gravity: { min: 0, max: 2, step: 0.01 },
  buoyancy: { min: 0, max: 3, step: 0.01 },
  stretch: { min: 0, max: 2.5, step: 0.01 },
  rimWidth: { min: 0, max: 1, step: 0.01 },
  depthOfField: { min: 0, max: 1.5, step: 0.01 },
  fogAmount: { min: 0, max: 1, step: 0.01 },
  cameraDrift: { min: 0, max: 3, step: 0.01 },
  grainAmount: { min: 0, max: 2.5, step: 0.01 },
  grainSize: { min: 0.5, max: 5, step: 0.05 },
  grainFps: { min: 1, max: 60, step: 1 },
} as const satisfies Record<string, Range>;

export const DEVICE_RANGES = {
  blobCount: { min: 3, max: 16, step: 1 },
  renderScale: { min: 0.15, max: 1, step: 0.01 },
} as const satisfies Record<string, Range>;

/** The ramp's stops, from empty space to the core of a mass. */
export const STOP_NAMES = [
  "Space",
  "Deep teal",
  "Teal",
  "Sage",
  "Tan",
  "Hot rim",
  "Amber",
  "Orange",
  "Red",
  "Crimson",
  "Core",
] as const;

const STOP_POSITIONS = [0, 0.1, 0.2, 0.27, 0.32, 0.37, 0.43, 0.54, 0.66, 0.82, 1];

export type LookKey = keyof typeof LOOK_RANGES;
export type DeviceKey = keyof typeof DEVICE_RANGES;
export type TunedDevice = Record<DeviceKey, number>;
export type Tuning = {
  look: Record<LookKey, number>;
  desktop: TunedDevice;
  phone: TunedDevice;
  ramp: { at: number; color: string }[];
};

function record(value: unknown, path: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`${path} must be an object`);
  }
  return value as Record<string, unknown>;
}

function inRange(value: unknown, range: Range, path: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${path} must be a number`);
  }
  if (value < range.min || value > range.max) {
    throw new Error(`${path} must be between ${range.min} and ${range.max}`);
  }
  if (range.step === 1 && !Number.isInteger(value)) {
    throw new Error(`${path} must be a whole number`);
  }
  // Sliders leave floating-point noise (0.4600000000000001).
  return range.step === 1 ? value : Number(value.toFixed(2));
}

function device(value: unknown, path: string): TunedDevice {
  const source = record(value, path);
  return {
    blobCount: inRange(source.blobCount, DEVICE_RANGES.blobCount, `${path}.blobCount`),
    renderScale: inRange(source.renderScale, DEVICE_RANGES.renderScale, `${path}.renderScale`),
  };
}

/** Returns a clean copy holding only known keys, or throws. */
export function validateTuning(input: unknown): Tuning {
  const source = record(input, "tuning");
  const lookSource = record(source.look, "look");
  const look = {} as Tuning["look"];
  for (const key of Object.keys(LOOK_RANGES) as LookKey[]) {
    look[key] = inRange(lookSource[key], LOOK_RANGES[key], `look.${key}`);
  }

  if (!Array.isArray(source.ramp) || source.ramp.length !== STOP_POSITIONS.length) {
    throw new Error(`ramp must have ${STOP_POSITIONS.length} stops`);
  }
  const ramp = source.ramp.map((value: unknown, i: number) => {
    const stop = record(value, `ramp[${i}]`);
    if (stop.at !== STOP_POSITIONS[i]) throw new Error(`ramp[${i}].at cannot change`);
    if (typeof stop.color !== "string" || !/^#[0-9a-f]{6}$/i.test(stop.color)) {
      throw new Error(`ramp[${i}].color must be a hex colour`);
    }
    return { at: STOP_POSITIONS[i], color: stop.color.toLowerCase() };
  });

  return {
    look,
    desktop: device(source.desktop, "desktop"),
    phone: device(source.phone, "phone"),
    ramp,
  };
}
