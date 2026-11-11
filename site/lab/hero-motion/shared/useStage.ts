"use client";

import { useEffect, useImperativeHandle, useRef, useState, type Ref } from "react";
import type { BenchResult, FrameStats, Stage, StageEngine, StageOptions } from "./stage";

/** An engine that takes the component's props as plain data. */
export interface ParamEngine<P> extends StageEngine {
  setParams(params: P): void;
}

/** What both components expose through `ref`. */
export type HeroMotionHandle<E = unknown> = {
  stats(): FrameStats | null;
  bench(frames?: number): Promise<BenchResult | null>;
  /** The live engine, for concept-specific debug calls. Null until ready. */
  engine(): E | null;
};

/**
 * Client-only canvas lifecycle.
 *
 * The component that calls this renders on the server too: it outputs
 * its static fallback and an empty <canvas>. three.js and the engine are
 * imported inside the effect, so neither is evaluated during server
 * rendering and neither is in the page's first chunk.
 *
 * Props reach the engine through `setParams` on every render. The canvas
 * and the WebGL context are created once and never remounted.
 */
export function useStage<P, E extends ParamEngine<P>>(
  load: () => Promise<(canvas: HTMLCanvasElement) => E>,
  params: P,
  paused: boolean,
  ref: Ref<HeroMotionHandle<E>> | undefined,
  /** Runs once the engine exists; return a cleanup. */
  attach?: (engine: E, root: HTMLDivElement) => void | (() => void),
  options?: StageOptions
) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<E | null>(null);
  const stageRef = useRef<Stage | null>(null);
  const [ready, setReady] = useState(false);

  // The latest values, readable from the mount effect without making it
  // re-run (which would rebuild the canvas).
  const latest = useRef({ params, paused, load, attach, options });
  latest.current = { params, paused, load, attach, options };

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    let dead = false;
    let detach: void | (() => void);

    (async () => {
      try {
        const [create, { Stage: StageClass }] = await Promise.all([
          latest.current.load(),
          import("./stage"),
        ]);
        if (dead) return;
        const engine = create(canvas);
        engine.setParams(latest.current.params);
        const stage = new StageClass(root, canvas, engine, latest.current.options);
        stage.setPaused(latest.current.paused);
        engineRef.current = engine;
        stageRef.current = stage;
        detach = latest.current.attach?.(engine, root);
        setReady(true);
      } catch (err) {
        // No WebGL, or a shader failed: the static fallback stays up.
        console.error("[hero-motion] canvas unavailable, showing the static fallback", err);
      }
    })();

    return () => {
      dead = true;
      if (detach) detach();
      stageRef.current?.dispose();
      engineRef.current?.dispose();
      stageRef.current = null;
      engineRef.current = null;
      setReady(false);
    };
  }, []);

  // Every render: hand the current props to the engine. It diffs them.
  useEffect(() => {
    engineRef.current?.setParams(params);
    stageRef.current?.setPaused(paused);
    stageRef.current?.invalidate();
  });

  useImperativeHandle(
    ref,
    () => ({
      stats: () => stageRef.current?.stats() ?? null,
      bench: async (frames) => (await stageRef.current?.bench(frames)) ?? null,
      engine: () => engineRef.current,
    }),
    []
  );

  return { rootRef, canvasRef, ready };
}
