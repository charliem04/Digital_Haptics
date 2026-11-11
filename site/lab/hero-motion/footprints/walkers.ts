import { angleDelta, clamp, createRng, smoothstep } from "../shared/rng";

/**
 * ════════════════════════════════════════════════════════════════════
 *  WALKERS — who is walking where. Pure simulation, no drawing.
 *
 *  A walker is a point with a heading. Every `stride / speed` seconds it
 *  takes a step: it moves one stride along its heading and leaves a print
 *  half a gauge to the left or right, alternating. Only the newest
 *  `trailLength` prints stay inked, so it reads as a person walking and
 *  not as a line being drawn.
 *
 *  Every object here is created once in the constructor. Stepping the
 *  simulation allocates nothing.
 * ════════════════════════════════════════════════════════════════════
 */

export const MAX_WALKERS = 12;
const RING = 28;
/** Seconds for a print to ink in / fade out. */
const INK_IN = 0.12;
const FADE_OUT = 0.75;

const WALK = 0;
const PAUSE = 1;
const PIVOT = 2;

export type Print = {
  x: number;
  y: number;
  /** Direction the toes point, radians (y is down). */
  angle: number;
  /** +1 right foot, -1 left foot. */
  side: number;
  born: number;
  /** Time the fade-out starts, or -1 while it is still part of the trail. */
  expire: number;
  /** The walker's step count when this was placed. */
  step: number;
  alive: boolean;
};

export type Walker = {
  active: boolean;
  x: number;
  y: number;
  heading: number;
  speedK: number;
  strideK: number;
  side: number;
  clock: number;
  mode: number;
  pause: number;
  pivotLeft: number;
  pivotTurn: number;
  steps: number;
  exited: boolean;
  f1: number;
  f2: number;
  p1: number;
  p2: number;
  head: number;
  prints: Print[];
};

export type WalkConfig = {
  walkSpeed: number;
  strideLength: number;
  pivotChance: number;
  trailLength: number;
  /** Print length in CSS px (FOOT_LENGTH × footScale). */
  footLength: number;
};

/** 0–1 ink for a print at time `t`. */
export function printInk(p: Print, t: number): number {
  if (!p.alive) return 0;
  const inked = smoothstep(0, INK_IN, t - p.born);
  return p.expire < 0 ? inked : inked * (1 - smoothstep(0, FADE_OUT, t - p.expire));
}

export class WalkerSim {
  readonly walkers: Walker[] = [];
  /** Simulation clock, seconds. Print times are on this clock. */
  time = 0;
  private rng = createRng(1);
  private width = 1;
  private height = 1;
  private inside = 0;

  constructor() {
    for (let i = 0; i < MAX_WALKERS; i++) {
      const prints: Print[] = [];
      for (let j = 0; j < RING; j++) {
        prints.push({
          x: 0,
          y: 0,
          angle: 0,
          side: 1,
          born: 0,
          expire: -1,
          step: 0,
          alive: false,
        });
      }
      this.walkers.push({
        active: false,
        x: 0,
        y: 0,
        heading: 0,
        speedK: 1,
        strideK: 1,
        side: 1,
        clock: 0,
        mode: WALK,
        pause: 0,
        pivotLeft: 0,
        pivotTurn: 0,
        steps: 0,
        exited: false,
        f1: 0,
        f2: 0,
        p1: 0,
        p2: 0,
        head: 0,
        prints,
      });
    }
  }

  /**
   * Start over from `seed`. Half the walkers start inside the frame and
   * the simulation is run forward a few seconds, so the very first frame
   * already has people mid-walk.
   */
  reset(seed: number, count: number, width: number, height: number, cfg: WalkConfig): void {
    this.rng = createRng(Math.round(seed) * 7919 + 13);
    this.width = width;
    this.height = height;
    this.time = 0;
    const n = clamp(Math.round(count), 1, MAX_WALKERS);
    for (let i = 0; i < MAX_WALKERS; i++) {
      const w = this.walkers[i];
      w.active = i < n;
      for (let j = 0; j < RING; j++) w.prints[j].alive = false;
      if (!w.active) continue;
      this.spawn(w, cfg);
      if (i % 2 === 0) {
        w.x = width * (0.15 + 0.7 * this.rng());
        w.y = height * (0.15 + 0.7 * this.rng());
        w.heading = this.rng() * Math.PI * 2;
      }
    }
    for (let i = 0; i < 240; i++) this.update(1 / 30, width, height, cfg);
  }

  /** Add or retire walkers without disturbing the ones already walking. */
  setCount(count: number, cfg: WalkConfig): void {
    const n = clamp(Math.round(count), 1, MAX_WALKERS);
    for (let i = 0; i < MAX_WALKERS; i++) {
      const w = this.walkers[i];
      if (i < n && !w.active) {
        w.active = true;
        for (let j = 0; j < RING; j++) w.prints[j].alive = false;
        this.spawn(w, cfg);
      } else if (i >= n && w.active) {
        // Retired walkers stop stepping; their prints fade out normally.
        w.active = false;
        this.expireAll(w);
      }
    }
  }

  update(dt: number, width: number, height: number, cfg: WalkConfig): void {
    this.width = width;
    this.height = height;
    this.time += dt;
    const t = this.time;

    let inside = 0;
    for (let i = 0; i < MAX_WALKERS; i++) {
      const w = this.walkers[i];
      if (w.active && !w.exited && w.x > 0 && w.x < width && w.y > 0 && w.y < height) inside++;
    }
    this.inside = inside;

    for (let i = 0; i < MAX_WALKERS; i++) {
      const w = this.walkers[i];

      let alive = 0;
      for (let j = 0; j < RING; j++) {
        const p = w.prints[j];
        if (!p.alive) continue;
        if (p.expire >= 0 && t - p.expire > FADE_OUT) p.alive = false;
        else alive++;
      }
      if (!w.active) continue;

      if (w.exited) {
        // Gone, and the last print has faded: come back in somewhere else.
        if (alive === 0) this.spawn(w, cfg);
        continue;
      }
      if (w.mode === PAUSE) {
        w.pause -= dt;
        if (w.pause <= 0) w.mode = WALK;
        continue;
      }

      const stride = Math.max(8, cfg.strideLength * w.strideK);
      const speed = Math.max(1, cfg.walkSpeed * w.speedK);
      const interval = (stride / speed) * (w.mode === PIVOT ? 0.6 : 1);
      w.clock += dt;
      // At most a few steps per frame, even after a long stall.
      for (let k = 0; k < 4 && w.clock >= interval; k++) {
        w.clock -= interval;
        this.step(w, stride, cfg);
        if (w.exited || w.mode === PAUSE) break;
      }
    }
  }

  /* ── internals ──────────────────────────────────────────────────── */

  private spawn(w: Walker, cfg: WalkConfig): void {
    const rng = this.rng;
    const margin = cfg.footLength * 0.9;
    const edge = Math.floor(rng() * 4);
    const along = 0.15 + 0.7 * rng();
    let inward: number;
    if (edge === 0) {
      w.x = -margin;
      w.y = this.height * along;
      inward = 0;
    } else if (edge === 1) {
      w.x = this.width + margin;
      w.y = this.height * along;
      inward = Math.PI;
    } else if (edge === 2) {
      w.x = this.width * along;
      w.y = -margin;
      inward = Math.PI / 2;
    } else {
      w.x = this.width * along;
      w.y = this.height + margin;
      inward = -Math.PI / 2;
    }
    w.heading = inward + (rng() - 0.5) * 1.1;
    w.speedK = 0.82 + rng() * 0.4;
    w.strideK = 0.9 + rng() * 0.2;
    w.side = rng() < 0.5 ? 1 : -1;
    w.clock = rng() * 0.5;
    w.mode = WALK;
    w.pause = 0;
    w.pivotLeft = 0;
    w.steps = 0;
    w.exited = false;
    w.f1 = 0.17 + rng() * 0.2;
    w.f2 = 0.41 + rng() * 0.3;
    w.p1 = rng() * Math.PI * 2;
    w.p2 = rng() * Math.PI * 2;
  }

  private step(w: Walker, stride: number, cfg: WalkConfig): void {
    const rng = this.rng;
    const t = this.time;
    const W = this.width;
    const H = this.height;

    if (w.mode === PIVOT) {
      // Shuffle on the spot: turn a slice of the pivot, barely travel.
      w.heading += w.pivotTurn;
      w.x += Math.cos(w.heading) * stride * 0.1;
      w.y += Math.sin(w.heading) * stride * 0.1;
      if (--w.pivotLeft <= 0) w.mode = WALK;
    } else {
      // Low-frequency wander: two slow sines per walker, so paths curve.
      let turn = (Math.sin(t * w.f1 + w.p1) + 0.6 * Math.sin(t * w.f2 + w.p2)) * 0.17;

      // Soft avoidance: steer away from anyone close.
      const reach = cfg.footLength * 1.9;
      const dx = Math.cos(w.heading);
      const dy = Math.sin(w.heading);
      for (let i = 0; i < MAX_WALKERS; i++) {
        const o = this.walkers[i];
        if (o === w || !o.active || o.exited) continue;
        const ox = o.x - w.x;
        const oy = o.y - w.y;
        const d = Math.hypot(ox, oy);
        if (d >= reach || d < 1e-3) continue;
        // Only react to walkers ahead, not ones already passed.
        if (ox * dx + oy * dy < -0.2 * d) continue;
        const cross = dx * oy - dy * ox;
        turn -= (cross >= 0 ? 1 : -1) * 0.45 * (1 - d / reach);
      }

      // Never leave the frame empty: the last walker in view is turned
      // back toward the middle before it can walk out.
      const pad = cfg.footLength * 1.4;
      const nearEdge = w.x < pad || w.x > W - pad || w.y < pad || w.y > H - pad;
      if (this.inside <= 1 && nearEdge && w.x > 0 && w.x < W && w.y > 0 && w.y < H) {
        const home = Math.atan2(H / 2 - w.y, W / 2 - w.x);
        turn += clamp(angleDelta(w.heading, home), -0.7, 0.7);
      }

      w.heading += turn;
      w.x += Math.cos(w.heading) * stride;
      w.y += Math.sin(w.heading) * stride;
    }

    // Plant the foot: half a gauge to the side, toes slightly out.
    const gauge = cfg.footLength * 0.3;
    const p = w.prints[w.head];
    w.head = (w.head + 1) % RING;
    p.x = w.x - Math.sin(w.heading) * gauge * w.side;
    p.y = w.y + Math.cos(w.heading) * gauge * w.side;
    p.angle = w.heading + w.side * 0.09;
    p.side = w.side;
    p.born = t;
    p.expire = -1;
    p.step = w.steps;
    p.alive = true;
    w.side = -w.side;
    w.steps++;

    // Anything older than the trail starts to fade.
    const trail = Math.max(1, Math.round(cfg.trailLength));
    for (let j = 0; j < RING; j++) {
      const q = w.prints[j];
      if (q.alive && q.expire < 0 && w.steps - 1 - q.step >= trail) q.expire = t;
    }

    const out = cfg.footLength * 1.3;
    if (w.x < -out || w.x > W + out || w.y < -out || w.y > H + out) {
      if (w.steps > 3) {
        w.exited = true;
        this.expireAll(w);
      }
      return;
    }

    if (w.mode !== WALK) return;
    const onscreen = w.x > 0 && w.x < W && w.y > 0 && w.y < H;
    const roll = rng();
    if (onscreen && roll < cfg.pivotChance) {
      // Stop, and turn 45–180° over two or three shuffle steps.
      w.mode = PIVOT;
      w.pivotLeft = rng() < 0.5 ? 2 : 3;
      const total = (Math.PI / 4 + rng() * ((Math.PI * 3) / 4)) * (rng() < 0.5 ? -1 : 1);
      w.pivotTurn = total / w.pivotLeft;
    } else if (onscreen && roll < cfg.pivotChance + 0.04) {
      w.mode = PAUSE;
      w.pause = 0.35 + rng() * 0.9;
    }
  }

  /** Fade every remaining print, oldest first. */
  private expireAll(w: Walker): void {
    for (let j = 0; j < RING; j++) {
      const q = w.prints[j];
      if (q.alive && q.expire < 0) {
        const age = w.steps - 1 - q.step; // 0 = newest
        q.expire = this.time + Math.max(0, 6 - age) * 0.12;
      }
    }
  }
}
