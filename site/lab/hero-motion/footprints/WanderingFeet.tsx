"use client";

import { forwardRef, useCallback, useRef, type ReactNode, type RefObject } from "react";
import { useStage, type HeroMotionHandle } from "../shared/useStage";
import type { StageOptions } from "../shared/stage";
import shell from "../shared/stage.module.css";
import { FEET_DEFAULTS, type FeetParams } from "./params";
import type { FeetEngine } from "./engine";
import css from "./footprints.module.css";

/** Every piece of copy in the overlay. Nothing is hard-coded below. */
export type FeetLabels = {
  /** Top-left year fragment, e.g. "20". */
  yearStart: string;
  /** Top-right year fragment, e.g. "26". */
  yearEnd: string;
  /** Top-centre, bold. */
  title: string;
  /** Runs vertically down the right edge. */
  edge: string;
  /** Mid-left readout: `( from ) → ( to )`. */
  rangeFrom: string;
  rangeTo: string;
  /** Bottom-right mark or logo. */
  mark: ReactNode;
};

const YEAR = String(new Date().getFullYear());

/** Placeholder copy. The range is Lafayette's latitude and longitude. */
export const FEET_LABELS: FeetLabels = {
  yearStart: YEAR.slice(0, 2),
  yearEnd: YEAR.slice(2),
  title: "Charles Meyers",
  edge: "Software / Creative Technology — Lafayette, LA",
  rangeFrom: "30 . 22",
  rangeTo: "92 . 02",
  mark: "CM",
};

export type WanderingFeetProps = Partial<FeetParams> & {
  className?: string;
  /** Freeze the animation on the current frame. */
  paused?: boolean;
  labels?: Partial<FeetLabels>;
  /**
   * The element whose pointer the flare follows: the hero container.
   * Defaults to this component's parent, which is the element it fills.
   */
  pointerTarget?: RefObject<HTMLElement | null>;
  /** Lab only: forces a device pixel ratio for benchmarking. */
  stageOptions?: StageOptions;
};

export type WanderingFeetHandle = HeroMotionHandle<FeetEngine>;

const load = () => import("./engine").then((m) => m.createFeetEngine);

/**
 * Concept A — wandering feet on a halftone grid, with a cursor flare.
 *
 * Fills its nearest positioned ancestor. The canvas and overlay ignore
 * the pointer entirely, so anything layered above stays clickable; the
 * flare listens on the hero container instead.
 */
export const WanderingFeet = forwardRef<WanderingFeetHandle, WanderingFeetProps>(
  function WanderingFeet(
    { className, paused = false, labels, pointerTarget, stageOptions, ...overrides },
    ref
  ) {
    const params: FeetParams = { ...FEET_DEFAULTS, ...stripUndefined(overrides) };
    const copy: FeetLabels = { ...FEET_LABELS, ...labels };
    const xRef = useRef<HTMLSpanElement>(null);
    const yRef = useRef<HTMLSpanElement>(null);

    const attach = useCallback(
      (engine: FeetEngine, root: HTMLDivElement) => {
        // Written straight to the DOM: a React render per frame would be
        // exactly the per-frame work this component avoids.
        engine.onReadout = (x, y) => {
          if (xRef.current) xRef.current.textContent = x.toFixed(3);
          if (yRef.current) yRef.current.textContent = y.toFixed(3);
        };

        const target = pointerTarget?.current ?? root.parentElement ?? root;
        const move = (e: PointerEvent) => {
          // Touch has no hover: the flare stays in its idle drift.
          if (e.pointerType === "touch") return;
          const box = root.getBoundingClientRect();
          engine.pointerMove(e.clientX - box.left, e.clientY - box.top);
        };
        const leave = () => engine.pointerLeave();
        target.addEventListener("pointermove", move, { passive: true });
        target.addEventListener("pointerenter", move, { passive: true });
        target.addEventListener("pointerleave", leave, { passive: true });
        return () => {
          target.removeEventListener("pointermove", move);
          target.removeEventListener("pointerenter", move);
          target.removeEventListener("pointerleave", leave);
        };
      },
      [pointerTarget]
    );

    const { rootRef, canvasRef, ready } = useStage<FeetParams, FeetEngine>(
      load,
      params,
      paused,
      ref,
      attach,
      stageOptions
    );

    return (
      <div
        ref={rootRef}
        aria-hidden
        className={className ? `${shell.root} ${className}` : shell.root}
        style={{ backgroundColor: params.paperColor }}
      >
        {/* Server-rendered and pre-WebGL fallback: the same paper and the
            same dot grid in CSS, so the canvas fades in over a match. */}
        <div
          className={shell.fallback}
          style={{
            backgroundImage: `radial-gradient(${params.dotColor} ${params.baseDotRadius}px, transparent ${params.baseDotRadius + 0.4}px)`,
            backgroundSize: `${params.gridSpacing}px ${params.gridSpacing}px`,
            opacity: params.baseDotOpacity,
          }}
        />
        <canvas ref={canvasRef} className={shell.canvas} data-ready={ready} />

        <div className={css.overlay}>
          <p className={css.yearStart}>{copy.yearStart}</p>
          <p className={css.title}>{copy.title}</p>
          <p className={css.yearEnd}>{copy.yearEnd}</p>
          <p className={css.edge}>{copy.edge}</p>
          <div className={css.readouts}>
            <p>
              ( {copy.rangeFrom} ) → ( {copy.rangeTo} )
            </p>
            <p>
              x <span ref={xRef}>0.640</span> / y <span ref={yRef}>0.440</span>
            </p>
          </div>
          <p className={css.mark}>
            <span className={css.markSquare} />
            {copy.mark}
          </p>
        </div>
      </div>
    );
  }
);

function stripUndefined<T extends object>(obj: T): T {
  const out = {} as T;
  for (const key in obj) if (obj[key] !== undefined) out[key] = obj[key];
  return out;
}
