import type { LiquidEngine } from "./engine";
import { STEP_DOWN_SCALE, type LiquidSettings } from "./params";

/**
 * The frame loop and runtime governor (docs/VISUAL_GUIDE.md §10.3).
 * Touches no DOM, so the same loop runs in the worker and, on browsers
 * without OffscreenCanvas, on the main thread.
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

const hasRaf = typeof requestAnimationFrame === "function";
const request = (callback: (now: number) => void): number =>
  hasRaf
    ? requestAnimationFrame(callback)
    : (setTimeout(() => callback(performance.now()), 16) as unknown as number);
const cancel = (handle: number) => (hasRaf ? cancelAnimationFrame(handle) : clearTimeout(handle));

export type LiquidLoop = {
  /** Run while the liquid is visible; pause otherwise. */
  setWanted: (wanted: boolean) => void;
  stop: () => void;
};

export function createLoop(engine: LiquidEngine, settings: LiquidSettings): LiquidLoop {
  let handle = 0;
  let last = 0;
  let wanted = false;
  let stopped = false;
  let frozen = false;
  let steppedDown = false;
  let sum = 0;
  let count = 0;

  const tick = (now: number) => {
    handle = request(tick);
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
    if (wanted && !stopped && !frozen) {
      if (handle === 0) {
        last = 0;
        handle = request(tick);
      }
    } else if (handle !== 0) {
      cancel(handle);
      handle = 0;
    }
  }

  return {
    setWanted(next) {
      wanted = next;
      sync();
    },
    stop() {
      stopped = true;
      sync();
    },
  };
}
