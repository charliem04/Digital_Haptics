import { angleDelta, clamp, createRng, smoothstep } from "../shared/rng";

/**
 * ════════════════════════════════════════════════════════════════════
 *  WALKERS — small 3D people standing on the far side of the glass.
 *
 *  Space: x, y are the glass (CSS px, y down). z is height above it,
 *  away from the viewer. Nothing here draws; the engine reads the joints
 *  and casts them onto the glass.
 *
 *  A walker is built from the ground up, in this order every tick:
 *    1. ROOT    a point with a heading and a speed. It steers.
 *    2. FEET    each foot is either planted (locked to the glass, it
 *               cannot slide) or swinging along an arc to where the body
 *               will need it. A foot only lifts once the body has moved
 *               on past it, so cadence comes out of speed and stride.
 *    3. PELVIS  rides on springs between the feet: it shifts over the
 *               standing foot, sinks when the legs are spread, turns
 *               with the stride and tips toward the swinging side.
 *    4. LEGS    two-bone IK from each hip to its ankle, knees forward.
 *
 *  Fixed timestep, seeded, and no allocation after the constructor.
 * ════════════════════════════════════════════════════════════════════
 */

export const MAX_WALKERS = 12;
export const MARKS = 14;
const TICK = 1 / 120;
const MAX_TICKS = 10;

const WALK = 0;
const PAUSE = 1;
const PIVOT = 2;

/** Joint slots in `Walker.joints` (x, y, z each). */
export const J = {
  pelvis: 0,
  hipL: 1,
  hipR: 2,
  kneeL: 3,
  kneeR: 4,
  ankleL: 5,
  ankleR: 6,
  heelL: 7,
  heelR: 8,
  toeL: 9,
  toeR: 10,
  waistL: 11,
  waistR: 12,
  count: 13,
} as const;

export type Foot = {
  /** Centre of the sole on the glass, and the way the toes point. */
  x: number;
  y: number;
  yaw: number;
  /** Height of the heel and of the toe above the glass. */
  heelZ: number;
  toeZ: number;
  planted: boolean;
  /** Swing: 0 → 1 progress, duration, start pose, target pose. */
  swing: number;
  duration: number;
  fromX: number;
  fromY: number;
  fromYaw: number;
  fromHeel: number;
  toX: number;
  toY: number;
  toYaw: number;
  jitterX: number;
  jitterY: number;
  /** Stance: when it landed, and how the contact has rolled so far. */
  landed: number;
  /** Along the sole, 0 = heel and 1 = toe: pressed between `lo` and `hi`. */
  lo: number;
  hi: number;
  /** Share of the body's weight on this foot, 0–1. */
  load: number;
  seed: number;
};

/** What a foot leaves behind when it lifts. */
export type Mark = {
  x: number;
  y: number;
  yaw: number;
  side: number;
  lifted: number;
  /** Walker's step count at lift-off; the trail is measured in steps. */
  step: number;
  /** Time the final fade starts, or -1 while still in the trail. */
  expire: number;
  seed: number;
  alive: boolean;
};

export type Walker = {
  active: boolean;
  exited: boolean;
  /** 0–1: fades the body's shadow in and out. */
  presence: number;
  style: number;

  // Root.
  x: number;
  y: number;
  heading: number;
  speed: number;
  mode: number;
  modeTime: number;
  pivotLeft: number;
  steps: number;
  lastFoot: number;
  fidget: number;

  // Who they are.
  speedK: number;
  strideK: number;
  legK: number;
  hipHalf: number;
  stance: number;
  toeOut: number;
  swayK: number;
  bounceK: number;
  asym: number;
  pauseBias: number;
  f1: number;
  f2: number;
  p1: number;
  p2: number;
  idlePhase: number;
  idleRate: number;

  // Pelvis and waist, as offsets in the walker's own frame, on springs.
  lat: number;
  latV: number;
  fwd: number;
  fwdV: number;
  z: number;
  zV: number;
  yaw: number;
  roll: number;
  waistLat: number;
  waistLatV: number;

  feet: [Foot, Foot];
  marks: Mark[];
  markHead: number;
  joints: Float32Array;
};

export type WalkConfig = {
  walkSpeed: number;
  strideLength: number;
  pivotChance: number;
  trailLength: number;
  /** Print length in CSS px. Every body dimension hangs off this. */
  footLength: number;
  /** Feet to mid-waist, in print lengths. */
  bodyHeight: number;
  gaitEnergy: number;
  swayAmount: number;
  individuality: number;
  /** A PRINT_STYLES index for everyone, or -1 for one each. */
  style: number;
  styleCount: number;
};

const FADE = 0.9;
/** Ink a lifted print keeps while it is still in the trail. */
export const RESIDUE = 0.52;

/** 0–1: how much of a mark is left at time `t`. */
export function markInk(m: Mark, t: number): number {
  if (!m.alive) return 0;
  return m.expire < 0 ? 1 : 1 - smoothstep(0, FADE, t - m.expire);
}

function makeFoot(): Foot {
  return {
    x: 0,
    y: 0,
    yaw: 0,
    heelZ: 0,
    toeZ: 0,
    planted: true,
    swing: 0,
    duration: 0.4,
    fromX: 0,
    fromY: 0,
    fromYaw: 0,
    fromHeel: 0,
    toX: 0,
    toY: 0,
    toYaw: 0,
    jitterX: 0,
    jitterY: 0,
    landed: -1,
    lo: 0,
    hi: 1,
    load: 0.5,
    seed: 0,
  };
}

export class WalkerSim {
  readonly walkers: Walker[] = [];
  /** Simulation clock, seconds. Mark and landing times are on it. */
  time = 0;
  private rng = createRng(1);
  private width = 1;
  private height = 1;
  private inside = 0;
  private carry = 0;

  constructor() {
    for (let i = 0; i < MAX_WALKERS; i++) {
      const marks: Mark[] = [];
      for (let j = 0; j < MARKS; j++) {
        marks.push({
          x: 0,
          y: 0,
          yaw: 0,
          side: 1,
          lifted: 0,
          step: 0,
          expire: -1,
          seed: 0,
          alive: false,
        });
      }
      this.walkers.push({
        active: false,
        exited: false,
        presence: 0,
        style: 0,
        x: 0,
        y: 0,
        heading: 0,
        speed: 0,
        mode: WALK,
        modeTime: 0,
        pivotLeft: 0,
        steps: 0,
        lastFoot: 0,
        fidget: 3,
        speedK: 1,
        strideK: 1,
        legK: 1,
        hipHalf: 20,
        stance: 30,
        toeOut: 0.1,
        swayK: 1,
        bounceK: 1,
        asym: 0,
        pauseBias: 0.04,
        f1: 0.2,
        f2: 0.5,
        p1: 0,
        p2: 0,
        idlePhase: 0,
        idleRate: 0.6,
        lat: 0,
        latV: 0,
        fwd: 0,
        fwdV: 0,
        z: 0,
        zV: 0,
        yaw: 0,
        roll: 0,
        waistLat: 0,
        waistLatV: 0,
        feet: [makeFoot(), makeFoot()],
        marks,
        markHead: 0,
        joints: new Float32Array(J.count * 3),
      });
    }
  }

  /**
   * Start over from `seed`. Half the walkers begin inside the frame and
   * the simulation runs forward a few seconds, so the first frame already
   * has people mid-stride with a trail behind them.
   */
  reset(seed: number, count: number, width: number, height: number, cfg: WalkConfig): void {
    this.rng = createRng(Math.round(seed) * 7919 + 13);
    this.width = width;
    this.height = height;
    this.time = 0;
    this.carry = 0;
    const n = clamp(Math.round(count), 1, MAX_WALKERS);
    for (let i = 0; i < MAX_WALKERS; i++) {
      const w = this.walkers[i];
      w.active = i < n;
      w.presence = 0;
      for (let j = 0; j < MARKS; j++) w.marks[j].alive = false;
      if (!w.active) continue;
      this.spawn(w, cfg);
      if (i % 2 === 0) {
        w.x = width * (0.15 + 0.7 * this.rng());
        w.y = height * (0.15 + 0.7 * this.rng());
        w.heading = this.rng() * Math.PI * 2;
        this.stand(w, cfg);
      }
    }
    for (let i = 0; i < 8 / TICK; i++) this.tick(TICK, cfg);
  }

  /** Add or retire walkers without disturbing the ones already walking. */
  setCount(count: number, cfg: WalkConfig): void {
    const n = clamp(Math.round(count), 1, MAX_WALKERS);
    for (let i = 0; i < MAX_WALKERS; i++) {
      const w = this.walkers[i];
      if (i < n && !w.active) {
        w.active = true;
        for (let j = 0; j < MARKS; j++) w.marks[j].alive = false;
        this.spawn(w, cfg);
      } else if (i >= n && w.active) {
        w.active = false;
        this.leave(w);
      }
    }
  }

  /** Put every walker in one style (>= 0), or deal styles out again (-1). */
  restyle(cfg: WalkConfig): void {
    for (let i = 0; i < MAX_WALKERS; i++) {
      this.walkers[i].style = cfg.style >= 0 ? cfg.style : (i * 5 + 2) % cfg.styleCount;
    }
  }

  /** Advance by a frame's worth of time, in fixed ticks. */
  update(dt: number, width: number, height: number, cfg: WalkConfig): void {
    this.width = width;
    this.height = height;
    this.carry += dt;
    for (let i = 0; i < MAX_TICKS && this.carry >= TICK; i++) {
      this.carry -= TICK;
      this.tick(TICK, cfg);
    }
    // After a long stall, drop the backlog instead of fast-forwarding.
    if (this.carry > TICK) this.carry = 0;
  }

  /* ── one tick ───────────────────────────────────────────────────── */

  private tick(h: number, cfg: WalkConfig): void {
    this.time += h;
    const t = this.time;
    const W = this.width;
    const H = this.height;

    let inside = 0;
    for (let i = 0; i < MAX_WALKERS; i++) {
      const w = this.walkers[i];
      if (w.active && !w.exited && w.x > 0 && w.x < W && w.y > 0 && w.y < H) inside++;
    }
    this.inside = inside;

    for (let i = 0; i < MAX_WALKERS; i++) {
      const w = this.walkers[i];

      let alive = 0;
      const trail = Math.max(1, Math.round(cfg.trailLength));
      for (let j = 0; j < MARKS; j++) {
        const m = w.marks[j];
        if (!m.alive) continue;
        if (m.expire < 0 && w.steps - m.step >= trail) m.expire = t;
        if (m.expire >= 0 && t - m.expire > FADE) m.alive = false;
        else alive++;
      }

      const here = w.active && !w.exited ? 1 : 0;
      w.presence += (here - w.presence) * Math.min(1, h * 2.5);
      if (w.presence < 0.002) w.presence = 0;

      if (!w.active) continue;
      if (w.exited) {
        // Gone, and the last print has faded: come back in somewhere else.
        if (alive === 0 && w.presence === 0) this.spawn(w, cfg);
        continue;
      }
      this.steer(w, h, cfg);
      this.gait(w, h, cfg);
      this.pose(w, h, cfg);
    }
  }

  /* ── 1. root ────────────────────────────────────────────────────── */

  private steer(w: Walker, h: number, cfg: WalkConfig): void {
    const t = this.time;
    const W = this.width;
    const H = this.height;
    const F = cfg.footLength;
    const energy = clamp(cfg.gaitEnergy, 0.3, 2.5);
    const cruise = cfg.walkSpeed * w.speedK * energy;
    let target = 0;

    if (w.mode === WALK) {
      target = cruise;
      // Low-frequency wander: two slow sines, so paths curve gently.
      let turn = (Math.sin(t * w.f1 + w.p1) + 0.6 * Math.sin(t * w.f2 + w.p2)) * 0.2;

      // Soft avoidance: steer away from anyone close and ahead.
      const reach = F * 2.8;
      const dx = Math.cos(w.heading);
      const dy = Math.sin(w.heading);
      for (let i = 0; i < MAX_WALKERS; i++) {
        const o = this.walkers[i];
        if (o === w || !o.active || o.exited) continue;
        const ox = o.x - w.x;
        const oy = o.y - w.y;
        const d = Math.hypot(ox, oy);
        if (d >= reach || d < 1e-3) continue;
        if (ox * dx + oy * dy < -0.2 * d) continue;
        const cross = dx * oy - dy * ox;
        turn -= (cross >= 0 ? 1 : -1) * 1.1 * (1 - d / reach);
        // Close and head-on: ease off rather than walk through.
        if (d < reach * 0.45) target *= 0.55;
      }

      // Never leave the frame empty: the last walker in view is turned
      // back toward the middle before it can walk out.
      const pad = Math.min(F * 1.6, Math.min(W, H) * 0.22);
      const nearEdge = w.x < pad || w.x > W - pad || w.y < pad || w.y > H - pad;
      if (this.inside <= 1 && nearEdge && w.x > 0 && w.x < W && w.y > 0 && w.y < H) {
        const home = Math.atan2(H / 2 - w.y, W / 2 - w.x);
        const off = angleDelta(w.heading, home);
        // Only while it is actually heading out. Steering at the centre
        // unconditionally makes a lone walker orbit it.
        if (Math.abs(off) > 1.1) turn += clamp(off, -1, 1) * 1.2;
      }
      w.heading += turn * h;
    } else if (w.mode === PAUSE) {
      w.modeTime -= h;
      if (w.modeTime <= 0) w.mode = WALK;
    } else {
      // Pivot: come to a stop, then the body turns and the feet have to
      // shuffle round after it (see the yaw rule in gait()).
      if (w.speed < 14) {
        const rate = 1.5 * energy * h;
        const step = clamp(w.pivotLeft, -rate, rate);
        w.heading += step;
        w.pivotLeft -= step;
        if (Math.abs(w.pivotLeft) < 1e-3) {
          w.modeTime -= h;
          if (w.modeTime <= 0) w.mode = WALK;
        }
      }
    }

    // Ease in and out of motion; nobody stops dead.
    const accel = 230 * energy * h;
    w.speed += clamp(target - w.speed, -accel * 1.3, accel);
    w.x += Math.cos(w.heading) * w.speed * h;
    w.y += Math.sin(w.heading) * w.speed * h;

    const out = F * 1.7;
    if ((w.x < -out || w.x > W + out || w.y < -out || w.y > H + out) && w.steps > 3) {
      w.exited = true;
      this.leave(w);
    }
  }

  /* ── 2. feet ────────────────────────────────────────────────────── */

  private gait(w: Walker, h: number, cfg: WalkConfig): void {
    const t = this.time;
    const F = cfg.footLength;
    const energy = clamp(cfg.gaitEnergy, 0.3, 2.5);
    const cruise = Math.max(20, cfg.walkSpeed * w.speedK * energy);
    const pace = clamp(w.speed / cruise, 0, 1.3);
    /** 0 standing, 1 properly walking. */
    const moving = clamp(w.speed / 36, 0, 1);
    const stride = Math.max(F * 0.5, cfg.strideLength * w.strideK * (0.5 + 0.5 * pace));
    // A planted foot starts `reach` ahead of the hips and lifts `reach`
    // behind them.
    const reach = 0.62 * stride * Math.min(1, pace);
    const dx = Math.cos(w.heading);
    const dy = Math.sin(w.heading);

    for (let i = 0; i < 2; i++) {
      const f = w.feet[i];
      const side = i === 0 ? -1 : 1;
      if (!f.planted) {
        f.swing += h / f.duration;
        const s = Math.min(1, f.swing);
        if (s < 0.72) {
          // Keep aiming at where the hips will be when it lands.
          const lead = w.speed * f.duration * (1 - s);
          // Feet track closer to the midline when walking than when standing.
          const st = w.stance * (1 + side * w.asym * 0.5) * (1 - 0.42 * moving);
          f.toX = w.x + dx * (lead + reach) - dy * side * st + f.jitterX;
          f.toY = w.y + dy * (lead + reach) + dx * side * st + f.jitterY;
          f.toYaw = w.heading + side * w.toeOut;
        }
        // Leaves slowly, travels, arrives slowly.
        const e = s * s * (3 - 2 * s);
        f.x = f.fromX + (f.toX - f.fromX) * e;
        f.y = f.fromY + (f.toY - f.fromY) * e;
        f.yaw = f.fromYaw + angleDelta(f.fromYaw, f.toYaw) * e;
        // The arc: peel off toe-last, clear the ground, then pull the
        // toes up so the heel arrives first.
        const lift = F * 0.2 * energy * w.bounceK * Math.sin(Math.PI * s) * (0.35 + 0.65 * moving);
        const pitch = 0.5 + (-0.34 - 0.5) * smoothstep(0.12, 0.72, s);
        const heelUp = Math.max(0, Math.sin(pitch)) * F * 0.75;
        const toeUp = Math.max(0, -Math.sin(pitch)) * F * 0.75;
        const settle = 1 - smoothstep(0.86, 1, s);
        f.heelZ = lift + Math.max(heelUp, f.fromHeel * (1 - smoothstep(0, 0.3, s))) * settle;
        f.toeZ = lift + toeUp * (0.3 + 0.7 * moving);
        if (f.swing >= 1) this.land(w, i, cfg);
      } else {
        const along = (f.x - w.x) * dx + (f.y - w.y) * dy;
        // 0 at heel strike, 1 at toe-off; a standing foot sits flat.
        const roll = 0.5 + (clamp((reach - along) / (2 * reach + 1e-3), 0, 1) - 0.5) * moving;
        const contact = t - f.landed;
        const want = moving > 0.3 ? 0.3 + 0.7 * smoothstep(0, 0.26, roll) : 1;
        f.hi = Math.max(f.hi, Math.min(want, 0.3 + contact / 0.14));
        const heelOff = smoothstep(0.62, 1, roll) * moving;
        f.lo = 0.7 * heelOff;
        f.heelZ = F * 0.36 * heelOff;
        f.toeZ = 0;
      }
    }

    const L = w.feet[0];
    const R = w.feet[1];
    if (!L.planted || !R.planted) return;

    // Whose turn is it? The foot the body has most left behind.
    let pick = -1;
    let best = 0;
    for (let i = 0; i < 2; i++) {
      const f = w.feet[i];
      const other = w.feet[1 - i];
      const side = i === 0 ? -1 : 1;
      if (t - other.landed < 0.05 + 0.05 / energy) continue;
      const along = (f.x - w.x) * dx + (f.y - w.y) * dy;
      const hx = w.x - dy * side * w.stance;
      const hy = w.y + dx * side * w.stance;
      const drift = Math.hypot(f.x - hx, f.y - hy);
      const twist = Math.abs(angleDelta(f.yaw, w.heading + side * w.toeOut));
      let need = 0;
      if (moving > 0.3 && along <= -reach) need = 2 + (-along - reach) / F;
      else if (drift > Math.max(1.35 * reach, F * 0.36)) need = 1 + drift / F;
      else if (moving < 0.5 && twist > 0.5) need = 1 + twist * 0.2;
      if (need > 0 && i === w.lastFoot) need -= 0.4;
      if (need > best) {
        best = need;
        pick = i;
      }
    }

    // Standing still is not standing frozen: now and then, shift a foot.
    if (pick < 0 && w.mode === PAUSE) {
      w.fidget -= h;
      if (w.fidget <= 0) {
        w.fidget = 1.6 + this.rng() * 3.5;
        pick = 1 - w.lastFoot;
      }
    }
    if (pick < 0) return;

    const f = w.feet[pick];
    const side = pick === 0 ? -1 : 1;
    const left = this.mark(w, f, side, F * 0.5);
    // Shuffles while turning on the spot are not a trail: let them go.
    if (w.mode === PIVOT) left.expire = t + 0.2;
    f.planted = false;
    f.swing = 0;
    f.fromX = f.x;
    f.fromY = f.y;
    f.fromYaw = f.yaw;
    f.fromHeel = f.heelZ;
    f.duration =
      moving > 0.3 ? clamp((0.78 * stride) / Math.max(w.speed, 50), 0.26, 0.64) : 0.36 / energy;
    const wobble = F * 0.07 * cfg.individuality;
    f.jitterX = (this.rng() - 0.5) * 2 * wobble;
    f.jitterY = (this.rng() - 0.5) * 2 * wobble;
    f.toX = f.x;
    f.toY = f.y;
    f.toYaw = f.yaw;
  }

  private land(w: Walker, index: number, cfg: WalkConfig): void {
    const f = w.feet[index];
    f.planted = true;
    f.x = f.toX;
    f.y = f.toY;
    f.yaw = f.toYaw;
    f.heelZ = 0;
    f.toeZ = 0;
    f.landed = this.time;
    f.lo = 0;
    f.hi = 0.28;
    f.seed = this.rng();
    w.lastFoot = index;
    w.steps++;

    if (w.mode !== WALK) return;
    const onscreen = w.x > 0 && w.x < this.width && w.y > 0 && w.y < this.height;
    if (!onscreen) return;
    const roll = this.rng();
    if (roll < cfg.pivotChance) {
      w.mode = PIVOT;
      w.pivotLeft = (Math.PI / 4 + this.rng() * ((Math.PI * 3) / 4)) * (this.rng() < 0.5 ? -1 : 1);
      w.modeTime = 0.2 + this.rng() * 0.5;
    } else if (roll < cfg.pivotChance + w.pauseBias) {
      w.mode = PAUSE;
      w.modeTime = 0.9 + this.rng() * 2.6;
      w.fidget = 0.8 + this.rng() * 2;
    }
  }

  /* ── 3. pelvis, 4. legs ─────────────────────────────────────────── */

  private pose(w: Walker, h: number, cfg: WalkConfig): void {
    const t = this.time;
    const F = cfg.footLength;
    const energy = clamp(cfg.gaitEnergy, 0.3, 2.5);
    const sway = cfg.swayAmount * w.swayK;
    const moving = clamp(w.speed / 36, 0, 1);
    const waistZ = Math.max(1.2, cfg.bodyHeight) * F * w.legK;
    const leg = waistZ * 0.84;
    const L = w.feet[0];
    const R = w.feet[1];
    const dx = Math.cos(w.heading);
    const dy = Math.sin(w.heading);

    // Where the weight wants to be: over the standing foot, or, when
    // idle, settling slowly from one hip to the other.
    w.idlePhase += w.idleRate * h * (1 - 0.7 * moving);
    let weight: number;
    if (!L.planted) weight = 1;
    else if (!R.planted) weight = -1;
    else if (moving > 0.4) weight = (w.lastFoot === 0 ? -1 : 1) * 0.45;
    else weight = Math.sin(w.idlePhase) * 0.8 + Math.sin(w.idlePhase * 0.37 + w.p2) * 0.3;
    const latTarget = weight * w.stance * 0.62 * sway;
    const fwdTarget = F * 0.05 * moving;

    // Under-damped springs: the pelvis overshoots a little and settles.
    const k = 9.5 * Math.sqrt(energy);
    w.latV += (k * k * (latTarget - w.lat) - 2 * 0.52 * k * w.latV) * h;
    w.lat += w.latV * h;
    w.fwdV += (k * k * (fwdTarget - w.fwd) - 2 * 0.6 * k * w.fwdV) * h;
    w.fwd += w.fwdV * h;
    // The upper body follows late and less.
    const kw = 5.2 * Math.sqrt(energy);
    w.waistLatV += (kw * kw * (w.lat * 0.45 - w.waistLat) - 2 * 0.42 * kw * w.waistLatV) * h;
    w.waistLat += w.waistLatV * h;

    // The hips turn with the stride: the forward foot pulls its hip on.
    const alongL = (L.x - w.x) * dx + (L.y - w.y) * dy;
    const alongR = (R.x - w.x) * dx + (R.y - w.y) * dy;
    const yawTarget = clamp(((alongR - alongL) / (F * 2.2)) * 0.32, -0.34, 0.34) * sway;
    w.yaw += (yawTarget - w.yaw) * Math.min(1, h * 9);
    // And tip: the hip over a lifted foot drops.
    const rollTarget = (L.planted ? 0 : -1) + (R.planted ? 0 : 1);
    const idleTip = moving < 0.4 ? -weight * 0.5 : 0;
    w.roll += ((rollTarget + idleTip) * leg * 0.03 * sway - w.roll) * Math.min(1, h * 7);

    const px = w.x + dx * w.fwd - dy * w.lat;
    const py = w.y + dy * w.fwd + dx * w.lat;
    const hc = Math.cos(w.heading + w.yaw);
    const hs = Math.sin(w.heading + w.yaw);
    const hipLx = px + hs * w.hipHalf;
    const hipLy = py - hc * w.hipHalf;
    const hipRx = px - hs * w.hipHalf;
    const hipRy = py + hc * w.hipHalf;

    // Height: as tall as the legs allow. Spread feet pull the pelvis
    // down, which is the twice-a-stride bob.
    const ankleH = F * 0.11;
    let zTarget = leg * 0.965;
    const span = leg * 0.992;
    for (let i = 0; i < 2; i++) {
      const f = w.feet[i];
      if (!f.planted) continue;
      const ax = f.x - Math.cos(f.yaw) * F * 0.3;
      const ay = f.y - Math.sin(f.yaw) * F * 0.3;
      const d = Math.hypot((i === 0 ? hipLx : hipRx) - ax, (i === 0 ? hipLy : hipRy) - ay);
      const top = ankleH + f.heelZ + Math.sqrt(Math.max(span * span - d * d, span * span * 0.3));
      if (top < zTarget) zTarget = top;
    }
    // Breathing, always.
    zTarget += leg * 0.006 * Math.sin(t * 1.25 + w.p1) - leg * 0.012 * w.bounceK * moving;
    const kz = 15;
    w.zV += (kz * kz * (zTarget - w.z) - 2 * 0.62 * kz * w.zV) * h;
    w.z += w.zV * h;

    const j = w.joints;
    set(j, J.pelvis, px, py, w.z);
    set(j, J.hipL, hipLx, hipLy, w.z + w.roll);
    set(j, J.hipR, hipRx, hipRy, w.z - w.roll);

    // The waist counter-rotates against the hips.
    const wc = Math.cos(w.heading - w.yaw * 0.7);
    const ws = Math.sin(w.heading - w.yaw * 0.7);
    const wx = w.x + dx * w.fwd * 0.5 - dy * w.waistLat;
    const wy = w.y + dy * w.fwd * 0.5 + dx * w.waistLat;
    const half = w.hipHalf * 0.86;
    const wz = waistZ + (w.z - leg * 0.965);
    set(j, J.waistL, wx + ws * half, wy - wc * half, wz);
    set(j, J.waistR, wx - ws * half, wy + wc * half, wz);

    for (let i = 0; i < 2; i++) {
      const f = w.feet[i];
      const fc = Math.cos(f.yaw);
      const fs = Math.sin(f.yaw);
      const ax = f.x - fc * F * 0.3;
      const ay = f.y - fs * F * 0.3;
      const az = ankleH + f.heelZ * 0.85 + f.toeZ * 0.15;
      set(j, J.ankleL + i, ax, ay, az);
      set(j, J.heelL + i, f.x - fc * F * 0.4, f.y - fs * F * 0.4, f.heelZ);
      set(j, J.toeL + i, f.x + fc * F * 0.42, f.y + fs * F * 0.42, f.toeZ);
      knee(j, J.hipL + i, J.ankleL + i, J.kneeL + i, leg * 0.5, leg * 0.5, dx, dy);

      // Weight on a foot follows the pelvis toward it.
      const side = i === 0 ? -1 : 1;
      const other = w.feet[1 - i];
      f.load = !f.planted
        ? 0
        : !other.planted
          ? 1
          : clamp(0.5 + (0.5 * side * w.lat) / (w.stance * 0.62 * Math.max(0.2, sway)), 0.15, 1);
    }
  }

  /* ── arrivals and departures ────────────────────────────────────── */

  private spawn(w: Walker, cfg: WalkConfig): void {
    const rng = this.rng;
    const F = cfg.footLength;
    const vary = clamp(cfg.individuality, 0, 2);
    const margin = F * 1.3;
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

    // Temperament: brisk, ambling or hesitant. Everything else is a
    // spread around it, scaled by `individuality`.
    const temper = rng();
    const brisk = temper > 0.66 ? 1 : 0;
    const hesitant = temper < 0.3 ? 1 : 0;
    const spread = (amount: number) => 1 + (rng() - 0.5) * 2 * amount * vary;
    w.speedK = (1 + 0.24 * brisk * vary - 0.26 * hesitant * vary) * spread(0.1);
    w.strideK = (1 + 0.12 * brisk * vary - 0.16 * hesitant * vary) * spread(0.08);
    w.legK = spread(0.1);
    w.hipHalf = F * 0.21 * spread(0.14);
    w.stance = F * 0.3 * spread(0.16);
    w.toeOut = 0.1 + (rng() - 0.3) * 0.22 * vary;
    w.swayK = (1 - 0.15 * brisk + 0.2 * hesitant) * spread(0.25);
    w.bounceK = (1 + 0.25 * brisk) * spread(0.2);
    w.asym = (rng() - 0.5) * 0.3 * vary;
    w.pauseBias = 0.025 + 0.07 * hesitant * vary + rng() * 0.02;
    w.f1 = 0.15 + rng() * 0.2;
    w.f2 = 0.4 + rng() * 0.3;
    w.p1 = rng() * Math.PI * 2;
    w.p2 = rng() * Math.PI * 2;
    w.idlePhase = rng() * Math.PI * 2;
    w.idleRate = 0.45 + rng() * 0.6;
    w.style = cfg.style >= 0 ? cfg.style : Math.floor(rng() * cfg.styleCount) % cfg.styleCount;

    w.speed = cfg.walkSpeed * w.speedK * 0.6;
    w.mode = WALK;
    w.modeTime = 0;
    w.pivotLeft = 0;
    w.steps = 0;
    w.lastFoot = rng() < 0.5 ? 0 : 1;
    w.fidget = 2;
    w.exited = false;
    w.presence = 0;
    this.stand(w, cfg);
  }

  /** Put both feet under the body and settle the springs. */
  private stand(w: Walker, cfg: WalkConfig): void {
    const dx = Math.cos(w.heading);
    const dy = Math.sin(w.heading);
    for (let i = 0; i < 2; i++) {
      const f = w.feet[i];
      const side = i === 0 ? -1 : 1;
      const stagger = (i === w.lastFoot ? 1 : -1) * cfg.footLength * 0.12;
      f.x = w.x - dy * side * w.stance + dx * stagger;
      f.y = w.y + dx * side * w.stance + dy * stagger;
      f.yaw = w.heading + side * w.toeOut;
      f.planted = true;
      f.heelZ = 0;
      f.toeZ = 0;
      f.landed = this.time - 1;
      f.lo = 0;
      f.hi = 1;
      f.load = 0.5;
      f.seed = this.rng();
    }
    w.lat = w.latV = w.fwd = w.fwdV = w.zV = w.yaw = w.roll = w.waistLat = w.waistLatV = 0;
    w.z = Math.max(1.2, cfg.bodyHeight) * cfg.footLength * w.legK * 0.84 * 0.965;
    this.pose(w, 0, cfg);
  }

  private mark(w: Walker, f: Foot, side: number, reach: number): Mark {
    // Shuffling on the spot would stamp a rosette of near-identical
    // prints. A new mark replaces any older one it mostly covers.
    for (let j = 0; j < MARKS; j++) {
      const old = w.marks[j];
      if (old.alive && Math.hypot(old.x - f.x, old.y - f.y) < reach) old.alive = false;
    }
    const m = w.marks[w.markHead];
    w.markHead = (w.markHead + 1) % MARKS;
    m.x = f.x;
    m.y = f.y;
    m.yaw = f.yaw;
    m.side = side;
    m.lifted = this.time;
    m.step = w.steps;
    m.expire = -1;
    m.seed = f.seed;
    m.alive = true;
    return m;
  }

  /** Walking out of frame: lift both feet and let the trail fade. */
  private leave(w: Walker): void {
    for (let i = 0; i < 2; i++) {
      const f = w.feet[i];
      if (f.planted) this.mark(w, f, i === 0 ? -1 : 1, 0);
      f.planted = false;
      f.swing = 1;
    }
    for (let j = 0; j < MARKS; j++) {
      const m = w.marks[j];
      if (m.alive && m.expire < 0)
        m.expire = this.time + Math.max(0, 3 - (w.steps - m.step)) * 0.14;
    }
  }
}

function set(j: Float32Array, slot: number, x: number, y: number, z: number): void {
  j[slot * 3] = x;
  j[slot * 3 + 1] = y;
  j[slot * 3 + 2] = z;
}

/**
 * Two-bone IK. The knee lies on the circle where the thigh's and shin's
 * spheres meet; of the points on it, take the one furthest along the
 * direction of travel, so knees always bend forward.
 */
function knee(
  j: Float32Array,
  hip: number,
  ankle: number,
  out: number,
  thigh: number,
  shin: number,
  poleX: number,
  poleY: number
): void {
  const hx = j[hip * 3];
  const hy = j[hip * 3 + 1];
  const hz = j[hip * 3 + 2];
  let nx = j[ankle * 3] - hx;
  let ny = j[ankle * 3 + 1] - hy;
  let nz = j[ankle * 3 + 2] - hz;
  const raw = Math.hypot(nx, ny, nz) || 1;
  nx /= raw;
  ny /= raw;
  nz /= raw;
  // Never quite straight: a locked knee reads as a stick.
  const d = clamp(raw, Math.abs(thigh - shin) + 1, (thigh + shin) * 0.992);
  const a = (thigh * thigh - shin * shin + d * d) / (2 * d);
  const bend = Math.sqrt(Math.max(0, thigh * thigh - a * a));
  // The pole, with its component along the leg removed.
  const dot = poleX * nx + poleY * ny;
  let qx = poleX - nx * dot;
  let qy = poleY - ny * dot;
  let qz = -nz * dot;
  const ql = Math.hypot(qx, qy, qz);
  if (ql < 1e-4) {
    qx = poleX;
    qy = poleY;
    qz = 0;
  } else {
    qx /= ql;
    qy /= ql;
    qz /= ql;
  }
  j[out * 3] = hx + nx * a + qx * bend;
  j[out * 3 + 1] = hy + ny * a + qy * bend;
  j[out * 3 + 2] = hz + nz * a + qz * bend;
}
