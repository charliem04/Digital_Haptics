import * as THREE from "three";
import type { ParamEngine } from "../shared/useStage";
import { clamp, hexToRgb, smoothstep } from "../shared/rng";
import { FEET_DEFAULTS, FOOT_LENGTH, type FeetParams } from "./params";
import { MAX_WALKERS, WalkerSim, printInk, type WalkConfig, type Walker } from "./walkers";
import {
  FOOT_ASPECT,
  LEG_SHARE,
  PRINT_STYLES,
  createFootSprites,
  createHaloSprite,
  createLegSprite,
  createWaistSprite,
} from "./sprites";
import { dotsVert } from "./dots.vert.glsl";
import { dotsFrag } from "./dots.frag.glsl";

/**
 * ════════════════════════════════════════════════════════════════════
 *  CONCEPT A ENGINE — wandering feet on a halftone grid.
 *
 *  Per frame:
 *    1. step the walkers (plain numbers, no allocation)
 *    2. ease the flare toward the pointer, or its idle drift
 *    3. redraw the density canvas: one pixel per dot cell, every inked
 *       print stamped as a red foot over a blue halo
 *    4. upload that canvas (≈ 180×60 texels) and draw one fullscreen quad
 *
 *  The shader turns the density into dot sizes, so the prints are made of
 *  the same dots as the background and stay locked to the grid.
 * ════════════════════════════════════════════════════════════════════
 */
export class FeetEngine implements ParamEngine<FeetParams> {
  readonly renderer: THREE.WebGLRenderer;
  /** Called with the flare position, 0–1 on each axis, when it changes. */
  onReadout: ((x: number, y: number) => void) | null = null;

  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private readonly geometry = new THREE.PlaneGeometry(2, 2);
  private readonly material: THREE.ShaderMaterial;
  private readonly density: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly texture: THREE.CanvasTexture;
  private readonly feet = createFootSprites();
  private readonly leg = createLegSprite();
  private readonly waist = createWaistSprite();
  private readonly halo = createHaloSprite();
  private readonly sim = new WalkerSim();
  private readonly cfg: WalkConfig = {
    walkSpeed: 0,
    strideLength: 0,
    pivotChance: 0,
    trailLength: 0,
    footLength: FOOT_LENGTH,
    style: -1,
    styleCount: PRINT_STYLES.length,
  };
  private readonly pixel = new Uint8Array(4);

  private p: FeetParams = { ...FEET_DEFAULTS };
  private width = 0;
  private height = 0;
  private cols = 0;
  private rows = 0;
  private started = false;

  // Flare state, CSS px.
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

    this.density = document.createElement("canvas");
    this.density.width = 2;
    this.density.height = 2;
    const ctx = this.density.getContext("2d");
    if (!ctx) throw new Error("2D canvas unavailable");
    this.ctx = ctx;
    ctx.imageSmoothingQuality = "high";

    this.texture = new THREE.CanvasTexture(this.density);
    this.texture.flipY = false;
    this.texture.minFilter = THREE.LinearFilter;
    this.texture.magFilter = THREE.LinearFilter;
    this.texture.generateMipmaps = false;
    this.texture.colorSpace = THREE.NoColorSpace;

    this.material = new THREE.ShaderMaterial({
      vertexShader: dotsVert,
      fragmentShader: dotsFrag,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uBuffer: { value: new THREE.Vector2(1, 1) },
        uDpr: { value: 1 },
        uSize: { value: new THREE.Vector2(1, 1) },
        uSpacing: { value: 12 },
        uGrid: { value: new THREE.Vector2(2, 2) },
        uDensity: { value: this.texture },
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
        uBody: { value: 0.8 },
      },
    });
    const quad = new THREE.Mesh(this.geometry, this.material);
    quad.frustumCulled = false;
    this.scene.add(quad);

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

        // Idle: drift slowly around a resting point.
        const restX = w * (0.64 + 0.07 * Math.sin(t * 0.11));
        const restY = h * (0.44 + 0.09 * Math.sin(t * 0.073 + 1.3));
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

    this.drawDensity();
  }

  render(): void {
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

  dispose(): void {
    this.onReadout = null;
    this.geometry.dispose();
    this.material.dispose();
    this.texture.dispose();
    this.renderer.dispose();
  }

  /* ── internals ──────────────────────────────────────────────────── */

  private applyParams(prev: FeetParams | null): void {
    const p = this.p;
    const u = this.material.uniforms;

    this.cfg.walkSpeed = p.walkSpeed;
    this.cfg.strideLength = p.strideLength;
    this.cfg.pivotChance = clamp(p.pivotChance, 0, 1);
    this.cfg.trailLength = clamp(p.trailLength, 1, 12);
    this.cfg.footLength = FOOT_LENGTH * Math.max(0.2, p.footScale);

    u.uBaseR.value = p.baseDotRadius;
    u.uMaxR.value = p.maxDotRadius;
    u.uBaseAlpha.value = clamp(p.baseDotOpacity, 0, 1);
    u.uSecondary.value = p.secondaryLine ? 1 : 0;
    u.uBody.value = clamp(p.bodyDensity, 0, 1);
    this.cfg.style = (PRINT_STYLES as readonly string[]).indexOf(p.printStyle);
    hexToRgb(p.dotColor, u.uDot.value as THREE.Vector3);
    hexToRgb(p.paperColor, u.uPaper.value as THREE.Vector3);
    hexToRgb(p.haloColor, u.uHalo.value as THREE.Vector3);

    if (!prev || prev.gridSpacing !== p.gridSpacing) this.layoutGrid();
    if (this.started && prev) {
      if (prev.seed !== p.seed) {
        this.sim.reset(p.seed, p.walkers, this.width, this.height, this.cfg);
      } else if (prev.walkers !== p.walkers) {
        this.sim.setCount(p.walkers, this.cfg);
      }
      if (prev.printStyle !== p.printStyle) this.sim.restyle(this.cfg);
    }
  }

  /**
   * One density texel per dot cell. Cells are anchored to the top-left,
   * so growing the container adds cells at the right and bottom and the
   * existing dots do not move.
   */
  private layoutGrid(): void {
    if (this.width === 0) return;
    const spacing = Math.max(4, this.p.gridSpacing);
    const cols = Math.max(2, Math.ceil(this.width / spacing));
    const rows = Math.max(2, Math.ceil(this.height / spacing));
    const u = this.material.uniforms;
    u.uSpacing.value = spacing;
    if (cols === this.cols && rows === this.rows) return;
    this.cols = cols;
    this.rows = rows;
    this.density.width = cols;
    this.density.height = rows;
    // Resizing a canvas resets its context state.
    this.ctx.imageSmoothingQuality = "high";
    (u.uGrid.value as THREE.Vector2).set(cols, rows);
    // The GPU texture has fixed storage: drop it so it is re-created at
    // the new size on the next upload.
    this.texture.dispose();
  }

  private drawDensity(): void {
    const ctx = this.ctx;
    const t = this.sim.time;
    const scale = 1 / Math.max(4, this.p.gridSpacing);
    const length = this.cfg.footLength;
    const footW = length * FOOT_ASPECT;
    const haloL = length * (1.15 + 1.5 * this.p.haloBlur);
    const haloW = haloL * 0.72;
    const haloAlpha = this.p.haloBlur > 0.01 ? 0.6 : 0;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    // Opaque black, not clear: keeps alpha at 1 so the upload is not
    // un-premultiplied into garbage.
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, this.cols, this.rows);
    ctx.globalCompositeOperation = "lighter";

    const walkers = this.sim.walkers;
    const bodyLength = length * Math.max(0, this.p.bodyHeight);
    for (let i = 0; i < MAX_WALKERS; i++) {
      const walker = walkers[i];
      const foot = this.feet[walker.style] ?? this.feet[0];
      if (bodyLength > 1 && walker.body > 0) this.drawBody(walker, bodyLength, scale);
      const prints = walker.prints;
      for (let j = 0; j < prints.length; j++) {
        const print = prints[j];
        const ink = printInk(print, t);
        if (ink <= 0.002) continue;
        // Sprite "up" is the toe direction, hence the quarter turn.
        const a = print.angle + Math.PI / 2;
        const c = Math.cos(a) * scale;
        const s = Math.sin(a) * scale;
        const x = print.x * scale;
        const y = print.y * scale;
        if (haloAlpha > 0) {
          ctx.globalAlpha = ink * haloAlpha;
          ctx.setTransform(c, s, -s, c, x, y);
          ctx.drawImage(this.halo, -haloW / 2, -haloL / 2, haloW, haloL);
        }
        ctx.globalAlpha = ink;
        // Mirror across the foot's long axis for the left print.
        ctx.setTransform(c * print.side, s * print.side, -s, c, x, y);
        ctx.drawImage(foot, -footW / 2, -length / 2, footW, length);
      }
    }
    this.texture.needsUpdate = true;
  }

  /**
   * Legs and waist, drawn into the green channel.
   *
   * The figure stands "up the page": each leg runs from an ankle to its
   * side of the hips, which sit a leg's length above the midpoint of the
   * feet, and the waist carries on from there to mid-waist, where the
   * sprite's own gradient reaches zero. Nothing is drawn above that.
   */
  private drawBody(walker: Walker, bodyLength: number, scale: number): void {
    const ctx = this.ctx;
    const legLength = bodyLength * LEG_SHARE;
    const waistLength = bodyLength - legLength;
    const footLength = this.cfg.footLength;
    const legWidth = footLength * 0.46;
    const hipHalf = footLength * 0.22;
    const hipX = (walker.leftX + walker.rightX) / 2;
    const hipY = (walker.leftY + walker.rightY) / 2 - legLength;
    // Whichever ankle is further left on the page takes the left hip, so
    // the legs never cross when the walker is heading down the page.
    const order = walker.leftX <= walker.rightX ? 1 : -1;

    ctx.globalAlpha = walker.body;
    for (let side = -1; side <= 1; side += 2) {
      const ankleX = side < 0 ? walker.leftX : walker.rightX;
      const ankleY = side < 0 ? walker.leftY : walker.rightY;
      const dx = hipX + side * order * hipHalf - ankleX;
      const dy = hipY - ankleY;
      const span = Math.hypot(dx, dy);
      if (span < 1) continue;
      // Sprite "up" runs from the ankle to the hip.
      const c = (-dy / span) * scale;
      const s = (dx / span) * scale;
      ctx.setTransform(c, s, -s, c, ankleX * scale, ankleY * scale);
      ctx.drawImage(this.leg, -legWidth / 2, -span, legWidth, span);
    }
    const waistWidth = hipHalf * 2 + legWidth * 0.9;
    ctx.setTransform(scale, 0, 0, scale, hipX * scale, hipY * scale);
    ctx.drawImage(this.waist, -waistWidth / 2, -waistLength, waistWidth, waistLength);
  }
}

export const createFeetEngine = (canvas: HTMLCanvasElement) => new FeetEngine(canvas);
