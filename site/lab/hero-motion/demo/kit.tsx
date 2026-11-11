"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import type { Pane } from "tweakpane";
import type { HeroMotionHandle } from "../shared/useStage";
import type { BenchResult } from "../shared/stage";
import css from "./lab.module.css";

/**
 * A tweakpane panel bound to one mutable object. Every change hands React
 * a fresh shallow copy, which flows to the component as ordinary props:
 * the same path a real page would use, so the panel also proves that
 * props hot-update without remounting the canvas.
 */
export function usePane<T extends object>(
  title: string,
  initial: T,
  build: (pane: Pane, state: T) => void
): { hostRef: RefObject<HTMLDivElement>; state: T } {
  const hostRef = useRef<HTMLDivElement>(null);
  const [live] = useState<T>(() => structuredClone(initial));
  const [state, setState] = useState<T>(live);
  const buildRef = useRef(build);

  useEffect(() => {
    let pane: Pane | undefined;
    let dead = false;
    import("tweakpane").then(({ Pane: PaneClass }) => {
      if (dead || !hostRef.current) return;
      pane = new PaneClass({ container: hostRef.current, title });
      buildRef.current(pane, live);
      pane.on("change", () => setState({ ...live }));
    });
    return () => {
      dead = true;
      pane?.dispose();
    };
  }, [title, live]);

  return { hostRef, state };
}

export type SizePreset = { label: string; style: CSSProperties };

export const SIZE_PRESETS: SizePreset[] = [
  { label: "Full-bleed hero", style: { width: "100%", height: 620 } },
  { label: "Half-width panel", style: { width: "50%", height: 620 } },
  { label: "Small card", style: { width: 360, height: 240 } },
  { label: "2560 × 1440", style: { width: 2560, height: 1440 } },
];

const ms = (n: number) => n.toFixed(2);

export function formatBench(b: BenchResult, gpu: string): string {
  return (
    `${b.width}×${b.height} @ dpr ${b.dpr} · ${b.frames} frames · ` +
    `avg ${ms(b.avg)} ms · p50 ${ms(b.p50)} · p95 ${ms(b.p95)} · max ${ms(b.max)} ms · ${gpu}`
  );
}

/**
 * The frame around one concept: a resizable stage, its control panel,
 * a live frame-time readout and a bench button.
 */
export function ConceptFrame({
  id,
  title,
  blurb,
  handle,
  gpu,
  panelRef,
  tools,
  fixedSize,
  children,
}: {
  id: string;
  title: string;
  blurb: string;
  handle: RefObject<HeroMotionHandle | null>;
  gpu: () => string;
  panelRef: RefObject<HTMLDivElement>;
  tools?: ReactNode;
  /** Bench mode: lock the stage to this size and run the bench once. */
  fixedSize?: { width: number; height: number };
  children: ReactNode;
}) {
  const [preset, setPreset] = useState(0);
  const [bench, setBench] = useState<string>("");
  const statsRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const s = handle.current?.stats();
      if (!s || !statsRef.current) return;
      statsRef.current.textContent = s.running
        ? `${s.width}×${s.height} @ dpr ${s.dpr} · frame interval avg ${ms(s.intervalAvg)} ms ` +
          `(p95 ${ms(s.intervalP95)}, max ${ms(s.intervalMax)}) · JS ${ms(s.cpuAvg)} ms`
        : `${s.width}×${s.height} @ dpr ${s.dpr} · not animating (paused, offscreen, hidden tab or reduced motion)`;
    }, 500);
    return () => window.clearInterval(timer);
  }, [handle]);

  const runBench = async () => {
    setBench("Running…");
    const result = await handle.current?.bench(300);
    setBench(result ? formatBench(result, gpu()) : "Canvas not ready.");
  };

  useEffect(() => {
    if (!fixedSize) return;
    const timer = window.setTimeout(runBench, 1500);
    return () => window.clearTimeout(timer);
    // Runs once, in bench mode only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const size: CSSProperties = fixedSize ?? SIZE_PRESETS[preset].style;

  return (
    <section className={css.concept} aria-labelledby={`${id}-title`}>
      <header className={css.conceptHead}>
        <h2 id={`${id}-title`} className={css.conceptTitle}>
          {title}
        </h2>
        <p className={css.blurb}>{blurb}</p>
      </header>

      <div className={css.toolbar}>
        {!fixedSize &&
          SIZE_PRESETS.map((p, i) => (
            <button
              key={p.label}
              type="button"
              className={css.button}
              aria-pressed={i === preset}
              onClick={() => setPreset(i)}
            >
              {p.label}
            </button>
          ))}
        <button type="button" className={css.button} onClick={runBench}>
          Bench 300 frames
        </button>
        {tools}
      </div>

      <p className={css.readout}>
        <span ref={statsRef}>Starting…</span>
      </p>
      {bench && (
        <p className={css.readout} data-bench={id}>
          Bench: {bench}
        </p>
      )}

      <div className={css.row}>
        <div className={css.scroller}>
          {/* key: a preset click resets any manual drag-resize. */}
          <div key={preset} className={css.stage} style={size}>
            {children}
          </div>
        </div>
        <div ref={panelRef} className={css.panel} />
      </div>
    </section>
  );
}
