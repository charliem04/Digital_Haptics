/**
 * Concept A fragment shader: paper, halftone dots, flare.
 *
 * Everything is worked out in CSS pixels with the origin top-left, the
 * same space the walkers and the pointer use.
 *
 *   1. Which grid cell is this fragment in? Sample the density texture
 *      (one texel per cell) at the cell's centre: .r is how much of the
 *      cell a footprint covers. The dot's radius grows with it.
 *   2. Sample .b at the fragment itself, bilinear, for the soft halo
 *      that tints the paper around each print.
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
uniform vec2 uGrid;        // density texture size, cells
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
  float density = texture2D(uDensity, (cell + 0.5) / uGrid).r;
  float halo = texture2D(uDensity, px / (uGrid * uSpacing)).b;

  // Square-root-ish response: a half-covered cell still gets a clearly
  // bigger dot, which is what draws the edge of the print.
  float radius = mix(uBaseR, uMaxR, pow(clamp(density, 0.0, 1.0), 0.6));
  float aa = 0.7 / uDpr;
  float dotMask = 1.0 - smoothstep(radius - aa, radius + aa, length(px - centre));
  float ink = mix(uBaseAlpha, 1.0, smoothstep(0.0, 0.25, density));

  vec3 color = mix(uPaper, uHalo, smoothstep(0.0, 1.0, halo) * 0.9);
  color = mix(color, uDot, dotMask * ink);

  // ── flare ────────────────────────────────────────────────────────
  if (uFlareI > 0.001) {
    vec2 f = px - uFlare;
    float ax = abs(f.x);
    float ay = abs(f.y);
    float r = length(f);

    // Two hairlines across the whole hero: a tight core inside a wider,
    // weaker glow, easing off toward the far edges.
    float vLine = (exp(-ax * ax / 0.7) * 0.85 + exp(-ax / 6.0) * 0.26)
                * mix(1.0, 0.5, smoothstep(0.0, uSize.y, ay));
    float hLine = (exp(-ay * ay / 0.4) * 0.75 + exp(-ay / 4.5) * 0.2)
                * mix(1.0, 0.5, smoothstep(0.0, uSize.x, ax));
    // Four-point star: the same lines, much brighter, dying fast.
    float star = exp(-ax / 1.7) * exp(-ay / 64.0) + exp(-ay / 1.7) * exp(-ax / 64.0);
    // Bloom: a hot centre and a broad, faint skirt.
    float bloom = exp(-r / 11.0) * 1.1 + exp(-r * r / 13000.0) * 0.3;

    float heat = vLine + hLine + star * 0.9 + bloom;
    if (uSecondary > 0.5) {
      float sy = abs(px.y - uSecondaryY);
      heat += exp(-sy * sy / 0.4) * 0.34 + exp(-sy / 4.0) * 0.08;
    }
    heat *= uFlareI;

    vec3 flare = mix(FLARE_GLOW, FLARE_BODY, smoothstep(0.02, 0.3, heat));
    flare = mix(flare, FLARE_CORE, smoothstep(0.7, 1.5, heat));
    color = mix(color, flare, 1.0 - exp(-heat * 1.7));
  }

  gl_FragColor = vec4(color, 1.0);
}
`;
