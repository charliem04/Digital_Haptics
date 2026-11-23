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
  /** Radius of a dot under a fully pressed sole, CSS px. */
  maxDotRadius: number;
  dotColor: string;
  paperColor: string;
  /** The blue-grey a shadow tints the paper. */
  haloColor: string;
  /** Soft halo hugging each print, 0–1.5. Separate from the body shadow. */
  haloBlur: number;
  /** How many walkers share the frame, 1–12. */
  walkers: number;
  /** Cruising speed, CSS px per second. */
  walkSpeed: number;
  /** CSS px between one footfall and the next at cruising speed. */
  strideLength: number;
  /** Chance at each footfall of stopping to pivot, 0–1. */
  pivotChance: number;
  /** Lifted prints each walker leaves behind before they fade. */
  trailLength: number;
  /** 1 = a print about 150 CSS px long. The whole body scales with it. */
  footScale: number;
  /** 0 hides the flare. It is still the light: shadows stay. */
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

  /* ── the body on the other side of the glass ─────────────────────── */

  /**
   * Feet to mid-waist, in print lengths. Nothing above mid-waist exists.
   * About 4.2 is anatomical; lower is squatter, with shorter shadows.
   */
  bodyHeight: number;
  /**
   * Height of the light (the flare) above the glass, CSS px. Lower makes
   * shadows longer and swing further as the flare moves.
   */
  lightHeight: number;
  /** Cap on how far a shadow may be thrown, as a multiple of its distance from the light. */
  shadowLength: number;
  /** How fast a shadow blurs with height above the glass. */
  penumbra: number;
  /** Strength of the cast shadow, 0–1. */
  shadowOpacity: number;
  /** Liveliness: cadence, acceleration, foot lift. 1 is an easy amble. */
  gaitEnergy: number;
  /** How much the hips shift, turn and tip, 0–2. */
  swayAmount: number;
  /** How different the walkers are from one another, 0–2. */
  individuality: number;
  /** How wide the trousers are cut. 1 is a relaxed straight leg. */
  pantsWidth: number;
  /** Hem width against the knee. Below 1 tapers, above 1 flares. */
  pantsHem: number;
  /** How much the cloth trails the leg and folds above the hem, 0–2. */
  pantsDrape: number;
};

export const FEET_DEFAULTS: FeetParams = {
  gridSpacing: 9,
  baseDotRadius: 0.8,
  maxDotRadius: 4.1,
  dotColor: "#0b0d10",
  paperColor: "#dfe9ee",
  haloColor: "#7f9fba",
  haloBlur: 0.5,
  walkers: 4,
  walkSpeed: 120,
  strideLength: 175,
  pivotChance: 0.06,
  trailLength: 3,
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
  bodyHeight: 3.4,
  lightHeight: 1150,
  shadowLength: 1.6,
  penumbra: 0.13,
  shadowOpacity: 0.85,
  gaitEnergy: 1,
  swayAmount: 1,
  individuality: 1,
  pantsWidth: 1,
  pantsHem: 1.05,
  pantsDrape: 1,
};

/** Length of a print at footScale 1, CSS px. */
export const FOOT_LENGTH = 150;
