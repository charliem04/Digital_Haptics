import type { HeroMotionHandle } from "../shared/useStage";

/**
 * Lab-only review tools, on `window.__lab`.
 *
 * Judging motion from a live canvas is unreliable: a screenshot catches
 * one arbitrary frame, often mid-fade, at whatever scale the viewer
 * happens to be using. These tools take the stage off its clock and
 * build CONTACT SHEETS instead: a run of frames at exact time steps,
 * read straight from the GL buffer and laid out side by side in an
 * overlay, so a whole stride (or a whole minute) can be looked at once.
 *
 *   __lab.sheet("feet", { frames: 8, gap: 0.15, cols: 4, width: 250 })
 *   __lab.frame("liquid", 1000)        one frame, 1000 px wide
 *   __lab.hide()
 */

type Renderable = { render(): void; renderer: { domElement: HTMLCanvasElement } };
type Handles = Record<string, { current: HeroMotionHandle<Renderable> | null }>;
/** x, y, width, height in drawing-buffer pixels. */
type Crop = [number, number, number, number];

export type SheetOptions = {
  frames?: number;
  /** Seconds between frames. */
  gap?: number;
  cols?: number;
  /** Width of each frame in the sheet, in overlay pixels. */
  width?: number;
  crop?: Crop;
  /** Runs before each frame is drawn (move the light, say). */
  each?: (index: number) => void;
};

function shrink(source: HTMLCanvasElement, width: number): HTMLCanvasElement {
  let c = source;
  const step = (w: number, h: number) => {
    const n = document.createElement("canvas");
    n.width = w;
    n.height = h;
    const ctx = n.getContext("2d");
    if (ctx) {
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(c, 0, 0, w, h);
    }
    c = n;
  };
  // Halve repeatedly: one big downscale aliases fine dot grids badly.
  while (c.width >= width * 2) step(c.width >> 1, c.height >> 1);
  if (c.width !== width) step(width, Math.round((c.height * width) / c.width));
  return c;
}

export function installLabDebug(): void {
  const host = window as unknown as {
    __heroLab?: Handles;
    __lab?: Record<string, unknown>;
  };
  const handle = (id: string) => host.__heroLab?.[id]?.current ?? null;

  /** Copy the current frame out of the GL buffer (valid only right after a render). */
  const grab = (id: string, width?: number, crop?: Crop): HTMLCanvasElement | null => {
    const engine = handle(id)?.engine();
    if (!engine) return null;
    engine.render();
    const src = engine.renderer.domElement;
    const [x, y, w, h] = crop ?? [0, 0, src.width, src.height];
    const copy = document.createElement("canvas");
    copy.width = w;
    copy.height = h;
    copy.getContext("2d")?.drawImage(src, x, y, w, h, 0, 0, w, h);
    return width ? shrink(copy, width) : copy;
  };

  const hide = () => document.getElementById("__lab-sheet")?.remove();

  /**
   * `scale` is overlay pixels per CSS pixel. 1 shows frames at their own
   * pixel size in CSS px; pass the viewer's capture scale to make one
   * frame pixel land on one captured pixel.
   */
  const show = (frames: HTMLCanvasElement[], cols = 1, scale = 1) => {
    hide();
    const overlay = document.createElement("div");
    overlay.id = "__lab-sheet";
    overlay.style.cssText =
      "position:fixed;inset:0;z-index:99999;background:#555;display:grid;" +
      `gap:${2 / scale}px;align-content:start;overflow:hidden;` +
      `grid-template-columns:repeat(${cols},max-content)`;
    for (const frame of frames) {
      frame.style.cssText = `display:block;width:${frame.width / scale}px;height:${frame.height / scale}px`;
      overlay.appendChild(frame);
    }
    overlay.addEventListener("click", hide);
    document.body.appendChild(overlay);
  };

  const sheet = (id: string, options: SheetOptions = {}, scale = 1): number => {
    const { frames = 8, gap = 0.15, cols = 4, width = 250, crop, each } = options;
    const h = handle(id);
    if (!h) return 0;
    h.hold(true);
    const out: HTMLCanvasElement[] = [];
    for (let i = 0; i < frames; i++) {
      for (let k = 0; k < Math.max(1, Math.round(gap * 60)); k++) h.step(1 / 60);
      each?.(i);
      const frame = grab(id, width, crop);
      if (frame) out.push(frame);
    }
    show(out, cols, scale);
    return out.length;
  };

  const frame = (id: string, width: number, scale = 1, crop?: Crop) => {
    const c = grab(id, width, crop);
    if (c) show([c], 1, scale);
  };

  /** Advance without drawing a sheet. */
  const run = (id: string, seconds: number) => {
    const h = handle(id);
    if (!h) return;
    h.hold(true);
    for (let k = 0; k < Math.round(seconds * 60); k++) h.step(1 / 60);
  };

  host.__lab = { grab, show, hide, sheet, frame, run, handle };
}
