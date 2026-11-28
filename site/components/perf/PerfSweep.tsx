"use client";

import { useEffect, useState } from "react";
import { LIQUID_STATE_EVENT, LIQUID_STATS_EVENT, type LiquidStats } from "@/lib/perf";

/**
 * ════════════════════════════════════════════════════════════════════
 *  PERF SWEEP (lib/perf.ts): `?perf&sweep` on any page.
 *
 *  Reloads the same page once per variant below, each with different
 *  layers switched off, and records 8 s of automatic scrolling on each.
 *  Every variant is a fresh page load, because the liquid reads its
 *  settings once. Results build up in sessionStorage and show as one
 *  table at the end, in a box that can be selected and copied on any
 *  device.
 *
 *  This exists because the browser pane cannot reproduce a real screen's
 *  compositing cost (docs/perf/PHASE1.md): the sweep runs where the
 *  problem is.
 * ════════════════════════════════════════════════════════════════════
 */

const VARIANTS: { label: string; query: string }[] = [
  { label: "as shipped", query: "" },
  { label: "no glass blur", query: "off=blur" },
  { label: "no grain overlay", query: "off=grain" },
  { label: "no blur + grain", query: "off=blur,grain" },
  { label: "liquid only", query: "off=blur,grain,motion,trim,glow" },
  { label: "no liquid", query: "off=liquid" },
  { label: "liquid at 1x", query: "dpr=1" },
  { label: "everything off", query: "off=liquid,blur,grain,motion,trim,glow" },
];

const KEY = "perf-sweep";
const SETTLE_MS = 6000;
const RECORD_MS = 8000;

type Row = {
  label: string;
  fps: number;
  p95: number;
  janky: number;
  longTasks: number;
  liquidFps: number | null;
  gpuMs: number | null;
  canvas: string;
};

type Saved = { rows: Row[]; device: Record<string, string | number> };

const r1 = (n: number) => Math.round(n * 10) / 10;

function load(): Saved {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) ?? "") as Saved;
  } catch {
    return { rows: [], device: {} };
  }
}

function urlFor(step: number): string {
  const variant = VARIANTS[step];
  const query = ["perf", "sweep", `sweepstep=${step}`, variant.query].filter(Boolean).join("&");
  return `${location.pathname}?${query}`;
}

/** Scroll the page up and down while timing frames. */
function record(): Promise<{
  intervals: number[];
  longTasks: number;
  liquid: LiquidStats[];
  hidden: boolean;
}> {
  return new Promise((resolve) => {
    const intervals: number[] = [];
    const liquid: LiquidStats[] = [];
    let longTasks = 0;
    let observer: PerformanceObserver | undefined;
    try {
      observer = new PerformanceObserver((list) => {
        longTasks += list.getEntries().length;
      });
      observer.observe({ type: "longtask" });
    } catch {
      // Not Chromium.
    }
    const onStats = (event: Event) => liquid.push((event as CustomEvent<LiquidStats>).detail);
    window.addEventListener(LIQUID_STATS_EVENT, onStats);

    // A hidden tab pauses animation frames, so the recording ends on a
    // timer, and a run that was hidden at any point is marked as such.
    let hidden = document.hidden;
    const onVisibility = () => {
      if (document.hidden) hidden = true;
    };
    document.addEventListener("visibilitychange", onVisibility);
    let done = false;
    let frame = 0;
    const finish = () => {
      if (done) return;
      done = true;
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener(LIQUID_STATS_EVENT, onStats);
      document.removeEventListener("visibilitychange", onVisibility);
      window.scrollTo(0, 0);
      resolve({ intervals, longTasks, liquid, hidden });
    };
    window.setTimeout(finish, RECORD_MS);

    const max = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    let dir = 1;
    let last = 0;
    const tick = (now: number) => {
      if (done) return;
      if (last) intervals.push(now - last);
      last = now;
      if (max > 0) {
        let y = scrollY + dir * 8;
        if (y >= max || y <= 0) {
          dir = -dir;
          y = Math.min(max, Math.max(0, y));
        }
        window.scrollTo(0, y);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
  });
}

function summarise(label: string, run: Awaited<ReturnType<typeof record>>): Row {
  const sorted = [...run.intervals].sort((a, b) => a - b);
  const avg = sorted.reduce((a, b) => a + b, 0) / Math.max(1, sorted.length);
  const liquid = run.liquid.filter((s) => s.frames > 0);
  const liquidMs = liquid.reduce((a, s) => a + s.frameMs, 0) / Math.max(1, liquid.length);
  const gpu = liquid.filter((s) => s.gpuMs !== null);
  const lastLiquid = liquid[liquid.length - 1];
  return {
    // Hidden tabs (and some embedded views) stop animation frames.
    label: run.hidden || run.intervals.length < 30 ? `${label} (NOT VISIBLE)` : label,
    fps: avg ? r1(1000 / avg) : 0,
    p95: r1(sorted[Math.floor(sorted.length * 0.95)] ?? 0),
    janky: Math.round((100 * sorted.filter((v) => v > 25).length) / Math.max(1, sorted.length)),
    longTasks: run.longTasks,
    liquidFps: liquid.length ? r1(1000 / liquidMs) : null,
    gpuMs: gpu.length ? r1(gpu.reduce((a, s) => a + (s.gpuMs ?? 0), 0) / gpu.length) : null,
    canvas: lastLiquid ? `${lastLiquid.canvasW}x${lastLiquid.canvasH}` : "-",
  };
}

function report(saved: Saved): string {
  const lines = saved.rows.map(
    (r) =>
      `${r.label.padEnd(18)} page ${String(r.fps).padStart(5)} fps  p95 ${String(r.p95).padStart(6)} ms  janky ${String(r.janky).padStart(3)}%  long ${r.longTasks}  liquid ${r.liquidFps ?? "-"} fps  gpu ${r.gpuMs ?? "-"} ms  canvas ${r.canvas}`
  );
  const device = Object.entries(saved.device)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
  return `${location.pathname}\n${lines.join("\n")}\n\n${device}`;
}

export function PerfSweep() {
  const [status, setStatus] = useState("starting");
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const stepParam = params.get("sweepstep");
    if (stepParam === null) {
      sessionStorage.removeItem(KEY);
      location.replace(urlFor(0));
      return;
    }
    const step = Number(stepParam);
    const variant = VARIANTS[step];
    if (!variant) return;

    let renderer = "";
    const onState = (event: Event) =>
      setStatus(`${variant.label}: liquid ${(event as CustomEvent<string>).detail}`);
    const onStats = (event: Event) => {
      renderer = (event as CustomEvent<LiquidStats>).detail.renderer;
    };
    window.addEventListener(LIQUID_STATE_EVENT, onState);
    window.addEventListener(LIQUID_STATS_EVENT, onStats);

    let dead = false;
    setStatus(`${step + 1}/${VARIANTS.length} ${variant.label}: settling`);
    const timer = window.setTimeout(async () => {
      setStatus(`${step + 1}/${VARIANTS.length} ${variant.label}: recording (hands off)`);
      const run = await record();
      if (dead) return;
      const saved = load();
      saved.rows[step] = summarise(variant.label, run);
      const nav = navigator as Navigator & { deviceMemory?: number };
      saved.device = {
        ...saved.device,
        viewport: `${innerWidth}x${innerHeight}`,
        screen: `${screen.width}x${screen.height}`,
        dpr: devicePixelRatio,
        cores: nav.hardwareConcurrency ?? 0,
        memoryGB: nav.deviceMemory ?? "n/a",
        ...(renderer ? { gpu: renderer } : {}),
        ua: nav.userAgent,
      };
      sessionStorage.setItem(KEY, JSON.stringify(saved));
      if (step + 1 < VARIANTS.length) location.replace(urlFor(step + 1));
      else {
        setStatus("done");
        setResult(report(saved));
      }
    }, SETTLE_MS);

    return () => {
      dead = true;
      window.clearTimeout(timer);
      window.removeEventListener(LIQUID_STATE_EVENT, onState);
      window.removeEventListener(LIQUID_STATS_EVENT, onStats);
    };
  }, []);

  return (
    <div
      data-perf-hud
      style={{
        position: "fixed",
        top: 8,
        left: 8,
        right: 8,
        zIndex: 2147483647,
        maxWidth: 760,
        padding: "8px 10px",
        borderRadius: 8,
        background: "rgba(0,0,0,0.85)",
        color: "#e8f0ea",
        font: "12px/1.45 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
      }}
    >
      <div>
        <b>PERF SWEEP</b> {status}
      </div>
      {result && (
        <>
          <textarea
            readOnly
            value={result}
            onFocus={(event) => event.currentTarget.select()}
            style={{
              display: "block",
              width: "100%",
              height: 260,
              marginTop: 6,
              background: "#111",
              color: "inherit",
              font: "inherit",
              fontSize: 11,
              whiteSpace: "pre",
            }}
          />
          <button
            type="button"
            style={{ marginTop: 6, padding: "4px 10px", font: "inherit" }}
            onClick={() => void navigator.clipboard?.writeText(result)}
          >
            Copy
          </button>
        </>
      )}
    </div>
  );
}
