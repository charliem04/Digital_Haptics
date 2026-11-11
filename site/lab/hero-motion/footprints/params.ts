/** Props and defaults for Concept A. Plain data: safe to import anywhere. */

/** Keep in step with PRINT_STYLES in sprites.ts (which needs the DOM). */
export type PrintStyleOption =
  | "mixed"
  | "sneaker"
  | "barefoot"
  | "boot"
  | "heel"
  | "oxford"
  | "sandal";

export type FeetParams = {
  /** Distance between dot centres, CSS px. */
  gridSpacing: number;
  /** Radius of a background dot, CSS px. */
  baseDotRadius: number;
  /** Radius of a dot fully inside a footprint, CSS px. */
  maxDotRadius: number;
  dotColor: string;
  paperColor: string;
  haloColor: string;
  /** Size of the soft halo around each print, 0–1.5. */
  haloBlur: number;
  /** How many walkers share the frame, 1–12. */
  walkers: number;
  /** CSS px per second. */
  walkSpeed: number;
  /** CSS px between one footfall and the next. */
  strideLength: number;
  /** Chance per step of stopping to pivot, 0–1. */
  pivotChance: number;
  /** Prints each walker leaves behind before they fade. */
  trailLength: number;
  /** 1 = a print about 150 CSS px long. */
  footScale: number;
  /** 0 hides the flare. */
  flareIntensity: number;
  /** Smoothing time of the pointer follow, ms. */
  flareFollowLag: number;
  /** ms */
  flareFadeIn: number;
  /** ms */
  flareFadeOut: number;
  /** Seconds for one idle fade-in/fade-out cycle. */
  flareIdleCycle: number;
  /** A second, fainter horizontal line. */
  secondaryLine: boolean;
  seed: number;
  /** Opacity of the background dots, 0–1. */
  baseDotOpacity: number;
  /** Which shoe leaves the prints. "mixed" gives each walker their own. */
  printStyle: PrintStyleOption;
  /**
   * Height of the leg-and-waist silhouette above each walker's feet, in
   * print lengths, measured to mid-waist where it ends. 0 removes it.
   */
  bodyHeight: number;
  /** How strongly the silhouette is drawn, 0–1. */
  bodyDensity: number;
};

export const FEET_DEFAULTS: FeetParams = {
  gridSpacing: 9,
  baseDotRadius: 0.8,
  maxDotRadius: 4.1,
  dotColor: "#0b0d10",
  paperColor: "#dfe9ee",
  haloColor: "#8ea8bd",
  haloBlur: 0.6,
  walkers: 5,
  walkSpeed: 96,
  strideLength: 124,
  pivotChance: 0.07,
  trailLength: 4,
  footScale: 1,
  flareIntensity: 1,
  flareFollowLag: 250,
  flareFadeIn: 600,
  flareFadeOut: 900,
  flareIdleCycle: 9,
  secondaryLine: true,
  seed: 11,
  baseDotOpacity: 0.34,
  printStyle: "mixed",
  bodyHeight: 2.1,
  bodyDensity: 0.8,
};

/** Length of a print at footScale 1, CSS px. */
export const FOOT_LENGTH = 150;
