/**
 * Concept B vertex shader. All the work is here: one height sample per
 * point, so the cost scales with point count, not with pixels.
 *
 * Seamless by construction:
 *   · The terrain is 4D gradient noise sampled on a torus,
 *     (cos u, sin u, cos v, sin v), so it wraps in both tile axes with no
 *     seam and no mirroring.
 *   · uPhase runs 0 → 1 over one loop. The scroll moves a whole number of
 *     tiles in that time, and every wave term advances a whole number of
 *     turns, so phase 1 is the same picture as phase 0.
 */
export const terrainVert = /* glsl */ `
uniform float uPhase;
uniform vec2 uScrollTiles;
uniform float uTilePx;
uniform float uNoiseScale;
uniform int uOctaves;
uniform float uRidgeMix;
uniform float uHeightScale;
uniform float uWaveAmp;
uniform float uWaveFreq;
uniform float uPointSize;
uniform float uFocal;
uniform vec3 uCamUp;
uniform vec4 uSeed;
uniform sampler2D uHeightMap;
uniform float uUseMap;
uniform float uMapAspect;
uniform vec2 uMapScroll;

varying float vHeight;
varying float vGrain;

const float TAU = 6.283185307179586;

uint pcg(uint v) {
  uint s = v * 747796405u + 2891336453u;
  uint w = ((s >> ((s >> 28u) + 4u)) ^ s) * 277803737u;
  return (w >> 22u) ^ w;
}

// One hash per lattice corner; its four bytes are the gradient.
vec4 grad4(ivec4 p) {
  uint h = pcg(uint(p.x) + pcg(uint(p.y) + pcg(uint(p.z) + pcg(uint(p.w)))));
  vec4 g = vec4(
    float(h & 255u),
    float((h >> 8u) & 255u),
    float((h >> 16u) & 255u),
    float(h >> 24u)
  );
  return g / 127.5 - 1.0;
}

float noise4(vec4 p) {
  ivec4 i = ivec4(floor(p));
  vec4 f = fract(p);
  vec4 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float n = 0.0;
  for (int c = 0; c < 16; c++) {
    ivec4 o = ivec4(c & 1, (c >> 1) & 1, (c >> 2) & 1, (c >> 3) & 1);
    vec4 fo = vec4(o);
    vec4 w = mix(1.0 - u, u, fo);
    n += dot(grad4(i + o), f - fo) * w.x * w.y * w.z * w.w;
  }
  return n;
}

// uv is in tiles and has period 1 on both axes.
float terrain(vec2 uv) {
  vec2 a = uv * TAU;
  vec4 torus = vec4(cos(a.x), sin(a.x), cos(a.y), sin(a.y)) * (uNoiseScale / TAU);
  float amp = 0.5;
  float freq = 1.0;
  float soft = 0.0;
  float ridged = 0.0;
  float norm = 0.0;
  for (int o = 0; o < 6; o++) {
    if (o >= uOctaves) break;
    float n = noise4(torus * freq + uSeed + float(o) * 17.31);
    soft += amp * n;
    float r = clamp(1.0 - abs(n) * 2.6, 0.0, 1.0);
    ridged += amp * r * r;
    norm += amp;
    amp *= 0.5;
    freq *= 2.0;
  }
  soft = 0.5 + 0.5 * clamp(soft / norm * 1.9, -1.0, 1.0);
  ridged = clamp(ridged / norm * 1.25, 0.0, 1.0);
  // Ridges only stand up where the broad shape is already high, so
  // basins stay calm instead of being scribbled over.
  float h = mix(soft, soft * 0.45 + ridged * (0.35 + 0.55 * soft), uRidgeMix);
  // Flatten the lows so basins read as bare grid.
  return smoothstep(0.2, 0.64, h);
}

void main() {
  vec2 world = position.xy;
  // fract(): the terms are periodic anyway, but float32 is not exact
  // about it (cos(x + 2π) can differ from cos(x) in the last bit, which
  // moved ~45 of 1.8M pixels). Wrapping here makes phase 1 bit-identical
  // to phase 0.
  float turn = TAU * fract(uPhase);
  float turn2 = TAU * fract(2.0 * uPhase);

  float h;
  if (uUseMap > 0.5) {
    // A real DEM does not tile. The texture is mirror-repeated, which has
    // period 2, and uMapScroll moves exactly 2 tiles per loop on one axis.
    vec2 muv = world / uTilePx;
    muv.y *= uMapAspect;
    h = textureLod(uHeightMap, muv + mod(uMapScroll * uPhase, 2.0), 0.0).r;
  } else {
    h = terrain(world / uTilePx + fract(uScrollTiles * uPhase));
  }

  // The wave lives in screen space, on top of the scrolling terrain, so
  // it only has to be periodic in time.
  float k = uWaveFreq * TAU / 1000.0;
  float wave = sin(dot(world, vec2(0.80, 0.60)) * k - turn)
             + 0.5 * sin(dot(world, vec2(-0.45, 0.89)) * k * 1.7 + turn2);
  float breathe = 1.0 + 0.06 * sin(turn);
  float lifted = h * breathe + uWaveAmp * wave * (0.35 + 0.65 * h);
  lifted = clamp(lifted, 0.0, 1.15);

  vec3 displaced = position + uCamUp * lifted * uHeightScale;
  vec4 mv = modelViewMatrix * vec4(displaced, 1.0);
  gl_Position = projectionMatrix * mv;

  // Mild distance attenuation; raised points are a touch larger.
  float atten = pow(uFocal / -mv.z, 0.6);
  gl_PointSize = uPointSize * atten * mix(0.8, 1.35, clamp(lifted, 0.0, 1.0));

  vHeight = clamp(lifted, 0.0, 1.0);
  vGrain = float(pcg(uint(gl_VertexID)) & 65535u) / 65535.0;
}
`;
