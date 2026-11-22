/** Public surface of the hero motion lab. See README.md. */
export { TopoTerrain } from "./terrain/TopoTerrain";
export type { TopoTerrainHandle, TopoTerrainProps } from "./terrain/TopoTerrain";
export { TERRAIN_DEFAULTS, TERRAIN_PALETTE } from "./terrain/params";
export type { PaletteStop, TerrainParams } from "./terrain/params";

export { WanderingFeet, FEET_LABELS } from "./footprints/WanderingFeet";
export type {
  FeetLabels,
  WanderingFeetHandle,
  WanderingFeetProps,
} from "./footprints/WanderingFeet";
export { FEET_DEFAULTS } from "./footprints/params";
export type { FeetParams } from "./footprints/params";

export { LiquidMetal } from "./liquid/LiquidMetal";
export type { LiquidMetalHandle, LiquidMetalProps } from "./liquid/LiquidMetal";
export { LIQUID_DEFAULTS, LIQUID_PALETTE } from "./liquid/params";
export type { LiquidParams, LiquidStop } from "./liquid/params";

export type { HeroMotionHandle } from "./shared/useStage";
export type { BenchResult, FrameStats } from "./shared/stage";
