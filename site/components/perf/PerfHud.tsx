"use client";

import { useEffect, useRef, useState } from "react";
import { LIQUID_STATE_EVENT, LIQUID_STATS_EVENT, perfFlags, type LiquidStats } from "@/lib/perf";

/**
 * ════════════════════════════════════════════════════════════════════
 *  PERF HUD (lib/perf.ts). Loaded only with `?perf`.
 *
 *  Page:    main-thread frame intervals from requestAnimationFrame. This
 *           is what scrolling feels like: when the GPU is saturated by
 *           the liquid or by compositing, these intervals grow too.
 *  Long:    main-thread tasks over 50 ms (Chromium only).
 *  Liquid:  the renderer's own frame interval, its CPU time per frame,
 *           and GPU time where EXT_disjoint_timer_query_webgl2 exists.
 *
 *  "Record 10 s" collects a summary to copy. The latest summary is also
 *  on window.__perf for scripted runs.
 * ════════════════════════════════════════════════════════════════════
 */

type Window = { intervals: number[]; longCount: number; longMs: number };

type Summary = {
  url: string;
  off: string[];
  liquidState: string;
  seconds: number;
  page: { fps: number; avgMs: number; p95Ms: number; p99Ms: number; jankyPct: number };
  longTasks: { count: number; totalMs: number };
  liquid: (LiquidStats & { samples: number }) | null;
  device: Record<string, string | number>;
};

const pct = (sorted: number[], p: number) =>
  sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))] : 0;

function pageStats(intervals: number[]) {
  const sorted = [...intervals].sort((a, b) => a - b);
  const avg = sorted.length ? sorted.reduce((a, b) => a + b, 0) / sorted.length : 0;
  return {
    fps: avg ? 1000 / avg : 0,
    avgMs: avg,
    p95Ms: pct(sorted, 0.95),
    p99Ms: pct(sorted, 0.99),
    // Missed at least one 60 Hz frame on the way.
    jankyPct: sorted.length ? (100 * sorted.filter((v) => v > 25).length) / sorted.length : 0,
  };
}

function device(): Record<string, string | number> {
  const nav = navigator as Navigator & { deviceMemory?: number };
  return {
    viewport: `${innerWidth}x${innerHeight}`,
    dpr: devicePixelRatio,
    cores: nav.hardwareConcurrency ?? 0,
    memoryGB: nav.deviceMemory ?? "n/a",
    ua: nav.userAgent,
  };
}

const r1 = (n: number) => Math.round(n * 10) / 10;

export function PerfHud() {
  const flags = perfFlags();
  const [, force] = useState(0);
  const [liquidState, setLiquidState] = useState("not on this page");
  const [liquid, setLiquid] = useState<LiquidStats | null>(null);
  const [recording, setRecording] = useState<number | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [open, setOpen] = useState(true);

  const live = useRef<Window>({ intervals: [], longCount: 0, longMs: 0 });
  const shown = useRef(pageStats([]));
  const rec = useRef<{
    start: number;
    page: Window;
    liquid: LiquidStats[];
  } | null>(null);
  const stateRef = useRef(liquidState);
  stateRef.current = liquidState;

  useEffect(() => {
    let handle = 0;
    let last = 0;
    let shownAt = performance.now();
    const tick = (now: number) => {
      handle = requestAnimationFrame(tick);
      if (last !== 0) {
        const interval = now - last;
        // A gap this long is a hidden tab, not a slow frame.
        if (interval < 500) {
          live.current.intervals.push(interval);
          rec.current?.page.intervals.push(interval);
        }
      }
      last = now;
      if (now - shownAt > 500) {
        shownAt = now;
        shown.current = pageStats(live.current.intervals);
        live.current.intervals = [];
        force((n) => n + 1);
      }
    };
    handle = requestAnimationFrame(tick);

    let observer: PerformanceObserver | undefined;
    try {
      observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          live.current.longCount++;
          live.current.longMs += entry.duration;
          if (rec.current) {
            rec.current.page.longCount++;
            rec.current.page.longMs += entry.duration;
          }
        }
      });
      observer.observe({ type: "longtask", buffered: true });
    } catch {
      // Not Chromium: no long-task timing.
    }

    const onStats = (event: Event) => {
      const stats = (event as CustomEvent<LiquidStats>).detail;
      setLiquid(stats);
      rec.current?.liquid.push(stats);
    };
    const onState = (event: Event) => setLiquidState((event as CustomEvent<string>).detail);
    window.addEventListener(LIQUID_STATS_EVENT, onStats);
    window.addEventListener(LIQUID_STATE_EVENT, onState);
    return () => {
      cancelAnimationFrame(handle);
      observer?.disconnect();
      window.removeEventListener(LIQUID_STATS_EVENT, onStats);
      window.removeEventListener(LIQUID_STATE_EVENT, onState);
    };
  }, []);

  const startRecording = (seconds: number) => {
    rec.current = {
      start: performance.now(),
      page: { intervals: [], longCount: 0, longMs: 0 },
      liquid: [],
    };
    setSummary(null);
    setRecording(seconds);
    window.setTimeout(() => {
      const r = rec.current;
      rec.current = null;
      setRecording(null);
      if (!r) return;
      const samples = r.liquid.filter((s) => s.frames > 0);
      const avg = (pick: (s: LiquidStats) => number) =>
        samples.length ? samples.reduce((a, s) => a + pick(s), 0) / samples.length : 0;
      const gpu = samples.filter((s) => s.gpuMs !== null);
      const lastLiquid = samples[samples.length - 1];
      const result: Summary = {
        url: location.pathname + location.search,
        off: Array.from(flags?.off ?? []),
        liquidState: stateRef.current,
        seconds,
        page: pageStats(r.page.intervals),
        longTasks: { count: r.page.longCount, totalMs: r.page.longMs },
        liquid: lastLiquid
          ? {
              ...lastLiquid,
              frameMs: avg((s) => s.frameMs),
              p95Ms: avg((s) => s.p95Ms),
              cpuMs: avg((s) => s.cpuMs),
              gpuMs: gpu.length ? gpu.reduce((a, s) => a + (s.gpuMs ?? 0), 0) / gpu.length : null,
              samples: samples.length,
            }
          : null,
        device: device(),
      };
      (window as unknown as { __perf?: Summary }).__perf = result;
      setSummary(result);
    }, seconds * 1000);
  };

  const page = shown.current;
  const box: React.CSSProperties = {
    position: "fixed",
    top: 8,
    left: 8,
    zIndex: 2147483647,
    maxWidth: "min(92vw, 360px)",
    padding: "8px 10px",
    borderRadius: 8,
    background: "rgba(0,0,0,0.82)",
    color: "#e8f0ea",
    font: "11px/1.45 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
    pointerEvents: "auto",
    whiteSpace: "pre-wrap",
  };
  const button: React.CSSProperties = {
    marginRight: 6,
    marginTop: 6,
    padding: "2px 8px",
    border: "1px solid #6b7d74",
    borderRadius: 4,
    background: "transparent",
    color: "inherit",
    font: "inherit",
    cursor: "pointer",
  };
  const color = (fps: number) => (fps >= 55 ? "#7fe0a0" : fps >= 40 ? "#f5c254" : "#ff7a6b");

  if (!open) {
    return (
      <button type="button" style={{ ...box, ...button }} onClick={() => setOpen(true)}>
        perf
      </button>
    );
  }

  return (
    <div style={box} data-perf-hud>
      <div>
        <b>PAGE</b> <span style={{ color: color(page.fps) }}>{r1(page.fps)} fps</span> · avg{" "}
        {r1(page.avgMs)} · p95 {r1(page.p95Ms)} ms · janky {Math.round(page.jankyPct)}%
      </div>
      <div>
        <b>LONG</b> {live.current.longCount} tasks · {Math.round(live.current.longMs)} ms total
      </div>
      <div>
        <b>LIQUID</b> {liquidState}
      </div>
      {liquid && (
        <div>
          {"  "}
          <span style={{ color: color(liquid.frameMs ? 1000 / liquid.frameMs : 0) }}>
            {liquid.frameMs ? r1(1000 / liquid.frameMs) : 0} fps
          </span>{" "}
          · p95 {r1(liquid.p95Ms)} · cpu {r1(liquid.cpuMs)} · gpu{" "}
          {liquid.gpuMs === null ? "n/a" : r1(liquid.gpuMs)} ms
          {"\n  "}scene {liquid.sceneW}x{liquid.sceneH} · canvas {liquid.canvasW}x{liquid.canvasH}
          {"\n  "}scale {r1(liquid.renderScale * 100) / 100} · blobs {liquid.blobCount} ·{" "}
          {liquid.thread}
          {liquid.steppedDown ? " · STEPPED DOWN" : ""}
          {liquid.frozen ? " · FROZEN" : ""}
          {!liquid.running ? " · paused" : ""}
          {"\n  "}
          {liquid.renderer || "renderer hidden"}
        </div>
      )}
      <div>
        <b>OFF</b> {flags && flags.off.size ? Array.from(flags.off).join(", ") : "none"} · dpr{" "}
        {typeof window !== "undefined" ? devicePixelRatio : ""}
      </div>
      <div>
        <button
          type="button"
          style={button}
          disabled={recording !== null}
          onClick={() => startRecording(10)}
        >
          {recording ? "recording…" : "Record 10 s"}
        </button>
        {summary && (
          <button
            type="button"
            style={button}
            onClick={() => void navigator.clipboard?.writeText(JSON.stringify(summary, null, 2))}
          >
            Copy result
          </button>
        )}
        <button type="button" style={button} onClick={() => setOpen(false)}>
          Hide
        </button>
      </div>
      {summary && (
        <div style={{ marginTop: 6, borderTop: "1px solid #3b4a43", paddingTop: 6 }}>
          10 s: page {r1(summary.page.fps)} fps, p95 {r1(summary.page.p95Ms)} ms, janky{" "}
          {Math.round(summary.page.jankyPct)}%, long {summary.longTasks.count}
          {summary.liquid &&
            `\nliquid ${r1(1000 / (summary.liquid.frameMs || 1))} fps, gpu ${
              summary.liquid.gpuMs === null ? "n/a" : r1(summary.liquid.gpuMs) + " ms"
            }`}
        </div>
      )}
    </div>
  );
}
