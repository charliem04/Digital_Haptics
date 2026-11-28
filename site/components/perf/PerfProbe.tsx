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
    const sweep = new URLSearchParams(window.location.search).has("sweep");
    void (sweep ? import("./PerfSweep") : import("./PerfHud")).then((mod) => {
      if (!dead) setHud(() => ("PerfSweep" in mod ? mod.PerfSweep : mod.PerfHud));
    });
    return () => {
      dead = true;
    };
  }, []);

  return Hud ? <Hud /> : null;
}
