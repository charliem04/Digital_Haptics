import { BlobSim, type BlobConfig } from "./blobs";
import { clamp, hexToRgb } from "./rng";
import { liquidVert, marchFrag, presentFrag } from "./shaders";
import {
  LOOK,
  MAX_BLOBS,
  RAMP,
  type LiquidLook,
  type LiquidSettings,
  type RampStop,
} from "./params";

/**
 * ════════════════════════════════════════════════════════════════════
 *  LIQUID ENGINE: plain WebGL2 (docs/VISUAL_GUIDE.md §10.1).
 *
 *  Per frame: step the masses, draw the liquid into a small half-float
 *  target, then enlarge it with a bicubic filter and add film grain at
 *  full resolution. Same shaders and simulation as the lab's three.js
 *  version, at about 6% of the JavaScript.
 *
 *  Only ever reached through a dynamic import, so it is in no page's
 *  initial JavaScript.
 * ════════════════════════════════════════════════════════════════════
 */

const RAMP_SIZE = 256;
const CAMERA_DISTANCE = 3.4;
const MAX_SCENE_PIXELS = 520_000;

const VERTEX = `#version 300 es
#define varying out
precision highp float;
in vec3 position;
${liquidVert}`;

const fragment = (body: string) => `#version 300 es
#define varying in
#define texture2D texture
#define gl_FragColor outColor
precision highp float;
precision highp int;
precision highp sampler2D;
out highp vec4 outColor;
${body}`;

type Program = { program: WebGLProgram; loc: (name: string) => WebGLUniformLocation | null };

/** Hand the main thread back so input and paint can run between GL steps. */
export const yieldToPage = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

function startProgram(gl: WebGL2RenderingContext, fragmentSource: string): WebGLProgram {
  const program = gl.createProgram();
  const vs = gl.createShader(gl.VERTEX_SHADER);
  const fs = gl.createShader(gl.FRAGMENT_SHADER);
  if (!program || !vs || !fs) throw new Error("Could not create a WebGL program");
  gl.shaderSource(vs, VERTEX);
  gl.compileShader(vs);
  gl.shaderSource(fs, fragment(fragmentSource));
  gl.compileShader(fs);
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.bindAttribLocation(program, 0, "position");
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  return program;
}

/**
 * Wait for the driver to finish linking without blocking the page, where
 * the browser supports it. Elsewhere the status check below simply
 * blocks once, after first paint and idle.
 */
async function whenLinked(gl: WebGL2RenderingContext, programs: WebGLProgram[]) {
  const ext = gl.getExtension("KHR_parallel_shader_compile");
  if (ext) {
    const done = () => programs.every((p) => gl.getProgramParameter(p, ext.COMPLETION_STATUS_KHR));
    const deadline = performance.now() + 10_000;
    while (!done() && performance.now() < deadline) {
      await new Promise((resolve) => setTimeout(resolve, 16));
    }
  }
  for (const p of programs) {
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error("Liquid shader failed to link");
  }
}

function wrap(gl: WebGL2RenderingContext, program: WebGLProgram): Program {
  const cache = new Map<string, WebGLUniformLocation | null>();
  return {
    program,
    loc(name) {
      if (!cache.has(name)) cache.set(name, gl.getUniformLocation(program, name));
      return cache.get(name) ?? null;
    },
  };
}

export class LiquidEngine {
  private readonly sim = new BlobSim();
  private readonly cfg: BlobConfig;
  private readonly fwd = new Float32Array(3);
  private readonly pos = new Float32Array(3);
  private readonly right = new Float32Array(3);
  private readonly up = new Float32Array(3);
  private readonly vao: WebGLVertexArrayObject;
  private readonly quad: WebGLBuffer;
  private readonly sceneTexture: WebGLTexture;
  private readonly framebuffer: WebGLFramebuffer;
  private readonly rampTexture: WebGLTexture;
  private readonly internalFormat: number;
  private readonly textureType: number;
  private width = 0;
  private height = 0;
  private dpr = 1;
  private sceneW = 0;
  private sceneH = 0;
  private scale: number;
  private started = false;
  private clock = 0;
  private look: LiquidLook = { ...LOOK };
  private ramp: readonly RampStop[] = RAMP;

  private constructor(
    private readonly canvas: HTMLCanvasElement | OffscreenCanvas,
    private readonly gl: WebGL2RenderingContext,
    private readonly march: Program,
    private readonly present: Program,
    private settings: LiquidSettings
  ) {
    this.scale = settings.renderScale;
    this.cfg = {
      count: settings.blobCount,
      coverage: this.look.coverage,
      flowSpeed: this.look.flowSpeed,
      gravity: this.look.gravity,
      buoyancy: this.look.buoyancy,
      stretch: this.look.stretch,
      aspect: 1.6,
    };

    const float = gl.getExtension("EXT_color_buffer_float");
    this.internalFormat = float ? gl.RGBA16F : gl.RGBA8;
    this.textureType = float ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE;

    const vao = gl.createVertexArray();
    const quad = gl.createBuffer();
    const sceneTexture = gl.createTexture();
    const framebuffer = gl.createFramebuffer();
    const rampTexture = gl.createTexture();
    if (!vao || !quad || !sceneTexture || !framebuffer || !rampTexture) {
      throw new Error("Could not allocate WebGL resources");
    }
    this.vao = vao;
    this.quad = quad;
    this.sceneTexture = sceneTexture;
    this.framebuffer = framebuffer;
    this.rampTexture = rampTexture;

    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    for (const texture of [sceneTexture, rampTexture]) {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }
    this.buildRamp();
  }

  /** Throws when WebGL2 or the shaders are unavailable; the poster stays. */
  static async create(
    canvas: HTMLCanvasElement | OffscreenCanvas,
    settings: LiquidSettings
  ): Promise<LiquidEngine> {
    const gl = (canvas as HTMLCanvasElement).getContext("webgl2", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
    });
    if (!gl) throw new Error("WebGL2 is not available");
    // Without a real GPU the browser draws this on the CPU, which would
    // block the page. Those visitors keep the poster.
    const debug = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = debug ? String(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL)) : "";
    if (/swiftshader|llvmpipe|software|basic render/i.test(renderer)) {
      throw new Error("No hardware GPU");
    }
    // One step per task, so no single task holds the page for all of them.
    const marchProgram = startProgram(gl, marchFrag);
    await yieldToPage();
    const presentProgram = startProgram(gl, presentFrag);
    await yieldToPage();
    await whenLinked(gl, [marchProgram, presentProgram]);
    await yieldToPage();
    return new LiquidEngine(canvas, gl, wrap(gl, marchProgram), wrap(gl, presentProgram), settings);
  }

  resize(width: number, height: number, pixelRatio = globalThis.devicePixelRatio || 1): void {
    if (width === 0 || height === 0) return;
    this.width = width;
    this.height = height;
    this.dpr = Math.min(pixelRatio, this.settings.maxDpr);
    this.canvas.width = Math.round(width * this.dpr);
    this.canvas.height = Math.round(height * this.dpr);
    this.cfg.aspect = width / height;
    this.layoutScene();
    if (!this.started) {
      this.started = true;
      this.sim.reset(this.look.seed, this.cfg);
    }
  }

  setRenderScale(scale: number): void {
    this.scale = scale;
    this.layoutScene();
  }

  /**
   * Apply new values to the running engine (the dev-only tuner). A new
   * seed or blob count restarts the arrangement; the rest apply in place.
   */
  retune(next: { look: LiquidLook; settings: LiquidSettings; ramp: readonly RampStop[] }): void {
    const restart =
      next.look.seed !== this.look.seed || next.settings.blobCount !== this.settings.blobCount;
    const recolor = next.ramp.some(
      (stop, i) => stop.at !== this.ramp[i]?.at || stop.color !== this.ramp[i]?.color
    );
    this.look = { ...next.look };
    this.settings = { ...next.settings };
    this.cfg.count = next.settings.blobCount;
    this.cfg.coverage = next.look.coverage;
    this.cfg.flowSpeed = next.look.flowSpeed;
    this.cfg.gravity = next.look.gravity;
    this.cfg.buoyancy = next.look.buoyancy;
    this.cfg.stretch = next.look.stretch;
    if (recolor) {
      this.ramp = next.ramp.map((stop) => ({ ...stop }));
      this.buildRamp();
    }
    if (next.settings.renderScale !== this.scale) this.setRenderScale(next.settings.renderScale);
    if (restart && this.started) this.sim.reset(next.look.seed, this.cfg);
  }

  /** Advance `dt` seconds (0 redraws the same moment) and draw. */
  frame(dt: number): void {
    if (!this.started || this.sceneW === 0) return;
    if (dt > 0) {
      this.sim.update(dt, this.cfg);
      this.clock += dt;
    }
    this.placeCamera();
    this.draw();
  }

  dispose(): void {
    const gl = this.gl;
    gl.deleteProgram(this.march.program);
    gl.deleteProgram(this.present.program);
    gl.deleteBuffer(this.quad);
    gl.deleteVertexArray(this.vao);
    gl.deleteTexture(this.sceneTexture);
    gl.deleteTexture(this.rampTexture);
    gl.deleteFramebuffer(this.framebuffer);
  }

  /* ── internals ──────────────────────────────────────────────────── */

  private placeCamera(): void {
    const t = this.clock;
    const yaw = 0.11 * this.look.cameraDrift * Math.sin(t * 0.043);
    const pitch = 0.07 * this.look.cameraDrift * Math.sin(t * 0.031 + 1.1);
    const cy = Math.cos(yaw);
    const sy = Math.sin(yaw);
    const cp = Math.cos(pitch);
    const sp = Math.sin(pitch);
    this.fwd[0] = sy * cp;
    this.fwd[1] = sp;
    this.fwd[2] = cy * cp;
    for (let i = 0; i < 3; i++) this.pos[i] = this.fwd[i] * -CAMERA_DISTANCE;
    this.right[0] = cy;
    this.right[1] = 0;
    this.right[2] = -sy;
    this.up[0] = -sy * sp;
    this.up[1] = cp;
    this.up[2] = -cy * sp;
  }

  private draw(): void {
    const gl = this.gl;
    gl.bindVertexArray(this.vao);

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    gl.viewport(0, 0, this.sceneW, this.sceneH);
    gl.useProgram(this.march.program);
    const m = this.march.loc;
    gl.uniform4fv(m("uBlob"), this.sim.spheres);
    gl.uniform4fv(m("uAxis"), this.sim.axes);
    gl.uniform1i(m("uCount"), clamp(this.settings.blobCount, 1, MAX_BLOBS));
    gl.uniform3fv(m("uCamPos"), this.pos);
    gl.uniform3fv(m("uCamRight"), this.right);
    gl.uniform3fv(m("uCamUp"), this.up);
    gl.uniform3fv(m("uCamFwd"), this.fwd);
    gl.uniform1f(m("uTan"), 1 / CAMERA_DISTANCE);
    gl.uniform1f(m("uAspect"), this.width / this.height);
    gl.uniform1f(m("uSharp"), 3.6 - 2.8 * this.look.viscosity);
    gl.uniform1f(m("uWarp"), this.look.warpAmount);
    gl.uniform1f(m("uWarpScale"), this.look.warpScale);
    gl.uniform1f(m("uTime"), this.clock);
    gl.uniform1f(m("uRim"), this.look.rimWidth);
    gl.uniform1f(m("uDof"), this.look.depthOfField);
    gl.uniform1f(m("uFog"), this.look.fogAmount);
    gl.uniform1f(m("uFocus"), CAMERA_DISTANCE);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.rampTexture);
    gl.uniform1i(m("uRamp"), 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.useProgram(this.present.program);
    const g = this.present.loc;
    gl.bindTexture(gl.TEXTURE_2D, this.sceneTexture);
    gl.uniform1i(g("uScene"), 0);
    gl.uniform2f(g("uSceneSize"), this.sceneW, this.sceneH);
    gl.uniform1f(g("uGrain"), this.look.grainAmount);
    gl.uniform1f(g("uGrainSize"), this.look.grainSize);
    gl.uniform1f(g("uGrainSeed"), (Math.floor(this.clock * this.look.grainFps) % 4096) + 1);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  private layoutScene(): void {
    if (this.width === 0) return;
    const gl = this.gl;
    const bufferW = this.width * this.dpr;
    const bufferH = this.height * this.dpr;
    let scale = clamp(this.scale, 0.1, 1);
    const pixels = bufferW * bufferH * scale * scale;
    if (pixels > MAX_SCENE_PIXELS) scale *= Math.sqrt(MAX_SCENE_PIXELS / pixels);
    const w = Math.max(16, Math.round(bufferW * scale));
    const h = Math.max(16, Math.round(bufferH * scale));
    if (w === this.sceneW && h === this.sceneH) return;
    this.sceneW = w;
    this.sceneH = h;
    gl.bindTexture(gl.TEXTURE_2D, this.sceneTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, this.internalFormat, w, h, 0, gl.RGBA, this.textureType, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      this.sceneTexture,
      0
    );
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  private buildRamp(): void {
    const data = new Uint8Array(RAMP_SIZE * 4);
    const a = { x: 0, y: 0, z: 0 };
    const b = { x: 0, y: 0, z: 0 };
    for (let i = 0; i < RAMP_SIZE; i++) {
      const t = i / (RAMP_SIZE - 1);
      let s = 0;
      while (s < this.ramp.length - 2 && t > this.ramp[s + 1].at) s++;
      const lo = this.ramp[s];
      const hi = this.ramp[s + 1];
      let k = clamp((t - lo.at) / (hi.at - lo.at), 0, 1);
      k = k * k * (3 - 2 * k);
      hexToRgb(lo.color, a);
      hexToRgb(hi.color, b);
      data[i * 4] = Math.round((a.x + (b.x - a.x) * k) * 255);
      data[i * 4 + 1] = Math.round((a.y + (b.y - a.y) * k) * 255);
      data[i * 4 + 2] = Math.round((a.z + (b.z - a.z) * k) * 255);
      data[i * 4 + 3] = 255;
    }
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.rampTexture);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, RAMP_SIZE, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
  }
}
