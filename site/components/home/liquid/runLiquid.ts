import { LiquidEngine } from "./engine";
import { DESKTOP, PHONE, STEP_DOWN_SCALE } from "./params";

/**
 * The loop around the engine: size, visibility, the runtime governor and
 * context loss (docs/VISUAL_GUIDE.md §10.3). Loaded with the engine,
 * after first paint and idle.
 */

const WINDOW = 90;
/** Average frame interval that triggers the step down. */
const SLOW_MS = 24;
/**
 * After the step down, only freeze below about 25 fps. Low-power modes
 * cap animation at 30 fps, and a steady 30 is fine for slow liquid.
 */
const FREEZE_MS = 40;
/** Longer gaps are a throttled or backgrounded tab, not a slow device. */
const IGNORE_MS = 250;
const MAX_DT = 1 / 20;

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
  const settings = phone ? PHONE : DESKTOP;
  const engine = await LiquidEngine.create(canvas, settings);

  let raf = 0;
  let last = 0;
  let onscreen = true;
  const visible = new Set<Element>(openings);
  let stopped = false;
  let frozen = false;
  let steppedDown = false;
  let sum = 0;
  let count = 0;

  const shouldRun = () => !stopped && !frozen && onscreen && !document.hidden;

  const tick = (now: number) => {
    raf = requestAnimationFrame(tick);
    const interval = last === 0 ? 1000 / 60 : now - last;
    last = now;
    engine.frame(Math.min(interval / 1000, MAX_DT));

    if (interval < IGNORE_MS) {
      sum += interval;
      count++;
    }
    if (count >= WINDOW) {
      const average = sum / count;
      sum = 0;
      count = 0;
      if (!steppedDown && average > SLOW_MS) {
        steppedDown = true;
        engine.setRenderScale(Math.min(STEP_DOWN_SCALE, settings.renderScale));
      } else if (steppedDown && average > FREEZE_MS) {
        frozen = true;
        sync();
      }
    }
  };

  function sync() {
    if (shouldRun()) {
      if (raf === 0) {
        last = 0;
        raf = requestAnimationFrame(tick);
      }
    } else if (raf !== 0) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  }

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
    if (raf !== 0) cancelAnimationFrame(raf);
    raf = 0;
    resizer.disconnect();
    viewer.disconnect();
    document.removeEventListener("visibilitychange", sync);
    canvas.removeEventListener("webglcontextlost", onLost);
  }

  canvas.addEventListener("webglcontextlost", onLost);
  document.addEventListener("visibilitychange", sync);
  layout();
  resizer.observe(root);
  openings.forEach((opening) => viewer.observe(opening));
  events.onReady();
  sync();

  return () => {
    stop();
    engine.dispose();
  };
}
