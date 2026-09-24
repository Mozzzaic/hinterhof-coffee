/**
 * Shared GLSL for the press. Every canvas on the site prints with these
 * functions, so a dot looks the same on a photo, on the courtyard and on the
 * wordmark.
 *
 * Positions are CSS pixels with y pointing down, like the page. Tones run
 * from 0 (bare paper) to 1 (solid ink). A tone is never drawn as a shade:
 * it becomes the radius of a dot.
 */
export const pressChunk = /* glsl */ `
float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

mat2 rot2(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat2(c, s, -s, c);
}

// Index of the screen cell under p.
vec2 cellOf(vec2 p, float cell, float angle) {
  return floor(rot2(angle) * p / cell);
}

// Centre of a screen cell, back in page pixels.
vec2 cellCentre(vec2 id, float cell, float angle) {
  return rot2(-angle) * ((id + 0.5) * cell);
}

// Ink coverage at p for a dot of the given tone. aa is in cell units.
float dotAt(vec2 p, float cell, float angle, float tone, float aa) {
  vec2 f = fract(rot2(angle) * p / cell) - 0.5;
  float d = length(f);
  float t = clamp(tone, 0.0, 1.0);
  float r = sqrt(t / 3.14159265);
  r = mix(r, 0.75, smoothstep(0.8, 1.0, t));
  return (1.0 - smoothstep(r - aa, r + aa, d)) * smoothstep(0.0, aa, r);
}

// When the roller reaches a cell. sweep is the cell's place along the pass.
float inkedAt(vec2 id, float sweep) {
  return sweep * 0.75 + hash21(id + 7.13) * 0.25;
}

// 1 once the cell has been printed, 0 before: no fade in between.
float printedCell(vec2 id, float sweep, float progress) {
  return step(inkedAt(id, sweep), progress * 1.02);
}

// The dot grows to its full size just after the cell is printed.
float dotGrowth(vec2 id, float sweep, float progress) {
  float at = inkedAt(id, sweep);
  return smoothstep(at, at + 0.18, progress * 1.2);
}
`;

/** A quad that fills whatever viewport it is drawn into. */
export const quadVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;
