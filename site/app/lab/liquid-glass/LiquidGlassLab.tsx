"use client";

import { useState } from "react";
import { LiquidGlass } from "liquid-glass-web-react";
import { LiquidBackdrop } from "@/components/home/liquid/LiquidBackdrop";

/**
 * The package refracts what it wraps, not what's behind it, so here it
 * wraps a liquid canvas directly. The amber tint is a separate layer that
 * follows the lens: tinting inside the lens would get refracted too.
 */
const LENS = { width: 380, height: 240, radius: 36 };

type Setting = {
  key: "strength" | "chromaticAberration" | "depth" | "curvature" | "blur";
  label: string;
  min: number;
  max: number;
  step: number;
};

const SETTINGS: Setting[] = [
  { key: "strength", label: "Bend", min: 0, max: 0.25, step: 0.005 },
  { key: "chromaticAberration", label: "Colour split", min: 0, max: 1, step: 0.05 },
  { key: "depth", label: "Rim width", min: 4, max: 80, step: 1 },
  { key: "curvature", label: "Curvature", min: 0, max: 1, step: 0.05 },
  { key: "blur", label: "Frost", min: 0, max: 12, step: 0.5 },
];

export function LiquidGlassLab() {
  const [values, setValues] = useState({
    strength: 0.1,
    chromaticAberration: 0.35,
    depth: 28,
    curvature: 0.65,
    blur: 0,
  });
  const [amber, setAmber] = useState(true);
  const [pos, setPos] = useState({ x: 0.5, y: 0.5 });

  return (
    <div className="page-x flex flex-col gap-8 py-12">
      <header className="flex max-w-[720px] flex-col gap-3">
        <h1 className="text-room-title font-medium">Liquid glass</h1>
        <p className="text-room-lede text-muted">
          The liquid-glass-web-react lens over a live liquid canvas. Drag the lens. It should work
          in Chrome, Safari and Firefox.
        </p>
      </header>

      <div className="grid gap-x-8 gap-y-4 rounded-panel bg-surface p-6 sm:grid-cols-2 lg:grid-cols-3">
        {SETTINGS.map((s) => (
          <label key={s.key} className="flex flex-col gap-2 text-room-small">
            <span className="flex justify-between">
              {s.label}
              <span className="text-muted">{values[s.key]}</span>
            </span>
            <input
              type="range"
              min={s.min}
              max={s.max}
              step={s.step}
              value={values[s.key]}
              onChange={(e) => setValues((v) => ({ ...v, [s.key]: Number(e.target.value) }))}
              className="accent-amber"
            />
          </label>
        ))}
        <label className="flex min-h-touch items-center gap-3 text-room-small">
          <input
            type="checkbox"
            checked={amber}
            onChange={(e) => setAmber(e.target.checked)}
            className="size-5 accent-amber"
          />
          Amber tint
        </label>
      </div>

      <div className="relative h-[100lvh] overflow-hidden rounded-panel">
        <LiquidGlass
          draggable
          x={pos.x}
          y={pos.y}
          {...LENS}
          {...values}
          onMove={(x, y) => setPos({ x, y })}
          className="h-full w-full"
        >
          <div data-liquid-opening className="relative h-[100lvh] w-full">
            <LiquidBackdrop />
          </div>
        </LiquidGlass>

        {amber && (
          <div
            aria-hidden
            className="pointer-events-none absolute border border-[rgb(245_162_84/0.62)] border-t-[rgb(249_184_120/0.8)] bg-[rgb(245_162_84/0.22)]"
            style={{
              width: LENS.width,
              height: LENS.height,
              borderRadius: LENS.radius,
              left: `calc(${pos.x * 100}% - ${LENS.width / 2}px)`,
              top: `calc(${pos.y * 100}% - ${LENS.height / 2}px)`,
            }}
          />
        )}
      </div>
    </div>
  );
}
