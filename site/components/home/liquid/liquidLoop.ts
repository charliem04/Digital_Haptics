import type { LiquidEngine } from "./engine";
import { STEP_DOWN_SCALE, type LiquidSettings } from "./params";
import type { LiquidStats } from "@/lib/perf";

/**
 * The frame loop and runtime governor (docs/VISUAL_GUIDE.md §10.3).
 * Touches no DOM, so the same loop runs in the worker and, on browsers
 * without OffscreenCanvas, on the main thread.
 */

const WINDOW = 90;
/** Average frame interval that triggers the step down. */
const SLOW_MS = 24;
/**
 * After the step down, only freeze below about 11 fps. iPhones in Low
 * Power Mode cap animation at 30 fps and dip below it, and slow liquid
 * still looks right at those rates, so they should keep playing.
 */
const FREEZE_MS = 90;
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

/** Perf probe options (lib/perf.ts). All off by default. */
export type LoopOptions = {
  /** Frame-rate cap; unset draws on every display frame. */
  fps?: number;
  /** false: never step down or freeze. */
  governor?: boolean;
  /** Called about twice a second with frame stats. */
  onStats?: (stats: Omit<LiquidStats, "renderer" | "thread">) => void;
};

const STATS_MS = 500;

export function createLoop(
  engine: LiquidEngine,
  settings: LiquidSettings,
  options: LoopOptions = {}
): LiquidLoop {
  const governed = options.governor !== false;
  const minInterval = options.fps ? 1000 / options.fps - 2 : 0;
  const onStats = options.onStats;
  let drawn = 0;
  let statsAt = 0;
  const intervals: number[] = [];
  let cpuSum = 0;
  let handle = 0;
  let last = 0;
  let wanted = false;
  let stopped = false;
  let frozen = false;
  let steppedDown = false;
  let sum = 0;
  let count = 0;

  const report = (now: number) => {
    if (!onStats) return;
    if (statsAt === 0) statsAt = now;
    if (now - statsAt < STATS_MS) return;
    statsAt = now;
    const sorted = [...intervals].sort((a, b) => a - b);
    const n = sorted.length;
    onStats({
      frameMs: n ? sorted.reduce((a, b) => a + b, 0) / n : 0,
      p95Ms: n ? sorted[Math.min(n - 1, Math.floor(n * 0.95))] : 0,
      gpuMs: engine.gpuMs(),
      cpuMs: n ? cpuSum / n : 0,
      frames: n,
      ...engine.info(),
      steppedDown,
      frozen,
      running: handle !== 0,
    });
    intervals.length = 0;
    cpuSum = 0;
  };

  const tick = (now: number) => {
    handle = request(tick);
    // A capped rate skips display frames until enough time has passed.
    if (minInterval > 0 && drawn !== 0 && now - drawn < minInterval) return;
    drawn = now;
    const interval = last === 0 ? 1000 / 60 : now - last;
    last = now;
    const started = onStats ? performance.now() : 0;
    engine.frame(Math.min(interval / 1000, MAX_DT));
    if (onStats) {
      cpuSum += performance.now() - started;
      if (interval < IGNORE_MS) intervals.push(interval);
      report(now);
    }
    if (!governed) return;

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
        drawn = 0;
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
