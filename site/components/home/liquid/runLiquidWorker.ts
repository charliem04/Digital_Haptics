import type { LiquidEvents } from "./runLiquid";
import type { LiquidCommand, LiquidReport } from "./liquid.worker";
import { LIQUID_STATS_EVENT, perfFlags } from "@/lib/perf";

/**
 * Main-thread side of the liquid worker: hands over the canvas, then
 * reports size and visibility. No WebGL runs on this thread. If the worker
 * fails, it is shut down and the poster stays.
 */
export async function runLiquidWorker(
  canvas: HTMLCanvasElement,
  root: HTMLElement,
  /** The parts of the page the liquid shows through. */
  openings: Element[],
  events: LiquidEvents
): Promise<() => void> {
  const offscreen = canvas.transferControlToOffscreen();
  const worker = new Worker(new URL("./liquid.worker.ts", import.meta.url));
  const send = (command: LiquidCommand, transfer: Transferable[] = []) =>
    worker.postMessage(command, transfer);

  const visible = new Set<Element>(openings);
  const isWanted = () => visible.size > 0 && !document.hidden;
  const measure = () => {
    const box = root.getBoundingClientRect();
    return {
      width: Math.round(box.width),
      height: Math.round(box.height),
      dpr: window.devicePixelRatio || 1,
    };
  };
  const sync = () => send({ type: "wanted", wanted: isWanted() });

  const resizer = new ResizeObserver(() => send({ type: "resize", ...measure() }));
  const viewer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) visible.add(entry.target);
      else visible.delete(entry.target);
    }
    sync();
  });

  let stopped = false;
  const stop = () => {
    if (stopped) return;
    stopped = true;
    resizer.disconnect();
    viewer.disconnect();
    document.removeEventListener("visibilitychange", sync);
    worker.terminate();
  };
  const fail = () => {
    stop();
    events.onLost();
  };

  worker.onerror = fail;
  worker.onmessage = ({ data }: MessageEvent<LiquidReport>) => {
    if (data.type === "ready") events.onReady();
    else if (data.type === "stats")
      window.dispatchEvent(new CustomEvent(LIQUID_STATS_EVENT, { detail: data.stats }));
    else fail();
  };

  document.addEventListener("visibilitychange", sync);
  send(
    {
      type: "init",
      canvas: offscreen,
      phone: isPhone(),
      wanted: isWanted(),
      overrides: perfFlags()?.liquid,
      ...measure(),
    },
    [offscreen]
  );
  resizer.observe(root);
  openings.forEach((opening) => viewer.observe(opening));

  return stop;
}

const isPhone = () => window.matchMedia("(max-width: 640px)").matches;
