/**
 * The stamps the density pass draws with. Built once; drawing them each
 * frame is a drawImage with a transform, which allocates nothing.
 *
 * Channels are used as data, not colour, and the density canvas adds
 * them up ("lighter"):
 *   red    footprint coverage  → solid, full-size dots
 *   green  body coverage       → sparse, smaller dots (legs and waist)
 *   blue   halo                → tints the paper
 */

/** Prints are drawn in a 96×192 design space, toes up, stored at half that. */
const DESIGN_W = 96;
const DESIGN_H = 192;
const STORE = 0.5;
/** Print width as a fraction of its length. */
export const FOOT_ASPECT = DESIGN_W / DESIGN_H;
export const HALO_SPRITE = 128;

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
 * sprite. The left foot is the same sprite mirrored.
 */
const PRINTS: Record<PrintStyle, Draw> = {
  // Rounded toe box, a gap, a round heel.
  sneaker(ctx) {
    ellipse(ctx, 46, 50, 35, 43, -0.14);
    ellipse(ctx, 53, 92, 25, 30, -0.05);
    ellipse(ctx, 50, 160, 25, 25);
  },

  // Bare foot: five separate toes, a ball, a narrow arch that hugs the
  // outside edge, and a heel, all joined.
  barefoot(ctx) {
    ellipse(ctx, 22, 24, 12, 14, -0.2);
    ellipse(ctx, 43, 13, 8.5, 10);
    ellipse(ctx, 59, 14, 7.5, 9);
    ellipse(ctx, 72, 20, 7, 8.5, 0.2);
    ellipse(ctx, 83, 31, 6.5, 8, 0.35);
    ellipse(ctx, 49, 64, 33, 27, -0.12);
    ellipse(ctx, 62, 108, 17, 36, -0.06);
    ellipse(ctx, 53, 160, 22, 26);
  },

  // Work boot: wide, square-shouldered sole and a big block heel.
  boot(ctx) {
    roundRect(ctx, 10, 6, 76, 112, 30);
    roundRect(ctx, 16, 134, 64, 54, 12);
  },

  // High heel: a pointed, triangular forefoot and a small stiletto dot
  // a long way behind it.
  heel(ctx) {
    ctx.beginPath();
    ctx.moveTo(44, 4);
    ctx.bezierCurveTo(70, 28, 80, 58, 72, 86);
    ctx.bezierCurveTo(68, 104, 58, 116, 50, 118);
    ctx.bezierCurveTo(40, 116, 28, 102, 24, 84);
    ctx.bezierCurveTo(18, 56, 26, 26, 44, 4);
    ctx.fill();
    ellipse(ctx, 50, 172, 10, 10);
  },

  // Dress shoe: slim, with a tapered almond toe and a D-shaped heel.
  oxford(ctx) {
    ctx.beginPath();
    ctx.moveTo(46, 4);
    ctx.bezierCurveTo(66, 10, 78, 40, 76, 70);
    ctx.bezierCurveTo(74, 96, 66, 114, 60, 122);
    ctx.lineTo(36, 122);
    ctx.bezierCurveTo(28, 110, 20, 92, 20, 68);
    ctx.bezierCurveTo(20, 38, 30, 10, 46, 4);
    ctx.fill();
    roundRect(ctx, 28, 138, 42, 50, 16);
  },

  // Sandal: one broad, even slab from toe to heel, no gap.
  sandal(ctx) {
    ellipse(ctx, 46, 54, 33, 48, -0.1);
    ellipse(ctx, 52, 138, 26, 46, 0.03);
  },
};

function canvas(width: number, height: number) {
  const el = document.createElement("canvas");
  el.width = width;
  el.height = height;
  return { el, ctx: el.getContext("2d") };
}

/**
 * One sprite per print style, in PRINT_STYLES order.
 *
 * Stored small on purpose: the density pass shrinks each one to roughly
 * 7×16 texels, and a modest source keeps that downscale clean.
 */
export function createFootSprites(): HTMLCanvasElement[] {
  return PRINT_STYLES.map((style) => {
    const { el, ctx } = canvas(DESIGN_W * STORE, DESIGN_H * STORE);
    if (!ctx) return el;
    ctx.scale(STORE, STORE);
    ctx.fillStyle = "#ff0000";
    PRINTS[style](ctx);
    return el;
  });
}

/** A soft round blob for the halo; drawn stretched along the print. */
export function createHaloSprite(): HTMLCanvasElement {
  const { el, ctx } = canvas(HALO_SPRITE, HALO_SPRITE);
  if (!ctx) return el;
  const r = HALO_SPRITE / 2;
  const g = ctx.createRadialGradient(r, r, 0, r, r, r);
  g.addColorStop(0, "rgba(0, 0, 255, 1)");
  g.addColorStop(0.35, "rgba(0, 0, 255, 0.62)");
  g.addColorStop(0.7, "rgba(0, 0, 255, 0.18)");
  g.addColorStop(1, "rgba(0, 0, 255, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, HALO_SPRITE, HALO_SPRITE);
  return el;
}

/**
 * How much body there is at each height, 0 (ankle) to 1 (mid-waist).
 * The shader turns this number into both dot size and how many cells
 * get a dot at all, so a falling value reads as "thinning out upward".
 * It reaches zero exactly at the top: nothing is drawn above mid-waist.
 */
export const LEG_SHARE = 0.76;
const bodyAt = (h: number) => (1 - h) ** 0.95;

export const LEG_SPRITE_W = 32;
export const LEG_SPRITE_H = 128;

/**
 * One leg: the sprite's bottom edge is the ankle and its top edge the
 * hip. Narrow at the ankle, wider at the thigh, fading as it rises.
 */
export function createLegSprite(): HTMLCanvasElement {
  const { el, ctx } = canvas(LEG_SPRITE_W, LEG_SPRITE_H);
  if (!ctx) return el;
  const g = ctx.createLinearGradient(0, LEG_SPRITE_H, 0, 0);
  for (let i = 0; i <= 8; i++) {
    const k = i / 8;
    g.addColorStop(k, `rgba(0, 255, 0, ${bodyAt(k * LEG_SHARE).toFixed(3)})`);
  }
  ctx.fillStyle = g;
  const cx = LEG_SPRITE_W / 2;
  ctx.beginPath();
  ctx.moveTo(cx - 9, LEG_SPRITE_H);
  ctx.lineTo(cx + 9, LEG_SPRITE_H);
  ctx.lineTo(cx + 14, 0);
  ctx.lineTo(cx - 14, 0);
  ctx.closePath();
  ctx.fill();
  return el;
}

export const WAIST_SPRITE_W = 96;
export const WAIST_SPRITE_H = 48;

/**
 * Hips to mid-waist: the sprite's bottom edge is the hip line. It picks
 * up where the legs leave off and fades to nothing at its top edge.
 */
export function createWaistSprite(): HTMLCanvasElement {
  const { el, ctx } = canvas(WAIST_SPRITE_W, WAIST_SPRITE_H);
  if (!ctx) return el;
  const g = ctx.createLinearGradient(0, WAIST_SPRITE_H, 0, 0);
  for (let i = 0; i <= 6; i++) {
    const k = i / 6;
    g.addColorStop(k, `rgba(0, 255, 0, ${bodyAt(LEG_SHARE + k * (1 - LEG_SHARE)).toFixed(3)})`);
  }
  ctx.fillStyle = g;
  // Slightly narrower at the waist than at the hips.
  ctx.beginPath();
  ctx.moveTo(4, WAIST_SPRITE_H);
  ctx.lineTo(WAIST_SPRITE_W - 4, WAIST_SPRITE_H);
  ctx.lineTo(WAIST_SPRITE_W - 16, 0);
  ctx.lineTo(16, 0);
  ctx.closePath();
  ctx.fill();
  return el;
}
