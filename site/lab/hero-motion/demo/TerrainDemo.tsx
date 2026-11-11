"use client";

import { useRef, useState } from "react";
import { TopoTerrain, type TopoTerrainHandle } from "../terrain/TopoTerrain";
import { TERRAIN_DEFAULTS, type PaletteStop } from "../terrain/params";
import { ConceptFrame, usePane } from "./kit";
import css from "./lab.module.css";

const D = TERRAIN_DEFAULTS;

/** The panel's flat view of the props (tweakpane binds to plain fields). */
const INITIAL = {
  pointSpacingPx: D.pointSpacingPx,
  pointSize: D.pointSize,
  pointShape: D.pointShape as string,
  heightScale: D.heightScale,
  noiseScale: D.noiseScale,
  octaves: D.octaves,
  ridgeMix: D.ridgeMix,
  scrollDirection: { x: D.scrollDirection[0], y: D.scrollDirection[1] },
  loopDuration: D.loopDuration,
  waveAmplitude: D.waveAmplitude,
  waveFrequency: D.waveFrequency,
  cameraTilt: D.cameraTilt,
  fov: D.fov,
  low: D.palette[0].color,
  mid: D.palette[1].color,
  midAt: D.palette[1].at,
  high: D.palette[2].color,
  highAt: D.palette[2].at,
  peak: D.palette[3].color,
  heightmap: "",
  seed: D.seed,
  aspectFit: D.aspectFit as string,
  maxPoints: D.maxPoints,
  tileSizePx: D.tileSizePx,
  grain: D.grain,
  paused: false,
};

export function TerrainDemo({
  bench = false,
  still = false,
}: {
  bench?: boolean;
  still?: boolean;
}) {
  const handle = useRef<TopoTerrainHandle>(null);
  const [debugFrame, setDebugFrame] = useState<"start" | "end" | null>(null);
  const [check, setCheck] = useState("");

  const { hostRef, state } = usePane("Concept B — terrain", INITIAL, (pane, s) => {
    const grid = pane.addFolder({ title: "Grid" });
    grid.addBinding(s, "pointSpacingPx", { min: 3, max: 24, step: 0.5 });
    grid.addBinding(s, "pointSize", { min: 0.5, max: 8, step: 0.1 });
    grid.addBinding(s, "pointShape", { options: { square: "square", round: "round" } });
    grid.addBinding(s, "aspectFit", { options: { cover: "cover", contain: "contain" } });
    grid.addBinding(s, "maxPoints", { min: 5000, max: 400000, step: 5000 });

    const land = pane.addFolder({ title: "Terrain" });
    land.addBinding(s, "heightScale", { min: 0, max: 160, step: 1 });
    land.addBinding(s, "noiseScale", { min: 1, max: 12, step: 0.1 });
    land.addBinding(s, "octaves", { min: 1, max: 6, step: 1 });
    land.addBinding(s, "ridgeMix", { min: 0, max: 1, step: 0.01 });
    land.addBinding(s, "tileSizePx", { min: 400, max: 4000, step: 50 });
    land.addBinding(s, "seed", { min: 0, max: 999, step: 1 });
    land.addBinding(s, "heightmap", { label: "heightmap URL" });

    const motion = pane.addFolder({ title: "Motion" });
    motion.addBinding(s, "scrollDirection", {
      x: { min: -3, max: 3, step: 1 },
      y: { min: -3, max: 3, step: 1 },
    });
    motion.addBinding(s, "loopDuration", { min: 4, max: 60, step: 1 });
    motion.addBinding(s, "waveAmplitude", { min: 0, max: 0.3, step: 0.005 });
    motion.addBinding(s, "waveFrequency", { min: 0, max: 10, step: 0.1 });
    motion.addBinding(s, "paused");

    const cam = pane.addFolder({ title: "Camera" });
    cam.addBinding(s, "cameraTilt", { min: 0, max: 45, step: 0.5 });
    cam.addBinding(s, "fov", { min: 8, max: 60, step: 0.5 });

    const pal = pane.addFolder({ title: "Palette" });
    pal.addBinding(s, "low");
    pal.addBinding(s, "mid");
    pal.addBinding(s, "midAt", { min: 0.05, max: 0.95, step: 0.01 });
    pal.addBinding(s, "high");
    pal.addBinding(s, "highAt", { min: 0.05, max: 0.95, step: 0.01 });
    pal.addBinding(s, "peak");
    pal.addBinding(s, "grain", { min: 0, max: 1, step: 0.01 });
  });

  const palette: PaletteStop[] = [
    { at: 0, color: state.low },
    { at: state.midAt, color: state.mid },
    { at: state.highAt, color: state.high },
    { at: 1, color: state.peak },
  ];

  const verify = () => {
    const engine = handle.current?.engine();
    if (!engine) return;
    const r = engine.verifyLoop();
    setCheck(
      r.maxDiff === 0
        ? `Frame 0 and frame ${state.loopDuration}s are pixel-identical (${r.pixels.toLocaleString()} px compared).`
        : `Frame 0 vs frame ${state.loopDuration}s: ${r.differing.toLocaleString()} of ${r.pixels.toLocaleString()} px differ, worst channel difference ${r.maxDiff}/255.`
    );
  };

  return (
    <ConceptFrame
      id="terrain"
      title="B — Topographic dot terrain"
      blurb="A grid of points lifted by a tileable height field, scrolling in a loop that ends exactly where it starts. Drag the stage's bottom-right corner: point spacing stays constant at any size."
      handle={handle}
      gpu={() => handle.current?.engine()?.gpu() ?? "unknown GPU"}
      panelRef={hostRef}
      fixedSize={bench ? { width: 2560, height: 1440 } : undefined}
      tools={
        <>
          {(["start", "end"] as const).map((f) => (
            <button
              key={f}
              type="button"
              className={css.button}
              aria-pressed={debugFrame === f}
              onClick={() => setDebugFrame(debugFrame === f ? null : f)}
            >
              {f === "start" ? "Hold frame 0" : "Hold frame = loop end"}
            </button>
          ))}
          <button type="button" className={css.button} onClick={verify}>
            Verify loop
          </button>
        </>
      }
    >
      <TopoTerrain
        ref={handle}
        paused={state.paused}
        pointSpacingPx={state.pointSpacingPx}
        pointSize={state.pointSize}
        pointShape={state.pointShape as "square" | "round"}
        heightScale={state.heightScale}
        noiseScale={state.noiseScale}
        octaves={state.octaves}
        ridgeMix={state.ridgeMix}
        scrollDirection={[state.scrollDirection.x, state.scrollDirection.y]}
        loopDuration={state.loopDuration}
        waveAmplitude={state.waveAmplitude}
        waveFrequency={state.waveFrequency}
        cameraTilt={state.cameraTilt}
        fov={state.fov}
        palette={palette}
        heightmap={state.heightmap.trim() || null}
        seed={state.seed}
        aspectFit={state.aspectFit as "cover" | "contain"}
        maxPoints={state.maxPoints}
        tileSizePx={state.tileSizePx}
        grain={state.grain}
        debugFrame={debugFrame}
        stageOptions={bench ? { dpr: 1 } : still ? { reducedMotion: true } : undefined}
      />
      {check && (
        <p
          className={css.readout}
          data-loop-check
          style={{ position: "absolute", left: 12, bottom: 10, color: "#d8f08a" }}
        >
          {check}
        </p>
      )}
    </ConceptFrame>
  );
}
