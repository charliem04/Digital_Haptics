"use client";

import { useRef, useState } from "react";
import { WanderingFeet, type WanderingFeetHandle } from "../footprints/WanderingFeet";
import { FEET_DEFAULTS, type PrintStyleOption } from "../footprints/params";
import { ConceptFrame, usePane } from "./kit";
import css from "./lab.module.css";

const INITIAL = { ...FEET_DEFAULTS, printStyle: FEET_DEFAULTS.printStyle as string, paused: false };

export function FeetDemo({ bench = false, still = false }: { bench?: boolean; still?: boolean }) {
  const handle = useRef<WanderingFeetHandle>(null);
  const [clicks, setClicks] = useState(0);

  const { hostRef, state } = usePane("Concept A — feet", INITIAL, (pane, s) => {
    const grid = pane.addFolder({ title: "Grid" });
    grid.addBinding(s, "gridSpacing", { min: 6, max: 28, step: 0.5 });
    grid.addBinding(s, "baseDotRadius", { min: 0.3, max: 3, step: 0.05 });
    grid.addBinding(s, "maxDotRadius", { min: 1, max: 12, step: 0.1 });
    grid.addBinding(s, "baseDotOpacity", { min: 0, max: 1, step: 0.01 });
    grid.addBinding(s, "dotColor");
    grid.addBinding(s, "paperColor");
    grid.addBinding(s, "haloColor");
    grid.addBinding(s, "haloBlur", { min: 0, max: 1.5, step: 0.01 });

    const walk = pane.addFolder({ title: "Walkers" });
    walk.addBinding(s, "walkers", { min: 1, max: 12, step: 1 });
    walk.addBinding(s, "walkSpeed", { min: 10, max: 240, step: 1 });
    walk.addBinding(s, "strideLength", { min: 30, max: 220, step: 1 });
    walk.addBinding(s, "pivotChance", { min: 0, max: 0.5, step: 0.005 });
    walk.addBinding(s, "trailLength", { min: 1, max: 12, step: 1 });
    walk.addBinding(s, "footScale", { min: 0.4, max: 2.5, step: 0.01 });
    walk.addBinding(s, "seed", { min: 0, max: 999, step: 1 });
    walk.addBinding(s, "printStyle", {
      options: {
        mixed: "mixed",
        sneaker: "sneaker",
        barefoot: "barefoot",
        boot: "boot",
        heel: "heel",
        oxford: "oxford",
        sandal: "sandal",
      },
    });
    walk.addBinding(s, "bodyHeight", { min: 0, max: 4, step: 0.05 });
    walk.addBinding(s, "bodyDensity", { min: 0, max: 1, step: 0.01 });
    walk.addBinding(s, "paused");

    const flare = pane.addFolder({ title: "Flare" });
    flare.addBinding(s, "flareIntensity", { min: 0, max: 2, step: 0.01 });
    flare.addBinding(s, "flareFollowLag", { min: 0, max: 1200, step: 10, label: "followLag ms" });
    flare.addBinding(s, "flareFadeIn", { min: 0, max: 3000, step: 50, label: "fadeIn ms" });
    flare.addBinding(s, "flareFadeOut", { min: 0, max: 3000, step: 50, label: "fadeOut ms" });
    flare.addBinding(s, "flareIdleCycle", { min: 2, max: 30, step: 0.5, label: "idleCycle s" });
    flare.addBinding(s, "secondaryLine");
  });

  const { paused, printStyle, ...params } = state;

  return (
    <ConceptFrame
      id="feet"
      title="A — Wandering feet on a halftone grid"
      blurb="Footprints made of the grid's own dots walk in from the edges, wander, pivot and leave. Move the pointer over the stage: the flare follows, and the x / y readout on the left tracks it. The button is ordinary content above the canvas, to show clicks pass through."
      handle={handle}
      gpu={() => handle.current?.engine()?.gpu() ?? "unknown GPU"}
      panelRef={hostRef}
      fixedSize={bench ? { width: 2560, height: 1440 } : undefined}
    >
      <WanderingFeet
        ref={handle}
        paused={paused}
        {...params}
        printStyle={printStyle as PrintStyleOption}
        stageOptions={bench ? { dpr: 1 } : still ? { reducedMotion: true } : undefined}
      />
      <div className={css.heroCopy}>
        <button type="button" className={css.button} onClick={() => setClicks((n) => n + 1)}>
          Content above the canvas · clicked {clicks}×
        </button>
      </div>
    </ConceptFrame>
  );
}
