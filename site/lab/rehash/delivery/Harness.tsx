"use client";

import { useEffect } from "react";
import { LIQUID_DEFAULTS, type LiquidParams } from "@/lab/hero-motion/liquid/params";

type Kind = "three" | "plain";
type Size = { width: number; height: number; dpr: number };
type Engine = {
  setParams(p: LiquidParams): void;
  resize(w: number, h: number, dpr: number): void;
  update(t: number, dt: number, still: boolean): void;
  render(): void;
  sync(): void;
  dispose(): void;
};

/** The Molten Room hero's settings. */
const HERO: Partial<LiquidParams> = { seed: 5, coverage: 0.46, flowSpeed: 0.7 };

async function make(kind: Kind, canvas: HTMLCanvasElement): Promise<Engine> {
  if (kind === "three") {
    const { createLiquidEngine } = await import("@/lab/hero-motion/liquid/engine");
    return createLiquidEngine(canvas);
  }
  const { createPlainLiquidEngine } = await import("./plainEngine");
  return createPlainLiquidEngine(canvas);
}

function freshCanvas({ width, height }: Size) {
  const canvas = document.createElement("canvas");
  canvas.style.cssText = `position:fixed;left:0;top:0;width:${width}px;height:${height}px`;
  document.body.appendChild(canvas);
  return canvas;
}

function context(canvas: HTMLCanvasElement) {
  return canvas.getContext("webgl2") as WebGL2RenderingContext;
}

const round = (v: number) => Math.round(v * 10) / 10;

async function bench(kind: Kind, size: Size, overrides: Partial<LiquidParams> = {}, frames = 240) {
  const canvas = freshCanvas(size);
  const t0 = performance.now();
  const engine = await make(kind, canvas);
  engine.setParams({ ...LIQUID_DEFAULTS, ...HERO, ...overrides });
  engine.resize(size.width, size.height, size.dpr);
  engine.update(0, 0, false);
  engine.render();
  engine.sync();
  const firstFrame = performance.now() - t0;

  for (let i = 0; i < 30; i++) {
    engine.update(0, 1 / 60, false);
    engine.render();
    engine.sync();
  }
  const times = new Float32Array(frames);
  for (let i = 0; i < frames; i++) {
    const a = performance.now();
    engine.update(0, 1 / 60, false);
    engine.render();
    engine.sync();
    times[i] = performance.now() - a;
    if (i % 30 === 29) await new Promise((r) => setTimeout(r, 0));
  }
  engine.dispose();
  canvas.remove();
  const avg = times.reduce((a, b) => a + b, 0) / frames;
  times.sort();
  return {
    kind,
    size: `${size.width}x${size.height}@${size.dpr}`,
    firstFrame: round(firstFrame),
    avg: round(avg),
    p95: round(times[Math.floor(frames * 0.95)]),
    max: round(times[frames - 1]),
  };
}

async function frameAt(kind: Kind, size: Size, steps: number) {
  const canvas = freshCanvas(size);
  const engine = await make(kind, canvas);
  engine.setParams({ ...LIQUID_DEFAULTS, ...HERO });
  engine.resize(size.width, size.height, size.dpr);
  for (let i = 0; i < steps; i++) engine.update(0, 1 / 60, false);
  engine.update(0, 0, true);
  engine.render();
  const gl = context(canvas);
  const pixels = new Uint8Array(canvas.width * canvas.height * 4);
  gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  engine.dispose();
  canvas.remove();
  return pixels;
}

/** How far apart the two renderers' pictures are, in 8-bit levels. */
async function parity(size: Size, steps = 1800) {
  const a = await frameAt("three", size, steps);
  const b = await frameAt("plain", size, steps);
  let sum = 0;
  let max = 0;
  for (let i = 0; i < a.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      const d = Math.abs(a[i + c] - b[i + c]);
      sum += d;
      if (d > max) max = d;
    }
  }
  return { meanDiff: Math.round((sum / ((a.length / 4) * 3)) * 1000) / 1000, maxDiff: max };
}

/** Encoded size of a still poster, grain left to CSS. */
async function poster(width: number, height: number, quality: number, steps = 2700) {
  const canvas = freshCanvas({ width, height, dpr: 1 });
  const engine = await make("plain", canvas);
  engine.setParams({ ...LIQUID_DEFAULTS, ...HERO, grainAmount: 0 });
  engine.resize(width, height, 1);
  for (let i = 0; i < steps; i++) engine.update(0, 1 / 60, false);
  engine.update(0, 0, true);
  engine.render();
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", quality));
  engine.dispose();
  canvas.remove();
  return { width, height, quality, type: blob?.type, kb: blob ? round(blob.size / 1024) : null };
}

/** Lab-only measurement page for the live hero delivery plan. */
export function Harness() {
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__delivery = { bench, parity, poster };
  }, []);
  return <p data-harness>Delivery harness ready. Use window.__delivery.</p>;
}
