/**
 * Concept A fragment shader: paper, halftone dots, flare.
 *
 * Everything is worked out in CSS pixels with the origin top-left, the
 * same space the walkers and the pointer use.
 *
 *   1. Which grid cell is this fragment in? Sample the density target at
 *      the cell's centre. Red is a sole pressed on the glass, green is
 *      the body's shadow. Together they are the cell's TONE, and the dot
 *      radius is a continuous function of it: no dithering, the dots
 *      simply swell as the shadow deepens.
 *   2. Sample blue at the fragment itself, bilinear: the wide, soft haze
 *      that tints the paper. The far, blurred part of a shadow lives
 *      here more than in the dots, which is what makes it look out of
 *      focus rather than merely pale.
 *   3. Lay the flare over the top.
 *
 * The flare is composited "over", not added. On black, adding light is
 * right. On pale paper it only clips toward white and the orange never
 * shows, so the flare colour replaces the paper in proportion to heat.
 */
export const dotsFrag = /* glsl */ `
uniform vec2 uBuffer;      // drawing buffer size, device px
uniform float uDpr;
uniform vec2 uSize;        // container size, CSS px
uniform float uSpacing;
uniform vec2 uGrid;        // dot cells across and down
uniform sampler2D uDensity;
uniform float uBaseR;
uniform float uMaxR;
uniform float uBaseAlpha;
uniform vec3 uDot;
uniform vec3 uPaper;
uniform vec3 uHalo;
uniform vec2 uFlare;       // CSS px
uniform float uFlareI;
uniform float uSecondary;  // 0 or 1
uniform float uSecondaryY; // CSS px

const vec3 FLARE_CORE = vec3(1.0, 0.953, 0.769);  // #fff3c4
const vec3 FLARE_BODY = vec3(1.0, 0.478, 0.239);  // #ff7a3d
const vec3 FLARE_GLOW = vec3(1.0, 0.353, 0.478);  // #ff5a7a

void main() {
  vec2 px = vec2(gl_FragCoord.x, uBuffer.y - gl_FragCoord.y) / uDpr;

  // ── dots ─────────────────────────────────────────────────────────
  vec2 cell = floor(px / uSpacing);
  vec2 centre = (cell + 0.5) * uSpacing;
  // The target has 2×2 texels per cell, so a bilinear tap at the cell
  // centre is the average of all four: the cell's true coverage.
  vec4 cover = texture2D(uDensity, (cell + 0.5) / uGrid);
  float tone = clamp(max(cover.r, cover.g * 0.8), 0.0, 1.0);
  float haze = texture2D(uDensity, px / (uGrid * uSpacing)).b;

  float radius = mix(uBaseR, uMaxR, pow(tone, 0.62));
  float aa = 0.7 / uDpr;
  float dotMask = 1.0 - smoothstep(radius - aa, radius + aa, length(px - centre));
  float ink = mix(uBaseAlpha, 1.0, smoothstep(0.0, 0.3, tone));

  vec3 color = mix(uPaper, uHalo, smoothstep(0.0, 0.9, haze) * 0.92);
  color = mix(color, uDot, dotMask * ink);

  // ── flare ────────────────────────────────────────────────────────
  if (uFlareI > 0.001) {
    vec2 f = px - uFlare;
    float ax = abs(f.x);
    float ay = abs(f.y);
    float r = length(f);

    // The vertical is a column, not a hairline: a tight core, a body a
    // few pixels wide and a broad soft skirt. It swells into a diamond
    // around the crossing.
    float column = exp(-ax * ax / 1.6) * 0.85
                 + exp(-ax / 8.0) * 0.5
                 + exp(-ax * ax / 2600.0) * 0.2;
    column *= mix(1.0, 0.55, smoothstep(0.0, uSize.y, ay));
    float swell = exp(-ax / (5.0 + 30.0 * exp(-ay / 80.0))) * exp(-ay / 120.0) * 0.55;

    // The horizontal stays thin and paler.
    float beam = exp(-ay * ay / 0.6) * 0.6
               + exp(-ay / 5.0) * 0.2
               + exp(-ay * ay / 500.0) * 0.07;
    beam *= mix(1.0, 0.5, smoothstep(0.0, uSize.x, ax));

    // Four-point star and a hot centre.
    float star = exp(-ax / 2.4) * exp(-ay / 95.0) + exp(-ay / 2.4) * exp(-ax / 95.0);
    float bloom = exp(-r / 15.0) * 1.35 + exp(-r * r / 17000.0) * 0.34;

    float heat = column + swell + beam + star * 0.9 + bloom;
    if (uSecondary > 0.5) {
      float sy = abs(px.y - uSecondaryY);
      heat += exp(-sy * sy / 0.5) * 0.34 + exp(-sy / 5.0) * 0.1;
      // Where the column crosses the second line it flares again, small.
      float sr = length(vec2(f.x, px.y - uSecondaryY));
      heat += exp(-sr / 9.0) * 0.7 + exp(-ax / 2.0) * exp(-sy / 40.0) * 0.5;
    }
    heat *= uFlareI;

    vec3 flare = mix(FLARE_GLOW, FLARE_BODY, smoothstep(0.03, 0.34, heat));
    flare = mix(flare, FLARE_CORE, smoothstep(0.75, 1.6, heat));
    color = mix(color, flare, 1.0 - exp(-heat * 1.75));
  }

  gl_FragColor = vec4(color, 1.0);
}
`;
