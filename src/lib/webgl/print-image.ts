import type * as THREE from "three";
import { cellSize, ink, rgb, screen } from "../ink";
import { pressChunk, quadVertex } from "./glsl";
import { getPrinter, type PrintJob } from "./printer";
import { pressOn, reducedMotion } from "./support";

/**
 * A photograph run through the press.
 *
 * The page first shows the CSS duotone (fast, no JavaScript needed). When the
 * image comes into view the press prints over it cell by cell, and from then
 * on the picture is made of ink dots only. On hover the dots behave like the
 * surface of a cup: rings travel out from the pointer.
 */

export type Sweep = "up" | "radial";

export type PrintImageOptions = {
  wrap: HTMLElement;
  img: HTMLImageElement;
  canvas: HTMLCanvasElement;
  paper: "sky" | "chalk";
  sweep: Sweep;
  /** Tonal controls, for photographs that print too flat or too heavy. */
  contrast?: number;
  lift?: number;
  gamma?: number;
  /**
   * The crop: the point of the photograph (0 to 1, from the top left) the
   * frame centres on, and how far it closes in on it. A printed picture
   * needs one subject, big enough to survive the dots.
   */
  focus?: readonly [number, number];
  zoom?: number;
};

/** The share of the visible picture that prints solid deep ink, and bare paper. */
const LEVELS_CLIP = 0.15;

const fragmentShader = /* glsl */ `
uniform sampler2D uTex;
uniform vec2 uTexSize;
uniform vec2 uSize;
uniform float uDpr;
uniform float uCell;
uniform float uAngle;
uniform float uDeepAngle;
uniform float uDeepOffset;
uniform float uSlip;
uniform vec3 uPaper;
uniform vec3 uInk;
uniform vec3 uDeep;
uniform float uPrint;
uniform float uSweep;
uniform vec2 uPointer;
uniform float uHover;
uniform float uTime;
uniform float uLod;
uniform float uContrast;
uniform float uLift;
uniform float uGamma;
uniform vec2 uFocus;
uniform float uZoom;
uniform vec2 uLevels;
varying vec2 vUv;

${pressChunk}

vec2 coverUv(vec2 px) {
  vec2 uv = px / uSize;
  float ar = uSize.x / uSize.y;
  float ir = uTexSize.x / uTexSize.y;
  vec2 s = (ar > ir ? vec2(1.0, ir / ar) : vec2(ar / ir, 1.0)) / uZoom;
  // The crop never runs off the photograph.
  vec2 f = clamp(uFocus, s * 0.5, 1.0 - s * 0.5);
  uv = (uv - 0.5) * s + f;
  return vec2(uv.x, 1.0 - uv.y);
}

float toneAt(vec2 px) {
  vec3 c = textureLod(uTex, coverUv(clamp(px, vec2(0.0), uSize)), uLod).rgb;
  float l = dot(c, vec3(0.299, 0.587, 0.114));
  // Levels first: the darkest part of this crop prints solid, the lightest
  // is left bare, so a flat photograph still has a black and a white.
  l = clamp((l - uLevels.x) / max(uLevels.y - uLevels.x, 0.05), 0.0, 1.0);
  l = clamp((l - 0.5) * uContrast + 0.5 + uLift, 0.0, 1.0);
  return pow(1.0 - l, uGamma);
}

float sweepAt(vec2 px) {
  float up = 1.0 - clamp(px.y / uSize.y, 0.0, 1.0);
  float radial = clamp(length(px / uSize - 0.5) * 1.35, 0.0, 1.0);
  return mix(up, radial, uSweep);
}

void main() {
  vec2 px = vec2(gl_FragCoord.x, uSize.y * uDpr - gl_FragCoord.y) / uDpr;

  // The surface of a cup: rings travel out from the pointer.
  vec2 rel = px - uPointer;
  float dist = length(rel);
  float ring = sin(dist * 0.085 - uTime * 4.2) * exp(-dist * 0.011) * uHover;
  vec2 warped = px + (dist > 0.5 ? rel / dist : vec2(0.0)) * ring * 5.0;

  float aa = 0.7 / (uDpr * uCell);

  // First drum: the ink.
  vec2 id1 = cellOf(warped, uCell, uAngle);
  vec2 c1 = cellCentre(id1, uCell, uAngle);
  float s1 = sweepAt(c1);
  float printed = printedCell(id1, s1, uPrint);
  float t1 = toneAt(c1) * dotGrowth(id1, s1, uPrint) + ring * 0.06;
  float inkCover = dotAt(warped, uCell, uAngle, t1, aa);

  // Second drum: the deep ink, only in the shadows, slightly off register.
  vec2 shift = vec2(uDeepOffset, -uDeepOffset);
  vec2 pd = warped + shift;
  vec2 id2 = cellOf(pd, uCell, uDeepAngle);
  vec2 c2 = cellCentre(id2, uCell, uDeepAngle) - shift;
  // Scrolling fast, the second drum slips behind the first, then catches up.
  float t2 = smoothstep(0.62, 1.0, toneAt(c2 - vec2(0.0, uSlip))) * dotGrowth(id2, sweepAt(c2), uPrint);
  float deepCover = dotAt(pd, uCell, uDeepAngle, t2, aa);

  vec3 colour = mix(mix(uPaper, uInk, inkCover), uDeep, deepCover);
  gl_FragColor = vec4(colour * printed, printed);
}
`;

const PRINT_SECONDS = 1.1;

/**
 * The levels of the part of the photograph the frame shows: the luminance
 * under which LEVELS_CLIP of it lies, and the one over which LEVELS_CLIP lies.
 */
function levelsOf(
  image: HTMLImageElement,
  frame: { x: number; y: number },
  focus: { x: number; y: number },
  zoom: number,
): [number, number] {
  try {
    const iw = image.naturalWidth;
    const ih = image.naturalHeight;
    const ar = frame.x / Math.max(frame.y, 1);
    const ir = iw / ih;
    const sx = (ar > ir ? 1 : ar / ir) / zoom;
    const sy = (ar > ir ? ir / ar : 1) / zoom;
    const fx = Math.min(Math.max(focus.x, sx / 2), 1 - sx / 2);
    const fy = Math.min(Math.max(focus.y, sy / 2), 1 - sy / 2);
    const side = 48;
    const probe = document.createElement("canvas");
    probe.width = side;
    probe.height = side;
    const context = probe.getContext("2d", { willReadFrequently: true });
    if (!context) return [0, 1];
    context.drawImage(
      image,
      (fx - sx / 2) * iw,
      (fy - sy / 2) * ih,
      sx * iw,
      sy * ih,
      0,
      0,
      side,
      side,
    );
    const { data } = context.getImageData(0, 0, side, side);
    const values: number[] = [];
    for (let i = 0; i < data.length; i += 4) {
      values.push((data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255);
    }
    values.sort((a, b) => a - b);
    const low = values[Math.floor(values.length * LEVELS_CLIP)];
    const high = values[Math.floor(values.length * (1 - LEVELS_CLIP))];
    return high - low > 0.05 ? [low, high] : [0, 1];
  } catch {
    return [0, 1];
  }
}

/** The ink curve, cubic-bezier(0.22, 1, 0.36, 1), close enough for a progress value. */
function easeInk(t: number) {
  return 1 - Math.pow(1 - t, 3.2);
}

export function attachPrint(options: PrintImageOptions): () => void {
  if (!pressOn()) return () => {};

  const { wrap, img, canvas } = options;
  const still = reducedMotion();
  const state = {
    started: still ? 0 : -1,
    progress: still ? 1 : 0,
    seen: false,
    hover: 0,
    hoverTarget: 0,
    pulseUntil: 0,
    /** How far the deep ink has slipped behind (px), following the scroll. */
    slip: 0,
  };
  const cleanups: Array<() => void> = [];
  let disposed = false;

  getPrinter()
    .then((printer) => {
      if (disposed) return;
      const three = printer.three;
      let texture: THREE.Texture | null = null;

      const uniforms = {
        uTex: { value: null as THREE.Texture | null },
        uTexSize: { value: new three.Vector2(1, 1) },
        uSize: { value: new three.Vector2(1, 1) },
        uDpr: { value: 1 },
        uCell: { value: cellSize() },
        uAngle: { value: (screen.angle * Math.PI) / 180 },
        uDeepAngle: { value: (screen.deepAngle * Math.PI) / 180 },
        uDeepOffset: { value: screen.deepOffset },
        uSlip: { value: 0 },
        uPaper: { value: new three.Vector3(...rgb(ink[options.paper])) },
        uInk: { value: new three.Vector3(...rgb(ink.ink)) },
        uDeep: { value: new three.Vector3(...rgb(ink.deep)) },
        uPrint: { value: state.progress },
        uSweep: { value: options.sweep === "radial" ? 1 : 0 },
        uPointer: { value: new three.Vector2(-9999, -9999) },
        uHover: { value: 0 },
        uTime: { value: 0 },
        uLod: { value: 0 },
        uContrast: { value: options.contrast ?? 1 },
        uLift: { value: options.lift ?? 0 },
        uGamma: { value: options.gamma ?? 1 },
        uFocus: { value: new three.Vector2(...(options.focus ?? [0.5, 0.5])) },
        uZoom: { value: Math.max(1, options.zoom ?? 1) },
        uLevels: { value: new three.Vector2(0, 1) },
      };

      const material = new three.ShaderMaterial({
        vertexShader: quadVertex,
        fragmentShader,
        uniforms,
        blending: three.NoBlending,
        depthTest: false,
        depthWrite: false,
      });

      // Up to 4px behind at a brisk scroll, back in register when it stops.
      let slipAt = 0;
      const slipStep = (now: number) => {
        const dt = Math.min(0.1, slipAt ? now - slipAt : 0.016);
        slipAt = now;
        const slip = still ? 0 : Math.max(-4, Math.min(4, printer.speed / 700));
        state.slip += (slip - state.slip) * (1 - Math.exp(-dt * 9));
        if (Math.abs(state.slip) < 0.05 && slip === 0) state.slip = 0;
        return Math.round(state.slip);
      };

      const job: PrintJob = {
        canvas,
        width: 0,
        height: 0,
        material,
        visible: false,
        dirty: true,
        // The second drum slips in whole pixels: a brisk scroll costs a few
        // redraws (one per pixel of slip), not one per frame.
        running: (now) =>
          (state.started >= 0 && state.progress < 1) ||
          state.hover > 0.002 ||
          state.hoverTarget > 0 ||
          now < state.pulseUntil ||
          slipStep(now) !== uniforms.uSlip.value,
        update: (now, dt) => {
          if (state.started >= 0 && state.progress < 1)
            state.progress = Math.min(1, (now - state.started) / PRINT_SECONDS);
          if (state.progress >= 1 && wrap.dataset.press === "ready") wrap.dataset.press = "printed";
          uniforms.uPrint.value = easeInk(state.progress);
          const target = now < state.pulseUntil ? 1 : state.hoverTarget;
          state.hover += (target - state.hover) * (1 - Math.exp(-dt * 5));
          uniforms.uHover.value = state.hover;
          uniforms.uTime.value = now;
          uniforms.uSlip.value = Math.round(state.slip);
        },
      };

      const lod = () => {
        const size = uniforms.uSize.value;
        const tex = uniforms.uTexSize.value;
        const scale = Math.max(size.x / tex.x, size.y / tex.y) * uniforms.uZoom.value;
        const cellTexels = uniforms.uCell.value / Math.max(scale, 1e-4);
        return Math.max(0, Math.log2(Math.max(1, cellTexels)) - 0.5);
      };

      const resize = () => {
        const rect = wrap.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, screen.maxDprStill);
        const width = Math.max(2, Math.round(rect.width * dpr));
        const height = Math.max(2, Math.round(rect.height * dpr));
        if (canvas.width !== width) canvas.width = width;
        if (canvas.height !== height) canvas.height = height;
        job.width = width;
        job.height = height;
        uniforms.uSize.value.set(width / dpr, height / dpr);
        uniforms.uDpr.value = dpr;
        uniforms.uCell.value = cellSize();
        uniforms.uLod.value = lod();
        job.dirty = true;
      };

      // A srcset <img> reports a density-corrected natural size that is not
      // its bitmap size, which WebGL would trip over. The press takes its own
      // copy of whatever file the browser picked (already cached).
      let source = "";
      const upload = () => {
        const url = img.currentSrc || img.src;
        if (!img.naturalWidth || !url || url === source) return;
        source = url;
        const copy = new Image();
        copy.decoding = "async";
        copy.src = url;
        copy
          .decode()
          .then(() => {
            if (disposed || source !== url) return;
            texture?.dispose();
            texture = new three.Texture(copy);
            texture.colorSpace = three.NoColorSpace;
            texture.minFilter = three.LinearMipmapLinearFilter;
            texture.magFilter = three.LinearFilter;
            texture.generateMipmaps = true;
            texture.needsUpdate = true;
            uniforms.uTex.value = texture;
            uniforms.uTexSize.value.set(copy.naturalWidth, copy.naturalHeight);
            uniforms.uLevels.value.set(...levelsOf(copy, uniforms.uSize.value, uniforms.uFocus.value, uniforms.uZoom.value));
            uniforms.uLod.value = lod();
            job.dirty = true;
            wrap.dataset.press = state.progress >= 1 ? "printed" : "ready";
            recheck();
            start();
          })
          .catch(() => {
            source = "";
          });
      };

      // The roller only runs once the picture is both loaded and in view.
      const start = () => {
        if (state.started >= 0 || !state.seen || !uniforms.uTex.value) return;
        state.started = performance.now() / 1000;
      };

      resize();
      if (img.complete && img.naturalWidth) upload();
      img.addEventListener("load", upload);
      cleanups.push(() => img.removeEventListener("load", upload));

      const sizer = new ResizeObserver(resize);
      sizer.observe(wrap);
      cleanups.push(() => sizer.disconnect());

      const near = new IntersectionObserver(
        ([entry]) => {
          job.visible = entry.isIntersecting && !!uniforms.uTex.value;
          if (entry.isIntersecting) job.dirty = true;
        },
        { rootMargin: "40% 0px" },
      );
      near.observe(wrap);
      cleanups.push(() => near.disconnect());

      const inView = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          state.seen = true;
          start();
        },
        { threshold: 0.3 },
      );
      if (!still) {
        inView.observe(wrap);
        cleanups.push(() => inView.disconnect());
      }

      // Visibility waits for the texture: re-check once it has arrived.
      const recheck = () => {
        const rect = wrap.getBoundingClientRect();
        const margin = window.innerHeight * 0.4;
        job.visible =
          !!uniforms.uTex.value &&
          rect.bottom > -margin &&
          rect.top < window.innerHeight + margin;
      };
      img.addEventListener("load", recheck);
      cleanups.push(() => img.removeEventListener("load", recheck));
      recheck();

      if (!still) {
        const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
        const local = (event: PointerEvent) => {
          const rect = wrap.getBoundingClientRect();
          uniforms.uPointer.value.set(
            event.clientX - rect.left,
            event.clientY - rect.top,
          );
        };
        const enter = (event: PointerEvent) => {
          if (!fine.matches) return;
          local(event);
          state.hoverTarget = 1;
        };
        const move = (event: PointerEvent) => {
          if (fine.matches) local(event);
        };
        const leave = () => {
          state.hoverTarget = 0;
        };
        // A tap on a touch screen drops one stone into the cup.
        const tap = (event: PointerEvent) => {
          if (fine.matches) return;
          local(event);
          state.pulseUntil = performance.now() / 1000 + 0.9;
        };
        wrap.addEventListener("pointerenter", enter);
        wrap.addEventListener("pointermove", move);
        wrap.addEventListener("pointerleave", leave);
        wrap.addEventListener("pointerdown", tap);
        cleanups.push(() => {
          wrap.removeEventListener("pointerenter", enter);
          wrap.removeEventListener("pointermove", move);
          wrap.removeEventListener("pointerleave", leave);
          wrap.removeEventListener("pointerdown", tap);
        });
      }

      printer.add(job);
      cleanups.push(() => {
        printer.remove(job);
        material.dispose();
        texture?.dispose();
        delete wrap.dataset.press;
      });
    })
    .catch(() => {
      /* The CSS duotone stays: nothing to undo. */
    });

  return () => {
    disposed = true;
    cleanups.splice(0).forEach((cleanup) => cleanup());
  };
}
