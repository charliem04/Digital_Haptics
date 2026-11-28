/**
 * ════════════════════════════════════════════════════════════════════
 *  PERFORMANCE PROBE (perf branch, Phase 0). Off unless the URL has
 *  `?perf`. Nothing else on the page changes without it.
 *
 *    ?perf                       the HUD: page fps, long tasks, liquid
 *    ?perf&off=liquid,grain,motion,trim,glow,blur
 *                                switch layers off to see what each costs:
 *                                liquid  the WebGL hero (poster instead)
 *                                grain   the fixed film-grain overlay
 *                                motion  embers, dividers, page transition
 *                                trim    the spinning case-card trims
 *                                glow    inner pages' fixed drifting glow
 *                                blur    every backdrop-filter
 *    ?perf&scale=0.2&blobs=6&dpr=1&px=3000000&fps=60&gov=off&tier=phone
 *                                try liquid settings without rebuilding
 *
 *  Read once per page load. Safe on the server: returns null there.
 * ════════════════════════════════════════════════════════════════════
 */

export const PERF_LAYERS = ["liquid", "grain", "motion", "trim", "glow", "blur"] as const;
export type PerfLayer = (typeof PERF_LAYERS)[number];

/** Per-visit overrides for the liquid renderer. Unset keeps the default. */
export type LiquidOverrides = {
  renderScale?: number;
  blobCount?: number;
  maxDpr?: number;
  /** Canvas pixel budget. */
  maxCanvasPixels?: number;
  /** Frame-rate cap (240 is effectively uncapped). */
  fps?: number;
  /** false switches off the runtime step-down and freeze. */
  governor?: boolean;
  /** Force the phone or desktop settings regardless of width. */
  tier?: "phone" | "desktop";
  /** Report frame stats back to the page. */
  stats?: boolean;
};

export type PerfFlags = {
  off: ReadonlySet<PerfLayer>;
  liquid: LiquidOverrides;
};

let cached: PerfFlags | null | undefined;

const num = (value: string | null, min: number, max: number) => {
  if (value === null || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : undefined;
};

export function perfFlags(): PerfFlags | null {
  if (cached !== undefined) return cached;
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  if (!params.has("perf")) return (cached = null);
  const off = new Set(
    (params.get("off") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter((s): s is PerfLayer => (PERF_LAYERS as readonly string[]).includes(s))
  );
  const tier = params.get("tier");
  cached = {
    off,
    liquid: {
      renderScale: num(params.get("scale"), 0.05, 1),
      blobCount: num(params.get("blobs"), 1, 16),
      maxDpr: num(params.get("dpr"), 0.5, 3),
      maxCanvasPixels: num(params.get("px"), 100_000, 50_000_000),
      fps: num(params.get("fps"), 5, 240),
      governor: params.get("gov") === "off" ? false : undefined,
      tier: tier === "phone" || tier === "desktop" ? tier : undefined,
      stats: true,
    },
  };
  return cached;
}

/** The liquid's report, sent about twice a second while it runs. */
export type LiquidStats = {
  /** Average frame interval over the last report, ms. */
  frameMs: number;
  /** 95th percentile frame interval, ms. */
  p95Ms: number;
  /** GPU time per frame from a timer query, ms, when the browser allows it. */
  gpuMs: number | null;
  /** Average CPU time inside engine.frame (simulation and GL calls), ms. */
  cpuMs: number;
  frames: number;
  sceneW: number;
  sceneH: number;
  canvasW: number;
  canvasH: number;
  renderScale: number;
  blobCount: number;
  steppedDown: boolean;
  frozen: boolean;
  running: boolean;
  renderer: string;
  thread: "worker" | "main";
};

export const LIQUID_STATS_EVENT = "liquid:stats";
export const LIQUID_STATE_EVENT = "liquid:state";
