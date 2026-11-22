"use client";

import { useRef } from "react";
import { LiquidMetal, type LiquidMetalHandle } from "../liquid/LiquidMetal";
import { LIQUID_DEFAULTS, LIQUID_PALETTE, type LiquidStop } from "../liquid/params";
import { ConceptFrame, usePane } from "./kit";

const { palette: _palette, ...NUMBERS } = LIQUID_DEFAULTS;
void _palette;

/** Names for the ramp's stops, in order, for the panel. */
const STOP_NAMES = [
  "space",
  "deepTeal",
  "teal",
  "sage",
  "tan",
  "hotRim",
  "amber",
  "orange",
  "red",
  "crimson",
  "core",
] as const;

const COLORS = Object.fromEntries(
  STOP_NAMES.map((name, i) => [name, LIQUID_PALETTE[i].color])
) as Record<(typeof STOP_NAMES)[number], string>;

const INITIAL = { ...NUMBERS, ...COLORS, paused: false };

export function LiquidDemo({ bench = false, still = false }: { bench?: boolean; still?: boolean }) {
  const handle = useRef<LiquidMetalHandle>(null);

  const { hostRef, state } = usePane("Concept C — liquid metal", INITIAL, (pane, s) => {
    const form = pane.addFolder({ title: "Liquid" });
    form.addBinding(s, "blobCount", { min: 3, max: 16, step: 1 });
    form.addBinding(s, "coverage", { min: 0, max: 1, step: 0.01 });
    form.addBinding(s, "viscosity", { min: 0, max: 1, step: 0.01 });
    form.addBinding(s, "stretch", { min: 0, max: 2.5, step: 0.01 });
    form.addBinding(s, "warpAmount", { min: 0, max: 2, step: 0.01 });
    form.addBinding(s, "warpScale", { min: 0.3, max: 3, step: 0.01 });
    form.addBinding(s, "seed", { min: 0, max: 999, step: 1 });

    const motion = pane.addFolder({ title: "Motion" });
    motion.addBinding(s, "flowSpeed", { min: 0, max: 4, step: 0.01 });
    motion.addBinding(s, "gravity", { min: 0, max: 2, step: 0.01 });
    motion.addBinding(s, "buoyancy", { min: 0, max: 3, step: 0.01 });
    motion.addBinding(s, "cameraDrift", { min: 0, max: 3, step: 0.01 });
    motion.addBinding(s, "paused");

    const look = pane.addFolder({ title: "Look" });
    look.addBinding(s, "rimWidth", { min: 0, max: 1, step: 0.01 });
    look.addBinding(s, "depthOfField", { min: 0, max: 1.5, step: 0.01 });
    look.addBinding(s, "fogAmount", { min: 0, max: 1, step: 0.01 });
    look.addBinding(s, "renderScale", { min: 0.15, max: 1, step: 0.01 });

    const grain = pane.addFolder({ title: "Grain" });
    grain.addBinding(s, "grainAmount", { min: 0, max: 2.5, step: 0.01 });
    grain.addBinding(s, "grainSize", { min: 0.5, max: 5, step: 0.05 });
    grain.addBinding(s, "grainFps", { min: 1, max: 60, step: 1 });

    const colors = pane.addFolder({ title: "Palette (space → core)", expanded: false });
    for (const name of STOP_NAMES) colors.addBinding(s, name);
  });

  const { paused, ...rest } = state;
  const palette: LiquidStop[] = STOP_NAMES.map((name, i) => ({
    at: LIQUID_PALETTE[i].at,
    color: state[name],
  }));

  return (
    <ConceptFrame
      id="liquid"
      title="C — Liquid metal in low gravity"
      blurb="A sealed room of heavy, glowing liquid. Warm masses rise, cool ones sink, a slow current carries them, and they stretch, neck and fuse as they pass. The liquid is drawn small and enlarged; the film grain on top is drawn at full resolution."
      handle={handle}
      gpu={() => handle.current?.engine()?.gpu() ?? "unknown GPU"}
      panelRef={hostRef}
      fixedSize={bench ? { width: 2560, height: 1440 } : undefined}
    >
      <LiquidMetal
        ref={handle}
        paused={paused}
        blobCount={rest.blobCount}
        coverage={rest.coverage}
        viscosity={rest.viscosity}
        warpAmount={rest.warpAmount}
        warpScale={rest.warpScale}
        flowSpeed={rest.flowSpeed}
        gravity={rest.gravity}
        buoyancy={rest.buoyancy}
        stretch={rest.stretch}
        rimWidth={rest.rimWidth}
        depthOfField={rest.depthOfField}
        fogAmount={rest.fogAmount}
        cameraDrift={rest.cameraDrift}
        grainAmount={rest.grainAmount}
        grainSize={rest.grainSize}
        grainFps={rest.grainFps}
        renderScale={rest.renderScale}
        seed={rest.seed}
        palette={palette}
        stageOptions={bench ? { dpr: 1 } : still ? { reducedMotion: true } : undefined}
      />
    </ConceptFrame>
  );
}
