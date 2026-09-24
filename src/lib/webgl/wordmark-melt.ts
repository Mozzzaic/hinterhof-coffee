import type * as THREE from "three";
import { cellSize, ink, rgb, screen } from "../ink";
import { WORDMARK_PATH, WORDMARK_VIEWBOX } from "../wordmark";
import { pressChunk, quadVertex } from "./glsl";
import { getPrinter, type PrintJob } from "./printer";
import { pressOn, reducedMotion } from "./support";

/**
 * The wordmark, still wet (hero and footer).
 *
 * The letters sit there as solid ink. Drag the pointer through them and the
 * ink smears the way it would on a fresh print: the letters stretch along
 * the stroke, sag a little, and where they are disturbed they break up into
 * halftone dots. Left alone, they settle back into their shape.
 *
 * A small displacement field (a quarter of the canvas resolution) carries
 * the smear and relaxes over a couple of seconds.
 */

const fieldFragment = /* glsl */ `
uniform sampler2D tField;
uniform vec2 uFieldSize;
uniform vec2 uPointer;
uniform vec2 uPrevious;
uniform float uAspect;
uniform float uForce;
uniform float uPress;
varying vec2 vUv;

void main() {
  vec2 texel = 1.0 / uFieldSize;
  vec2 f = texture2D(tField, vUv).xy;
  vec2 around = texture2D(tField, vUv + vec2(texel.x, 0.0)).xy
    + texture2D(tField, vUv - vec2(texel.x, 0.0)).xy
    + texture2D(tField, vUv + vec2(0.0, texel.y)).xy
    + texture2D(tField, vUv - vec2(0.0, texel.y)).xy;
  f = mix(f, around * 0.25, 0.3);

  vec2 scale = vec2(uAspect, 1.0);
  vec2 pa = (vUv - uPrevious) * scale;
  vec2 ba = (uPointer - uPrevious) * scale;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);
  float d = length(pa - ba * h);
  float brush = exp(-(d * d) / 0.012) * uForce;
  f += (uPointer - uPrevious) * brush * 0.9;

  // A fingertip pressed into the wet ink pushes it out all around.
  vec2 away = (vUv - uPointer) * scale;
  float pressed = exp(-dot(away, away) / 0.04) * uPress;
  f += normalize(away + vec2(1e-5)) / scale * pressed * 0.03;

  // Wet ink sags.
  f.y -= length(f) * 0.02;
  f *= 0.972;
  f = clamp(f, vec2(-0.09), vec2(0.09));
  gl_FragColor = vec4(f, 0.0, 1.0);
}
`;

const inkFragment = /* glsl */ `
uniform sampler2D tMask;
uniform sampler2D tField;
uniform vec2 uSize;
uniform float uDpr;
uniform float uCell;
uniform float uAngle;
uniform vec3 uLetters;
varying vec2 vUv;

${pressChunk}

float maskAt(vec2 uv) {
  return texture2D(tMask, uv).r;
}

void main() {
  vec2 px = vec2(gl_FragCoord.x, uSize.y * uDpr - gl_FragCoord.y) / uDpr;
  vec2 uv = vec2(px.x / uSize.x, 1.0 - px.y / uSize.y);
  vec2 f = texture2D(tField, uv).xy;
  float wet = clamp(length(f * vec2(uSize.x / uSize.y, 1.0)) * 16.0, 0.0, 1.0);
  vec2 s = uv - f;
  vec2 r = vec2(1.0 / uSize.x, 1.0 / uSize.y) * (0.6 + wet * 5.0);
  float m = maskAt(s) * 0.36
    + (maskAt(s + vec2(r.x, 0.0)) + maskAt(s - vec2(r.x, 0.0))
      + maskAt(s + vec2(0.0, r.y)) + maskAt(s - vec2(0.0, r.y))) * 0.16;
  float edge = 0.5 / (uDpr * 2.0);
  float solid = smoothstep(0.5 - edge, 0.5 + edge, m);
  float aa = 0.7 / (uDpr * uCell);
  float dots = dotAt(px, uCell, uAngle, smoothstep(0.1, 0.9, m), aa);
  float cover = mix(solid, dots, wet);
  gl_FragColor = vec4(uLetters * cover, cover);
}
`;

export function attachMelt(options: {
  wrap: HTMLElement;
  canvas: HTMLCanvasElement;
  /** Ink of the letters: blue on the pale pages, pale on the blue footer. */
  letters?: "ink" | "sky";
  /** Hand over from the SVG only after its own entrance has played (ms). */
  delay?: number;
}): () => void {
  if (!pressOn() || reducedMotion()) return () => {};
  const { wrap, canvas } = options;
  const cleanups: Array<() => void> = [];
  let disposed = false;

  getPrinter()
    .then((printer) => {
      if (disposed) return;
      const three = printer.three;
      const mask = document.createElement("canvas");
      const maskTexture = new three.CanvasTexture(mask);
      maskTexture.colorSpace = three.NoColorSpace;
      maskTexture.generateMipmaps = false;
      maskTexture.minFilter = three.LinearFilter;

      const fieldOptions = {
        type: three.HalfFloatType,
        depthBuffer: false,
        minFilter: three.LinearFilter,
        magFilter: three.LinearFilter,
      };
      let read = new three.WebGLRenderTarget(2, 2, fieldOptions);
      let write = new three.WebGLRenderTarget(2, 2, fieldOptions);

      const field = new three.ShaderMaterial({
        vertexShader: quadVertex,
        fragmentShader: fieldFragment,
        blending: three.NoBlending,
        depthTest: false,
        depthWrite: false,
        uniforms: {
          tField: { value: read.texture as THREE.Texture },
          uFieldSize: { value: new three.Vector2(2, 2) },
          uPointer: { value: new three.Vector2(-1, -1) },
          uPrevious: { value: new three.Vector2(-1, -1) },
          uAspect: { value: 1 },
          uForce: { value: 0 },
          uPress: { value: 0 },
        },
      });

      const material = new three.ShaderMaterial({
        vertexShader: quadVertex,
        fragmentShader: inkFragment,
        blending: three.NoBlending,
        depthTest: false,
        depthWrite: false,
        uniforms: {
          tMask: { value: maskTexture },
          tField: { value: read.texture as THREE.Texture },
          uSize: { value: new three.Vector2(1, 1) },
          uDpr: { value: 1 },
          uCell: { value: cellSize() },
          uAngle: { value: (screen.angle * Math.PI) / 180 },
          uLetters: { value: new three.Vector3(...rgb(ink[options.letters ?? "sky"])) },
        },
      });

      const pointer = { x: -1, y: -1, px: -1, py: -1, moved: 0, inside: false };
      // A press (a tap, a click) blooms the ink under it, then lets go.
      let press = 0;
      let wetUntil = 0;
      let settled = true;
      let fieldW = 2;
      let fieldH = 2;
      let cleared = false;
      // The canvas replaces the SVG only once it holds pixels, so the swap
      // can never show an empty frame.
      let handOverPending = false;

      const clearField = (renderer: THREE.WebGLRenderer) => {
        renderer.setClearColor(0x000000, 0);
        for (const target of [read, write]) {
          renderer.setRenderTarget(target);
          renderer.clear();
        }
        cleared = true;
      };

      const job: PrintJob = {
        canvas,
        width: 0,
        height: 0,
        material,
        visible: false,
        dirty: true,
        running: (now) => {
          if (now < wetUntil) {
            settled = false;
            return true;
          }
          // Once dry, wipe what is left of the smear and print the letters
          // one last time, exactly as they were.
          if (!settled) {
            settled = true;
            cleared = false;
            job.dirty = true;
          }
          return false;
        },
        prepass: (p, now) => {
          const renderer = p.renderer;
          if (!cleared) clearField(renderer);
          const uniforms = field.uniforms;
          uniforms.tField.value = read.texture;
          uniforms.uPointer.value.set(pointer.x, pointer.y);
          uniforms.uPrevious.value.set(
            pointer.px < 0 ? pointer.x : pointer.px,
            pointer.py < 0 ? pointer.y : pointer.py,
          );
          uniforms.uForce.value = pointer.inside && now - pointer.moved < 0.08 ? 1 : 0;
          uniforms.uPress.value = press;
          press = press > 0.02 ? press * 0.9 : 0;
          pointer.px = pointer.x;
          pointer.py = pointer.y;
          renderer.setRenderTarget(write);
          p.drawQuad(field, fieldW, fieldH);
          [read, write] = [write, read];
          material.uniforms.tField.value = read.texture;
          // The final quad is drawn and copied right after, in this same task.
          if (handOverPending) {
            handOverPending = false;
            wrap.dataset.press = "ready";
          }
        },
      };

      const rasterise = (width: number, height: number) => {
        // Texture storage is immutable: a new size needs a new texture.
        if (mask.width !== width || mask.height !== height) maskTexture.dispose();
        mask.width = width;
        mask.height = height;
        const context = mask.getContext("2d");
        if (!context) return;
        context.fillStyle = "black";
        context.fillRect(0, 0, width, height);
        const box = WORDMARK_VIEWBOX;
        const scale = Math.min(width / box.width, height / box.height);
        const offsetX = (width - box.width * scale) / 2;
        const offsetY = (height - box.height * scale) / 2;
        context.setTransform(
          scale,
          0,
          0,
          scale,
          offsetX - box.x * scale,
          offsetY - box.y * scale,
        );
        context.fillStyle = "white";
        context.fill(new Path2D(WORDMARK_PATH));
        maskTexture.needsUpdate = true;
      };

      const resize = () => {
        const rect = wrap.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, screen.maxDprStill);
        const width = Math.max(2, Math.round(rect.width * dpr));
        const height = Math.max(2, Math.round(rect.height * dpr));
        canvas.width = width;
        canvas.height = height;
        job.width = width;
        job.height = height;
        material.uniforms.uSize.value.set(width / dpr, height / dpr);
        material.uniforms.uDpr.value = dpr;
        material.uniforms.uCell.value = cellSize();
        rasterise(width, height);
        fieldW = Math.max(2, Math.ceil(width / 4));
        fieldH = Math.max(2, Math.ceil(height / 4));
        read.setSize(fieldW, fieldH);
        write.setSize(fieldW, fieldH);
        field.uniforms.uFieldSize.value.set(fieldW, fieldH);
        field.uniforms.uAspect.value = width / height;
        cleared = false;
        job.dirty = true;
      };

      const move = (event: PointerEvent) => {
        const rect = wrap.getBoundingClientRect();
        pointer.x = (event.clientX - rect.left) / rect.width;
        pointer.y = 1 - (event.clientY - rect.top) / rect.height;
        if (!pointer.inside) {
          pointer.px = pointer.x;
          pointer.py = pointer.y;
        }
        pointer.inside = true;
        const now = performance.now() / 1000;
        pointer.moved = now;
        wetUntil = now + 3.2;
      };
      const leave = () => {
        pointer.inside = false;
      };
      const down = (event: PointerEvent) => {
        const rect = wrap.getBoundingClientRect();
        pointer.x = (event.clientX - rect.left) / rect.width;
        pointer.y = 1 - (event.clientY - rect.top) / rect.height;
        pointer.px = pointer.x;
        pointer.py = pointer.y;
        press = 1;
        wetUntil = performance.now() / 1000 + 3.2;
      };

      resize();
      const sizer = new ResizeObserver(resize);
      sizer.observe(wrap);
      const near = new IntersectionObserver(
        ([entry]) => {
          job.visible = entry.isIntersecting;
          job.dirty = true;
        },
        { rootMargin: "20% 0px" },
      );
      near.observe(wrap);
      wrap.addEventListener("pointermove", move);
      wrap.addEventListener("pointerleave", leave);
      wrap.addEventListener("pointerdown", down);
      printer.add(job);
      const handOver = window.setTimeout(() => {
        handOverPending = true;
        job.dirty = true;
      }, options.delay ?? 0);

      cleanups.push(() => {
        window.clearTimeout(handOver);
        printer.remove(job);
        sizer.disconnect();
        near.disconnect();
        wrap.removeEventListener("pointermove", move);
        wrap.removeEventListener("pointerleave", leave);
        wrap.removeEventListener("pointerdown", down);
        material.dispose();
        field.dispose();
        maskTexture.dispose();
        read.dispose();
        write.dispose();
        delete wrap.dataset.press;
      });
    })
    .catch(() => {
      /* The SVG wordmark stays. */
    });

  return () => {
    disposed = true;
    cleanups.splice(0).forEach((cleanup) => cleanup());
  };
}
