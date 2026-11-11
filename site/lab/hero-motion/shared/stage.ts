/**
 * ════════════════════════════════════════════════════════════════════
 *  STAGE — the part both hero backgrounds share.
 *
 *  Owns everything that is about the container rather than the picture:
 *    · size      ResizeObserver on the root; the canvas is sized by its
 *                container, never the viewport. DPR is capped at 2.
 *    · running   the loop runs only while the root is on screen, the tab
 *                is visible, `paused` is off and reduced motion is off.
 *    · stills    when it is not running, `invalidate()` draws exactly one
 *                frame without advancing time. Under
 *                prefers-reduced-motion that single frame is the whole
 *                output: there is no loop.
 *    · timing    a ring of frame times for the demo's readout and bench.
 *
 *  It knows nothing about three.js. An engine is anything with the four
 *  methods below.
 * ════════════════════════════════════════════════════════════════════
 */

export interface StageEngine {
  /** CSS-pixel size of the container and the (capped) device pixel ratio. */
  resize(width: number, height: number, dpr: number): void;
  /**
   * Advance to `time` seconds. `dt` is 0 for a still frame. `still` is
   * true under reduced motion: compose one good frame, ignore the pointer.
   */
  update(time: number, dt: number, still: boolean): void;
  render(): void;
  /** Block until the GPU has finished the last render (bench only). */
  sync(): void;
  dispose(): void;
}

export type FrameStats = {
  /** Frames drawn since the stage started. */
  frames: number;
  /** Mean / 95th percentile / worst rAF-to-rAF interval, ms. */
  intervalAvg: number;
  intervalP95: number;
  intervalMax: number;
  /** Mean JS time spent in update + render (submission only), ms. */
  cpuAvg: number;
  running: boolean;
  width: number;
  height: number;
  dpr: number;
};

export type BenchResult = {
  frames: number;
  width: number;
  height: number;
  dpr: number;
  /** update + render + GPU sync, ms. */
  avg: number;
  p50: number;
  p95: number;
  max: number;
};

export type StageOptions = {
  /** Force a device pixel ratio (the bench uses 1 for a true 2560×1440). */
  dpr?: number;
  maxDpr?: number;
  /** Override prefers-reduced-motion (the lab uses this to preview the still frame). */
  reducedMotion?: boolean;
};

const RING = 240;
const MAX_DT = 1 / 20;

export class Stage {
  private readonly ro: ResizeObserver;
  private readonly io: IntersectionObserver;
  private readonly mq: MediaQueryList;
  private raf = 0;
  private last = 0;
  private time = 0;
  private width = 0;
  private height = 0;
  private dpr = 1;
  private onscreen = true;
  private paused = false;
  private reduced = false;
  private disposed = false;
  private benching = false;

  private frames = 0;
  private readonly intervals = new Float32Array(RING);
  private readonly cpu = new Float32Array(RING);
  private readonly sorted = new Float32Array(RING);

  constructor(
    private readonly root: HTMLElement,
    private readonly canvas: HTMLCanvasElement,
    private readonly engine: StageEngine,
    private readonly options: StageOptions = {}
  ) {
    this.mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.reduced = options.reducedMotion ?? this.mq.matches;
    this.mq.addEventListener("change", this.onMotionPref);
    document.addEventListener("visibilitychange", this.onVisibility);

    this.ro = new ResizeObserver((entries) => {
      const box = entries[entries.length - 1].contentRect;
      this.layout(box.width, box.height);
    });
    this.ro.observe(root);

    this.io = new IntersectionObserver((entries) => {
      this.onscreen = entries[entries.length - 1].isIntersecting;
      this.sync();
    });
    this.io.observe(root);

    const box = root.getBoundingClientRect();
    this.layout(box.width, box.height);
    this.sync();
  }

  get isRunning(): boolean {
    return this.raf !== 0 && this.shouldRun();
  }

  setPaused(paused: boolean): void {
    this.paused = paused;
    this.sync();
  }

  /** Draw one frame soon. A no-op while the loop is running. */
  invalidate(): void {
    if (this.disposed || this.raf !== 0 || this.width === 0) return;
    this.raf = requestAnimationFrame(this.still);
  }

  stats(): FrameStats {
    const n = Math.min(this.frames, RING);
    let sum = 0;
    let cpuSum = 0;
    let max = 0;
    for (let i = 0; i < n; i++) {
      const v = this.intervals[i];
      this.sorted[i] = v;
      sum += v;
      cpuSum += this.cpu[i];
      if (v > max) max = v;
    }
    const view = this.sorted.subarray(0, n).sort();
    return {
      frames: this.frames,
      intervalAvg: n ? sum / n : 0,
      intervalP95: n ? view[Math.min(n - 1, Math.floor(n * 0.95))] : 0,
      intervalMax: max,
      cpuAvg: n ? cpuSum / n : 0,
      running: this.isRunning,
      width: this.width,
      height: this.height,
      dpr: this.dpr,
    };
  }

  /**
   * Time `count` frames back to back: update + render + a blocking GPU
   * sync, so the number includes the GPU's work and not just the cost of
   * submitting it. Not paced by rAF, so it also works in a throttled tab.
   */
  async bench(count = 300, warmup = 30): Promise<BenchResult> {
    this.benching = true;
    this.stop();
    const times = new Float32Array(count);
    const step = 1 / 60;
    for (let i = -warmup; i < count; i++) {
      const t0 = performance.now();
      this.time += step;
      this.engine.update(this.time, step, false);
      this.engine.render();
      this.engine.sync();
      const t1 = performance.now();
      if (i >= 0) times[i] = t1 - t0;
      // Yield now and then so the page stays responsive.
      if (i % 30 === 29) await new Promise((r) => setTimeout(r, 0));
    }
    let sum = 0;
    for (let i = 0; i < count; i++) sum += times[i];
    times.sort();
    this.benching = false;
    this.sync();
    return {
      frames: count,
      width: this.width,
      height: this.height,
      dpr: this.dpr,
      avg: sum / count,
      p50: times[Math.floor(count * 0.5)],
      p95: times[Math.floor(count * 0.95)],
      max: times[count - 1],
    };
  }

  dispose(): void {
    this.disposed = true;
    this.stop();
    this.ro.disconnect();
    this.io.disconnect();
    this.mq.removeEventListener("change", this.onMotionPref);
    document.removeEventListener("visibilitychange", this.onVisibility);
  }

  /* ── internals ──────────────────────────────────────────────────── */

  private shouldRun(): boolean {
    return (
      !this.disposed &&
      !this.benching &&
      !this.paused &&
      !this.reduced &&
      this.onscreen &&
      !document.hidden &&
      this.width > 0 &&
      this.height > 0
    );
  }

  private sync(): void {
    if (this.shouldRun()) {
      if (this.raf === 0) {
        this.last = 0;
        this.raf = requestAnimationFrame(this.tick);
      }
    } else {
      this.stop();
      // Leaving the loop (pause, reduced motion) still owes one frame.
      if (!this.disposed && !this.benching && this.onscreen && !document.hidden) this.invalidate();
    }
  }

  private stop(): void {
    if (this.raf !== 0) cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  private layout(width: number, height: number): void {
    const w = Math.round(width);
    const h = Math.round(height);
    const dpr =
      this.options.dpr ?? Math.min(window.devicePixelRatio || 1, this.options.maxDpr ?? 2);
    if (w === this.width && h === this.height && dpr === this.dpr) return;
    this.width = w;
    this.height = h;
    this.dpr = dpr;
    if (w === 0 || h === 0) {
      this.stop();
      return;
    }
    this.engine.resize(w, h, dpr);
    // Resizing clears the drawing buffer. ResizeObserver runs before
    // paint, so drawing here means the cleared buffer is never shown.
    this.engine.update(this.time, 0, this.reduced);
    this.engine.render();
    this.sync();
  }

  private readonly tick = (now: number): void => {
    this.raf = requestAnimationFrame(this.tick);
    const interval = this.last === 0 ? 1000 / 60 : now - this.last;
    this.last = now;
    const dt = Math.min(interval / 1000, MAX_DT);
    this.time += dt;
    const t0 = performance.now();
    this.engine.update(this.time, dt, false);
    this.engine.render();
    const slot = this.frames % RING;
    this.intervals[slot] = interval;
    this.cpu[slot] = performance.now() - t0;
    this.frames++;
  };

  private readonly still = (): void => {
    this.raf = 0;
    if (this.disposed || this.width === 0) return;
    this.engine.update(this.time, 0, this.reduced);
    this.engine.render();
    // The loop may have become runnable while this frame was queued.
    this.sync2();
  };

  private sync2(): void {
    if (this.shouldRun() && this.raf === 0) {
      this.last = 0;
      this.raf = requestAnimationFrame(this.tick);
    }
  }

  private readonly onVisibility = (): void => this.sync();

  private readonly onMotionPref = (): void => {
    this.reduced = this.options.reducedMotion ?? this.mq.matches;
    this.sync();
  };
}
