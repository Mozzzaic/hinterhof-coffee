import type * as THREE from "three";
import { gsap } from "../gsap";
import { cellSize, ink, rgb, screen } from "../ink";
import { BLOCK, buildCourtyard, PATH, STOPS } from "./courtyard-scene";
import { pressChunk, quadVertex } from "./glsl";
import { loadThree, pressFailed, pressOn, reducedMotion } from "./support";

type Three = typeof import("three");

/**
 * The courtyard guide's map, printed live.
 *
 * The block of Oranienstraße 147 seen from above, the houses drawn at a
 * little under half their height so both courtyards open up ("not to
 * scale"). As the map crosses the screen, the way to the café door draws
 * itself on the ground in dashes and the three stops light up; pointing at a
 * stop in the list leans the map toward it.
 *
 * Three passes a frame: the lit scene (tones), an id and normal pass
 * (outlines), and the press, which turns both into dots and lines in the
 * site's two inks. The sun never moves, so its shadows are computed once.
 */

export type CourtyardHost = {
  el: HTMLElement;
  paper: "sky" | "chalk";
  /** 0..1, read every frame. */
  progress: () => number;
  /** 0, 1 or 2: the stop the line has reached. */
  onStation?: (index: number) => void;
  /** The stop pointed at in the guide's list, or -1. Read every frame. */
  focus?: () => number;
};

const DEG = Math.PI / 180;

/** High enough to see down into both courtyards, turning slowly toward the door. */
const MAP = { elevation: 62, azimuth: -30, sweep: 12, squash: 0.45 };

/** Ink id of the drawn route: printed solid, over everything. */
const ROUTE_ID = 254;

const idVertex = /* glsl */ `
varying vec3 vNormal;
void main() {
  vec3 objectNormal = normal;
  vec4 p = vec4(position, 1.0);
  #ifdef USE_INSTANCING
    objectNormal = mat3(instanceMatrix) * objectNormal;
    p = instanceMatrix * p;
  #endif
  vNormal = normalize(normalMatrix * objectNormal);
  gl_Position = projectionMatrix * modelViewMatrix * p;
}
`;

const idFragment = /* glsl */ `
uniform float uId;
varying vec3 vNormal;
void main() {
  gl_FragColor = vec4(normalize(vNormal) * 0.5 + 0.5, uId / 255.0);
}
`;

const pressFragment = /* glsl */ `
uniform sampler2D tColor;
uniform sampler2D tNormal;
uniform sampler2D tDepth;
uniform vec2 uSize;
uniform float uDpr;
uniform float uCell;
uniform float uAngle;
uniform float uDeepAngle;
uniform float uDeepOffset;
uniform vec3 uPaper;
uniform vec3 uInk;
uniform vec3 uDeep;
uniform float uPrint;
uniform float uBoil;
uniform float uNear;
uniform float uFar;
uniform float uExposure;
uniform float uLine;
uniform float uToneFloor;
uniform float uToneGamma;
varying vec2 vUv;

${pressChunk}

vec2 toUv(vec2 px) {
  return vec2(px.x / uSize.x, 1.0 - px.y / uSize.y);
}

float linearDepth(vec2 uv) {
  return uNear + texture2D(tDepth, uv).x * (uFar - uNear);
}

// Average light over the cell, turned into ink.
float toneAt(vec2 px) {
  float q = uCell * 0.25;
  vec3 c = texture2D(tColor, toUv(px + vec2(-q, -q))).rgb
    + texture2D(tColor, toUv(px + vec2(q, -q))).rgb
    + texture2D(tColor, toUv(px + vec2(-q, q))).rgb
    + texture2D(tColor, toUv(px + vec2(q, q))).rgb;
  float l = clamp(c.r * 0.25 * uExposure, 0.0, 1.0);
  float t = 1.0 - pow(l, 1.0 / 2.2);
  // Lit plaster is bare paper: tone only starts where the light drops.
  return pow(clamp((t - uToneFloor) / (1.0 - uToneFloor), 0.0, 1.0), uToneGamma);
}

// Outlines: where the object, the facing or the distance jumps.
float lineAt(vec2 px) {
  vec2 wobble = vec2(
    vnoise(px * 0.045 + uBoil * 13.1),
    vnoise(px * 0.045 + 31.7 + uBoil * 13.1)
  ) - 0.5;
  vec2 p = px + wobble * 2.4;
  vec2 uv = toUv(p);
  float o = uLine * 0.5;
  vec2 dx = vec2(o / uSize.x, 0.0);
  vec2 dy = vec2(0.0, o / uSize.y);
  vec4 c = texture2D(tNormal, uv);
  vec4 a = texture2D(tNormal, uv + dx);
  vec4 b = texture2D(tNormal, uv - dx);
  vec4 e = texture2D(tNormal, uv + dy);
  vec4 f = texture2D(tNormal, uv - dy);
  float ids = step(0.002, abs(a.a - c.a)) + step(0.002, abs(b.a - c.a))
    + step(0.002, abs(e.a - c.a)) + step(0.002, abs(f.a - c.a));
  vec3 n = c.rgb * 2.0 - 1.0;
  float normals = smoothstep(0.92, 0.7, dot(n, a.rgb * 2.0 - 1.0))
    + smoothstep(0.92, 0.7, dot(n, b.rgb * 2.0 - 1.0))
    + smoothstep(0.92, 0.7, dot(n, e.rgb * 2.0 - 1.0))
    + smoothstep(0.92, 0.7, dot(n, f.rgb * 2.0 - 1.0));
  // A flat wall changes depth steadily across the screen, however grazing
  // the angle: only a break in that slope is an edge.
  float d = linearDepth(uv);
  float l = linearDepth(uv - dx);
  float r = linearDepth(uv + dx);
  float u = linearDepth(uv - dy);
  float w = linearDepth(uv + dy);
  float rel = (abs(l + r - 2.0 * d) + abs(u + w - 2.0 * d)) / 14.0;
  float depths = smoothstep(0.035, 0.07, rel);
  // The route is inked solid.
  float route = step(0.99, c.a);
  return max(clamp(ids + normals + depths, 0.0, 1.0), route);
}

void main() {
  vec2 px = vec2(gl_FragCoord.x, uSize.y * uDpr - gl_FragCoord.y) / uDpr;
  float aa = 0.7 / (uDpr * uCell);

  vec2 id1 = cellOf(px, uCell, uAngle);
  vec2 c1 = cellCentre(id1, uCell, uAngle);
  float s1 = clamp(c1.y / uSize.y, 0.0, 1.0);
  float t1 = toneAt(c1) * dotGrowth(id1, s1, uPrint);
  float inkCover = dotAt(px, uCell, uAngle, t1, aa);

  vec2 shift = vec2(uDeepOffset, -uDeepOffset);
  vec2 pd = px + shift;
  vec2 id2 = cellOf(pd, uCell, uDeepAngle);
  vec2 c2 = cellCentre(id2, uCell, uDeepAngle) - shift;
  float s2 = clamp(c2.y / uSize.y, 0.0, 1.0);
  float t2 = smoothstep(0.66, 1.0, toneAt(c2)) * dotGrowth(id2, s2, uPrint);
  float deepCover = dotAt(pd, uCell, uDeepAngle, t2, aa);

  float drawn = step(clamp(px.y / uSize.y, 0.0, 1.0) * 0.9, uPrint);
  float line = lineAt(px) * drawn;

  vec3 colour = mix(mix(uPaper, uInk, inkCover), uDeep, deepCover);
  colour = mix(colour, uInk, line);
  gl_FragColor = vec4(colour, 1.0);
}
`;

class Courtyard {
  private three: Three;
  private renderer: THREE.WebGLRenderer;
  readonly canvas: HTMLCanvasElement;
  private scene: THREE.Scene;
  private meshes: THREE.Mesh[];
  private camera: THREE.OrthographicCamera;
  private litTarget: THREE.WebGLRenderTarget;
  private idTarget: THREE.WebGLRenderTarget;
  private press: THREE.ShaderMaterial;
  private pressScene: THREE.Scene;
  private pressCamera: THREE.Camera;
  private idMaterials = new Map<number, THREE.ShaderMaterial>();
  private litMaterials = new Map<THREE.Mesh, THREE.Material | THREE.Material[]>();
  private trail: THREE.Mesh;
  private trailCount: number;
  private stopsAt: number[];
  private stopPoints: THREE.Vector3[];
  private target: THREE.Vector3;
  /** Where the camera looks now, and how close: eased toward a stop pointed at. */
  private look: THREE.Vector3;
  private goal: THREE.Vector3;
  private zoom = 1;
  private focus = -1;

  private host: CourtyardHost | null = null;
  private printStart = -1;
  private sizer: ResizeObserver;
  private observer: IntersectionObserver;
  private visible = false;
  private still = reducedMotion();

  private route = 0;
  private pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  private station = -1;
  private width = 0;
  private height = 0;
  private dpr = 1;
  private lastInput = 0;
  private lastTick = 0;
  private easing = false;
  private frame = 0;
  /** Under reduced motion the map is a still: draw it once per size or focus. */
  private dirty = true;

  constructor(three: Three) {
    this.three = three;
    this.canvas = document.createElement("canvas");
    this.canvas.className = "ink-canvas courtyard-canvas";
    this.canvas.setAttribute("aria-hidden", "true");
    this.renderer = new three.WebGLRenderer({
      canvas: this.canvas,
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(1);
    this.renderer.setClearColor(0xffffff, 1);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = three.PCFShadowMap;
    this.renderer.shadowMap.autoUpdate = false;
    this.renderer.shadowMap.needsUpdate = true;
    this.canvas.addEventListener("webglcontextlost", pressFailed);

    const built = buildCourtyard(three);
    this.scene = built.scene;
    this.meshes = built.meshes;
    // The houses at a little under half their height: the courtyards open up.
    built.world.scale.y = MAP.squash;
    built.world.updateMatrixWorld(true);
    this.camera = new three.OrthographicCamera(-1, 1, 1, -1, 1, 320);
    this.target = new three.Vector3(
      (BLOCK.minX + BLOCK.maxX) / 2,
      0,
      (BLOCK.minZ + PATH[0][1]) / 2,
    );
    this.look = this.target.clone();
    this.goal = this.target.clone();

    // The way to the door, dashed on the ground like a hand-drawn guide, and
    // over everything: under the passages too.
    const ground = new three.CatmullRomCurve3(
      PATH.map(([x, z]) => new three.Vector3(x, 0.06, z)),
      false,
      "centripetal",
    );
    const segments = 240;
    const radial = 6;
    const trailGeometry = new three.TubeGeometry(ground, segments, 0.32, radial, false);
    const solid = trailGeometry.index!.array;
    const dashed: number[] = [];
    const perSegment = radial * 6;
    for (let segment = 0; segment < segments; segment++) {
      // Four segments inked, three left blank.
      if (segment % 7 > 3) continue;
      for (let k = 0; k < perSegment; k++) dashed.push(solid[segment * perSegment + k]);
    }
    trailGeometry.setIndex(dashed);
    this.trailCount = dashed.length;
    this.trail = new three.Mesh(
      trailGeometry,
      new three.MeshBasicMaterial({ color: 0x000000, depthTest: false }),
    );
    this.trail.userData.ink = ROUTE_ID;
    this.trail.renderOrder = 10;
    this.trail.frustumCulled = false;
    this.scene.add(this.trail);
    this.meshes.push(this.trail);
    // Where along the line each stop sits.
    const samples = ground.getSpacedPoints(400);
    this.stopPoints = STOPS.map(([x, z]) => new three.Vector3(x, 0, z));
    this.stopsAt = STOPS.map(([x, z]) => {
      let best = 0;
      let bestDistance = Infinity;
      samples.forEach((point, index) => {
        const distance = Math.hypot(point.x - x, point.z - z);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = index / (samples.length - 1);
        }
      });
      return best;
    });

    this.litTarget = new three.WebGLRenderTarget(2, 2, {
      type: three.HalfFloatType,
    });
    this.idTarget = new three.WebGLRenderTarget(2, 2, {
      depthTexture: new three.DepthTexture(2, 2),
    });

    for (const mesh of this.meshes) {
      const id = mesh.userData.ink as number;
      let material = this.idMaterials.get(id);
      if (!material) {
        material = new three.ShaderMaterial({
          vertexShader: idVertex,
          fragmentShader: idFragment,
          uniforms: { uId: { value: id === ROUTE_ID ? id : id % 250 } },
          blending: three.NoBlending,
          depthTest: id !== ROUTE_ID,
        });
        this.idMaterials.set(id, material);
      }
      this.litMaterials.set(mesh, mesh.material);
    }

    this.press = new three.ShaderMaterial({
      vertexShader: quadVertex,
      fragmentShader: pressFragment,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        tColor: { value: this.litTarget.texture },
        tNormal: { value: this.idTarget.texture },
        tDepth: { value: this.idTarget.depthTexture },
        uSize: { value: new three.Vector2(1, 1) },
        uDpr: { value: 1 },
        uCell: { value: cellSize() },
        uAngle: { value: screen.angle * DEG },
        uDeepAngle: { value: screen.deepAngle * DEG },
        uDeepOffset: { value: screen.deepOffset },
        uPaper: { value: new three.Vector3(...rgb(ink.sky)) },
        uInk: { value: new three.Vector3(...rgb(ink.ink)) },
        uDeep: { value: new three.Vector3(...rgb(ink.deep)) },
        uPrint: { value: 0 },
        uBoil: { value: 0 },
        uNear: { value: this.camera.near },
        uFar: { value: this.camera.far },
        uExposure: { value: 1.3 },
        uLine: { value: 1.6 },
        uToneFloor: { value: 0.18 },
        uToneGamma: { value: 1.1 },
      },
    });
    this.pressScene = new three.Scene();
    const quad = new three.Mesh(new three.PlaneGeometry(2, 2), this.press);
    quad.frustumCulled = false;
    this.pressScene.add(quad);
    this.pressCamera = new three.Camera();

    this.sizer = new ResizeObserver(() => this.resize());
    this.observer = new IntersectionObserver(
      ([entry]) => {
        this.visible = entry.isIntersecting;
        this.dirty = true;
      },
      { rootMargin: "35% 0px" },
    );

    window.addEventListener("pointermove", this.onPointer, { passive: true });
    window.addEventListener("scroll", this.onScroll, { passive: true });
    gsap.ticker.add(this.tick);
  }

  register(host: CourtyardHost) {
    this.host = host;
    host.el.appendChild(this.canvas);
    this.press.uniforms.uPaper.value.set(...rgb(ink[host.paper]));
    this.observer.observe(host.el);
    this.sizer.observe(host.el);
    this.printStart = this.still ? -1 : performance.now() / 1000;
    this.press.uniforms.uPrint.value = this.still ? 1 : 0;
    this.route = this.goalRoute();
    this.width = 0;
    this.resize();
    host.el.dataset.courtyard = "ready";
    // Compile every shader of the map while the page is idle, so the first
    // frame it scrolls into view is not the frame that pays for it.
    const warm = () => {
      if (this.host !== host) return;
      this.passes();
      this.dirty = true;
    };
    if ("requestIdleCallback" in window) window.requestIdleCallback(warm, { timeout: 4000 });
    else setTimeout(warm, 300);
    return () => {
      this.observer.unobserve(host.el);
      this.sizer.disconnect();
      this.canvas.remove();
      delete host.el.dataset.courtyard;
      if (this.host === host) this.host = null;
    };
  }

  private resize() {
    const host = this.host;
    if (!host) return;
    const rect = host.el.getBoundingClientRect();
    this.dpr = Math.min(window.devicePixelRatio || 1, screen.maxDpr);
    const width = Math.max(2, Math.round(rect.width * this.dpr));
    const height = Math.max(2, Math.round(rect.height * this.dpr));
    if (width === this.width && height === this.height) return;
    this.width = width;
    this.height = height;
    this.dirty = true;
    this.renderer.setSize(width, height, false);
    this.litTarget.setSize(Math.ceil(width / 2), Math.ceil(height / 2));
    this.idTarget.setSize(width, height);
    this.fit(width / height);
    const uniforms = this.press.uniforms;
    uniforms.uSize.value.set(width / this.dpr, height / this.dpr);
    uniforms.uDpr.value = this.dpr;
    uniforms.uCell.value = cellSize();
  }

  /** Point the camera: azimuth and elevation in degrees. */
  private aim(azimuth: number, elevation: number, target = this.target) {
    const distance = 150;
    const a = azimuth * DEG;
    const e = elevation * DEG;
    this.camera.position.set(
      target.x + Math.sin(a) * Math.cos(e) * distance,
      target.y + Math.sin(e) * distance,
      target.z + Math.cos(a) * Math.cos(e) * distance,
    );
    this.camera.lookAt(target);
    this.camera.updateMatrixWorld();
  }

  /** Frame the whole block and the way in, whatever the shape of the box. */
  private fit(aspect: number) {
    this.aim(MAP.azimuth + MAP.sweep / 2, MAP.elevation);
    const view = this.camera.matrixWorldInverse;
    const point = new this.three.Vector3();
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    const include = (x: number, y: number, z: number) => {
      point.set(x, y, z).applyMatrix4(view);
      minX = Math.min(minX, point.x);
      maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
    };
    for (const x of [BLOCK.minX, BLOCK.maxX])
      for (const z of [BLOCK.minZ, BLOCK.maxZ])
        for (const y of [0, BLOCK.height * MAP.squash]) include(x, y, z);
    for (const [x, z] of PATH) include(x, 0, z);
    const content = Math.max((maxY - minY) / 2, (maxX - minX) / 2 / aspect) * 1.08;
    // The frame is an arch: keep its rounded top corners clear by sitting the
    // block a little lower.
    const lift = content * (aspect < 1 ? 0.16 : 0.08);
    const half = content + lift;
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2 + lift;
    this.camera.left = cx - half * aspect;
    this.camera.right = cx + half * aspect;
    this.camera.top = cy + half;
    this.camera.bottom = cy - half;
    this.camera.updateProjectionMatrix();
  }

  private onPointer = (event: PointerEvent) => {
    if (event.pointerType !== "mouse" || this.still) return;
    this.pointer.tx = (event.clientX / window.innerWidth) * 2 - 1;
    this.pointer.ty = (event.clientY / window.innerHeight) * 2 - 1;
    this.lastInput = performance.now();
  };

  private onScroll = () => {
    this.lastInput = performance.now();
  };

  private goalRoute() {
    if (!this.host || this.still) return 1;
    return Math.min(1, Math.max(0, this.host.progress()));
  }

  /** Camera, line and stop markers for this frame. Returns the stop reached. */
  private overhead(progress: number, host: CourtyardHost, ease: number) {
    // A stop pointed at in the list: lean toward it and come a little closer.
    const focus = host.focus?.() ?? -1;
    if (focus !== this.focus) {
      this.focus = focus;
      this.lastInput = performance.now();
    }
    this.goal.copy(this.target);
    if (focus >= 0) this.goal.lerp(this.stopPoints[focus], 0.35);
    const zoom = focus >= 0 ? 1.2 : 1;
    this.look.lerp(this.goal, ease);
    this.zoom += (zoom - this.zoom) * ease;
    this.easing =
      this.look.distanceToSquared(this.goal) > 1e-4 || Math.abs(zoom - this.zoom) > 1e-3;
    if (Math.abs(this.camera.zoom - this.zoom) > 1e-4) {
      this.camera.zoom = this.zoom;
      this.camera.updateProjectionMatrix();
    }
    this.aim(
      MAP.azimuth + progress * MAP.sweep + this.pointer.x * 3,
      MAP.elevation - this.pointer.y * 2,
      this.look,
    );
    // The line draws itself along the way.
    const drawn = Math.round(this.trailCount * Math.min(1, progress * 1.08));
    this.trail.geometry.setDrawRange(0, drawn - (drawn % 3));
    // Pin the three stops on the page, in the host's own pixels.
    const point = new this.three.Vector3();
    const w = this.width / this.dpr;
    const h = this.height / this.dpr;
    this.stopPoints.forEach((stop, index) => {
      point.copy(stop).project(this.camera);
      host.el.style.setProperty(`--stop-${index}-x`, `${((point.x + 1) / 2) * w}px`);
      host.el.style.setProperty(`--stop-${index}-y`, `${((1 - point.y) / 2) * h}px`);
    });
    return this.stopsAt.filter((at) => progress * 1.08 >= at).length - 1;
  }

  private tick = () => {
    const host = this.host;
    if (!host || !this.visible || document.hidden) return;
    const rect = host.el.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;
    // A still map is redrawn only when something asks: a new size, or a stop
    // pointed at.
    if (this.still && !this.dirty && (host.focus?.() ?? -1) === this.focus) return;
    this.dirty = false;

    const now = performance.now();
    const time = now / 1000;
    const printing = this.printStart >= 0 && this.press.uniforms.uPrint.value < 1;
    const goal = this.goalRoute();
    // At rest nothing moves faster than the pencil boil: draw at its rate
    // (8 frames a second) and let the battery be. Not while the map is still
    // easing to where the scroll left it.
    const idle =
      now - this.lastInput > 1200 &&
      !printing &&
      !this.easing &&
      Math.abs(goal - this.route) < 1e-3;
    const boil = Math.floor(time * screen.boilFps);
    if (idle && boil === this.frame) return;
    this.frame = boil;
    // Time-based easing, so a slow device arrives as surely as a fast one.
    const dt = Math.min(0.1, this.lastTick > 0 ? time - this.lastTick : 1 / 60);
    this.lastTick = time;
    const follow = (rate: number) => (this.still ? 1 : 1 - Math.exp(-dt * rate));
    this.pointer.x += (this.pointer.tx - this.pointer.x) * follow(3);
    this.pointer.y += (this.pointer.ty - this.pointer.y) * follow(3);
    this.route += (goal - this.route) * follow(5.5);

    const reached = this.overhead(this.route, host, follow(5));
    if (reached !== this.station) {
      this.station = reached;
      host.onStation?.(reached);
    }

    const uniforms = this.press.uniforms;
    if (printing) {
      const t = Math.min(1, (time - this.printStart) / 1.4);
      uniforms.uPrint.value = 1 - Math.pow(1 - t, 3.2);
    }
    uniforms.uBoil.value = this.still ? 0 : boil;

    this.passes();
  };

  /** The three passes: tones, outlines, the press. */
  private passes() {
    const renderer = this.renderer;
    // Lit pass: tones.
    for (const mesh of this.meshes) mesh.material = this.litMaterials.get(mesh)!;
    renderer.setRenderTarget(this.litTarget);
    renderer.render(this.scene, this.camera);
    // Id pass: outlines.
    for (const mesh of this.meshes)
      mesh.material = this.idMaterials.get(mesh.userData.ink as number)!;
    renderer.setClearColor(0x8080ff, 0);
    renderer.setRenderTarget(this.idTarget);
    renderer.render(this.scene, this.camera);
    renderer.setClearColor(0xffffff, 1);
    // The press.
    renderer.setRenderTarget(null);
    renderer.render(this.pressScene, this.pressCamera);
  }
}

let courtyard: Promise<Courtyard> | null = null;

/** Hand a place on the page to the map. Returns the way to take it back. */
export function mountCourtyard(host: CourtyardHost): () => void {
  if (!pressOn()) return () => {};
  let release: (() => void) | null = null;
  let cancelled = false;
  courtyard ??= loadThree().then((three) => new Courtyard(three));
  courtyard
    .then((instance) => {
      if (!cancelled) release = instance.register(host);
    })
    .catch(() => pressFailed());
  return () => {
    cancelled = true;
    release?.();
  };
}
