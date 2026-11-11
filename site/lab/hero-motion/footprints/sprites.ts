/**
 * The two stamps the density pass draws with. Built once; drawing them
 * each frame is a drawImage with a transform, which allocates nothing.
 *
 * Channels are used as data, not colour: the print is pure red and the
 * halo pure blue, and the density canvas adds them up ("lighter"), so
 * the shader reads print coverage from .r and halo from .b.
 */

/** The print is drawn in a 96×192 design space, stored at half that. */
const DESIGN_W = 96;
const DESIGN_H = 192;
const STORE = 0.5;
export const FOOT_SPRITE_W = DESIGN_W * STORE;
export const FOOT_SPRITE_H = DESIGN_H * STORE;
/** Print width as a fraction of its length. */
export const FOOT_ASPECT = FOOT_SPRITE_W / FOOT_SPRITE_H;
export const HALO_SPRITE = 128;

/**
 * A right shoe print, toes up: a rounded sole that leans toward the big
 * toe, a gap, and a heel. The left print is this one mirrored.
 */
export function createFootSprite(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = FOOT_SPRITE_W;
  canvas.height = FOOT_SPRITE_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  // Stored small on purpose: the density pass shrinks it to roughly
  // 7×16 texels, and a modest source keeps that downscale clean.
  ctx.scale(STORE, STORE);
  ctx.fillStyle = "#ff0000";

  // Ball of the foot and toe box.
  ctx.beginPath();
  ctx.ellipse(46, 50, 35, 43, -0.14, 0, Math.PI * 2);
  ctx.fill();
  // Arch: narrower, tucked toward the outside edge.
  ctx.beginPath();
  ctx.ellipse(53, 92, 25, 30, -0.05, 0, Math.PI * 2);
  ctx.fill();
  // Heel, after a clear gap.
  ctx.beginPath();
  ctx.ellipse(50, 160, 25, 25, 0, 0, Math.PI * 2);
  ctx.fill();
  return canvas;
}

/** A soft round blob for the halo; drawn stretched along the print. */
export function createHaloSprite(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = HALO_SPRITE;
  canvas.height = HALO_SPRITE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  const r = HALO_SPRITE / 2;
  const g = ctx.createRadialGradient(r, r, 0, r, r, r);
  g.addColorStop(0, "rgba(0, 0, 255, 1)");
  g.addColorStop(0.35, "rgba(0, 0, 255, 0.62)");
  g.addColorStop(0.7, "rgba(0, 0, 255, 0.18)");
  g.addColorStop(1, "rgba(0, 0, 255, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, HALO_SPRITE, HALO_SPRITE);
  return canvas;
}
