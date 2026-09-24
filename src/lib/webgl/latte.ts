import type * as THREE from "three";
import { cellSize, ink, rgb, screen } from "../ink";
import { pressChunk, quadVertex } from "./glsl";
import { getPrinter, type PrintJob } from "./printer";
import { pressOn, reducedMotion } from "./support";

/**
 * A flat white, printed live.
 *
 * The cup is seen from above. The coffee is the ink, the milk is the paper:
 * a small fluid simulation carries the milk across the crema, and the press
 * prints the result like everything else on the site, as dots and pencil
 * lines in the page's own inks.
 *
 * When the cup first comes into view, it pours itself: the shot, the milk
 * from high up, then low, then the pull through that makes the heart. After
 * that it belongs to the visitor: the pointer stirs the foam, a press drops
 * milk, and a brisk scroll makes the cup slop a little.
 *
 * The simulation runs in fixed steps so the heart comes out the same on a
 * slow phone as on a fast laptop (the slow one simply pours slower). It
 * stops as soon as the surface is calm: a still cup costs nothing.
 */

const SIM = 144;
const DYE = 432;
const STEP = 1 / 60;
const PRESSURE_ITERATIONS = 18;

/** Where the pour is, in seconds of simulated time. */
const POUR = {
  shot: 0.35,
  height: 1.2,
  lower: 2.0,
  pull: 2.95,
  done: 3.45,
};

// ---- Simulation passes ------------------------------------------------------
// Screen space for the sim: 0..1 over the liquid disc. Textures have v up, so
// every point handed to a pass has its y flipped once, in JavaScript.

const inside = /* glsl */ `
float inside(vec2 uv) {
  return step(length(uv - 0.5), 0.492);
}
`;

const splatFragment = /* glsl */ `
uniform sampler2D uTarget;
uniform vec2 uPoint;
uniform vec3 uColor;
uniform float uRadius;
uniform float uRadial;
uniform float uCap;
uniform float uDisc;
varying vec2 vUv;
void main() {
  vec2 p = vUv - uPoint;
  // A soft round of a given radius, or a gaussian dab.
  float g = uDisc > 0.0
    ? 1.0 - smoothstep(uDisc - 0.012, uDisc + 0.012, length(p))
    : exp(-dot(p, p) / uRadius);
  vec3 add = g * uColor;
  add.xy += normalize(p + vec2(1e-6)) * uRadial * g;
  vec3 value = texture2D(uTarget, vUv).xyz + add;
  if (uCap > 0.0) value = min(value, vec3(uCap));
  gl_FragColor = vec4(value, 1.0);
}
`;

// The pull through, as a barista sees it: behind the stream, the round
// becomes a heart. The fluid keeps it alive; this keeps it a heart.
const shapeFragment = /* glsl */ `
uniform sampler2D uTarget;
uniform vec2 uTip;
uniform float uScale;
uniform float uLine;
uniform float uStrength;
varying vec2 vUv;

float dot2(vec2 v) { return dot(v, v); }

// Inigo Quilez's heart: tip at the origin, lobes up to about y = 1.1.
float heart(vec2 p) {
  p.x = abs(p.x);
  if (p.y + p.x > 1.0) return sqrt(dot2(p - vec2(0.25, 0.75))) - sqrt(2.0) / 4.0;
  return sqrt(min(dot2(p - vec2(0.0, 1.0)), dot2(p - 0.5 * max(p.x + p.y, 0.0)))) * sign(p.x - p.y);
}

void main() {
  vec2 screen = vec2(vUv.x, 1.0 - vUv.y);
  vec2 p = vec2(screen.x - uTip.x, uTip.y - screen.y) / uScale;
  float inside = 1.0 - smoothstep(-0.03, 0.03, heart(p));
  float passed = 1.0 - smoothstep(uLine - 0.04, uLine + 0.04, screen.y);
  float milk = texture2D(uTarget, vUv).r;
  milk = mix(milk, inside * 1.1, uStrength * passed);
  gl_FragColor = vec4(milk, 0.0, 0.0, 1.0);
}
`;

const advectFragment = /* glsl */ `
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 uVelocityTexel;
uniform float uDt;
uniform float uDissipation;
varying vec2 vUv;
void main() {
  vec2 from = vUv - uDt * texture2D(uVelocity, vUv).xy * uVelocityTexel;
  gl_FragColor = texture2D(uSource, from) / (1.0 + uDissipation * uDt);
}
`;

const curlFragment = /* glsl */ `
uniform sampler2D uVelocity;
uniform vec2 uTexel;
varying vec2 vUv;
void main() {
  float l = texture2D(uVelocity, vUv - vec2(uTexel.x, 0.0)).y;
  float r = texture2D(uVelocity, vUv + vec2(uTexel.x, 0.0)).y;
  float t = texture2D(uVelocity, vUv + vec2(0.0, uTexel.y)).x;
  float b = texture2D(uVelocity, vUv - vec2(0.0, uTexel.y)).x;
  gl_FragColor = vec4(0.5 * (r - l - t + b), 0.0, 0.0, 1.0);
}
`;

const vorticityFragment = /* glsl */ `
uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform vec2 uTexel;
uniform float uCurlStrength;
uniform float uDt;
varying vec2 vUv;
void main() {
  float l = texture2D(uCurl, vUv - vec2(uTexel.x, 0.0)).x;
  float r = texture2D(uCurl, vUv + vec2(uTexel.x, 0.0)).x;
  float t = texture2D(uCurl, vUv + vec2(0.0, uTexel.y)).x;
  float b = texture2D(uCurl, vUv - vec2(0.0, uTexel.y)).x;
  float c = texture2D(uCurl, vUv).x;
  vec2 force = 0.5 * vec2(abs(t) - abs(b), abs(r) - abs(l));
  force /= length(force) + 0.0001;
  force *= uCurlStrength * c;
  force.y *= -1.0;
  vec2 velocity = texture2D(uVelocity, vUv).xy + force * uDt;
  gl_FragColor = vec4(clamp(velocity, -1000.0, 1000.0), 0.0, 1.0);
}
`;

const divergenceFragment = /* glsl */ `
uniform sampler2D uVelocity;
uniform vec2 uTexel;
varying vec2 vUv;
${inside}
void main() {
  vec2 vl = vUv - vec2(uTexel.x, 0.0);
  vec2 vr = vUv + vec2(uTexel.x, 0.0);
  vec2 vt = vUv + vec2(0.0, uTexel.y);
  vec2 vb = vUv - vec2(0.0, uTexel.y);
  vec2 c = texture2D(uVelocity, vUv).xy;
  // The wall of the cup: what flows into it comes straight back.
  float l = inside(vl) > 0.5 ? texture2D(uVelocity, vl).x : -c.x;
  float r = inside(vr) > 0.5 ? texture2D(uVelocity, vr).x : -c.x;
  float t = inside(vt) > 0.5 ? texture2D(uVelocity, vt).y : -c.y;
  float b = inside(vb) > 0.5 ? texture2D(uVelocity, vb).y : -c.y;
  gl_FragColor = vec4(0.5 * (r - l + t - b), 0.0, 0.0, 1.0);
}
`;

const scaleFragment = /* glsl */ `
uniform sampler2D uTexture;
uniform float uValue;
varying vec2 vUv;
void main() {
  gl_FragColor = uValue * texture2D(uTexture, vUv);
}
`;

const pressureFragment = /* glsl */ `
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
uniform vec2 uTexel;
varying vec2 vUv;
${inside}
void main() {
  float c = texture2D(uPressure, vUv).x;
  vec2 vl = vUv - vec2(uTexel.x, 0.0);
  vec2 vr = vUv + vec2(uTexel.x, 0.0);
  vec2 vt = vUv + vec2(0.0, uTexel.y);
  vec2 vb = vUv - vec2(0.0, uTexel.y);
  float l = inside(vl) > 0.5 ? texture2D(uPressure, vl).x : c;
  float r = inside(vr) > 0.5 ? texture2D(uPressure, vr).x : c;
  float t = inside(vt) > 0.5 ? texture2D(uPressure, vt).x : c;
  float b = inside(vb) > 0.5 ? texture2D(uPressure, vb).x : c;
  float divergence = texture2D(uDivergence, vUv).x;
  gl_FragColor = vec4((l + r + b + t - divergence) * 0.25, 0.0, 0.0, 1.0);
}
`;

const gradientFragment = /* glsl */ `
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
uniform vec2 uTexel;
varying vec2 vUv;
${inside}
void main() {
  float l = texture2D(uPressure, vUv - vec2(uTexel.x, 0.0)).x;
  float r = texture2D(uPressure, vUv + vec2(uTexel.x, 0.0)).x;
  float t = texture2D(uPressure, vUv + vec2(0.0, uTexel.y)).x;
  float b = texture2D(uPressure, vUv - vec2(0.0, uTexel.y)).x;
  vec2 velocity = texture2D(uVelocity, vUv).xy - vec2(r - l, t - b);
  gl_FragColor = vec4(velocity * inside(vUv), 0.0, 1.0);
}
`;

// ---- The print --------------------------------------------------------------

const cupFragment = /* glsl */ `
uniform sampler2D tDye;
uniform vec2 uSize;
uniform float uDpr;
uniform float uCell;
uniform float uAngle;
uniform float uDeepAngle;
uniform float uDeepOffset;
uniform vec3 uPaper;
uniform vec3 uInk;
uniform vec3 uDeep;
uniform vec2 uCentre;
uniform float uRim;
uniform vec2 uParallax;
uniform float uFill;
uniform float uPrint;
uniform float uBoil;
varying vec2 vUv;

${pressChunk}

float capsule(vec2 p, vec2 a, vec2 b, float r) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h) - r;
}

float ellipse(vec2 p, vec2 c, vec2 axis, vec2 radii) {
  vec2 q = p - c;
  vec2 local = vec2(dot(q, axis), dot(q, vec2(-axis.y, axis.x)));
  return (length(local / radii) - 1.0) * min(radii.x, radii.y);
}

// Everything on the table, as signed distances in page pixels.
float rimD(vec2 p) { return length(p - uCentre) - uRim; }
float innerD(vec2 p) { return length(p - uCentre) - uRim * 0.86; }
float saucerD(vec2 p) { return length(p - uCentre) - uRim * 1.46; }
float wellD(vec2 p) { return length(p - uCentre) - uRim * 1.1; }
float handleD(vec2 p) {
  return capsule(p, uCentre + vec2(uRim * 0.9, 0.0), uCentre + vec2(uRim * 1.36, 0.0), uRim * 0.105);
}
float slotD(vec2 p) {
  return capsule(p, uCentre + vec2(uRim * 1.06, 0.0), uCentre + vec2(uRim * 1.27, 0.0), uRim * 0.032);
}
vec2 spoonAxis() { return normalize(vec2(0.52, 0.85)); }
float bowlD(vec2 p) {
  vec2 axis = spoonAxis();
  return ellipse(p, uCentre + axis * uRim * 1.24, axis, vec2(uRim * 0.15, uRim * 0.095));
}
float stemD(vec2 p) {
  vec2 axis = spoonAxis();
  return capsule(p, uCentre + axis * uRim * 1.36, uCentre + axis * uRim * 2.05, uRim * 0.032);
}

vec2 liquidCentre() { return uCentre + uParallax; }
float liquidRadius() { return uRim * 0.86 * 0.985; }

// The surface of the drink: crema, darker toward the rim, with the milk
// taking the ink away wherever it has spread.
float drinkTone(vec2 q) {
  vec2 lc = liquidCentre();
  float rl = liquidRadius();
  float r = length(q - lc);
  // While the shot pours, the pool spreads from the middle.
  float a = atan(q.y - lc.y, q.x - lc.x);
  float pool = uFill * rl * (1.0 + 0.035 * sin(a * 5.0 + uFill * 7.0) * (1.0 - uFill));
  if (r > pool) return 0.12;
  vec2 suv = (q - (lc - rl)) / (2.0 * rl);
  float milk = texture2D(tDye, vec2(suv.x, 1.0 - suv.y)).r;
  float rn = r / rl;
  float crema = 0.54 + 0.36 * smoothstep(0.3, 1.0, rn)
    + (vnoise(q * 0.21) - 0.5) * 0.07
    + (vnoise(q * 0.047 + 11.0) - 0.5) * 0.08;
  return clamp(crema * (1.0 - smoothstep(0.05, 0.85, milk)), 0.0, 1.0);
}

float toneAt(vec2 q) {
  vec2 shadow = uRim * vec2(0.06, 0.085);
  bool onSaucer = saucerD(q) < 0.0;
  bool onCup = rimD(q) < 0.0;
  bool onHandle = handleD(q) < 0.0;
  bool onSpoon = bowlD(q) < 0.0 || stemD(q) < 0.0;
  if (innerD(q) < 0.0) {
    // The inner wall shows where the drink sits lower than the rim.
    float drinkEdge = length(q - liquidCentre()) - liquidRadius();
    return drinkEdge > 0.0 ? 0.3 : drinkTone(q);
  }
  if (onCup || onHandle) return 0.0;
  if (onSpoon) return 0.16;
  // Shadows, light from the top left: the cup and its handle on the saucer,
  // the spoon, and the saucer on the table.
  bool cupShadow = rimD(q - shadow) < 0.0 || handleD(q - shadow) < 0.0;
  bool spoonShadow = bowlD(q - shadow * 0.35) < 0.0 || stemD(q - shadow * 0.35) < 0.0;
  if (onSaucer) return cupShadow ? 0.34 : spoonShadow ? 0.28 : 0.0;
  if (spoonShadow) return 0.24;
  return saucerD(q - shadow * 1.25) < 0.0 ? 0.2 : 0.0;
}

float lineAt(vec2 p) {
  vec2 wobble = vec2(
    vnoise(p * 0.045 + uBoil * 13.1),
    vnoise(p * 0.045 + 31.7 + uBoil * 13.1)
  ) - 0.5;
  vec2 q = p + wobble * 2.2;
  float w = 1.0;
  float aa = 0.6;
  float d = min(abs(rimD(q)), abs(innerD(q)));
  d = min(d, abs(saucerD(q)));
  // The cup hides what is under it.
  bool covered = rimD(q) < -1.0;
  if (!covered) d = min(d, abs(handleD(q)));
  if (!covered && handleD(q) > 1.0) {
    d = min(d, abs(bowlD(q)));
    if (bowlD(q) > 1.0) d = min(d, abs(stemD(q)));
  }
  float line = 1.0 - smoothstep(w - aa, w + aa, d);
  // The saucer's well and the handle's slot: lighter lines.
  float well = (!covered && handleD(q) > 0.0 && bowlD(q) > 0.0 && stemD(q) > 0.0)
    ? 1.0 - smoothstep(0.6 - aa, 0.6 + aa, abs(wellD(q))) : 0.0;
  float slot = 1.0 - smoothstep(0.6 - aa, 0.6 + aa, abs(slotD(q)));
  return max(line, max(well, slot) * 0.8);
}

void main() {
  vec2 px = vec2(gl_FragCoord.x, uSize.y * uDpr - gl_FragCoord.y) / uDpr;
  float aa = 0.7 / (uDpr * uCell);
  float reach = uRim * 2.2;

  vec2 id1 = cellOf(px, uCell, uAngle);
  vec2 c1 = cellCentre(id1, uCell, uAngle);
  float s1 = clamp(length(c1 - uCentre) / reach, 0.0, 1.0);
  float t1 = toneAt(c1) * dotGrowth(id1, s1, uPrint);
  float inkCover = dotAt(px, uCell, uAngle, t1, aa);

  vec2 shift = vec2(uDeepOffset, -uDeepOffset);
  vec2 pd = px + shift;
  vec2 id2 = cellOf(pd, uCell, uDeepAngle);
  vec2 c2 = cellCentre(id2, uCell, uDeepAngle) - shift;
  float s2 = clamp(length(c2 - uCentre) / reach, 0.0, 1.0);
  float t2 = smoothstep(0.66, 1.0, toneAt(c2)) * dotGrowth(id2, s2, uPrint);
  float deepCover = dotAt(pd, uCell, uDeepAngle, t2, aa);

  float drawn = step(clamp(length(px - uCentre) / reach, 0.0, 1.0) * 0.9, uPrint);
  float line = lineAt(px) * drawn;

  vec3 colour = mix(mix(uPaper, uInk, inkCover), uDeep, deepCover);
  colour = mix(colour, uInk, line);
  gl_FragColor = vec4(colour, 1.0);
}
`;

type Splat = {
  /** Screen uv over the liquid disc, y down. */
  x: number;
  y: number;
  /** Velocity to add, in sim cells per second, screen directions. */
  vx?: number;
  vy?: number;
  /** Outward push, cells per second. */
  radial?: number;
  /** Milk to add. */
  milk?: number;
  /** Gaussian radius, in uv squared. */
  radius: number;
  /** A flat round of this radius (uv) instead of a gaussian dab. */
  disc?: number;
};

export type LatteHandle = {
  release: () => void;
  /** Empty the cup and pour again. */
  replay: () => void;
};

export function attachLatte(options: {
  wrap: HTMLElement;
  canvas: HTMLCanvasElement;
  paper: "sky" | "chalk";
  /** -1 before the pour, then 0 (shot), 1 (milk) and 2 (heart). */
  onStage?: (stage: number) => void;
}): LatteHandle {
  const none: LatteHandle = { release: () => {}, replay: () => {} };
  if (!pressOn()) return none;
  const { wrap, canvas } = options;
  const still = reducedMotion();
  const cleanups: Array<() => void> = [];
  let disposed = false;
  let replay = () => {};

  getPrinter()
    .then((printer) => {
      if (disposed) return;
      const three = printer.three;
      const renderer = printer.renderer;

      const target = (size: number) =>
        new three.WebGLRenderTarget(size, size, {
          type: three.HalfFloatType,
          depthBuffer: false,
          minFilter: three.LinearFilter,
          magFilter: three.LinearFilter,
          wrapS: three.ClampToEdgeWrapping,
          wrapT: three.ClampToEdgeWrapping,
        });
      const pair = (size: number) => {
        let read = target(size);
        let write = target(size);
        return {
          get read() {
            return read;
          },
          get write() {
            return write;
          },
          swap() {
            [read, write] = [write, read];
          },
          dispose() {
            read.dispose();
            write.dispose();
          },
        };
      };
      const velocity = pair(SIM);
      const dye = pair(DYE);
      const pressure = pair(SIM);
      const divergence = target(SIM);
      const curl = target(SIM);

      const pass = (fragmentShader: string, uniforms: Record<string, THREE.IUniform>) =>
        new three.ShaderMaterial({
          vertexShader: quadVertex,
          fragmentShader,
          uniforms,
          blending: three.NoBlending,
          depthTest: false,
          depthWrite: false,
        });
      const texel = new three.Vector2(1 / SIM, 1 / SIM);
      const splat = pass(splatFragment, {
        uTarget: { value: null },
        uPoint: { value: new three.Vector2() },
        uColor: { value: new three.Vector3() },
        uRadius: { value: 0.001 },
        uRadial: { value: 0 },
        uCap: { value: 0 },
        uDisc: { value: 0 },
      });
      const shape = pass(shapeFragment, {
        uTarget: { value: null },
        uTip: { value: new three.Vector2(0.5, 0.73) },
        uScale: { value: 0.42 },
        uLine: { value: 0 },
        uStrength: { value: 0 },
      });
      const advect = pass(advectFragment, {
        uVelocity: { value: null },
        uSource: { value: null },
        uVelocityTexel: { value: texel },
        uDt: { value: STEP },
        uDissipation: { value: 0 },
      });
      const curlPass = pass(curlFragment, {
        uVelocity: { value: null },
        uTexel: { value: texel },
      });
      const vorticity = pass(vorticityFragment, {
        uVelocity: { value: null },
        uCurl: { value: null },
        uTexel: { value: texel },
        uCurlStrength: { value: 1.5 },
        uDt: { value: STEP },
      });
      const divergencePass = pass(divergenceFragment, {
        uVelocity: { value: null },
        uTexel: { value: texel },
      });
      const scale = pass(scaleFragment, {
        uTexture: { value: null },
        uValue: { value: 0.8 },
      });
      const pressurePass = pass(pressureFragment, {
        uPressure: { value: null },
        uDivergence: { value: null },
        uTexel: { value: texel },
      });
      const gradient = pass(gradientFragment, {
        uPressure: { value: null },
        uVelocity: { value: null },
        uTexel: { value: texel },
      });

      const material = new three.ShaderMaterial({
        vertexShader: quadVertex,
        fragmentShader: cupFragment,
        blending: three.NoBlending,
        depthTest: false,
        depthWrite: false,
        uniforms: {
          tDye: { value: dye.read.texture as THREE.Texture },
          uSize: { value: new three.Vector2(1, 1) },
          uDpr: { value: 1 },
          uCell: { value: cellSize() },
          uAngle: { value: (screen.angle * Math.PI) / 180 },
          uDeepAngle: { value: (screen.deepAngle * Math.PI) / 180 },
          uDeepOffset: { value: screen.deepOffset },
          uPaper: { value: new three.Vector3(...rgb(ink[options.paper])) },
          uInk: { value: new three.Vector3(...rgb(ink.ink)) },
          uDeep: { value: new three.Vector3(...rgb(ink.deep)) },
          uCentre: { value: new three.Vector2() },
          uRim: { value: 100 },
          uParallax: { value: new three.Vector2() },
          uFill: { value: 0 },
          uPrint: { value: still ? 1 : 0 },
          uBoil: { value: 0 },
        },
      });

      const draw = (m: THREE.ShaderMaterial, into: THREE.WebGLRenderTarget) => {
        renderer.setRenderTarget(into);
        printer.drawQuad(m, into.width, into.height);
      };

      // ---- State -------------------------------------------------------------
      const geometry = { width: 1, height: 1, dpr: 1, cx: 0, cy: 0, rim: 1 };
      const queue: Splat[] = [];
      const pointer = { x: -1, y: -1, t: 0, inside: false, down: false, px: 0, py: 0 };
      let steps = 0;
      let accumulator = 0;
      let startedAt = -1;
      let stage = -1;
      let calmFrom = 0;
      let printStart = -1;
      let cleared = false;
      let seen = false;
      let lastNow = 0;

      const setStage = (next: number) => {
        if (next === stage) return;
        stage = next;
        options.onStage?.(next);
      };

      const clearAll = () => {
        renderer.setClearColor(0x000000, 0);
        // A clear only reaches inside the scissor the last job left behind.
        renderer.setScissorTest(false);
        for (const rt of [velocity.read, velocity.write, dye.read, dye.write, pressure.read, pressure.write]) {
          renderer.setRenderTarget(rt);
          renderer.clear();
        }
        cleared = true;
      };

      const applySplat = (s: Splat) => {
        // Screen uv (y down) to texture uv (y up).
        splat.uniforms.uPoint.value.set(s.x, 1 - s.y);
        splat.uniforms.uRadius.value = s.radius;
        splat.uniforms.uDisc.value = s.disc ?? 0;
        if (s.vx || s.vy || s.radial) {
          splat.uniforms.uTarget.value = velocity.read.texture;
          splat.uniforms.uColor.value.set(s.vx ?? 0, -(s.vy ?? 0), 0);
          splat.uniforms.uRadial.value = s.radial ?? 0;
          splat.uniforms.uCap.value = 0;
          draw(splat, velocity.write);
          velocity.swap();
        }
        if (s.milk) {
          splat.uniforms.uTarget.value = dye.read.texture;
          splat.uniforms.uColor.value.set(s.milk, 0, 0);
          splat.uniforms.uRadial.value = 0;
          splat.uniforms.uCap.value = 1.2;
          draw(splat, dye.write);
          dye.swap();
        }
      };

      let shaping: { line: number; strength: number } | null = null;

      /** The barista, one step at a time. */
      const script = (t: number) => {
        shaping = null;
        if (t >= POUR.shot && t < POUR.height) {
          setStage(0);
          // The shot lands and turns in the cup: crema swirls.
          const k = (t - POUR.shot) / (POUR.height - POUR.shot);
          const a = t * 9;
          queue.push({
            x: 0.5 + Math.cos(a) * 0.12,
            y: 0.5 + Math.sin(a) * 0.12,
            vx: -Math.sin(a) * 70 * (1 - k),
            vy: Math.cos(a) * 70 * (1 - k),
            radius: 0.006,
          });
        } else if (t >= POUR.height && t < POUR.lower) {
          setStage(1);
          // Milk from high up dives under the crema and lifts its colour.
          queue.push({ x: 0.5, y: 0.47, milk: 0.006, radius: 0.02 });
        } else if (t >= POUR.lower && t < POUR.pull) {
          // Pitcher down: the white lands on top and spreads into a round
          // (a liquid cannot grow out of a point, so the round grows here).
          const k = (t - POUR.lower) / (POUR.pull - POUR.lower);
          queue.push({
            x: 0.5,
            y: 0.4 + k * 0.03,
            milk: 0.3,
            radius: 0,
            disc: 0.04 + 0.19 * Math.sqrt(k),
          });
        } else if (t >= POUR.pull && t < POUR.done) {
          setStage(2);
          // The pull through: a thin stream across the white makes the heart.
          const k = (t - POUR.pull) / (POUR.done - POUR.pull);
          const y = 0.2 + k * 0.56;
          // The stream: a thin line of white, dragging the surface along.
          queue.push({ x: 0.5, y, vy: 60, milk: 0.25, radius: 0.001 });
          shaping = { line: y + 0.04, strength: 0.22 };
        } else if (t >= POUR.done && t < POUR.done + 0.25) {
          // The pitcher lifts: the point settles.
          shaping = { line: 1.2, strength: 0.18 };
        }
      };

      const simulate = (t: number) => {
        script(t);
        for (const s of queue.splice(0)) applySplat(s);
        if (shaping) {
          shape.uniforms.uTarget.value = dye.read.texture;
          shape.uniforms.uLine.value = shaping.line;
          shape.uniforms.uStrength.value = shaping.strength;
          draw(shape, dye.write);
          dye.swap();
        }
        // Swirls, kept alive a little.
        curlPass.uniforms.uVelocity.value = velocity.read.texture;
        draw(curlPass, curl);
        vorticity.uniforms.uVelocity.value = velocity.read.texture;
        vorticity.uniforms.uCurl.value = curl.texture;
        draw(vorticity, velocity.write);
        velocity.swap();
        // Keep it incompressible, inside the cup.
        divergencePass.uniforms.uVelocity.value = velocity.read.texture;
        draw(divergencePass, divergence);
        scale.uniforms.uTexture.value = pressure.read.texture;
        scale.uniforms.uValue.value = 0.8;
        draw(scale, pressure.write);
        pressure.swap();
        pressurePass.uniforms.uDivergence.value = divergence.texture;
        for (let i = 0; i < PRESSURE_ITERATIONS; i++) {
          pressurePass.uniforms.uPressure.value = pressure.read.texture;
          draw(pressurePass, pressure.write);
          pressure.swap();
        }
        gradient.uniforms.uPressure.value = pressure.read.texture;
        gradient.uniforms.uVelocity.value = velocity.read.texture;
        draw(gradient, velocity.write);
        velocity.swap();
        // Carry everything along.
        advect.uniforms.uVelocity.value = velocity.read.texture;
        advect.uniforms.uSource.value = velocity.read.texture;
        advect.uniforms.uDissipation.value = 3;
        draw(advect, velocity.write);
        velocity.swap();
        advect.uniforms.uVelocity.value = velocity.read.texture;
        advect.uniforms.uSource.value = dye.read.texture;
        advect.uniforms.uDissipation.value = 0.004;
        draw(advect, dye.write);
        dye.swap();
        material.uniforms.tDye.value = dye.read.texture;
        steps++;
      };

      // The heart keeps settling for a moment after the last drop.
      const pouring = () => startedAt >= 0 && !still && steps * STEP < POUR.done + 1.6;

      const job: PrintJob = {
        canvas,
        width: 0,
        height: 0,
        material,
        visible: false,
        dirty: true,
        running: (now) =>
          (printStart >= 0 && now - printStart < 1.2) ||
          pouring() ||
          now < calmFrom ||
          queue.length > 0 ||
          (!still && Math.abs(printer.speed) > 400),
        prepass: (_p, now) => {
          if (!cleared) clearAll();
          const dt = Math.min(0.1, lastNow ? now - lastNow : STEP);
          lastNow = now;
          const uniforms = material.uniforms;
          if (printStart >= 0) {
            const k = Math.min(1, Math.max(0, (now - printStart) / 1.1));
            uniforms.uPrint.value = 1 - Math.pow(1 - k, 3.2);
          }
          uniforms.uBoil.value = Math.floor(now * screen.boilFps);
          if (startedAt < 0 || still) return;
          // A brisk scroll makes the drink slop against the wall.
          if (!still && Math.abs(printer.speed) > 400) {
            const push = Math.max(-1, Math.min(1, printer.speed / 2500)) * 60;
            queue.push({ x: 0.5, y: 0.5, vy: -push, radius: 0.5 });
            calmFrom = Math.max(calmFrom, now + 2.5);
          }
          accumulator = Math.min(accumulator + dt, STEP * 3);
          while (accumulator >= STEP) {
            accumulator -= STEP;
            simulate(steps * STEP);
          }
          uniforms.uFill.value = Math.min(1, Math.max(0, (steps * STEP - POUR.shot + 0.15) / 0.8));
        },
      };

      const layout = () => {
        const rect = wrap.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, screen.maxDpr);
        const width = Math.max(2, Math.round(rect.width * dpr));
        const height = Math.max(2, Math.round(rect.height * dpr));
        canvas.width = width;
        canvas.height = height;
        job.width = width;
        job.height = height;
        geometry.width = rect.width;
        geometry.height = rect.height;
        geometry.dpr = dpr;
        // The cup sits a touch left of centre to leave room for its handle,
        // the saucer nearly filling the height.
        geometry.rim = Math.min(rect.height * 0.33, rect.width * 0.26);
        geometry.cx = rect.width * 0.47;
        geometry.cy = rect.height * 0.5;
        const uniforms = material.uniforms;
        uniforms.uSize.value.set(rect.width, rect.height);
        uniforms.uDpr.value = dpr;
        uniforms.uCell.value = cellSize();
        uniforms.uCentre.value.set(geometry.cx, geometry.cy);
        uniforms.uRim.value = geometry.rim;
        job.dirty = true;
      };

      /** Pointer to the liquid's own uv, or null when it is not over the drink. */
      const toDrink = (clientX: number, clientY: number) => {
        const rect = wrap.getBoundingClientRect();
        const r = geometry.rim * 0.86 * 0.985;
        const x = (clientX - rect.left - (geometry.cx - r)) / (2 * r);
        const y = (clientY - rect.top - (geometry.cy - r)) / (2 * r);
        return Math.hypot(x - 0.5, y - 0.5) < 0.48 ? { x, y } : null;
      };

      const touch = () => {
        calmFrom = performance.now() / 1000 + 3.5;
        job.dirty = true;
      };

      const move = (event: PointerEvent) => {
        if (still || startedAt < 0) return;
        const at = toDrink(event.clientX, event.clientY);
        const now = performance.now() / 1000;
        // A little parallax: the drink sits lower than the rim.
        const rect = wrap.getBoundingClientRect();
        const nx = (event.clientX - rect.left) / rect.width - 0.5;
        const ny = (event.clientY - rect.top) / rect.height - 0.5;
        material.uniforms.uParallax.value.set(-nx * geometry.rim * 0.035, -ny * geometry.rim * 0.035);
        if (!at) {
          pointer.inside = false;
          job.dirty = true;
          return;
        }
        if (pointer.inside) {
          const dt = Math.max(0.008, now - pointer.t);
          const vx = ((at.x - pointer.x) / dt) * SIM * 0.35;
          const vy = ((at.y - pointer.y) / dt) * SIM * 0.35;
          queue.push({
            x: at.x,
            y: at.y,
            vx: Math.max(-600, Math.min(600, vx)),
            vy: Math.max(-600, Math.min(600, vy)),
            milk: pointer.down ? 0.08 : 0,
            radius: 0.0016,
          });
        }
        pointer.x = at.x;
        pointer.y = at.y;
        pointer.t = now;
        pointer.inside = true;
        touch();
      };
      const down = (event: PointerEvent) => {
        if (still || startedAt < 0) return;
        const at = toDrink(event.clientX, event.clientY);
        if (!at) return;
        pointer.down = true;
        // A drop of milk.
        queue.push({ x: at.x, y: at.y, milk: 1.1, radius: 0.0026 });
        touch();
      };
      const up = () => {
        pointer.down = false;
      };
      const leave = () => {
        pointer.inside = false;
        pointer.down = false;
      };

      const start = () => {
        if (startedAt >= 0) return;
        startedAt = performance.now() / 1000;
        if (still) {
          // No pour to watch: pour it all at once and print the cup as it
          // ends up.
          clearAll();
          while (steps * STEP < POUR.done + 1.2) simulate(steps * STEP);
          material.uniforms.uFill.value = 1;
          setStage(2);
          job.dirty = true;
          return;
        }
        printStart = startedAt;
        steps = 0;
        accumulator = 0;
        job.dirty = true;
      };

      replay = () => {
        if (startedAt < 0) return;
        clearAll();
        steps = 0;
        accumulator = 0;
        queue.length = 0;
        material.uniforms.uFill.value = 0;
        setStage(-1);
        if (still) {
          while (steps * STEP < POUR.done + 1.2) simulate(steps * STEP);
          material.uniforms.uFill.value = 1;
          setStage(2);
        }
        job.dirty = true;
      };

      layout();
      const sizer = new ResizeObserver(layout);
      sizer.observe(wrap);
      const near = new IntersectionObserver(
        ([entry]) => {
          job.visible = entry.isIntersecting;
          job.dirty = true;
          if (entry.intersectionRatio >= 0.3 && !seen) {
            seen = true;
            start();
          }
        },
        { threshold: [0, 0.3] },
      );
      near.observe(wrap);
      wrap.addEventListener("pointermove", move);
      wrap.addEventListener("pointerdown", down);
      window.addEventListener("pointerup", up);
      wrap.addEventListener("pointerleave", leave);
      printer.add(job);
      wrap.dataset.press = "ready";

      cleanups.push(() => {
        printer.remove(job);
        sizer.disconnect();
        near.disconnect();
        wrap.removeEventListener("pointermove", move);
        wrap.removeEventListener("pointerdown", down);
        window.removeEventListener("pointerup", up);
        wrap.removeEventListener("pointerleave", leave);
        for (const m of [splat, shape, advect, curlPass, vorticity, divergencePass, scale, pressurePass, gradient, material]) m.dispose();
        velocity.dispose();
        dye.dispose();
        pressure.dispose();
        divergence.dispose();
        curl.dispose();
        delete wrap.dataset.press;
      });
    })
    .catch(() => {
      /* The photograph stays. */
    });

  return {
    release: () => {
      disposed = true;
      cleanups.splice(0).forEach((cleanup) => cleanup());
    },
    replay: () => replay(),
  };
}
