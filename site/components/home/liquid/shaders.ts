/**
 * Liquid hero shaders.
 *
 *   liquidVert      a fullscreen quad
 *   marchFrag       the liquid itself, at low resolution
 *   presentFrag     smooth upscale to the screen, then film grain
 *
 * ── HOW THE LIQUID IS FOUND ─────────────────────────────────────────
 *
 * Each mass is a soft density, exp(K·(1 − |M(p − c)|²/r²)), where M
 * squashes space along the mass's stretch axis. The liquid's surface is
 * where the densities of all the masses sum to 1, which is what makes
 * them fuse into necks and bridges instead of intersecting.
 *
 * Along a straight ray p = o + t·d, |M(p − c)|² is a quadratic in t, so
 * each mass's density along the ray is exactly a 1D Gaussian:
 *
 *     A · exp(−w · (t − t₀)²)
 *
 * with A, w and t₀ worked out once per mass per pixel. Marching the ray
 * then costs one exp per mass per step and no distance field at all,
 * and A alone already says how close the ray passes: that is the soft
 * glow outside the surface, for free.
 *
 * Space is not empty: a ray that misses still picks up that glow, which
 * is why nothing here has a hard edge.
 */

import { MAX_BLOBS } from "./params";

export const liquidVert = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = position.xy * 0.5 + 0.5;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

export const marchFrag = /* glsl */ `
#define N ${MAX_BLOBS}
#define STEPS 22

uniform vec4 uBlob[N];   // centre, radius
uniform vec4 uAxis[N];   // stretch axis, squash
uniform int uCount;
uniform vec3 uCamPos;
uniform vec3 uCamRight;
uniform vec3 uCamUp;
uniform vec3 uCamFwd;
uniform float uTan;
uniform float uAspect;
uniform float uSharp;     // K: high keeps masses apart, low fuses them
uniform float uWarp;
uniform float uWarpScale;
uniform float uTime;
uniform float uRim;
uniform float uDof;
uniform float uFog;
uniform float uFocus;
uniform sampler2D uRamp;

varying vec2 vUv;

/** Where the surface sits on the ramp: the hot rim. */
const float RIM = 0.37;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

void main() {
  vec2 q = (vUv * 2.0 - 1.0) * vec2(uAspect, 1.0);

  // A slow lens over the whole view. It bends every ray a little, so
  // masses shear and fold as they drift through it.
  float ws = uWarpScale;
  vec2 lens = vec2(
    sin(q.y * 1.7 * ws + uTime * 0.21) + 0.5 * sin(q.x * 2.9 * ws - uTime * 0.13 + q.y * 1.1 + 1.7),
    sin(q.x * 1.5 * ws - uTime * 0.17 + 0.6) + 0.5 * sin(q.y * 3.1 * ws + uTime * 0.11 + q.x * 0.9)
  );
  q += lens * 0.11 * uWarp;

  vec3 ro = uCamPos;
  vec3 rd = normalize(uCamFwd + (uCamRight * q.x + uCamUp * q.y) * uTan);

  // ── one Gaussian per mass along this ray ─────────────────────────
  float A[N];
  float T[N];
  float W[N];
  float total = 0.0;     // how much liquid the ray passes near
  float soft = 0.0;      // the same, with out-of-focus masses spread wider
  float tNear = 1e9;
  float tFar = -1e9;
  float tSum = 0.0;      // for the glow's depth: an average, weighted by
  float tWeight = 1e-4;  // closeness, so it never jumps between masses
  for (int i = 0; i < N; i++) {
    A[i] = 0.0;
    T[i] = 0.0;
    W[i] = 1.0;
    if (i >= uCount) continue;
    vec3 axis = uAxis[i].xyz;
    float squash = uAxis[i].w;
    float inv = 1.0 / (uBlob[i].w * uBlob[i].w);
    vec3 oc = ro - uBlob[i].xyz;
    vec3 mo = oc - axis * dot(oc, axis) * squash;
    vec3 md = rd - axis * dot(rd, axis) * squash;
    float a = dot(md, md);
    float b = dot(mo, md);
    float t0 = -b / a;
    // Squared miss distance, in the mass's own squashed space.
    float miss = (dot(mo, mo) - b * b / a) * inv;
    // No mass is a clean ellipsoid. Its outline swells and tucks in slow
    // lobes, set by where the ray passes it, so shapes read as liquid
    // being pulled about rather than as beads.
    vec3 pass = (mo + md * t0) / uBlob[i].w;
    float id = float(i) * 2.399;
    float lobes = sin(dot(pass, vec3(1.1, 0.5, -0.8)) + id + uTime * 0.13)
                + 0.5 * sin(dot(pass, vec3(-0.6, 1.2, 0.4)) * 1.3 - id * 1.7 - uTime * 0.09);
    miss *= 1.0 + 0.11 * uWarp * lobes;
    float e = uSharp * (1.0 - miss);
    float amp = t0 > 0.0 ? exp(min(e, 12.0)) : 0.0;
    A[i] = amp;
    T[i] = t0;
    W[i] = uSharp * a * inv;
    total += amp;
    float blur = uDof * abs(t0 - uFocus) * 0.9;
    soft += t0 > 0.0 ? exp(min(e, 0.0) / (1.0 + blur)) : 0.0;
    float near = min(amp, 1.0);
    tSum += near * t0;
    tWeight += near;
    if (amp > 0.03) {
      float reach = 2.7 / sqrt(W[i]);
      tNear = min(tNear, t0 - reach);
      tFar = max(tFar, t0 + reach);
    }
  }

  // ── march for the first place the sum reaches 1 ──────────────────
  float hitT = -1.0;
  float peak = 0.0;      // strongest near-miss before the hit
  float best = 0.0;      // strongest density anywhere on the ray
  if (total > 0.25 && tFar > tNear) {
    tNear = max(tNear, 0.05);
    float dt = (tFar - tNear) / float(STEPS);
    // A fixed per-pixel offset hides the step pattern. It must not change
    // from frame to frame, or silhouettes would boil.
    float t = tNear + dt * hash(gl_FragCoord.xy);
    float prev = 0.0;
    float before = 0.0;
    for (int s = 0; s < STEPS; s++) {
      float sum = 0.0;
      for (int i = 0; i < N; i++) {
        if (i >= uCount) break;
        float d = t - T[i];
        sum += A[i] * exp(-W[i] * d * d);
      }
      best = max(best, sum);
      if (sum >= 1.0) {
        // Bisect back to the crossing.
        float lo = t - dt;
        float hi = t;
        for (int k = 0; k < 4; k++) {
          float mid = 0.5 * (lo + hi);
          float ms = 0.0;
          for (int i = 0; i < N; i++) {
            if (i >= uCount) break;
            float d = mid - T[i];
            ms += A[i] * exp(-W[i] * d * d);
          }
          if (ms >= 1.0) hi = mid; else lo = mid;
        }
        hitT = hi;
        break;
      }
      // A rise then a fall below the surface: something passed close by
      // in front of whatever we go on to hit.
      if (prev > before && prev > sum) peak = max(peak, prev);
      before = prev;
      prev = sum;
      t += dt;
    }
  }

  vec3 color;
  float depth;
  if (hitT > 0.0) {
    // ── on the surface ─────────────────────────────────────────────
    vec3 p = ro + rd * hitT;
    vec3 grad = vec3(0.0);
    float weight = 0.0;
    float girth = 0.0;
    for (int i = 0; i < N; i++) {
      if (i >= uCount) break;
      vec3 axis = uAxis[i].xyz;
      float squash = uAxis[i].w;
      float inv = 1.0 / (uBlob[i].w * uBlob[i].w);
      vec3 pc = p - uBlob[i].xyz;
      vec3 m = pc - axis * dot(pc, axis) * squash;
      float rho = exp(min(uSharp * (1.0 - dot(m, m) * inv), 12.0));
      // MᵀM(p − c): the squash applied twice.
      grad += rho * inv * (m - axis * dot(m, axis) * squash);
      weight += rho;
      girth += rho * uBlob[i].w;
    }
    vec3 normal = normalize(grad);
    float facing = clamp(dot(normal, -rd), 0.0, 1.0);
    // How deep inside the silhouette this pixel is, without a normal:
    // it is what keeps necks and merged masses reading as one body.
    float inside = clamp(log(max(total, 1.0)) / uSharp, 0.0, 1.0);
    float inward = facing * (0.72 + 0.28 * inside);

    // Out of focus, the rim spreads.
    float blur = uDof * abs(hitT - uFocus) * 0.35;
    float x = pow(inward, mix(0.55, 2.3, clamp(uRim + blur, 0.0, 1.0)));
    // Only a thick body has a dark heart. A droplet or a thin stream is
    // lit all the way through, so it stays ember-coloured.
    x *= clamp(girth / max(weight, 1e-4) / 0.42, 0.3, 1.15);
    float drift = 0.045 * sin(p.x * 2.1 + p.y * 1.7 + p.z * 1.3 + uTime * 0.1);
    color = texture2D(uRamp, vec2(RIM + (1.0 - RIM) * clamp(x + drift * inward, 0.0, 1.0), 0.5)).rgb;

    // Something nearer grazed this ray: lay its glow over the top, so a
    // mass in front has a lit edge against the mass behind.
    float graze = smoothstep(0.3, 1.0, peak);
    vec3 glow = texture2D(uRamp, vec2(RIM * pow(peak, 0.45), 0.5)).rgb;
    color = mix(color, glow, graze * 0.9);
    depth = hitT;
  } else {
    // ── a miss: the glow around the liquid ─────────────────────────
    float h = mix(total, best, smoothstep(0.25, 0.5, total));
    h = clamp(max(h, min(soft, 1.0) * 0.92), 0.0, 1.0);
    color = texture2D(uRamp, vec2(RIM * pow(h, 0.45), 0.5)).rgb;
    depth = tSum / tWeight;
  }

  // Distance swallows colour into the teal haze.
  float haze = uFog * smoothstep(uFocus - 0.4, uFocus + 2.4, depth);
  vec3 far = texture2D(uRamp, vec2(0.12, 0.5)).rgb;
  vec3 space = texture2D(uRamp, vec2(0.0, 0.5)).rgb;
  float lit = hitT > 0.0 ? 1.0 : 0.0;
  color = mix(color, mix(space, far, 0.6 * lit + 0.25), haze * 0.8);

  gl_FragColor = vec4(color, 1.0);
}
`;

export const presentFrag = /* glsl */ `
uniform sampler2D uScene;
uniform vec2 uSceneSize;   // texels
uniform float uGrain;
uniform float uGrainSize;  // device px
uniform float uGrainSeed;

varying vec2 vUv;

float hash(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

// Bicubic B-spline in four bilinear taps. The scene is rendered small;
// this is what keeps the enlargement silky instead of blocky.
vec4 cubic(float v) {
  vec4 n = vec4(1.0, 2.0, 3.0, 4.0) - v;
  vec4 s = n * n * n;
  float x = s.x;
  float y = s.y - 4.0 * s.x;
  float z = s.z - 4.0 * s.y + 6.0 * s.x;
  float w = 6.0 - x - y - z;
  return vec4(x, y, z, w) / 6.0;
}

vec3 bicubic(vec2 uv) {
  vec2 inv = 1.0 / uSceneSize;
  vec2 coord = uv * uSceneSize - 0.5;
  vec2 f = fract(coord);
  coord -= f;
  vec4 xc = cubic(f.x);
  vec4 yc = cubic(f.y);
  vec4 c = coord.xxyy + vec2(-0.5, 1.5).xyxy;
  vec4 s = vec4(xc.xz + xc.yw, yc.xz + yc.yw);
  vec4 offset = (c + vec4(xc.yw, yc.yw) / s) * inv.xxyy;
  vec3 s0 = texture2D(uScene, offset.xz).rgb;
  vec3 s1 = texture2D(uScene, offset.yz).rgb;
  vec3 s2 = texture2D(uScene, offset.xw).rgb;
  vec3 s3 = texture2D(uScene, offset.yw).rgb;
  float sx = s.x / (s.x + s.y);
  float sy = s.z / (s.z + s.w);
  return mix(mix(s3, s2, sx), mix(s1, s0, sx), sy);
}

void main() {
  vec3 color = bicubic(vUv);
  float luma = dot(color, vec3(0.299, 0.587, 0.114));

  // Film grain, at the screen's own resolution. Two layers: fine,
  // per-grain noise and a coarser clumping, like silver in an emulsion.
  vec2 g = gl_FragCoord.xy / max(uGrainSize, 0.5) + uGrainSeed * vec2(37.0, 17.0);
  float fine = hash(floor(g)) + hash(floor(g) + 71.7) - 1.0;
  float clump = vnoise(g * 0.42 + 11.0) - 0.5;
  float grain = fine * 0.8 + clump * 1.1;
  // Strongest through the midtones and gradients, held back in the
  // blacks and on the hottest highlights.
  float weight = mix(0.62, 1.0, smoothstep(0.03, 0.3, luma)) * mix(1.0, 0.6, smoothstep(0.6, 0.95, luma));
  color += grain * weight * 0.077 * uGrain;

  // With grain off, a one-step dither still breaks up banding.
  float dither = (hash(gl_FragCoord.xy + 3.3) + hash(gl_FragCoord.xy + 9.1) - 1.0) / 255.0;
  color += dither * step(uGrain, 0.001);

  gl_FragColor = vec4(color, 1.0);
}
`;
