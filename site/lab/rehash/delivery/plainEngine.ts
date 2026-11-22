import type { ParamEngine } from "@/lab/hero-motion/shared/useStage";
import { clamp, hexToRgb } from "@/lab/hero-motion/shared/rng";
import {
  LIQUID_DEFAULTS,
  MAX_BLOBS,
  type LiquidParams,
  type LiquidStop,
} from "@/lab/hero-motion/liquid/params";
import { BlobSim, type BlobConfig } from "@/lab/hero-motion/liquid/blobs";
import { liquidVert, marchFrag, presentFrag } from "@/lab/hero-motion/liquid/liquid.glsl";

/**
 * Measurement prototype for the Stage 2 delivery plan: the liquid on
 * plain WebGL2, with the same shaders and simulation as the three.js
 * engine, so the two can be compared on size, speed and pixels.
 */

const RAMP_SIZE = 256;
const CAMERA_DISTANCE = 3.4;
const MAX_SCENE_PIXELS = 520_000;

const vertexSource = `#version 300 es
#define attribute in
#define varying out
precision highp float;
in vec3 position;
${liquidVert}`;

const fragmentSource = (body: string) => `#version 300 es
#define varying in
#define texture2D texture
#define gl_FragColor outColor
precision highp float;
precision highp int;
precision highp sampler2D;
out highp vec4 outColor;
${body}`;

type Program = { program: WebGLProgram; loc: (name: string) => WebGLUniformLocation | null };

function compile(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Could not create a shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) ?? "Shader failed to compile");
  }
  return shader;
}

function link(gl: WebGL2RenderingContext, fragment: string): Program {
  const program = gl.createProgram();
  if (!program) throw new Error("Could not create a program");
  const vs = compile(gl, gl.VERTEX_SHADER, vertexSource);
  const fs = compile(gl, gl.FRAGMENT_SHADER, fragmentSource(fragment));
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.bindAttribLocation(program, 0, "position");
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) ?? "Program failed to link");
  }
  const cache = new Map<string, WebGLUniformLocation | null>();
  return {
    program,
    loc(name) {
      if (!cache.has(name)) cache.set(name, gl.getUniformLocation(program, name));
      return cache.get(name) ?? null;
    },
  };
}

export class PlainLiquidEngine implements ParamEngine<LiquidParams> {
  private readonly gl: WebGL2RenderingContext;
  private readonly march: Program;
  private readonly present: Program;
  private readonly vao: WebGLVertexArrayObject;
  private readonly quad: WebGLBuffer;
  private readonly sceneTexture: WebGLTexture;
  private readonly framebuffer: WebGLFramebuffer;
  private readonly rampTexture: WebGLTexture;
  private readonly rampData = new Uint8Array(RAMP_SIZE * 4);
  private readonly internalFormat: number;
  private readonly textureType: number;
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
  private readonly fwd = new Float32Array(3);
  private readonly pos = new Float32Array(3);
  private readonly right = new Float32Array(3);
  private readonly up = new Float32Array(3);

  private p: LiquidParams = { ...LIQUID_DEFAULTS };
  private width = 0;
  private height = 0;
  private dpr = 1;
  private sceneW = 0;
  private sceneH = 0;
  private started = false;
  private clock = 0;
  private grainSeed = 1;

  constructor(private readonly canvas: HTMLCanvasElement) {
    const gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "high-performance",
    });
    if (!gl) throw new Error("WebGL2 is not available");
    this.gl = gl;

    const float = gl.getExtension("EXT_color_buffer_float");
    this.internalFormat = float ? gl.RGBA16F : gl.RGBA8;
    this.textureType = float ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE;

    this.march = link(gl, marchFrag);
    this.present = link(gl, presentFrag);

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
    this.buildRamp(this.p.palette);
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
    this.canvas.width = Math.round(width * dpr);
    this.canvas.height = Math.round(height * dpr);
    this.cfg.aspect = width / height;
    this.layoutScene();
    if (!this.started) {
      this.started = true;
      this.sim.reset(this.p.seed, this.cfg);
    }
  }

  update(_time: number, dt: number, still: boolean): void {
    if (!this.started) return;
    if (dt > 0) {
      this.sim.update(dt, this.cfg);
      this.clock += dt;
    }
    const t = this.clock;
    const drift = this.p.cameraDrift;
    const yaw = 0.11 * drift * Math.sin(t * 0.043);
    const pitch = 0.07 * drift * Math.sin(t * 0.031 + 1.1);
    const cy = Math.cos(yaw);
    const sy = Math.sin(yaw);
    const cp = Math.cos(pitch);
    const sp = Math.sin(pitch);
    this.fwd[0] = sy * cp;
    this.fwd[1] = sp;
    this.fwd[2] = cy * cp;
    this.pos[0] = this.fwd[0] * -CAMERA_DISTANCE;
    this.pos[1] = this.fwd[1] * -CAMERA_DISTANCE;
    this.pos[2] = this.fwd[2] * -CAMERA_DISTANCE;
    this.right[0] = cy;
    this.right[1] = 0;
    this.right[2] = -sy;
    this.up[0] = -sy * sp;
    this.up[1] = cp;
    this.up[2] = -cy * sp;
    const fps = Math.max(1, this.p.grainFps);
    this.grainSeed = still ? 1 : (Math.floor(t * fps) % 4096) + 1;
  }

  render(): void {
    if (!this.started || this.sceneW === 0) return;
    const gl = this.gl;
    const p = this.p;
    gl.bindVertexArray(this.vao);

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    gl.viewport(0, 0, this.sceneW, this.sceneH);
    gl.useProgram(this.march.program);
    const m = this.march.loc;
    gl.uniform4fv(m("uBlob"), this.sim.spheres);
    gl.uniform4fv(m("uAxis"), this.sim.axes);
    gl.uniform1i(m("uCount"), clamp(Math.round(p.blobCount), 1, MAX_BLOBS));
    gl.uniform3fv(m("uCamPos"), this.pos);
    gl.uniform3fv(m("uCamRight"), this.right);
    gl.uniform3fv(m("uCamUp"), this.up);
    gl.uniform3fv(m("uCamFwd"), this.fwd);
    gl.uniform1f(m("uTan"), 1 / CAMERA_DISTANCE);
    gl.uniform1f(m("uAspect"), this.width / this.height);
    gl.uniform1f(m("uSharp"), 3.6 - 2.8 * clamp(p.viscosity, 0, 1));
    gl.uniform1f(m("uWarp"), p.warpAmount);
    gl.uniform1f(m("uWarpScale"), p.warpScale);
    gl.uniform1f(m("uTime"), this.clock);
    gl.uniform1f(m("uRim"), clamp(p.rimWidth, 0, 1));
    gl.uniform1f(m("uDof"), Math.max(0, p.depthOfField));
    gl.uniform1f(m("uFog"), clamp(p.fogAmount, 0, 1));
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
    gl.uniform1f(g("uGrain"), Math.max(0, p.grainAmount));
    gl.uniform1f(g("uGrainSize"), Math.max(0.5, p.grainSize));
    gl.uniform1f(g("uGrainSeed"), this.grainSeed);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  sync(): void {
    const gl = this.gl;
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, this.pixel);
  }

  context(): WebGL2RenderingContext {
    return this.gl;
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

  private applyParams(prev: LiquidParams | null): void {
    const p = this.p;
    const cfg = this.cfg;
    cfg.count = p.blobCount;
    cfg.coverage = p.coverage;
    cfg.flowSpeed = p.flowSpeed;
    cfg.gravity = p.gravity;
    cfg.buoyancy = p.buoyancy;
    cfg.stretch = Math.max(0, p.stretch);
    if (prev && prev.palette !== p.palette) this.buildRamp(p.palette);
    if (!prev || prev.renderScale !== p.renderScale) this.layoutScene();
    if (this.started && prev && prev.seed !== p.seed) this.sim.reset(p.seed, cfg);
  }

  private layoutScene(): void {
    if (this.width === 0) return;
    const gl = this.gl;
    const bufferW = this.width * this.dpr;
    const bufferH = this.height * this.dpr;
    let scale = clamp(this.p.renderScale, 0.1, 1);
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
      let k = span > 0 ? (t - lo.at) / span : 0;
      k = k * k * (3 - 2 * k);
      hexToRgb(lo.color, this.rgbA);
      hexToRgb(hi.color, this.rgbB);
      data[i * 4] = Math.round((this.rgbA.x + (this.rgbB.x - this.rgbA.x) * k) * 255);
      data[i * 4 + 1] = Math.round((this.rgbA.y + (this.rgbB.y - this.rgbA.y) * k) * 255);
      data[i * 4 + 2] = Math.round((this.rgbA.z + (this.rgbB.z - this.rgbA.z) * k) * 255);
      data[i * 4 + 3] = 255;
    }
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.rampTexture);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, RAMP_SIZE, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
  }
}

export const createPlainLiquidEngine = (canvas: HTMLCanvasElement) => new PlainLiquidEngine(canvas);
