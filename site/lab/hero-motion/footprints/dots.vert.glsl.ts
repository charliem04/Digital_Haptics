/** Concept A vertex shader: a fullscreen quad. The camera is unused. */
export const dotsVert = /* glsl */ `
void main() {
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;
