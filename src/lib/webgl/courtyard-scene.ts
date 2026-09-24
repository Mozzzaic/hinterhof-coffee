import type * as THREE from "three";

type Three = typeof import("three");

/**
 * The courtyard, built from boxes and one arch, for the guide's map.
 *
 * Oranienstraße 147 as the copy describes it: a street front with an arched
 * passage, a first courtyard with the bins and a tree, a second passage, and
 * the second courtyard with the lit door on the right. Metres, y up, the
 * street facade on z = 0, the way in heading towards -z.
 *
 * The arch is the brand mark's own proportion: a half circle on legs a
 * little taller than its radius (ArchMark.tsx: radius 13, legs 15).
 *
 * Every mesh carries an ink id. The post pass draws a line wherever the id
 * changes, which is how the drawing gets its outlines.
 */

/** The way in, drawn on the ground (x, z). */
export const PATH: [number, number][] = [
  [0, 12.5],
  [0, 5],
  [0, -3],
  [0.3, -10],
  [0.9, -15.5],
  [0.2, -22],
  [0, -27.5],
  [0, -33],
  [1.2, -36.6],
  [4.2, -39.4],
  [6.7, -40.2],
];

/** Where the three stops of the guide stand on the ground (x, z). */
export const STOPS: [number, number][] = [
  [0, 9.5],
  [-1.6, -18.6],
  [6.2, -40.2],
];

/** What the map has to frame: the houses of the block (the way in is added). */
export const BLOCK = { minX: -17, maxX: 17, minZ: -51, maxZ: 0, height: 17.8 };

const ARCH_RATIO = 15 / 13;

/** A wall seen from the front, with an arched passage cut up from its bottom edge. */
function wallWithArch(
  three: Three,
  halfWidth: number,
  height: number,
  archWidth: number,
) {
  const radius = archWidth / 2;
  const legs = radius * ARCH_RATIO;
  const shape = new three.Shape();
  shape.moveTo(-halfWidth, 0);
  shape.lineTo(-radius, 0);
  shape.lineTo(-radius, legs);
  shape.absarc(0, legs, radius, Math.PI, 0, true);
  shape.lineTo(radius, 0);
  shape.lineTo(halfWidth, 0);
  shape.lineTo(halfWidth, height);
  shape.lineTo(-halfWidth, height);
  shape.closePath();
  return shape;
}

/** The arch outline on its own: a door, a glowing opening. */
function archOutline(three: Three, width: number) {
  const radius = width / 2;
  const legs = radius * ARCH_RATIO;
  const shape = new three.Shape();
  shape.moveTo(-radius, 0);
  shape.lineTo(-radius, legs);
  shape.absarc(0, legs, radius, Math.PI, 0, true);
  shape.lineTo(radius, 0);
  shape.closePath();
  return shape;
}

export type CourtyardScene = {
  scene: THREE.Scene;
  /** Everything built, without the lights: the map squashes it in height. */
  world: THREE.Group;
  meshes: THREE.Mesh[];
  sun: THREE.DirectionalLight;
  ids: number;
};

export function buildCourtyard(three: Three): CourtyardScene {
  const scene = new three.Scene();
  const world = new three.Group();
  scene.add(world);
  const meshes: THREE.Mesh[] = [];
  let nextId = 1;

  const wall = new three.MeshLambertMaterial({ color: 0xffffff });
  const stone = new three.MeshLambertMaterial({ color: 0xe8e8e8 });
  const glass = new three.MeshLambertMaterial({ color: 0x3a3a3a });
  const dark = new three.MeshLambertMaterial({ color: 0x777777 });
  const leaf = new three.MeshLambertMaterial({ color: 0xb4b4b4 });
  const glow = new three.MeshBasicMaterial({ color: 0xffffff });
  // Foliage is drawn in lobes, the way a pencil draws leaves: overlapping
  // round shapes whose meeting lines become the drawing.
  const lobe = new three.SphereGeometry(1, 20, 14);

  /** Give a mesh its ink id and its shadows, wherever it hangs in the graph. */
  const register = <T extends THREE.Mesh>(mesh: T, id = nextId++) => {
    mesh.userData.ink = id;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    meshes.push(mesh);
    return mesh;
  };

  const add = <T extends THREE.Mesh>(mesh: T, id = nextId++) => {
    world.add(mesh);
    return register(mesh, id);
  };

  const box = (
    w: number,
    h: number,
    d: number,
    x: number,
    y: number,
    z: number,
    material: THREE.Material = wall,
    id?: number,
  ) => {
    const mesh = new three.Mesh(new three.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z);
    return add(mesh, id);
  };

  /** Rows of windows on a facade, instanced: panes, sills and lintels. */
  const windows = (
    placements: { x: number; y: number; w: number; h: number }[],
    frame: THREE.Matrix4,
  ) => {
    const unit = new three.BoxGeometry(1, 1, 1);
    const panes = new three.InstancedMesh(unit, glass, placements.length);
    const sills = new three.InstancedMesh(unit, stone, placements.length);
    const lintels = new three.InstancedMesh(unit, stone, placements.length);
    const m = new three.Matrix4();
    const local = new three.Matrix4();
    placements.forEach((p, i) => {
      local.compose(
        new three.Vector3(p.x, p.y + p.h / 2, 0.02),
        new three.Quaternion(),
        new three.Vector3(p.w, p.h, 0.2),
      );
      panes.setMatrixAt(i, m.multiplyMatrices(frame, local));
      local.compose(
        new three.Vector3(p.x, p.y - 0.07, 0.14),
        new three.Quaternion(),
        new three.Vector3(p.w + 0.36, 0.14, 0.34),
      );
      sills.setMatrixAt(i, m.multiplyMatrices(frame, local));
      local.compose(
        new three.Vector3(p.x, p.y + p.h + 0.16, 0.08),
        new three.Quaternion(),
        new three.Vector3(p.w + 0.24, 0.32, 0.18),
      );
      lintels.setMatrixAt(i, m.multiplyMatrices(frame, local));
    });
    add(panes);
    add(sills);
    add(lintels);
  };

  /** A regular Altbau grid: floors above a ground floor, columns across. */
  const grid = (
    columns: number[],
    floors: number,
    groundHeight: number,
    floorHeight: number,
    skip: (x: number, floor: number) => boolean = () => false,
  ) => {
    const out: { x: number; y: number; w: number; h: number }[] = [];
    for (let floor = 0; floor < floors; floor++) {
      for (const x of columns) {
        if (skip(x, floor)) continue;
        out.push({
          x,
          y: groundHeight + floor * floorHeight + 0.85,
          w: 1.3,
          h: 1.95,
        });
      }
    }
    return out;
  };

  const facing = (x: number, z: number, rotationY: number) =>
    new three.Matrix4().compose(
      new three.Vector3(x, 0, z),
      new three.Quaternion().setFromAxisAngle(new three.Vector3(0, 1, 0), rotationY),
      new three.Vector3(1, 1, 1),
    );

  const GROUND = 5.2;
  const FLOOR = 3.05;
  const HEIGHT = GROUND + FLOOR * 4 + 0.4;

  // ---- The ground: street, pavement, both courtyards ------------------------
  // Far wider than anything looks at, so no view ever finds its edge.
  const ground = new three.Mesh(new three.PlaneGeometry(400, 400), stone);
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, 0, -10);
  add(ground).castShadow = false;
  // Kerb between pavement and street.
  box(240, 0.14, 0.32, 0, 0.07, 6.2, stone);
  box(240, 0.02, 0.2, 0, 0.01, 11.5, glass).castShadow = false;

  // ---- Vorderhaus: the street front and the first passage -------------------
  const front = new three.Mesh(
    new three.ExtrudeGeometry(wallWithArch(three, 13, HEIGHT, 4.4), {
      depth: 9,
      bevelEnabled: false,
      curveSegments: 28,
    }),
    wall,
  );
  front.position.z = -9;
  add(front);
  // Its windows and ledges are left out: from above, squashed, they would
  // print as one dark band along the street.

  // ---- First courtyard ------------------------------------------------------
  // Side wings, windows facing into the yard.
  box(8, HEIGHT, 18, -13, HEIGHT / 2, -18);
  box(8, HEIGHT, 18, 13, HEIGHT / 2, -18);
  const sideColumns = [-11.5, -15.5, -19.5, -23.5];
  windows(
    grid(sideColumns.map((z) => -z), 5, 0.4, FLOOR),
    facing(-9, 0, Math.PI / 2),
  );
  windows(
    grid(sideColumns, 5, 0.4, FLOOR),
    facing(9, 0, -Math.PI / 2),
  );
  // Quergebaeude with the second, lower passage.
  const middle = new three.Mesh(
    new three.ExtrudeGeometry(wallWithArch(three, 17, HEIGHT - 1.2, 3.4), {
      depth: 7,
      bevelEnabled: false,
      curveSegments: 24,
    }),
    wall,
  );
  middle.position.z = -34;
  add(middle);
  windows(
    grid([-7.5, -3.8, 3.8, 7.5], 4, GROUND - 0.6, FLOOR).concat(
      grid([0], 4, GROUND - 0.6, FLOOR),
    ),
    facing(0, -27, 0),
  );
  // The bins, left of the path: "walk past the bins".
  for (const [i, z] of [-17.2, -18.5, -19.8].entries()) {
    box(1.0, 1.1, 1.0, -6.2, 0.55, z, dark, 60);
    const lid = box(1.08, 0.1, 1.12, -6.2, 1.15, z, stone, 61);
    if (i === 1) {
      lid.rotation.z = -0.38;
      lid.position.set(-6.0, 1.3, z);
    }
  }
  // The courtyard tree: a trunk and a crown of lobes.
  box(0.34, 4.6, 0.34, 5.2, 2.3, -20.5, dark, 70);
  for (const [x, y, z, r] of [
    [5.2, 6.7, -20.5, 2.0],
    [3.7, 5.7, -19.7, 1.5],
    [6.6, 5.8, -21.1, 1.6],
    [4.5, 7.7, -21.6, 1.5],
    [6.2, 7.6, -19.5, 1.4],
    [4.8, 5.3, -21.9, 1.3],
    [5.9, 5.1, -19.2, 1.2],
  ] as const) {
    const part = new three.Mesh(lobe, leaf);
    part.position.set(x, y, z);
    part.scale.setScalar(r);
    add(part, 71);
  }
  // Bicycle stands: three low hoops.
  for (const z of [-13.4, -14.5, -15.6]) {
    const hoop = new three.Mesh(
      new three.TorusGeometry(0.42, 0.04, 6, 20, Math.PI),
      dark,
    );
    hoop.position.set(6.9, 0, z);
    hoop.rotation.y = Math.PI / 2;
    add(hoop, 62);
  }
  // And a bicycle leaning on them, as there always is.
  const bike = new three.Group();
  const wheel = new three.TorusGeometry(0.34, 0.025, 6, 28);
  for (const z of [-0.52, 0.52]) {
    const rim = new three.Mesh(wheel, dark);
    rim.rotation.y = Math.PI / 2;
    rim.position.set(0, 0.34, z);
    bike.add(rim);
  }
  const tube = (w: number, h: number, d: number, y: number, z: number, tilt = 0) => {
    const part = new three.Mesh(new three.BoxGeometry(w, h, d), dark);
    part.position.set(0, y, z);
    part.rotation.x = tilt;
    bike.add(part);
  };
  tube(0.03, 0.03, 0.62, 0.78, 0.05);
  tube(0.03, 0.5, 0.03, 0.55, -0.22, -0.2);
  tube(0.03, 0.03, 0.68, 0.56, 0.08, -0.64);
  tube(0.03, 0.62, 0.03, 0.66, 0.47, 0.22);
  tube(0.46, 0.03, 0.03, 0.97, 0.4);
  tube(0.1, 0.03, 0.22, 0.83, -0.27);
  bike.position.set(6.4, 0, -14.5);
  bike.rotation.z = 0.12;
  world.add(bike);
  for (const part of bike.children) register(part as THREE.Mesh, 105);

  // ---- Second courtyard -----------------------------------------------------
  box(8, HEIGHT - 1.2, 13, -12, (HEIGHT - 1.2) / 2, -40.5);
  box(8, HEIGHT - 1.2, 13, 12, (HEIGHT - 1.2) / 2, -40.5);
  box(32, HEIGHT - 1.2, 4, 0, (HEIGHT - 1.2) / 2, -49);
  windows(
    grid([-38, -42.5].map((z) => -z), 4, 0.6, FLOOR),
    facing(-8, 0, Math.PI / 2),
  );
  windows(
    grid([-6, -2, 2, 6], 4, 0.6, FLOOR),
    facing(0, -47, 0),
  );
  // Right wing: upper windows only, the ground floor is the café.
  windows(grid([-37, -43.5], 3, 0.6 + FLOOR, FLOOR), facing(8, 0, -Math.PI / 2));

  // The café door: the arch again, lit from inside.
  const doorFrame = new three.Mesh(
    new three.ExtrudeGeometry(archOutline(three, 2.3), {
      depth: 0.12,
      bevelEnabled: false,
      curveSegments: 20,
    }),
    stone,
  );
  doorFrame.position.set(7.95, 0, -40.2);
  doorFrame.rotation.y = -Math.PI / 2;
  add(doorFrame, 80);
  const door = new three.Mesh(
    new three.ShapeGeometry(archOutline(three, 1.8), 20),
    glow,
  );
  door.position.set(7.8, 0, -40.2);
  door.rotation.y = -Math.PI / 2;
  add(door, 81).castShadow = false;
  // Shop window beside the door, lit too.
  const shop = new three.Mesh(new three.PlaneGeometry(2.4, 2.1), glow);
  shop.position.set(7.8, 1.65, -37.2);
  shop.rotation.y = -Math.PI / 2;
  add(shop, 82).castShadow = false;
  // Its glazing bars, so it reads as a window and not a lamp.
  box(0.06, 2.1, 0.06, 7.76, 1.65, -37.2, dark, 89);
  box(0.06, 0.06, 2.4, 7.76, 1.9, -37.2, dark, 89);
  // Lamp over the door and the round sign.
  box(0.5, 0.08, 0.08, 7.7, 3.35, -40.2, dark, 83);
  const doorLamp = new three.Mesh(new three.SphereGeometry(0.17, 14, 10), glow);
  doorLamp.position.set(7.45, 3.22, -40.2);
  add(doorLamp, 84).castShadow = false;
  const sign = new three.Mesh(new three.CylinderGeometry(0.5, 0.5, 0.08, 28), stone);
  sign.rotation.x = Math.PI / 2;
  sign.position.set(7.35, 3.2, -42.1);
  add(sign, 85);
  box(0.6, 0.06, 0.06, 7.7, 3.75, -42.1, dark, 83);
  // A bench and two pots, because people stay.
  box(0.5, 0.45, 2.0, 7.35, 0.225, -36.6, dark, 86);
  for (const z of [-38.6, -41.8]) {
    box(0.55, 0.6, 0.55, 7.4, 0.3, z, stone, 87);
    for (const [dx, y, dz, r] of [
      [0, 0.98, 0, 0.36],
      [-0.12, 0.84, 0.21, 0.26],
      [0.08, 0.86, -0.22, 0.27],
    ] as const) {
      const part = new three.Mesh(lobe, leaf);
      part.position.set(7.4 + dx, y, z + dz);
      part.scale.setScalar(r);
      add(part, 88);
    }
  }
  // Two chairs and a small round table outside the door.
  const table = new three.Mesh(new three.CylinderGeometry(0.36, 0.36, 0.05, 20), stone);
  table.position.set(5.6, 0.74, -38.9);
  add(table, 100);
  box(0.05, 0.72, 0.05, 5.6, 0.36, -38.9, dark, 101);
  for (const [x, z, turn] of [
    [4.95, -38.4, 0.5],
    [6.2, -39.5, -2.6],
  ] as const) {
    const chair = new three.Group();
    const seat = new three.Mesh(new three.BoxGeometry(0.44, 0.04, 0.42), dark);
    seat.position.y = 0.46;
    const back = new three.Mesh(new three.BoxGeometry(0.44, 0.42, 0.04), dark);
    back.position.set(0, 0.68, -0.2);
    chair.add(seat, back);
    for (const [lx, lz] of [
      [-0.19, -0.18],
      [0.19, -0.18],
      [-0.19, 0.18],
      [0.19, 0.18],
    ] as const) {
      const leg = new three.Mesh(new three.BoxGeometry(0.03, 0.46, 0.03), dark);
      leg.position.set(lx, 0.23, lz);
      chair.add(leg);
    }
    chair.position.set(x, 0, z);
    chair.rotation.y = turn;
    world.add(chair);
    for (const part of chair.children) register(part as THREE.Mesh, 102);
  }
  // String lights along the café front, in loops between hooks, framing the
  // door on arrival: paper dots on the wall.
  const hooks = [-34.6, -37.4, -40.2, -42.9, -45.6];
  const festoon: THREE.Vector3[] = [];
  hooks.slice(1).forEach((z, index) => {
    const from = hooks[index];
    for (let step = index === 0 ? 0 : 1; step <= 8; step++) {
      const t = step / 8;
      festoon.push(
        new three.Vector3(7.84, 4.12 - Math.sin(Math.PI * t) * 0.42, from + (z - from) * t),
      );
    }
  });
  const cable = new three.CatmullRomCurve3(festoon);
  add(
    new three.Mesh(new three.TubeGeometry(cable, 96, 0.016, 4, false), dark),
    103,
  ).castShadow = false;
  const bulbShape = new three.SphereGeometry(0.07, 10, 8);
  const bulbs = 20;
  for (let i = 1; i < bulbs; i++) {
    const bulb = new three.Mesh(bulbShape, glow);
    bulb.position.copy(cable.getPointAt(i / bulbs)).add(new three.Vector3(-0.04, -0.09, 0));
    add(bulb, 104).castShadow = false;
  }

  // ---- Roofs: chimneys, seen from above on the map ---------------------------
  for (const [x, y, z] of [
    [-9, HEIGHT, -4],
    [4, HEIGHT, -6.5],
    [10.5, HEIGHT, -2.5],
    [-13.5, HEIGHT, -14],
    [13.5, HEIGHT, -22.5],
    [-10, HEIGHT - 1.2, -30],
    [6, HEIGHT - 1.2, -31.5],
    [-12, HEIGHT - 1.2, -44],
    [12.5, HEIGHT - 1.2, -37.5],
    [4, HEIGHT - 1.2, -49.5],
  ] as const) {
    box(0.8, 1.3, 0.6, x, y + 0.65, z, wall, 106);
    box(1.0, 0.14, 0.8, x, y + 1.35, z, stone, 107);
  }

  // ---- Light ---------------------------------------------------------------
  // A high sun from the east: the courtyards get light down to the ground,
  // while the café front, facing west, stands in its own shade and the lit
  // door, the window and the string lights are the brightest things there.
  scene.add(new three.HemisphereLight(0xffffff, 0x8a8a8a, 1.2));
  const sun = new three.DirectionalLight(0xffffff, 3.0);
  sun.position.set(12, 46, 4);
  sun.target.position.set(0, 0, -16);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -30;
  sun.shadow.camera.right = 30;
  sun.shadow.camera.top = 36;
  sun.shadow.camera.bottom = -36;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 90;
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.03;
  scene.add(sun, sun.target);
  const spill = new three.PointLight(0xffffff, 26, 9, 2);
  spill.position.set(6.4, 2.1, -40.2);
  scene.add(spill);

  return { scene, world, meshes, sun, ids: nextId };
}
