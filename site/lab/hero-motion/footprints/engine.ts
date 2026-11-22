import * as THREE from "three";
import type { ParamEngine } from "../shared/useStage";
import { clamp, hexToRgb, smoothstep } from "../shared/rng";
import { FEET_DEFAULTS, FOOT_LENGTH, type FeetParams } from "./params";
import {
  J,
  MAX_WALKERS,
  RESIDUE,
  WalkerSim,
  markInk,
  type WalkConfig,
  type Walker,
} from "./walkers";
import { CELL_FILL, FOOT_ASPECT, PRINT_STYLES, createPrintAtlas } from "./sprites";
import { densityFrag, densityVert } from "./density.glsl";
import { dotsVert } from "./dots.vert.glsl";
import { dotsFrag } from "./dots.frag.glsl";

/**
 * ════════════════════════════════════════════════════════════════════
 *  CONCEPT A ENGINE — bodies on the far side of the glass.
 *
 *  The screen is a sheet of frosted glass seen from underneath. People
 *  stand on it. We never see them: only where a sole PRESSES the glass,
 *  and the SHADOW the rest of them casts onto it from a light on their
 *  side. That light is the flare.
 *
 *  Per frame:
 *    1. step the walkers (3D joints, fixed timestep, no allocation)
 *    2. ease the flare toward the pointer, or its idle drift
 *    3. project every joint from the light onto the glass and write the
 *       limbs as capsule instances, the soles as print instances
 *    4. draw those instances into a small density target
 *    5. draw one fullscreen quad that turns density into halftone dots
 *
 *  The depth is one rule, applied in step 3: the higher a joint is above
 *  the glass, the further its shadow is thrown and the more it blurs.
 *  A planted foot is at height zero, so it does not move when the light
 *  does. Everything above it swings.
 * ════════════════════════════════════════════════════════════════════
 */

const CAPACITY = 640;
/** Density texels per dot cell, each way. */
const SUPERSAMPLE = 2;
/** How much wider the paper haze is than the dot shadow. */
const HAZE = 2.6;

export class FeetEngine implements ParamEngine<FeetParams> {
  readonly renderer: THREE.WebGLRenderer;
  /** Called with the flare position, 0–1 on each axis, when it changes. */
  onReadout: ((x: number, y: number) => void) | null = null;

  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private readonly quad = new THREE.PlaneGeometry(2, 2);
  private readonly material: THREE.ShaderMaterial;

  private readonly densityScene = new THREE.Scene();
  private readonly instances = new THREE.InstancedBufferGeometry();
  private readonly densityMaterial: THREE.ShaderMaterial;
  private readonly target: THREE.WebGLRenderTarget;
  private readonly atlas: THREE.CanvasTexture;
  private readonly aA = new Float32Array(CAPACITY * 4);
  private readonly aR = new Float32Array(CAPACITY * 4);
  private readonly aO = new Float32Array(CAPACITY * 4);
  private readonly aM = new Float32Array(CAPACITY * 4);
  private readonly aS = new Float32Array(CAPACITY * 2);
  private readonly attributes: THREE.InstancedBufferAttribute[] = [];
  private count = 0;

  private readonly sim = new WalkerSim();
  private readonly cfg: WalkConfig = {
    walkSpeed: 0,
    strideLength: 0,
    pivotChance: 0,
    trailLength: 0,
    footLength: FOOT_LENGTH,
    bodyHeight: 3.4,
    gaitEnergy: 1,
    swayAmount: 1,
    individuality: 1,
    style: -1,
    styleCount: PRINT_STYLES.length,
  };
  private readonly pixel = new Uint8Array(4);
  /** Joints of the walker being drawn, cast onto the glass: x, y, spread. */
  private readonly cast = new Float32Array(J.count * 3);

  private p: FeetParams = { ...FEET_DEFAULTS };
  private width = 0;
  private height = 0;
  private cols = 0;
  private rows = 0;
  private started = false;

  // Flare state, CSS px. The flare is also the light.
  private fx = 0;
  private fy = 0;
  private fvx = 0;
  private fvy = 0;
  private pointerX = 0;
  private pointerY = 0;
  private hovering = false;
  private hover = 0;
  private clock = 0;
  private lastQx = -1;
  private lastQy = -1;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
    });

    // ── density pass ───────────────────────────────────────────────
    this.target = new THREE.WebGLRenderTarget(4, 4, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      depthBuffer: false,
      stencilBuffer: false,
      generateMipmaps: false,
    });
    this.target.texture.colorSpace = THREE.NoColorSpace;

    this.atlas = new THREE.CanvasTexture(createPrintAtlas());
    this.atlas.flipY = false;
    this.atlas.minFilter = THREE.LinearFilter;
    this.atlas.magFilter = THREE.LinearFilter;
    this.atlas.generateMipmaps = false;
    this.atlas.colorSpace = THREE.NoColorSpace;

    this.instances.setAttribute("position", this.quad.getAttribute("position"));
    this.instances.setIndex(this.quad.getIndex());
    const add = (name: string, data: Float32Array, size: number) => {
      const attribute = new THREE.InstancedBufferAttribute(data, size);
      attribute.setUsage(THREE.DynamicDrawUsage);
      this.instances.setAttribute(name, attribute);
      this.attributes.push(attribute);
    };
    add("aA", this.aA, 4);
    add("aR", this.aR, 4);
    add("aO", this.aO, 4);
    add("aM", this.aM, 4);
    add("aS", this.aS, 2);
    this.instances.instanceCount = 0;

    this.densityMaterial = new THREE.ShaderMaterial({
      vertexShader: densityVert,
      fragmentShader: densityFrag,
      depthTest: false,
      depthWrite: false,
      side: THREE.DoubleSide,
      // MAX: overlapping limbs and prints form a union, not a sum.
      blending: THREE.CustomBlending,
      blendEquation: THREE.MaxEquation,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneFactor,
      uniforms: {
        uArea: { value: new THREE.Vector2(1, 1) },
        uHaze: { value: HAZE },
        uAtlas: { value: this.atlas },
        uStyles: { value: PRINT_STYLES.length },
        uFill: { value: CELL_FILL },
      },
    });
    const marks = new THREE.Mesh(this.instances, this.densityMaterial);
    marks.frustumCulled = false;
    this.densityScene.add(marks);

    // ── dot pass ───────────────────────────────────────────────────
    this.material = new THREE.ShaderMaterial({
      vertexShader: dotsVert,
      fragmentShader: dotsFrag,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uBuffer: { value: new THREE.Vector2(1, 1) },
        uDpr: { value: 1 },
        uSize: { value: new THREE.Vector2(1, 1) },
        uSpacing: { value: 9 },
        uGrid: { value: new THREE.Vector2(2, 2) },
        uDensity: { value: this.target.texture },
        uBaseR: { value: 1 },
        uMaxR: { value: 5 },
        uBaseAlpha: { value: 0.3 },
        uDot: { value: new THREE.Vector3() },
        uPaper: { value: new THREE.Vector3(1, 1, 1) },
        uHalo: { value: new THREE.Vector3() },
        uFlare: { value: new THREE.Vector2() },
        uFlareI: { value: 0 },
        uSecondary: { value: 0 },
        uSecondaryY: { value: 0 },
      },
    });
    const paper = new THREE.Mesh(this.quad, this.material);
    paper.frustumCulled = false;
    this.scene.add(paper);

    this.applyParams(null);
  }

  setParams(next: FeetParams): void {
    const prev = this.p;
    this.p = next;
    this.applyParams(prev);
  }

  /** Pointer position relative to the container's top-left, CSS px. */
  pointerMove(x: number, y: number): void {
    this.pointerX = x;
    this.pointerY = y;
    this.hovering = true;
  }

  pointerLeave(): void {
    this.hovering = false;
  }

  resize(width: number, height: number, dpr: number): void {
    const first = this.width === 0;
    // Grown from next to nothing (a hidden tab, a collapsed panel): the
    // walkers were laid out for the old box and would all be bunched in
    // one corner of the new one. Lay them out again.
    const outgrown = this.width * this.height < width * height * 0.25;
    this.width = width;
    this.height = height;
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(width, height, false);
    const u = this.material.uniforms;
    const buffer = this.renderer.getDrawingBufferSize(u.uBuffer.value as THREE.Vector2);
    u.uDpr.value = buffer.x / width;
    (u.uSize.value as THREE.Vector2).set(width, height);
    this.layoutGrid();
    if (first) {
      this.fx = width * 0.64;
      this.fy = height * 0.44;
    }
    if (!this.started || outgrown) {
      this.started = true;
      this.sim.reset(this.p.seed, this.p.walkers, width, height, this.cfg);
    }
  }

  update(_time: number, dt: number, still: boolean): void {
    if (!this.started) return;
    const p = this.p;
    const w = this.width;
    const h = this.height;

    if (dt > 0) {
      this.sim.update(dt, w, h, this.cfg);
      this.clock += dt;
    }
    const t = this.clock;

    // ── flare ──────────────────────────────────────────────────────
    let intensity: number;
    if (still) {
      // Reduced motion: one composed frame, flare parked, pointer ignored.
      this.fx = w * 0.64;
      this.fy = h * 0.44;
      intensity = 0.85;
    } else {
      if (dt > 0) {
        const rate = this.hovering
          ? dt / Math.max(0.001, p.flareFadeIn / 1000)
          : -dt / Math.max(0.001, p.flareFadeOut / 1000);
        this.hover = clamp(this.hover + rate, 0, 1);

        // Idle: drift slowly around a resting point. Because the flare is
        // the light, this is also what keeps the shadows gently moving.
        const restX = w * (0.64 + 0.09 * Math.sin(t * 0.11));
        const restY = h * (0.44 + 0.11 * Math.sin(t * 0.073 + 1.3));
        const tx = this.hovering ? this.pointerX : restX;
        const ty = this.hovering ? this.pointerY : restY;

        // Critically damped spring (the usual "smooth damp"): heavy, no
        // overshoot, settles in about `lag`.
        const lag = Math.max(0.001, (this.hovering ? p.flareFollowLag : 1400) / 1000);
        const omega = 2 / lag;
        const x = omega * dt;
        const decay = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
        let change = this.fx - tx;
        let temp = (this.fvx + omega * change) * dt;
        this.fvx = (this.fvx - omega * temp) * decay;
        this.fx = tx + (change + temp) * decay;
        change = this.fy - ty;
        temp = (this.fvy + omega * change) * dt;
        this.fvy = (this.fvy - omega * temp) * decay;
        this.fy = ty + (change + temp) * decay;
      }
      const eased = smoothstep(0, 1, this.hover);
      const cycle = Math.max(1, p.flareIdleCycle);
      const idle = 0.1 + 0.75 * (0.5 - 0.5 * Math.cos((t / cycle) * Math.PI * 2));
      const breathing = 1 + 0.15 * Math.sin((t / 4) * Math.PI * 2);
      intensity = idle + (breathing - idle) * eased;
    }

    const u = this.material.uniforms;
    (u.uFlare.value as THREE.Vector2).set(this.fx, this.fy);
    u.uFlareI.value = intensity * p.flareIntensity;
    u.uSecondaryY.value = h * 0.19 + (this.fy - h * 0.44) * 0.12;

    // The DOM readout only changes when the third decimal does.
    const qx = Math.round(clamp(this.fx / w, 0, 1) * 1000);
    const qy = Math.round(clamp(this.fy / h, 0, 1) * 1000);
    if ((qx !== this.lastQx || qy !== this.lastQy) && this.onReadout) {
      this.lastQx = qx;
      this.lastQy = qy;
      this.onReadout(qx / 1000, qy / 1000);
    }

    this.buildInstances();
  }

  render(): void {
    this.renderer.setRenderTarget(this.target);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.clear();
    this.renderer.render(this.densityScene, this.camera);
    this.renderer.setRenderTarget(null);
    this.renderer.render(this.scene, this.camera);
  }

  sync(): void {
    const gl = this.renderer.getContext();
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, this.pixel);
  }

  gpu(): string {
    const gl = this.renderer.getContext();
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    return String(gl.getParameter(ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
  }

  /** Debug: the simulation, for inspecting in the lab. */
  simulation(): WalkerSim {
    return this.sim;
  }

  /** Debug: put the light somewhere, as if the pointer were there. */
  placeLight(x: number, y: number): void {
    this.fx = x;
    this.fy = y;
    this.fvx = this.fvy = 0;
    this.pointerX = x;
    this.pointerY = y;
    this.hovering = true;
    this.hover = 1;
  }

  dispose(): void {
    this.onReadout = null;
    this.quad.dispose();
    this.instances.dispose();
    this.material.dispose();
    this.densityMaterial.dispose();
    this.target.dispose();
    this.atlas.dispose();
    this.renderer.dispose();
  }

  /* ── internals ──────────────────────────────────────────────────── */

  private applyParams(prev: FeetParams | null): void {
    const p = this.p;
    const u = this.material.uniforms;
    const cfg = this.cfg;

    cfg.walkSpeed = p.walkSpeed;
    cfg.strideLength = p.strideLength;
    cfg.pivotChance = clamp(p.pivotChance, 0, 1);
    cfg.trailLength = clamp(p.trailLength, 1, 12);
    cfg.footLength = FOOT_LENGTH * Math.max(0.2, p.footScale);
    cfg.bodyHeight = clamp(p.bodyHeight, 1.2, 8);
    cfg.gaitEnergy = p.gaitEnergy;
    cfg.swayAmount = clamp(p.swayAmount, 0, 2);
    cfg.individuality = clamp(p.individuality, 0, 2);
    cfg.style = (PRINT_STYLES as readonly string[]).indexOf(p.printStyle);

    u.uBaseR.value = p.baseDotRadius;
    u.uMaxR.value = p.maxDotRadius;
    u.uBaseAlpha.value = clamp(p.baseDotOpacity, 0, 1);
    u.uSecondary.value = p.secondaryLine ? 1 : 0;
    hexToRgb(p.dotColor, u.uDot.value as THREE.Vector3);
    hexToRgb(p.paperColor, u.uPaper.value as THREE.Vector3);
    hexToRgb(p.haloColor, u.uHalo.value as THREE.Vector3);

    if (!prev || prev.gridSpacing !== p.gridSpacing) this.layoutGrid();
    if (this.started && prev) {
      if (prev.seed !== p.seed || prev.individuality !== p.individuality) {
        this.sim.reset(p.seed, p.walkers, this.width, this.height, cfg);
      } else if (prev.walkers !== p.walkers) {
        this.sim.setCount(p.walkers, cfg);
      }
      if (prev.printStyle !== p.printStyle) this.sim.restyle(cfg);
    }
  }

  /**
   * The density target covers a whole number of dot cells, anchored to
   * the top-left, so growing the container adds cells at the right and
   * bottom and the existing dots do not move.
   */
  private layoutGrid(): void {
    if (this.width === 0) return;
    const spacing = Math.max(4, this.p.gridSpacing);
    const cols = Math.max(2, Math.ceil(this.width / spacing));
    const rows = Math.max(2, Math.ceil(this.height / spacing));
    const u = this.material.uniforms;
    u.uSpacing.value = spacing;
    (this.densityMaterial.uniforms.uArea.value as THREE.Vector2).set(
      cols * spacing,
      rows * spacing
    );
    if (cols === this.cols && rows === this.rows) return;
    this.cols = cols;
    this.rows = rows;
    (u.uGrid.value as THREE.Vector2).set(cols, rows);
    this.target.setSize(cols * SUPERSAMPLE, rows * SUPERSAMPLE);
  }

  /* ── casting the scene onto the glass ───────────────────────────── */

  private buildInstances(): void {
    this.count = 0;
    const p = this.p;
    const t = this.sim.time;
    const F = this.cfg.footLength;
    const printL = F / CELL_FILL;
    const printW = (F * FOOT_ASPECT) / CELL_FILL;
    const haloR = F * 0.2;
    const haloBlur = F * 0.42 * p.haloBlur;
    const walkers = this.sim.walkers;

    for (let i = 0; i < MAX_WALKERS; i++) {
      const w = walkers[i];

      // Lifted prints: what the walker has left behind.
      for (let k = 0; k < w.marks.length; k++) {
        const m = w.marks[k];
        const left = markInk(m, t);
        if (left <= 0.003) continue;
        const age = t - m.lifted;
        // A lifted print loses its sharpest ink at once, then lingers.
        const residue = RESIDUE * left * (1 - 0.25 * smoothstep(0, 1.5, age));
        const bleed = 0.02 + 0.07 * smoothstep(0, 3, age) + 0.1 * (1 - left);
        this.print(
          m.x,
          m.y,
          m.yaw,
          printL,
          printW,
          0,
          1,
          0,
          residue,
          m.seed,
          bleed,
          w.style,
          m.side
        );
        if (p.haloBlur > 0.01) this.halo(m.x, m.y, m.yaw, F, haloR, haloBlur, 0.6 * residue);
      }

      if (w.active && !w.exited) {
        // Feet on the glass right now, inked by how hard they press.
        for (let k = 0; k < 2; k++) {
          const f = w.feet[k];
          if (!f.planted) continue;
          const press = 0.6 + 0.4 * f.load;
          const side = k === 0 ? -1 : 1;
          this.print(
            f.x,
            f.y,
            f.yaw,
            printL,
            printW,
            f.lo,
            f.hi,
            press,
            RESIDUE,
            f.seed,
            0.02,
            w.style,
            side
          );
          if (p.haloBlur > 0.01) this.halo(f.x, f.y, f.yaw, F, haloR, haloBlur, 0.75 * press);
        }
      }
      if (w.presence > 0) this.body(w, w.presence);
    }

    this.instances.instanceCount = this.count;
    for (let k = 0; k < this.attributes.length; k++) this.attributes[k].needsUpdate = true;
  }

  /**
   * One walker's shadow. Each joint P is cast from the light L onto the
   * glass (z = 0) along the line L → P:
   *
   *     S.xy = P.xy + (P.xy − L.xy) · k,     k = P.z / (L.z − P.z)
   *
   * k is zero on the glass and grows with height, so a joint's shadow is
   * thrown further, and by the same similar triangles drawn wider
   * (× 1 + k), the higher it is. Blur grows with height too. Opacity
   * falls with height and is exactly zero at mid-waist.
   */
  private body(w: Walker, presence: number): void {
    const p = this.p;
    const j = w.joints;
    const cast = this.cast;
    const F = this.cfg.footLength;
    const lightZ = Math.max(50, p.lightHeight);
    const maxK = Math.max(0, p.shadowLength);
    const waistZ = Math.max(j[J.waistL * 3 + 2], j[J.waistR * 3 + 2], 1);
    const strength = presence * clamp(p.shadowOpacity, 0, 1);
    if (strength <= 0.003) return;

    for (let s = 0; s < J.count; s++) {
      const x = j[s * 3];
      const y = j[s * 3 + 1];
      const z = Math.max(0, j[s * 3 + 2]);
      const k = Math.min(z / Math.max(lightZ - z, lightZ * 0.05), maxK);
      cast[s * 3] = x + (x - this.fx) * k;
      cast[s * 3 + 1] = y + (y - this.fy) * k;
      cast[s * 3 + 2] = k;
    }

    // Legs: the ankle is nearly on the glass (sharp, dense), the hip far.
    for (let side = 0; side < 2; side++) {
      this.limb(j, J.hipL + side, J.kneeL + side, F * 0.19, F * 0.15, waistZ, strength);
      this.limb(j, J.kneeL + side, J.ankleL + side, F * 0.145, F * 0.1, waistZ, strength);
      // A foot only casts a shadow once it has left the glass; until
      // then it is a print.
      const heelZ = j[(J.heelL + side) * 3 + 2];
      const toeZ = j[(J.toeL + side) * 3 + 2];
      const lifted = Math.max(smoothstep(0.5, F * 0.1, heelZ), smoothstep(0.5, F * 0.1, toeZ));
      if (lifted > 0.01) {
        this.limb(j, J.heelL + side, J.toeL + side, F * 0.15, F * 0.17, waistZ, strength * lifted);
      }
      // Hip up to the waist: fades to nothing by construction.
      this.limb(j, J.hipL + side, J.waistL + side, F * 0.2, F * 0.18, waistZ, strength);
    }
    this.limb(j, J.hipL, J.hipR, F * 0.2, F * 0.2, waistZ, strength);
  }

  private limb(
    j: Float32Array,
    a: number,
    b: number,
    ra: number,
    rb: number,
    waistZ: number,
    strength: number
  ): void {
    const cast = this.cast;
    const za = Math.max(0, j[a * 3 + 2]);
    const zb = Math.max(0, j[b * 3 + 2]);
    const ka = cast[a * 3 + 2];
    const kb = cast[b * 3 + 2];
    const blur = this.p.penumbra;
    this.capsule(
      cast[a * 3],
      cast[a * 3 + 1],
      cast[b * 3],
      cast[b * 3 + 1],
      ra * (1 + ka),
      rb * (1 + kb),
      1.4 + blur * za * (1 + 0.5 * ka),
      1.4 + blur * zb * (1 + 0.5 * kb),
      strength * fall(za, waistZ),
      strength * fall(zb, waistZ),
      0,
      1,
      1
    );
  }

  /** The soft glow hugging a print: haze only. */
  private halo(
    x: number,
    y: number,
    yaw: number,
    F: number,
    radius: number,
    blur: number,
    opacity: number
  ): void {
    const c = Math.cos(yaw) * F * 0.3;
    const s = Math.sin(yaw) * F * 0.3;
    // Haze is drawn `HAZE` times wider than the blur it is given.
    const b = blur / HAZE;
    this.capsule(x - c, y - s, x + c, y + s, radius, radius, b, b, opacity, opacity, 0, 0, 1);
  }

  private capsule(
    ax: number,
    ay: number,
    bx: number,
    by: number,
    ra: number,
    rb: number,
    blurA: number,
    blurB: number,
    oa: number,
    ob: number,
    mr: number,
    mg: number,
    mb: number
  ): void {
    const n = this.count;
    if (n >= CAPACITY || (oa <= 0.002 && ob <= 0.002)) return;
    const i = n * 4;
    this.aA[i] = ax;
    this.aA[i + 1] = ay;
    this.aA[i + 2] = bx;
    this.aA[i + 3] = by;
    this.aR[i] = ra;
    this.aR[i + 1] = rb;
    this.aR[i + 2] = blurA;
    this.aR[i + 3] = blurB;
    this.aO[i] = oa;
    this.aO[i + 1] = ob;
    this.aO[i + 2] = 0;
    this.aO[i + 3] = 0;
    this.aM[i] = mr;
    this.aM[i + 1] = mg;
    this.aM[i + 2] = mb;
    this.aM[i + 3] = 0;
    this.aS[n * 2] = 0;
    this.aS[n * 2 + 1] = 1;
    this.count = n + 1;
  }

  private print(
    x: number,
    y: number,
    yaw: number,
    length: number,
    width: number,
    lo: number,
    hi: number,
    pressed: number,
    residue: number,
    seed: number,
    bleed: number,
    style: number,
    side: number
  ): void {
    const n = this.count;
    if (n >= CAPACITY) return;
    const i = n * 4;
    this.aA[i] = x;
    this.aA[i + 1] = y;
    this.aA[i + 2] = Math.cos(yaw);
    this.aA[i + 3] = Math.sin(yaw);
    this.aR[i] = length;
    this.aR[i + 1] = width;
    this.aR[i + 2] = seed;
    this.aR[i + 3] = bleed;
    this.aO[i] = lo;
    this.aO[i + 1] = hi;
    this.aO[i + 2] = pressed;
    this.aO[i + 3] = residue;
    this.aM[i] = 1;
    this.aM[i + 1] = 0;
    this.aM[i + 2] = 0;
    this.aM[i + 3] = 1;
    this.aS[n * 2] = style;
    this.aS[n * 2 + 1] = side;
    this.count = n + 1;
  }
}

/** Shadow opacity by height: densest at the ankle, zero at mid-waist. */
function fall(z: number, waistZ: number): number {
  const up = clamp(1 - z / waistZ, 0, 1);
  return 0.6 * Math.pow(up, 0.9);
}

export const createFeetEngine = (canvas: HTMLCanvasElement) => new FeetEngine(canvas);
