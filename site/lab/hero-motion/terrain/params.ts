/** Props and defaults for Concept B. Plain data: safe to import anywhere. */

export type PaletteStop = {
  /** Elevation, 0 (lowest) to 1 (peaks). */
  at: number;
  /** "#rrggbb" */
  color: string;
};

export type TerrainParams = {
  /** On-screen distance between neighbouring points, CSS px. */
  pointSpacingPx: number;
  /** Point diameter, CSS px. */
  pointSize: number;
  pointShape: "square" | "round";
  /** How far a peak is pushed along the camera's up axis, CSS px. */
  heightScale: number;
  /** Base features per tile. Higher = busier terrain. */
  noiseScale: number;
  /** fBm octaves, 1–6. */
  octaves: number;
  /** 0 = soft rolling fBm, 1 = sharp ridges. */
  ridgeMix: number;
  /**
   * Whole tiles travelled per loop on each axis. Integers only: that is
   * what makes the loop seamless (see README). [1, 1] is a slow diagonal.
   */
  scrollDirection: [number, number];
  /** Seconds for one seamless loop. */
  loopDuration: number;
  /** Travelling-wave height, as a fraction of full elevation. */
  waveAmplitude: number;
  /** Wave crests across 1000 CSS px. */
  waveFrequency: number;
  /** Degrees off straight-down. */
  cameraTilt: number;
  /** Vertical field of view, degrees. */
  fov: number;
  palette: PaletteStop[];
  /** Optional grayscale heightmap URL (PNG/JPG/WebP, or .exr). */
  heightmap: string | null;
  seed: number;
  /** "cover" fills the container; "contain" shows the whole plane inside it. */
  aspectFit: "cover" | "contain";
  /** Hard cap on point count. Spacing widens to stay under it. */
  maxPoints: number;
  /** Side of one terrain tile, CSS px. The scroll moves one of these per loop. */
  tileSizePx: number;
  /** Per-point brightness jitter, 0–1. */
  grain: number;
  /**
   * Debug: freeze on the first frame of the loop ("start") or the frame
   * exactly one loop later ("end"). They should be the same picture.
   */
  debugFrame: "start" | "end" | null;
};

export const TERRAIN_PALETTE: PaletteStop[] = [
  { at: 0, color: "#0f5b4a" },
  { at: 0.42, color: "#2fd1a6" },
  { at: 0.76, color: "#d8f08a" },
  { at: 1, color: "#8a5a33" },
];

export const TERRAIN_DEFAULTS: TerrainParams = {
  pointSpacingPx: 6,
  pointSize: 2,
  pointShape: "square",
  heightScale: 64,
  noiseScale: 3.2,
  octaves: 5,
  ridgeMix: 0.55,
  scrollDirection: [1, 1],
  loopDuration: 20,
  waveAmplitude: 0.05,
  waveFrequency: 2.5,
  cameraTilt: 14,
  fov: 22,
  palette: TERRAIN_PALETTE,
  heightmap: null,
  seed: 7,
  aspectFit: "cover",
  maxPoints: 160_000,
  tileSizePx: 1800,
  grain: 0.22,
  debugFrame: null,
};
