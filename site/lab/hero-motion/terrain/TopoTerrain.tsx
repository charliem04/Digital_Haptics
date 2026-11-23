"use client";

import { forwardRef, type CSSProperties } from "react";
import { useStage, type HeroMotionHandle } from "../shared/useStage";
import type { StageOptions } from "../shared/stage";
import shell from "../shared/stage.module.css";
import { TERRAIN_DEFAULTS, type TerrainParams } from "./params";
import type { TerrainEngine } from "./engine";

export type TopoTerrainProps = Partial<TerrainParams> & {
  className?: string;
  /** Freeze the animation on the current frame. */
  paused?: boolean;
  /** Lab only: forces a device pixel ratio for benchmarking. */
  stageOptions?: StageOptions;
};

export type TopoTerrainHandle = HeroMotionHandle<TerrainEngine>;

const load = () => import("./engine").then((m) => m.createTerrainEngine);

/**
 * Server-rendered and pre-WebGL fallback: black with a dim teal dot
 * grid at the same pitch, so the canvas fades in over something close.
 */
function fallbackStyle(spacing: number, color: string): CSSProperties {
  return {
    backgroundColor: "#000",
    backgroundImage: `radial-gradient(${color} 1px, transparent 1.4px)`,
    backgroundSize: `${spacing}px ${spacing}px`,
    backgroundPosition: "center",
    opacity: 0.9,
  };
}

/**
 * Concept B — topographic dot terrain, scrolling in a seamless loop.
 *
 * Fills its nearest positioned ancestor. Every prop hot-updates; the
 * canvas is never remounted.
 */
export const TopoTerrain = forwardRef<TopoTerrainHandle, TopoTerrainProps>(function TopoTerrain(
  { className, paused = false, stageOptions, ...overrides },
  ref
) {
  const params: TerrainParams = { ...TERRAIN_DEFAULTS, ...stripUndefined(overrides) };
  const { rootRef, canvasRef, ready } = useStage<TerrainParams, TerrainEngine>(
    load,
    params,
    paused,
    ref,
    undefined,
    stageOptions
  );

  return (
    <div
      ref={rootRef}
      aria-hidden
      className={className ? `${shell.root} ${className}` : shell.root}
      style={{ backgroundColor: "#000" }}
    >
      <div
        className={shell.fallback}
        style={fallbackStyle(params.pointSpacingPx, params.palette[0]?.color ?? "#0f5b4a")}
      />
      <canvas ref={canvasRef} className={shell.canvas} data-ready={ready} />
    </div>
  );
});

function stripUndefined<T extends object>(obj: T): T {
  const out = {} as T;
  for (const key in obj) if (obj[key] !== undefined) out[key] = obj[key];
  return out;
}
