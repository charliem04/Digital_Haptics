"use client";

import { forwardRef } from "react";
import { useStage, type HeroMotionHandle } from "../shared/useStage";
import type { StageOptions } from "../shared/stage";
import shell from "../shared/stage.module.css";
import { LIQUID_DEFAULTS, type LiquidParams } from "./params";
import type { LiquidEngine } from "./engine";

export type LiquidMetalProps = Partial<LiquidParams> & {
  className?: string;
  /** Freeze the animation on the current frame. */
  paused?: boolean;
  /** Lab only: forces a device pixel ratio for benchmarking. */
  stageOptions?: StageOptions;
};

export type LiquidMetalHandle = HeroMotionHandle<LiquidEngine>;

const load = () => import("./engine").then((m) => m.createLiquidEngine);

/**
 * Concept C — liquid metal drifting in a low-gravity room.
 *
 * Fills its nearest positioned ancestor. Every prop hot-updates; the
 * canvas is never remounted.
 */
export const LiquidMetal = forwardRef<LiquidMetalHandle, LiquidMetalProps>(function LiquidMetal(
  { className, paused = false, stageOptions, ...overrides },
  ref
) {
  const params: LiquidParams = { ...LIQUID_DEFAULTS, ...stripUndefined(overrides) };
  const { rootRef, canvasRef, ready } = useStage<LiquidParams, LiquidEngine>(
    load,
    params,
    paused,
    ref,
    undefined,
    stageOptions
  );

  // Server-rendered and pre-WebGL fallback: the room's own colours as a
  // soft still, so the canvas fades in over something of the same mood.
  const space = params.palette[0]?.color ?? "#181c21";
  const teal = params.palette[2]?.color ?? "#1c4345";
  const ember = params.palette[7]?.color ?? "#f56c36";

  return (
    <div
      ref={rootRef}
      aria-hidden
      className={className ? `${shell.root} ${className}` : shell.root}
      style={{ backgroundColor: space }}
    >
      <div
        className={shell.fallback}
        style={{
          backgroundImage:
            `radial-gradient(60% 70% at 72% 62%, ${ember}33, transparent 70%), ` +
            `radial-gradient(80% 90% at 30% 40%, ${teal}, transparent 75%)`,
        }}
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
