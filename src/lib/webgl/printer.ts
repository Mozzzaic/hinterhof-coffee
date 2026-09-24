import type * as THREE from "three";
import { gsap } from "../gsap";
import { screen } from "../ink";
import { loadThree, pressFailed } from "./support";

type Three = typeof import("three");

/**
 * One WebGL context for every printed image and for the footer wordmark.
 *
 * Each job keeps its own ordinary 2D canvas in the page flow, so it scrolls
 * with the DOM natively (no fixed overlay chasing the scroll, no one-frame
 * lag on touch screens). The printer renders a job into the corner of its own
 * off-screen buffer and copies the pixels across. Nothing redraws unless a
 * job is visible and either dirty or animating.
 */
export interface PrintJob {
  /** Visible 2D canvas the print is copied into. */
  canvas: HTMLCanvasElement;
  /** Size in device pixels. */
  width: number;
  height: number;
  material: THREE.ShaderMaterial;
  visible: boolean;
  /** Draw once on the next frame. */
  dirty: boolean;
  /** Keep drawing every frame while this is true. */
  running(now: number): boolean;
  /** Refresh uniforms right before the job is drawn. */
  update?(now: number, dt: number): void;
  /** Off-screen passes a job needs before its final quad. */
  prepass?(printer: Printer, now: number, dt: number): void;
}

export class Printer {
  readonly three: Three;
  readonly renderer: THREE.WebGLRenderer;
  readonly scene: THREE.Scene;
  readonly camera: THREE.Camera;
  readonly quad: THREE.Mesh;
  private jobs = new Set<PrintJob>();
  private contexts = new WeakMap<HTMLCanvasElement, CanvasRenderingContext2D>();
  private bufferWidth = 0;
  private bufferHeight = 0;
  private last = 0;
  private lastScroll = 0;
  /** How fast the page is scrolling, px per second, smoothed. Jobs may read it. */
  speed = 0;

  constructor(three: Three) {
    this.three = three;
    const canvas = document.createElement("canvas");
    this.renderer = new three.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
      powerPreference: "low-power",
    });
    this.renderer.setPixelRatio(1);
    this.renderer.setClearColor(0x000000, 0);
    this.scene = new three.Scene();
    this.camera = new three.Camera();
    this.quad = new three.Mesh(new three.PlaneGeometry(2, 2));
    this.quad.frustumCulled = false;
    this.scene.add(this.quad);
    canvas.addEventListener("webglcontextlost", pressFailed);
    this.lastScroll = window.scrollY;
    // Room for any job up to the size of the screen from the start: growing
    // the buffer mid-scroll reallocates it, a hitch every time.
    const dpr = Math.min(window.devicePixelRatio || 1, screen.maxDprStill);
    this.fit(
      Math.min(4096, Math.ceil(window.innerWidth * dpr)),
      Math.min(4096, Math.ceil(window.innerHeight * dpr)),
    );
    gsap.ticker.add(this.tick);
  }

  add(job: PrintJob) {
    this.jobs.add(job);
    job.dirty = true;
    // Compile the job's shader while the page is idle, not on the frame it
    // first scrolls into view (a compile is a hitch of tens of milliseconds).
    const warm = () => {
      if (!this.jobs.has(job)) return;
      this.quad.material = job.material;
      this.renderer
        .compileAsync(this.scene, this.camera)
        .then(() => {
          // One pixel, drawn once: three checks the program on first use,
          // which waits for the driver. Better now than mid-scroll.
          if (!this.jobs.has(job)) return;
          this.renderer.setRenderTarget(null);
          this.drawQuad(job.material, 1, 1);
          job.dirty = true;
        })
        .catch(() => {});
    };
    if ("requestIdleCallback" in window) window.requestIdleCallback(warm, { timeout: 3000 });
    else setTimeout(warm, 200);
  }

  remove(job: PrintJob) {
    this.jobs.delete(job);
  }

  /** Render a material into the bottom-left corner of the shared buffer. */
  drawQuad(material: THREE.Material, width: number, height: number) {
    this.quad.material = material;
    this.renderer.setViewport(0, 0, width, height);
    this.renderer.setScissor(0, 0, width, height);
    this.renderer.setScissorTest(true);
    this.renderer.render(this.scene, this.camera);
  }

  private fit(width: number, height: number) {
    if (width <= this.bufferWidth && height <= this.bufferHeight) return;
    this.bufferWidth = Math.max(this.bufferWidth, width);
    this.bufferHeight = Math.max(this.bufferHeight, height);
    this.renderer.setSize(this.bufferWidth, this.bufferHeight, false);
  }

  private draw(job: PrintJob, now: number, dt: number) {
    const { width, height } = job;
    if (width < 2 || height < 2) return;
    this.fit(width, height);
    job.prepass?.(this, now, dt);
    this.renderer.setRenderTarget(null);
    this.drawQuad(job.material, width, height);
    let context = this.contexts.get(job.canvas);
    if (!context) {
      context = job.canvas.getContext("2d") ?? undefined;
      if (!context) return;
      this.contexts.set(job.canvas, context);
    }
    context.clearRect(0, 0, width, height);
    context.drawImage(
      this.renderer.domElement,
      0,
      this.bufferHeight - height,
      width,
      height,
      0,
      0,
      width,
      height,
    );
  }

  private tick = () => {
    const now = performance.now() / 1000;
    const dt = Math.min(0.05, this.last ? now - this.last : 0.016);
    this.last = now;
    const scroll = window.scrollY;
    const raw = (scroll - this.lastScroll) / Math.max(dt, 0.001);
    this.lastScroll = scroll;
    this.speed += (raw - this.speed) * (1 - Math.exp(-dt * 10));
    if (Math.abs(this.speed) < 1) this.speed = 0;
    for (const job of this.jobs) {
      if (!job.visible) continue;
      if (!job.dirty && !job.running(now)) continue;
      job.update?.(now, dt);
      this.draw(job, now, dt);
      job.dirty = false;
    }
  };
}

let printer: Promise<Printer> | null = null;

export function getPrinter() {
  printer ??= loadThree().then((three) => new Printer(three));
  return printer;
}
