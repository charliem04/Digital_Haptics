import * as THREE from "three";
import type { ParamEngine } from "../shared/useStage";
import { createRng, hexToRgb } from "../shared/rng";
import { TERRAIN_DEFAULTS, type PaletteStop, type TerrainParams } from "./params";
import { terrainVert } from "./terrain.vert.glsl";
import { terrainFrag } from "./terrain.frag.glsl";

/**
 * ════════════════════════════════════════════════════════════════════
 *  CONCEPT B ENGINE — topographic dot terrain.
 *
 *  Per frame, JS does three things: work out the loop phase, write it to
 *  one uniform, and call render. Everything else is the vertex shader.
 *  Geometry, camera and the palette texture are rebuilt only when a prop
 *  or the container size changes.
 *
 *  World units are CSS pixels. The camera sits at the distance where one
 *  world unit at the plane's centre is one CSS pixel on screen, so
 *  `pointSpacingPx` means what it says at any container size.
 * ════════════════════════════════════════════════════════════════════
 */

export type LoopCheck = {
  /** Largest difference in any channel of any pixel, 0–255. */
  maxDiff: number;
  /** Pixels that differ at all. */
  differing: number;
  pixels: number;
};

const RAMP_SIZE = 256;

export class TerrainEngine implements ParamEngine<TerrainParams> {
  readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(22, 1, 1, 10000);
  private readonly geometry = new THREE.BufferGeometry();
  private readonly material: THREE.ShaderMaterial;
  private readonly rampData = new Uint8Array(RAMP_SIZE * 4);
  private readonly ramp: THREE.DataTexture;
  private readonly blank: THREE.DataTexture;
  private readonly pixel = new Uint8Array(4);
  private readonly rgb = { x: 0, y: 0, z: 0 };
  private readonly rgb2 = { x: 0, y: 0, z: 0 };

  private p: TerrainParams = { ...TERRAIN_DEFAULTS };
  private width = 0;
  private height = 0;
  private dpr = 1;
  private cols = 0;
  private rows = 0;
  private spacing = 0;
  private mapUrl: string | null = null;
  private mapTexture: THREE.Texture | null = null;
  private disposed = false;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
    });
    this.renderer.setClearColor(0x000000, 1);

    this.ramp = new THREE.DataTexture(this.rampData, RAMP_SIZE, 1, THREE.RGBAFormat);
    this.ramp.minFilter = THREE.LinearFilter;
    this.ramp.magFilter = THREE.LinearFilter;
    this.blank = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1, THREE.RGBAFormat);
    this.blank.needsUpdate = true;

    this.material = new THREE.ShaderMaterial({
      vertexShader: terrainVert,
      fragmentShader: terrainFrag,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
      transparent: true,
      uniforms: {
        uPhase: { value: 0 },
        uScrollTiles: { value: new THREE.Vector2(1, 1) },
        uTilePx: { value: 1800 },
        uNoiseScale: { value: 4 },
        uOctaves: { value: 5 },
        uRidgeMix: { value: 0.5 },
        uHeightScale: { value: 40 },
        uWaveAmp: { value: 0.05 },
        uWaveFreq: { value: 2.5 },
        uPointSize: { value: 2 },
        uFocal: { value: 1000 },
        uCamUp: { value: new THREE.Vector3(0, 1, 0) },
        uSeed: { value: new THREE.Vector4() },
        uHeightMap: { value: this.blank },
        uUseMap: { value: 0 },
        uMapAspect: { value: 1 },
        uMapScroll: { value: new THREE.Vector2() },
        uRamp: { value: this.ramp },
        uRound: { value: 0 },
        uGrain: { value: 0.2 },
      },
    });

    const points = new THREE.Points(this.geometry, this.material);
    // Positions move in the shader; the CPU-side bounds mean nothing.
    points.frustumCulled = false;
    this.scene.add(points);

    this.applyParams(null);
  }

  setParams(next: TerrainParams): void {
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
    this.layout();
  }

  update(time: number, _dt: number, still: boolean): void {
    const { loopDuration, debugFrame } = this.p;
    let phase: number;
    if (debugFrame === "start") phase = 0;
    // Reduced motion: hold a point in the loop with a ridge in frame,
    // rather than wherever phase 0 happens to fall.
    else if (still) phase = this.p.stillPhase;
    // Deliberately 1, not wrapped to 0: this frame only matches the first
    // one if the shader really is periodic.
    else if (debugFrame === "end") phase = 1;
    else phase = (time % loopDuration) / loopDuration;
    this.material.uniforms.uPhase.value = phase;
  }

  render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  sync(): void {
    const gl = this.renderer.getContext();
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, this.pixel);
  }

  /** Render phase 0 and phase 1 and compare every pixel. Debug only. */
  verifyLoop(): LoopCheck {
    const gl = this.renderer.getContext();
    const w = gl.drawingBufferWidth;
    const h = gl.drawingBufferHeight;
    const a = new Uint8Array(w * h * 4);
    const b = new Uint8Array(w * h * 4);
    const uPhase = this.material.uniforms.uPhase;
    const keep = uPhase.value as number;
    uPhase.value = 0;
    this.render();
    gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, a);
    uPhase.value = 1;
    this.render();
    gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, b);
    uPhase.value = keep;
    this.render();

    let maxDiff = 0;
    let differing = 0;
    for (let i = 0; i < a.length; i += 4) {
      const d = Math.max(
        Math.abs(a[i] - b[i]),
        Math.abs(a[i + 1] - b[i + 1]),
        Math.abs(a[i + 2] - b[i + 2])
      );
      if (d > 0) differing++;
      if (d > maxDiff) maxDiff = d;
    }
    return { maxDiff, differing, pixels: w * h };
  }

  /**
   * Mean brightness (0–1) of `steps` evenly spaced frames of the loop.
   * Debug only: it is how the lab finds a well-lit `stillPhase`.
   */
  scanLoop(steps = 20): number[] {
    const gl = this.renderer.getContext();
    const w = gl.drawingBufferWidth;
    const h = gl.drawingBufferHeight;
    const buffer = new Uint8Array(w * h * 4);
    const uPhase = this.material.uniforms.uPhase;
    const keep = uPhase.value as number;
    const out: number[] = [];
    for (let s = 0; s < steps; s++) {
      uPhase.value = s / steps;
      this.render();
      gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, buffer);
      let sum = 0;
      for (let i = 0; i < buffer.length; i += 16) sum += buffer[i] + buffer[i + 1] + buffer[i + 2];
      out.push(sum / ((buffer.length / 16) * 765));
    }
    uPhase.value = keep;
    this.render();
    return out;
  }

  /** The GPU as the browser reports it, for the bench readout. */
  gpu(): string {
    const gl = this.renderer.getContext();
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    return String(gl.getParameter(ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
  }

  pointCount(): number {
    return this.cols * this.rows;
  }

  dispose(): void {
    this.disposed = true;
    this.geometry.dispose();
    this.material.dispose();
    this.ramp.dispose();
    this.blank.dispose();
    this.mapTexture?.dispose();
    this.renderer.dispose();
  }

  /* ── internals ──────────────────────────────────────────────────── */

  private applyParams(prev: TerrainParams | null): void {
    const p = this.p;
    const u = this.material.uniforms;

    u.uTilePx.value = Math.max(64, p.tileSizePx);
    u.uNoiseScale.value = p.noiseScale;
    u.uOctaves.value = Math.max(1, Math.min(6, Math.round(p.octaves)));
    u.uRidgeMix.value = p.ridgeMix;
    u.uHeightScale.value = p.heightScale;
    u.uWaveAmp.value = p.waveAmplitude;
    u.uWaveFreq.value = p.waveFrequency;
    u.uRound.value = p.pointShape === "round" ? 1 : 0;
    u.uGrain.value = p.grain;

    // Whole tiles only, or the end of the loop would not meet the start.
    const sx = Math.round(p.scrollDirection[0]);
    const sy = Math.round(p.scrollDirection[1]);
    (u.uScrollTiles.value as THREE.Vector2).set(sx, sy);
    // Heightmap: one axis, two tiles per loop (the mirror period).
    const alongX = Math.abs(sx) >= Math.abs(sy);
    (u.uMapScroll.value as THREE.Vector2).set(
      alongX ? 2 * (Math.sign(sx) || 1) : 0,
      alongX ? 0 : 2 * (Math.sign(sy) || 1)
    );

    if (!prev || prev.seed !== p.seed) {
      const rng = createRng(Math.round(p.seed) * 2654435761 + 1);
      (u.uSeed.value as THREE.Vector4).set(rng() * 64, rng() * 64, rng() * 64, rng() * 64);
    }
    if (!prev || !samePalette(prev.palette, p.palette)) this.buildRamp(p.palette);
    if (!prev || prev.heightmap !== p.heightmap) this.loadHeightmap(p.heightmap);

    if (
      !prev ||
      prev.pointSpacingPx !== p.pointSpacingPx ||
      prev.pointSize !== p.pointSize ||
      prev.heightScale !== p.heightScale ||
      prev.cameraTilt !== p.cameraTilt ||
      prev.fov !== p.fov ||
      prev.aspectFit !== p.aspectFit ||
      prev.maxPoints !== p.maxPoints
    ) {
      this.layout();
    }
  }

  /**
   * Camera and grid for the current size.
   *
   * The camera looks at the plane's centre from `tilt` degrees off the
   * normal, at the distance d where the centre is 1:1 with CSS pixels.
   * A plane point (x, y) lands on screen at
   *     sx = x·d / (d + y·sinθ)      sy = y·cosθ·d / (d + y·sinθ)
   * so the half-extents that exactly cover (or exactly fit inside) the
   * container come out in closed form.
   */
  private layout(): void {
    const { width: w, height: h, p } = this;
    if (w === 0 || h === 0) return;

    const fov = Math.max(5, Math.min(80, p.fov));
    const tilt = (Math.max(0, Math.min(60, p.cameraTilt)) * Math.PI) / 180;
    const d = h / 2 / Math.tan((fov * Math.PI) / 360);
    const sin = Math.sin(tilt);
    const cos = Math.cos(tilt);

    let halfX: number;
    let halfY: number;
    if (p.aspectFit === "cover") {
      // The far edge is the narrow one: size the plane to cover there.
      halfY = ((h / 2) * d) / Math.max(1e-3, d * cos - (h / 2) * sin);
      halfX = ((w / 2) * (d + halfY * sin)) / d;
      // Points are lifted up-screen, which would bare the bottom edge.
      halfY += Math.abs(p.heightScale) * 1.2;
    } else {
      // The near edge is the wide one: fit it, with room for the lift.
      const fitH = Math.max(1, h / 2 - Math.abs(p.heightScale) * 1.2 - p.pointSize);
      halfY = (fitH * d) / (d * cos + fitH * sin);
      halfX = ((w / 2 - p.pointSize) * (d - halfY * sin)) / d;
    }

    let spacing = Math.max(2, p.pointSpacingPx);
    const count = (s: number) => (2 * Math.ceil(halfX / s) + 1) * (2 * Math.ceil(halfY / s) + 1);
    const cap = Math.max(1000, p.maxPoints);
    if (count(spacing) > cap) spacing *= Math.sqrt(count(spacing) / cap);
    while (count(spacing) > cap) spacing *= 1.02;

    // Odd counts keep a point on the centre, so the lattice is anchored
    // there and a resize slides it instead of re-flowing it.
    const halfCols =
      p.aspectFit === "cover" ? Math.ceil(halfX / spacing) : Math.floor(halfX / spacing);
    const halfRows =
      p.aspectFit === "cover" ? Math.ceil(halfY / spacing) : Math.floor(halfY / spacing);
    const cols = 2 * halfCols + 1;
    const rows = 2 * halfRows + 1;

    if (cols !== this.cols || rows !== this.rows || spacing !== this.spacing) {
      this.cols = cols;
      this.rows = rows;
      this.spacing = spacing;
      const positions = new Float32Array(cols * rows * 3);
      let i = 0;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          positions[i++] = (c - halfCols) * spacing;
          positions[i++] = (r - halfRows) * spacing;
          positions[i++] = 0;
        }
      }
      this.geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    }

    this.camera.fov = fov;
    this.camera.aspect = w / h;
    this.camera.near = d * 0.2;
    this.camera.far = d * 4;
    this.camera.position.set(0, -d * sin, d * cos);
    this.camera.up.set(0, 1, 0);
    this.camera.lookAt(0, 0, 0);
    this.camera.updateProjectionMatrix();

    const u = this.material.uniforms;
    (u.uCamUp.value as THREE.Vector3).set(0, cos, sin);
    u.uFocal.value = d;
    u.uPointSize.value = p.pointSize * this.dpr;
  }

  private buildRamp(palette: PaletteStop[]): void {
    const stops = (palette.length ? palette : TERRAIN_DEFAULTS.palette)
      .slice()
      .sort((a, b) => a.at - b.at);
    const data = this.rampData;
    for (let i = 0; i < RAMP_SIZE; i++) {
      const t = i / (RAMP_SIZE - 1);
      let lo = stops[0];
      let hi = stops[stops.length - 1];
      for (let s = 0; s < stops.length - 1; s++) {
        if (t >= stops[s].at && t <= stops[s + 1].at) {
          lo = stops[s];
          hi = stops[s + 1];
          break;
        }
      }
      if (t <= stops[0].at) hi = lo = stops[0];
      if (t >= stops[stops.length - 1].at) lo = hi = stops[stops.length - 1];
      const span = hi.at - lo.at;
      const k = span > 0 ? (t - lo.at) / span : 0;
      hexToRgb(lo.color, this.rgb);
      hexToRgb(hi.color, this.rgb2);
      data[i * 4] = Math.round((this.rgb.x + (this.rgb2.x - this.rgb.x) * k) * 255);
      data[i * 4 + 1] = Math.round((this.rgb.y + (this.rgb2.y - this.rgb.y) * k) * 255);
      data[i * 4 + 2] = Math.round((this.rgb.z + (this.rgb2.z - this.rgb.z) * k) * 255);
      data[i * 4 + 3] = 255;
    }
    this.ramp.needsUpdate = true;
  }

  private loadHeightmap(url: string | null): void {
    this.mapUrl = url;
    const u = this.material.uniforms;
    if (!url) {
      this.mapTexture?.dispose();
      this.mapTexture = null;
      u.uHeightMap.value = this.blank;
      u.uUseMap.value = 0;
      return;
    }
    const use = (texture: THREE.Texture) => {
      // A newer URL (or a dispose) may have arrived while this loaded.
      if (this.disposed || this.mapUrl !== url) {
        texture.dispose();
        return;
      }
      texture.wrapS = THREE.MirroredRepeatWrapping;
      texture.wrapT = THREE.MirroredRepeatWrapping;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;
      texture.colorSpace = THREE.NoColorSpace;
      texture.needsUpdate = true;
      const image = texture.image as { width?: number; height?: number } | undefined;
      u.uMapAspect.value = image?.width && image.height ? image.width / image.height : 1;
      this.mapTexture?.dispose();
      this.mapTexture = texture;
      u.uHeightMap.value = texture;
      u.uUseMap.value = 1;
      this.render();
    };
    const fail = () => {
      console.warn(`[hero-motion] heightmap failed to load, using procedural terrain: ${url}`);
      if (this.mapUrl === url) u.uUseMap.value = 0;
    };
    if (/\.exr($|\?)/i.test(url)) {
      import("three/examples/jsm/loaders/EXRLoader.js")
        .then(({ EXRLoader }) => new EXRLoader().load(url, use, undefined, fail))
        .catch(fail);
    } else {
      new THREE.TextureLoader().load(url, use, undefined, fail);
    }
  }
}

function samePalette(a: PaletteStop[], b: PaletteStop[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].at !== b[i].at || a[i].color !== b[i].color) return false;
  }
  return true;
}

export const createTerrainEngine = (canvas: HTMLCanvasElement) => new TerrainEngine(canvas);
