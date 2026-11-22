import * as THREE from "three";
import type { ParamEngine } from "../shared/useStage";
import { clamp, hexToRgb } from "../shared/rng";
import { LIQUID_DEFAULTS, MAX_BLOBS, type LiquidParams, type LiquidStop } from "./params";
import { BlobSim, type BlobConfig } from "./blobs";
import { liquidVert, marchFrag, presentFrag } from "./liquid.glsl";

/**
 * ════════════════════════════════════════════════════════════════════
 *  CONCEPT C ENGINE — liquid metal adrift in a low-gravity room.
 *
 *  Per frame:
 *    1. step the blobs (CPU, a dozen bodies, fixed timestep)
 *    2. drift the camera a little, so near and far masses slide past
 *       each other and the depth is felt
 *    3. MARCH: draw the liquid into a small half-float target, about a
 *       third of the screen each way
 *    4. PRESENT: enlarge it with a bicubic filter and lay film grain
 *       over it at the screen's full resolution
 *
 *  The picture has no fine detail in it by design, so step 3 can be
 *  small. The grain is the only thing drawn at full resolution, and it
 *  is what the eye reads as sharpness.
 * ════════════════════════════════════════════════════════════════════
 */

const RAMP_SIZE = 256;
/** Camera distance from the focal plane; the view is 2 units tall there. */
const CAMERA_DISTANCE = 3.4;
/** The liquid never needs more than this many pixels. */
const MAX_SCENE_PIXELS = 520_000;

export class LiquidEngine implements ParamEngine<LiquidParams> {
  readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private readonly quad = new THREE.PlaneGeometry(2, 2);
  private readonly mesh: THREE.Mesh;
  private readonly march: THREE.ShaderMaterial;
  private readonly present: THREE.ShaderMaterial;
  private readonly target: THREE.WebGLRenderTarget;
  private readonly rampData = new Uint8Array(RAMP_SIZE * 4);
  private readonly ramp: THREE.DataTexture;
  private readonly sim = new BlobSim();
  private readonly cfg: BlobConfig = {
    count: 12,
    coverage: 0.45,
    flowSpeed: 1,
    gravity: 0.3,
    buoyancy: 1,
    stretch: 1,
    aspect: 1.6,
  };
  private readonly pixel = new Uint8Array(4);
  private readonly rgbA = { x: 0, y: 0, z: 0 };
  private readonly rgbB = { x: 0, y: 0, z: 0 };

  private p: LiquidParams = { ...LIQUID_DEFAULTS };
  private width = 0;
  private height = 0;
  private dpr = 1;
  private started = false;
  private clock = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
    });
    this.renderer.setClearColor(0x181c21, 1);

    // Half-float: the dark teal falloffs span only a few 8-bit steps, and
    // would band before the grain ever got to dither them.
    this.target = new THREE.WebGLRenderTarget(4, 4, {
      type: THREE.HalfFloatType,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      depthBuffer: false,
      stencilBuffer: false,
      generateMipmaps: false,
    });
    this.target.texture.colorSpace = THREE.NoColorSpace;

    this.ramp = new THREE.DataTexture(this.rampData, RAMP_SIZE, 1, THREE.RGBAFormat);
    this.ramp.minFilter = THREE.LinearFilter;
    this.ramp.magFilter = THREE.LinearFilter;

    this.march = new THREE.ShaderMaterial({
      vertexShader: liquidVert,
      fragmentShader: marchFrag,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uBlob: { value: this.sim.spheres },
        uAxis: { value: this.sim.axes },
        uCount: { value: 12 },
        uCamPos: { value: new THREE.Vector3(0, 0, -CAMERA_DISTANCE) },
        uCamRight: { value: new THREE.Vector3(1, 0, 0) },
        uCamUp: { value: new THREE.Vector3(0, 1, 0) },
        uCamFwd: { value: new THREE.Vector3(0, 0, 1) },
        uTan: { value: 1 / CAMERA_DISTANCE },
        uAspect: { value: 1.6 },
        uSharp: { value: 2 },
        uWarp: { value: 0.7 },
        uWarpScale: { value: 1 },
        uTime: { value: 0 },
        uRim: { value: 0.5 },
        uDof: { value: 0.7 },
        uFog: { value: 0.6 },
        uFocus: { value: CAMERA_DISTANCE },
        uRamp: { value: this.ramp },
      },
    });
    this.present = new THREE.ShaderMaterial({
      vertexShader: liquidVert,
      fragmentShader: presentFrag,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uScene: { value: this.target.texture },
        uSceneSize: { value: new THREE.Vector2(4, 4) },
        uGrain: { value: 1 },
        uGrainSize: { value: 1.6 },
        uGrainSeed: { value: 0 },
      },
    });

    this.mesh = new THREE.Mesh(this.quad, this.march);
    this.mesh.frustumCulled = false;
    this.scene.add(this.mesh);

    this.applyParams(null);
  }

  setParams(next: LiquidParams): void {
    const prev = this.p;
    this.p = next;
    this.applyParams(prev);
  }

  resize(width: number, height: number, dpr: number): void {
    this.width = width;
    this.height = height;
    this.dpr = dpr;
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(width, height, false);
    this.cfg.aspect = width / height;
    this.march.uniforms.uAspect.value = width / height;
    this.layoutScene();
    if (!this.started) {
      this.started = true;
      this.sim.reset(this.p.seed, this.cfg);
    }
  }

  update(_time: number, dt: number, still: boolean): void {
    if (!this.started) return;
    const p = this.p;
    if (dt > 0) {
      this.sim.update(dt, this.cfg);
      this.clock += dt;
    }
    const t = this.clock;
    const u = this.march.uniforms;
    u.uTime.value = t;
    u.uCount.value = clamp(Math.round(p.blobCount), 1, MAX_BLOBS);

    // The camera sways on two slow, unrelated periods and always looks
    // at the middle of the room.
    const drift = p.cameraDrift;
    const yaw = 0.11 * drift * Math.sin(t * 0.043);
    const pitch = 0.07 * drift * Math.sin(t * 0.031 + 1.1);
    const cy = Math.cos(yaw);
    const sy = Math.sin(yaw);
    const cp = Math.cos(pitch);
    const sp = Math.sin(pitch);
    const fwd = u.uCamFwd.value as THREE.Vector3;
    fwd.set(sy * cp, sp, cy * cp);
    (u.uCamPos.value as THREE.Vector3).copy(fwd).multiplyScalar(-CAMERA_DISTANCE);
    (u.uCamRight.value as THREE.Vector3).set(cy, 0, -sy);
    (u.uCamUp.value as THREE.Vector3).set(-sy * sp, cp, -cy * sp);

    // Grain is re-drawn a dozen or so times a second, like film, not on
    // every frame like video noise. Still frames keep one fixed pattern.
    const fps = Math.max(1, p.grainFps);
    this.present.uniforms.uGrainSeed.value = still ? 1 : (Math.floor(t * fps) % 4096) + 1;
  }

  render(): void {
    this.mesh.material = this.march;
    this.renderer.setRenderTarget(this.target);
    this.renderer.render(this.scene, this.camera);
    this.mesh.material = this.present;
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

  /** Debug: the size the liquid is actually marched at. */
  sceneSize(): [number, number] {
    return [this.target.width, this.target.height];
  }

  dispose(): void {
    this.quad.dispose();
    this.march.dispose();
    this.present.dispose();
    this.target.dispose();
    this.ramp.dispose();
    this.renderer.dispose();
  }

  /* ── internals ──────────────────────────────────────────────────── */

  private applyParams(prev: LiquidParams | null): void {
    const p = this.p;
    const cfg = this.cfg;
    cfg.count = p.blobCount;
    cfg.coverage = p.coverage;
    cfg.flowSpeed = p.flowSpeed;
    cfg.gravity = p.gravity;
    cfg.buoyancy = p.buoyancy;
    cfg.stretch = Math.max(0, p.stretch);

    const u = this.march.uniforms;
    // Syrupy liquid has a shallow density falloff, so neighbours fuse
    // from further away; a steep one keeps them as separate beads.
    u.uSharp.value = 3.6 - 2.8 * clamp(p.viscosity, 0, 1);
    u.uWarp.value = p.warpAmount;
    u.uWarpScale.value = p.warpScale;
    u.uRim.value = clamp(p.rimWidth, 0, 1);
    u.uDof.value = Math.max(0, p.depthOfField);
    u.uFog.value = clamp(p.fogAmount, 0, 1);

    const g = this.present.uniforms;
    g.uGrain.value = Math.max(0, p.grainAmount);
    g.uGrainSize.value = Math.max(0.5, p.grainSize);

    if (!prev || !samePalette(prev.palette, p.palette)) this.buildRamp(p.palette);
    if (!prev || prev.renderScale !== p.renderScale) this.layoutScene();
    if (this.started && prev && prev.seed !== p.seed) this.sim.reset(p.seed, cfg);
  }

  private layoutScene(): void {
    if (this.width === 0) return;
    const bufferW = this.width * this.dpr;
    const bufferH = this.height * this.dpr;
    let scale = clamp(this.p.renderScale, 0.1, 1);
    const pixels = bufferW * bufferH * scale * scale;
    if (pixels > MAX_SCENE_PIXELS) scale *= Math.sqrt(MAX_SCENE_PIXELS / pixels);
    const w = Math.max(16, Math.round(bufferW * scale));
    const h = Math.max(16, Math.round(bufferH * scale));
    if (w === this.target.width && h === this.target.height) return;
    this.target.setSize(w, h);
    (this.present.uniforms.uSceneSize.value as THREE.Vector2).set(w, h);
  }

  private buildRamp(palette: LiquidStop[]): void {
    const stops = (palette.length ? palette : LIQUID_DEFAULTS.palette)
      .slice()
      .sort((a, b) => a.at - b.at);
    const data = this.rampData;
    for (let i = 0; i < RAMP_SIZE; i++) {
      const t = i / (RAMP_SIZE - 1);
      let lo = stops[0];
      let hi = stops[stops.length - 1];
      if (t <= stops[0].at) hi = lo;
      else if (t >= hi.at) lo = hi;
      else {
        for (let s = 0; s < stops.length - 1; s++) {
          if (t >= stops[s].at && t <= stops[s + 1].at) {
            lo = stops[s];
            hi = stops[s + 1];
            break;
          }
        }
      }
      const span = hi.at - lo.at;
      // Eased between stops, so the bands melt into each other.
      let k = span > 0 ? (t - lo.at) / span : 0;
      k = k * k * (3 - 2 * k);
      hexToRgb(lo.color, this.rgbA);
      hexToRgb(hi.color, this.rgbB);
      data[i * 4] = Math.round((this.rgbA.x + (this.rgbB.x - this.rgbA.x) * k) * 255);
      data[i * 4 + 1] = Math.round((this.rgbA.y + (this.rgbB.y - this.rgbA.y) * k) * 255);
      data[i * 4 + 2] = Math.round((this.rgbA.z + (this.rgbB.z - this.rgbA.z) * k) * 255);
      data[i * 4 + 3] = 255;
    }
    this.ramp.needsUpdate = true;
  }
}

function samePalette(a: LiquidStop[], b: LiquidStop[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].at !== b[i].at || a[i].color !== b[i].color) return false;
  }
  return true;
}

export const createLiquidEngine = (canvas: HTMLCanvasElement) => new LiquidEngine(canvas);
