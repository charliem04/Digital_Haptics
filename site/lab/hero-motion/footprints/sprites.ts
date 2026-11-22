/**
 * The sole shapes, drawn once into a single atlas texture.
 *
 * Each cell holds one right-foot print, toes up, white on black, with a
 * deliberately soft edge. The density shader does not use that softness
 * as blur: it thresholds it. Moving the threshold shrinks or swells the
 * print, which is how light pressure gets a thinner, broken-edged mark
 * and full weight gets the whole sole.
 */

/** Prints are designed in a 96×192 box. */
const DESIGN_W = 96;
const DESIGN_H = 192;
/** Print width as a fraction of its length. */
export const FOOT_ASPECT = DESIGN_W / DESIGN_H;

export const CELL_W = 64;
export const CELL_H = 128;
/** How much of a cell the print itself fills; the rest is soft margin. */
export const CELL_FILL = 0.8;

export const PRINT_STYLES = ["sneaker", "barefoot", "boot", "heel", "oxford", "sandal"] as const;
export type PrintStyle = (typeof PRINT_STYLES)[number];

type Draw = (ctx: CanvasRenderingContext2D) => void;

const ellipse = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  rot = 0
) => {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
  ctx.fill();
};

const roundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) => {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
};

/**
 * Every print is a RIGHT foot: the big-toe side is on the left of the
 * cell. The left foot is the same cell mirrored.
 *
 * Shapes are narrower than a real sole on purpose. Only the parts of a
 * foot that actually bear weight reach the glass.
 */
const PRINTS: Record<PrintStyle, Draw> = {
  // Rounded toe box, a waist, a round heel.
  sneaker(ctx) {
    ellipse(ctx, 46, 48, 30, 42, -0.14);
    ellipse(ctx, 54, 96, 17, 30, -0.05);
    ellipse(ctx, 50, 160, 22, 25);
  },

  // Bare foot: five separate toes, the ball, the outer edge, the heel.
  barefoot(ctx) {
    ellipse(ctx, 22, 22, 12, 14, -0.2);
    ellipse(ctx, 43, 12, 8.5, 10);
    ellipse(ctx, 59, 13, 7.5, 9);
    ellipse(ctx, 72, 20, 7, 8.5, 0.2);
    ellipse(ctx, 83, 31, 6.5, 8, 0.35);
    ellipse(ctx, 49, 66, 32, 24, -0.12);
    ellipse(ctx, 66, 112, 12, 34, -0.06);
    ellipse(ctx, 54, 162, 20, 24);
  },

  // Work boot: wide, square-shouldered sole and a big block heel.
  boot(ctx) {
    roundRect(ctx, 10, 6, 76, 108, 30);
    roundRect(ctx, 16, 136, 64, 52, 12);
  },

  // High heel: a pointed forefoot and a small stiletto dot far behind.
  heel(ctx) {
    ctx.beginPath();
    ctx.moveTo(44, 4);
    ctx.bezierCurveTo(70, 28, 80, 58, 72, 84);
    ctx.bezierCurveTo(68, 100, 58, 110, 50, 112);
    ctx.bezierCurveTo(40, 110, 28, 98, 24, 82);
    ctx.bezierCurveTo(18, 56, 26, 26, 44, 4);
    ctx.fill();
    ellipse(ctx, 50, 172, 11, 11);
  },

  // Dress shoe: slim, with a tapered almond toe and a D-shaped heel.
  oxford(ctx) {
    ctx.beginPath();
    ctx.moveTo(46, 4);
    ctx.bezierCurveTo(64, 10, 74, 40, 72, 70);
    ctx.bezierCurveTo(70, 94, 64, 110, 58, 118);
    ctx.lineTo(38, 118);
    ctx.bezierCurveTo(30, 108, 24, 92, 24, 68);
    ctx.bezierCurveTo(24, 38, 32, 10, 46, 4);
    ctx.fill();
    roundRect(ctx, 30, 140, 38, 48, 15);
  },

  // Sandal: one long, even slab from toe to heel.
  sandal(ctx) {
    ellipse(ctx, 46, 54, 30, 48, -0.1);
    ellipse(ctx, 52, 138, 23, 46, 0.03);
  },
};

/**
 * All six prints in a row, in PRINT_STYLES order. The red channel is the
 * soft-edged shape; the canvas is opaque so nothing is premultiplied.
 */
export function createPrintAtlas(): HTMLCanvasElement {
  const atlas = document.createElement("canvas");
  atlas.width = CELL_W * PRINT_STYLES.length;
  atlas.height = CELL_H;
  const out = atlas.getContext("2d");
  if (!out) return atlas;
  out.fillStyle = "#000";
  out.fillRect(0, 0, atlas.width, atlas.height);

  const sharp = document.createElement("canvas");
  sharp.width = CELL_W;
  sharp.height = CELL_H;
  const ctx = sharp.getContext("2d");
  if (!ctx) return atlas;

  // The same shape stamped faintly around a small disc: a cheap, exact
  // blur that needs no canvas filter support.
  const taps = 16;
  const radius = 3.6;
  out.globalCompositeOperation = "lighter";
  PRINT_STYLES.forEach((style, index) => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, CELL_W, CELL_H);
    const scale = (CELL_W * CELL_FILL) / DESIGN_W;
    ctx.setTransform(
      scale,
      0,
      0,
      scale,
      (CELL_W * (1 - CELL_FILL)) / 2,
      (CELL_H * (1 - CELL_FILL)) / 2
    );
    ctx.fillStyle = "#fff";
    PRINTS[style](ctx);

    out.save();
    out.beginPath();
    out.rect(index * CELL_W, 0, CELL_W, CELL_H);
    out.clip();
    out.globalAlpha = 1 / (taps + 1);
    out.drawImage(sharp, index * CELL_W, 0);
    for (let k = 0; k < taps; k++) {
      const a = (k / taps) * Math.PI * 2;
      const r = radius * (k % 2 === 0 ? 1 : 0.55);
      out.drawImage(sharp, index * CELL_W + Math.cos(a) * r, Math.sin(a) * r);
    }
    out.restore();
  });
  return atlas;
}
