/** Small deterministic helpers. Nothing here allocates after creation. */

/** mulberry32: a seedable PRNG returning floats in [0, 1). */
export function createRng(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const clamp = (v: number, lo: number, hi: number): number => (v < lo ? lo : v > hi ? hi : v);

export const smoothstep = (a: number, b: number, v: number): number => {
  const t = clamp((v - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

/** Shortest signed difference between two angles, in (-π, π]. */
export function angleDelta(from: number, to: number): number {
  let d = (to - from) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d <= -Math.PI) d += Math.PI * 2;
  return d;
}

/**
 * "#rrggbb" or "#rgb" → three floats in 0..1, written into `out`.
 *
 * Deliberately not THREE.Color: that converts sRGB to linear, and these
 * shaders write display values straight to the canvas.
 */
export function hexToRgb(hex: string, out: { x: number; y: number; z: number }): void {
  let h = hex.trim().replace(/^#/, "");
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  const n = parseInt(h.slice(0, 6), 16);
  if (Number.isNaN(n)) return;
  out.x = ((n >> 16) & 255) / 255;
  out.y = ((n >> 8) & 255) / 255;
  out.z = (n & 255) / 255;
}
