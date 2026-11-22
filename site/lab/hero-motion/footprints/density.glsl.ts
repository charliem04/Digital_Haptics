/**
 * Concept A density pass: everything the walkers put on the glass, drawn
 * as instanced quads into a small render target that the dot shader then
 * reads. Channels are data, not colour:
 *
 *   red    CONTACT   a sole pressed against the glass. Crisp.
 *   green  SHADOW    the body's cast shadow, as dot tone.
 *   blue   HAZE      the same shadow spread much wider, for the paper.
 *
 * Two kinds of instance share the shader:
 *
 *   capsule  a limb's shadow between two projected joints. Radius, blur
 *            and opacity are given at each end and interpolated, so one
 *            capsule can go from a sharp ankle to a diffuse knee.
 *   print    one sole from the atlas, inked between `lo` and `hi` along
 *            its length (heel = 0, toe = 1).
 *
 * Blending is MAX, so limbs meeting at a joint, or a new print over an
 * old one, form a union rather than stacking into a darker seam.
 */
export const densityVert = /* glsl */ `
attribute vec4 aA; // capsule: a.xy, b.xy          print: centre.xy, toe direction
attribute vec4 aR; // capsule: ra, rb, blur a, b   print: length, width, seed, bleed
attribute vec4 aO; // capsule: opacity a, b, -, -  print: lo, hi, pressed, residue
attribute vec4 aM; // rgb: channel mask            a: 0 capsule, 1 print
attribute vec2 aS; // print: style index, side (+1 right, -1 left)

uniform vec2 uArea;   // CSS px covered by the target
uniform float uHaze;  // how much wider the haze is than the shadow

varying vec2 vP;
varying vec2 vUv;
varying vec4 vA;
varying vec4 vR;
varying vec4 vO;
varying vec4 vM;
varying vec2 vS;

void main() {
  vec2 p;
  vUv = vec2(0.0);
  if (aM.a < 0.5) {
    vec2 ab = aA.zw - aA.xy;
    float len = length(ab);
    vec2 axis = len > 1e-3 ? ab / len : vec2(1.0, 0.0);
    vec2 across = vec2(-axis.y, axis.x);
    float pad = max(aR.x + aR.z * uHaze, aR.y + aR.w * uHaze) + 2.0;
    p = (aA.xy + aA.zw) * 0.5 + axis * position.x * (len * 0.5 + pad) + across * position.y * pad;
  } else {
    vec2 toe = aA.zw;
    vec2 right = vec2(-toe.y, toe.x);
    p = aA.xy + right * position.x * aR.y * 0.5 + toe * position.y * aR.x * 0.5;
    // u runs big-toe side → little-toe side, v runs toe → heel.
    vUv = vec2(position.x * aS.y * 0.5 + 0.5, 0.5 - position.y * 0.5);
  }
  vP = p;
  vA = aA;
  vR = aR;
  vO = aO;
  vM = aM;
  vS = aS;
  gl_Position = vec4(p / uArea * 2.0 - 1.0, 0.0, 1.0);
}
`;

export const densityFrag = /* glsl */ `
uniform sampler2D uAtlas;
uniform float uStyles;
uniform float uFill;   // fraction of an atlas cell the print occupies
uniform float uHaze;

varying vec2 vP;
varying vec2 vUv;
varying vec4 vA;
varying vec4 vR;
varying vec4 vO;
varying vec4 vM;
varying vec2 vS;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
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

void main() {
  vec3 o;
  if (vM.a < 0.5) {
    // ── capsule ────────────────────────────────────────────────────
    vec2 ab = vA.zw - vA.xy;
    float t = clamp(dot(vP - vA.xy, ab) / max(dot(ab, ab), 1e-4), 0.0, 1.0);
    float d = length(vP - (vA.xy + ab * t));
    float r = mix(vR.x, vR.y, t);
    float blur = mix(vR.z, vR.w, t);
    float opacity = mix(vO.x, vO.y, t);
    // When the blur is wider than the limb, the smoothstep never reaches
    // 1 at the centre: a far-off limb casts a paler shadow, not just a
    // softer one, with no extra term.
    float shadow = 1.0 - smoothstep(r - blur, r + blur, d);
    float wide = blur * uHaze + 3.0;
    float haze = 1.0 - smoothstep(r - wide, r + wide, d);
    o = vec3(0.0, opacity * shadow, sqrt(opacity) * haze);
  } else {
    // ── print ──────────────────────────────────────────────────────
    vec2 cell = clamp(vUv, 0.012, 0.988);
    float shape = texture2D(uAtlas, vec2((vS.x + cell.x) / uStyles, cell.y)).r;
    // Position along the sole itself, 0 at the heel, 1 at the toe.
    float along = 1.0 - (vUv.y - (1.0 - uFill) * 0.5) / uFill;

    float lo = vO.x;
    float hi = vO.y;
    float edge = 0.07;
    float ever = 1.0 - smoothstep(hi - edge, hi + edge, along);
    float now = smoothstep(lo - edge, lo + edge, along) * ever * vO.z;
    float ink = max(now, ever * vO.w);

    // Pressure decides how much of the soft shape survives; a little
    // noise breaks the outline so no two marks share an edge.
    float grit = vnoise(vUv * vec2(3.0, 6.0) + vR.z * 31.0)
               + 0.5 * vnoise(vUv * vec2(9.0, 17.0) + vR.z * 7.0);
    float threshold = 0.46 + (1.0 - ink) * 0.22 + (grit - 0.75) * 0.3;
    float softness = 0.09 + vR.w;
    float cover = smoothstep(threshold - softness, threshold + softness, shape);
    o = vec3(cover * (0.3 + 0.7 * ink) * step(0.004, ink), 0.0, 0.0);
  }
  gl_FragColor = vec4(o * vM.rgb, 1.0);
}
`;
