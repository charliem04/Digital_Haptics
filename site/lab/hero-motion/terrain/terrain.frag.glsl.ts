/**
 * Concept B fragment shader: a crisp square or round point, coloured by
 * elevation through a 1D ramp texture (so the palette is swappable), with
 * a little per-point brightness jitter. Blending is additive.
 */
export const terrainFrag = /* glsl */ `
uniform sampler2D uRamp;
uniform float uRound;
uniform float uGrain;

varying float vHeight;
varying float vGrain;

void main() {
  float alpha = 1.0;
  if (uRound > 0.5) {
    float d = length(gl_PointCoord - 0.5);
    alpha = 1.0 - smoothstep(0.38, 0.5, d);
  }
  vec3 color = texture2D(uRamp, vec2(vHeight, 0.5)).rgb;
  color *= 1.0 + (vGrain - 0.5) * 2.0 * uGrain;
  gl_FragColor = vec4(color * alpha, 1.0);
}
`;
