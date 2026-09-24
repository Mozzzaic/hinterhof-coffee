/**
 * The press. One ink, one deeper pass of the same ink, two papers.
 *
 * These are the only colours a canvas may put on screen. They mirror the
 * @theme block in globals.css: change one, change both.
 */
export const ink = {
  sky: "#c5d9f5",
  chalk: "#eaf1fc",
  ink: "#2450be",
  deep: "#16337c",
} as const;

export type Paper = "sky" | "chalk" | "ink";

/**
 * sRGB triplet in 0..1, written to the canvas untouched. The shaders skip
 * three.js colour management on purpose: the hex above is what must come out.
 */
export function rgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/** The screen every canvas prints with, in CSS pixels and degrees. */
export const screen = {
  /** Dot cell on a desktop layout. */
  cell: 6,
  /** Dot cell under 40rem, where everything is closer to the eye. */
  cellCompact: 5,
  /** Ink screen angle. */
  angle: 15,
  /** The deep ink runs on its own screen, like a second riso drum. */
  deepAngle: 75,
  /** Misregistration of the second drum, in CSS pixels. */
  deepOffset: 1,
  /** Hand-drawn lines re-wobble at this rate, like drawn animation. */
  boilFps: 8,
  /** Continuous canvases never render denser than this. */
  maxDpr: 1.5,
  /** Canvases that only redraw on interaction can afford retina. */
  maxDprStill: 2,
} as const;

/** Cell size for the current layout. */
export function cellSize() {
  return typeof window !== "undefined" &&
    window.matchMedia("(max-width: 39.999rem)").matches
    ? screen.cellCompact
    : screen.cell;
}
