"use client";

import { useEffect, useState, type ComponentType } from "react";
import { perfFlags } from "@/lib/perf";

/**
 * The perf probe's entry point (lib/perf.ts). Without `?perf` in the URL
 * it renders nothing and loads nothing: the HUD is a separate chunk,
 * imported only when asked for.
 */
export function PerfProbe() {
  const [Hud, setHud] = useState<ComponentType | null>(null);

  useEffect(() => {
    const flags = perfFlags();
    if (!flags) return;
    document.documentElement.dataset.perfOff = Array.from(flags.off).join(" ");
    let dead = false;
    void import("./PerfHud").then((mod) => {
      if (!dead) setHud(() => mod.PerfHud);
    });
    return () => {
      dead = true;
    };
  }, []);

  return Hud ? <Hud /> : null;
}
