import { clamp, createRng } from "../shared/rng";
import { MAX_BLOBS } from "./params";

/**
 * ════════════════════════════════════════════════════════════════════
 *  BLOBS — a sealed room of heavy liquid, in very low gravity.
 *
 *  This is a lava lamp with the glass taken away. Each mass has a
 *  temperature. Near the floor it slowly warms and near the ceiling it
 *  slowly cools; warm masses are buoyant, cool ones sink. On top of that
 *  slow cycle:
 *
 *    · a gentle current (divergence-free, so it stirs without piling
 *      liquid up anywhere) carries everything around
 *    · neighbours attract at arm's length and repel up close, so masses
 *      gather, hang together and peel apart
 *    · heavy drag: nothing coasts, nothing bounces
 *    · a moving mass stretches along its direction of travel
 *
 *  Nothing is ever removed or respawned, so it can run indefinitely.
 *  World units: the visible height at the focal plane is 2.
 *
 *  Fixed timestep, seeded, and no allocation after the constructor.
 * ════════════════════════════════════════════════════════════════════
 */

const TICK = 1 / 60;
/** Masses per chain: a head and its followers. */
const CHAIN = 3;
const MAX_TICKS = 6;

export type BlobConfig = {
  count: number;
  coverage: number;
  flowSpeed: number;
  gravity: number;
  buoyancy: number;
  stretch: number;
  /** Width over height of the view. The room is as wide as the frame. */
  aspect: number;
};

export class BlobSim {
  /** x, y, z, radius per blob: uploaded as-is. */
  readonly spheres = new Float32Array(MAX_BLOBS * 4);
  /** Stretch axis x, y, z and squash (0 = round) per blob: uploaded as-is. */
  readonly axes = new Float32Array(MAX_BLOBS * 4);
  time = 0;

  private readonly vel = new Float32Array(MAX_BLOBS * 3);
  private readonly base = new Float32Array(MAX_BLOBS);
  private readonly heat = new Float32Array(MAX_BLOBS);
  private readonly phase = new Float32Array(MAX_BLOBS);
  private readonly amount = new Float32Array(MAX_BLOBS);
  private carry = 0;
  private count = 0;

  reset(seed: number, cfg: BlobConfig): void {
    const rng = createRng(Math.round(seed) * 104729 + 7);
    const halfX = this.halfWidth(cfg);
    this.time = 0;
    this.carry = 0;
    this.count = clamp(Math.round(cfg.count), 1, MAX_BLOBS);
    let head = 0.3;
    for (let i = 0; i < MAX_BLOBS; i++) {
      // A few big masses and a spread of droplets.
      // Masses come in threes: a head and two smaller followers tied to
      // it. Moving, a chain strings out into a tapering stream; at rest
      // it draws back into one body.
      const place = i % CHAIN;
      if (place === 0) head = 0.2 + 0.4 * Math.pow(rng(), 1.6);
      this.base[i] = head * (place === 0 ? 1 : place === 1 ? 0.66 : 0.44);
      this.heat[i] = rng();
      this.phase[i] = rng() * Math.PI * 2;
      this.amount[i] = 0;
      if (place === 0) {
        this.spheres[i * 4] = (rng() * 2 - 1) * halfX * 0.85;
        this.spheres[i * 4 + 1] = (rng() * 2 - 1) * 1.0;
        this.spheres[i * 4 + 2] = -0.5 + rng() * 1.6;
      } else {
        // Followers start beside their head.
        this.spheres[i * 4] = this.spheres[(i - 1) * 4] + (rng() - 0.5) * 0.3;
        this.spheres[i * 4 + 1] = this.spheres[(i - 1) * 4 + 1] + (rng() - 0.5) * 0.3;
        this.spheres[i * 4 + 2] = this.spheres[(i - 1) * 4 + 2] + (rng() - 0.5) * 0.3;
      }
      this.spheres[i * 4 + 3] = this.base[i];
      this.vel[i * 3] = this.vel[i * 3 + 1] = this.vel[i * 3 + 2] = 0;
      this.axes[i * 4] = 0;
      this.axes[i * 4 + 1] = 1;
      this.axes[i * 4 + 2] = 0;
      this.axes[i * 4 + 3] = 0;
    }
    // Let it find a natural arrangement before anyone sees it.
    for (let i = 0; i < 45 / TICK; i++) this.tick(TICK, cfg);
  }

  update(dt: number, cfg: BlobConfig): void {
    this.count = clamp(Math.round(cfg.count), 1, MAX_BLOBS);
    this.carry += dt;
    for (let i = 0; i < MAX_TICKS && this.carry >= TICK; i++) {
      this.carry -= TICK;
      this.tick(TICK, cfg);
    }
    if (this.carry > TICK) this.carry = 0;
  }

  private halfWidth(cfg: BlobConfig): number {
    return Math.max(0.8, cfg.aspect) * 0.98;
  }

  private tick(h: number, cfg: BlobConfig): void {
    this.time += h;
    const t = this.time;
    const n = this.count;
    const s = this.spheres;
    const v = this.vel;
    const halfX = this.halfWidth(cfg);
    const halfY = 1.05;
    const nearZ = -0.6;
    const farZ = 1.3;
    const size = 0.6 + 0.85 * clamp(cfg.coverage, 0, 1);
    const flow = 0.034 * cfg.flowSpeed;
    const drag = 0.55;

    for (let i = 0; i < n; i++) {
      const x = s[i * 4];
      const y = s[i * 4 + 1];
      const z = s[i * 4 + 2];
      // Warm masses swell a little; everything breathes.
      const r =
        this.base[i] * size * (1 + 0.1 * this.heat[i] + 0.035 * Math.sin(t * 0.21 + this.phase[i]));
      s[i * 4 + 3] = r;

      // The lamp: warm at the bottom, cool at the top, slowly.
      const level = y / halfY;
      const rate = h / (7 * (0.6 + r));
      if (level < -0.4) this.heat[i] = Math.min(1, this.heat[i] + rate);
      else if (level > 0.4) this.heat[i] = Math.max(0, this.heat[i] - rate);

      // An ABC flow: each component depends only on the other two axes,
      // so it has no divergence. It stirs; it never compresses.
      const fx = flow * (Math.sin(z * 2.6 + t * 0.11) + Math.cos(y * 2.3 - t * 0.07));
      const fy = flow * 0.6 * (Math.sin(x * 2.1 + t * 0.09) + Math.cos(z * 2.4 + t * 0.05));
      const fz = flow * 0.6 * (Math.sin(y * 2.2 - t * 0.08) + Math.cos(x * 2.5 + t * 0.06));

      let ax = drag * (fx - v[i * 3]);
      let ay = drag * (fy - v[i * 3 + 1]);
      let az = drag * (fz - v[i * 3 + 2]);
      ay += 0.058 * cfg.buoyancy * (this.heat[i] - 0.5) * 2 - 0.011 * cfg.gravity;

      // Neighbours: drawn together from a distance, held apart up close.
      for (let j = 0; j < n; j++) {
        if (j === i) continue;
        const dx = s[j * 4] - x;
        const dy = s[j * 4 + 1] - y;
        const dz = s[j * 4 + 2] - z;
        const d = Math.hypot(dx, dy, dz);
        const same = Math.floor(i / CHAIN) === Math.floor(j / CHAIN);
        // Only a chain's own masses draw together. Strangers keep a wide,
        // gentle distance, so the room holds several bodies spread through
        // it that pass and nudge, rather than one that swallows the rest.
        const reach = (r + s[j * 4 + 3]) * (same ? 1.5 : 3.2);
        if (d >= reach || d < 1e-4) continue;
        const rest = (r + s[j * 4 + 3]) * 0.9;
        if (!same) {
          const away = 1 - d / reach;
          const push = (-0.05 * away * away) / d;
          ax += dx * push;
          ay += dy * push * 0.5;
          az += dz * push;
          if (d >= rest) continue;
        }
        const u = d / reach;
        const window = (1 - u * u) * (1 - u * u);
        // The bigger mass barely notices the smaller one.
        const mi = r * r * r;
        const mj = s[j * 4 + 3] * s[j * 4 + 3] * s[j * 4 + 3];
        const pull = (0.085 * (d - rest) * window * mj) / ((mi + mj) * d);
        ax += dx * pull;
        ay += dy * pull;
        az += dz * pull;
      }

      // Tied to the mass ahead of it in its chain. The tie is slack up
      // close and firm when stretched, so a stream can neck but not snap.
      if (i % CHAIN !== 0) {
        const k = i - 1;
        const dx = s[k * 4] - x;
        const dy = s[k * 4 + 1] - y;
        const dz = s[k * 4 + 2] - z;
        const d = Math.hypot(dx, dy, dz);
        const slack = (r + s[k * 4 + 3]) * 0.75;
        if (d > slack) {
          const tug = (0.5 * (d - slack)) / d;
          ax += dx * tug;
          ay += dy * tug;
          az += dz * tug;
        }
      }

      // The room has soft walls.
      const wall = 0.9;
      if (x > halfX) ax -= wall * (x - halfX);
      if (x < -halfX) ax -= wall * (x + halfX);
      if (y > halfY) ay -= wall * (y - halfY);
      if (y < -halfY) ay -= wall * (y + halfY);
      if (z > farZ) az -= wall * (z - farZ);
      if (z < nearZ) az -= wall * (z - nearZ);

      v[i * 3] += ax * h;
      v[i * 3 + 1] += ay * h;
      v[i * 3 + 2] += az * h;
    }

    for (let i = 0; i < n; i++) {
      s[i * 4] += v[i * 3] * h;
      s[i * 4 + 1] += v[i * 3 + 1] * h;
      s[i * 4 + 2] += v[i * 3 + 2] * h;

      // Stretch along the motion. The axis turns slowly and never flips
      // (an ellipsoid looks the same either way round, but a lerp does
      // not know that).
      const a = this.axes;
      const speed = Math.hypot(v[i * 3], v[i * 3 + 1], v[i * 3 + 2]);
      if (speed > 1e-4) {
        let tx = v[i * 3] / speed;
        let ty = v[i * 3 + 1] / speed;
        let tz = v[i * 3 + 2] / speed;
        if (tx * a[i * 4] + ty * a[i * 4 + 1] + tz * a[i * 4 + 2] < 0) {
          tx = -tx;
          ty = -ty;
          tz = -tz;
        }
        const turn = Math.min(1, h * 1.2);
        let nx = a[i * 4] + (tx - a[i * 4]) * turn;
        let ny = a[i * 4 + 1] + (ty - a[i * 4 + 1]) * turn;
        let nz = a[i * 4 + 2] + (tz - a[i * 4 + 2]) * turn;
        const len = Math.hypot(nx, ny, nz) || 1;
        nx /= len;
        ny /= len;
        nz /= len;
        a[i * 4] = nx;
        a[i * 4 + 1] = ny;
        a[i * 4 + 2] = nz;
      }
      const want = 1 + cfg.stretch * 0.7 * Math.min(speed / 0.05, 1.6);
      this.amount[i] += (want - 1 - this.amount[i]) * Math.min(1, h * 1.4);
      // The shader wants 1 − 1/stretch: 0 for a sphere.
      a[i * 4 + 3] = 1 - 1 / (1 + this.amount[i]);
    }
  }
}
