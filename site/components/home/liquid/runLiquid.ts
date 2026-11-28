import { LiquidEngine, yieldToPage } from "./engine";
import { createLoop } from "./liquidLoop";
import { pickSettings } from "./params";
import { LIQUID_STATS_EVENT, perfFlags } from "@/lib/perf";

/**
 * Main-thread fallback, for browsers without OffscreenCanvas. Everyone
 * else uses runLiquidWorker. Handles size, visibility and context loss
 * around the shared loop (docs/VISUAL_GUIDE.md §10.3).
 */

export type LiquidEvents = {
  /** The first frame is on the canvas: cross-fade it in. */
  onReady: () => void;
  /** WebGL went away: fall back to the poster. */
  onLost: () => void;
};

export async function runLiquid(
  canvas: HTMLCanvasElement,
  root: HTMLElement,
  /** The parts of the page the liquid shows through. */
  openings: Element[],
  events: LiquidEvents
): Promise<() => void> {
  const phone = window.matchMedia("(max-width: 640px)").matches;
  const overrides = perfFlags()?.liquid ?? {};
  const settings = pickSettings(phone, overrides);
  const engine = await LiquidEngine.create(canvas, settings);
  if (overrides.stats) engine.enableGpuTimer();
  const loop = createLoop(engine, settings, {
    governor: overrides.governor,
    onStats: overrides.stats
      ? (stats) =>
          window.dispatchEvent(
            new CustomEvent(LIQUID_STATS_EVENT, {
              detail: { ...stats, renderer: engine.renderer, thread: "main" },
            })
          )
      : undefined,
  });

  let onscreen = true;
  let stopped = false;
  const visible = new Set<Element>(openings);
  const sync = () => loop.setWanted(onscreen && !document.hidden);

  const layout = () => {
    const box = root.getBoundingClientRect();
    engine.resize(Math.round(box.width), Math.round(box.height));
    if (!stopped) engine.frame(0);
  };

  const resizer = new ResizeObserver(layout);
  const viewer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) visible.add(entry.target);
      else visible.delete(entry.target);
    }
    onscreen = visible.size > 0;
    sync();
  });
  const onLost = (event: Event) => {
    event.preventDefault();
    stop();
    events.onLost();
  };

  function stop() {
    if (stopped) return;
    stopped = true;
    loop.stop();
    resizer.disconnect();
    viewer.disconnect();
    document.removeEventListener("visibilitychange", sync);
    canvas.removeEventListener("webglcontextlost", onLost);
  }

  canvas.addEventListener("webglcontextlost", onLost);
  document.addEventListener("visibilitychange", sync);
  await yieldToPage();
  layout();
  await yieldToPage();
  if (stopped) return () => engine.dispose();
  resizer.observe(root);
  openings.forEach((opening) => viewer.observe(opening));
  events.onReady();
  sync();

  return () => {
    stop();
    engine.dispose();
  };
}
