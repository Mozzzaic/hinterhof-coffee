"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { Sweep } from "@/lib/webgl/print-image";
import { loadThree, pressOn } from "@/lib/webgl/support";

type Props = {
  src: string;
  alt: string;
  sizes: string;
  /** The surface the picture sits on: the paper the press prints on. */
  paper?: "sky" | "chalk";
  /** How the roller crosses the picture the first time it is seen. */
  sweep?: Sweep;
  preload?: boolean;
  className?: string;
  contrast?: number;
  lift?: number;
  /** The crop: the point the frame centres on (0 to 1, from the top left). */
  focus?: readonly [number, number];
  /** How far the frame closes in on that point (1 = the whole photograph). */
  zoom?: number;
};

/**
 * A photograph as it arrives (CSS duotone, no JavaScript needed), then as
 * it is printed (ink dots, WebGL). The <img> stays in the page underneath
 * the canvas for search engines, screen readers and every visitor without
 * the press.
 */
export default function InkImage({
  src,
  alt,
  sizes,
  paper = "chalk",
  sweep = "up",
  preload,
  className,
  contrast,
  lift,
  focus,
  zoom = 1,
}: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [fx, fy] = focus ?? [0.5, 0.5];

  useEffect(() => {
    if (!wrap.current || !img.current || !canvas.current || !pressOn()) return;
    const elements = {
      wrap: wrap.current,
      img: img.current,
      canvas: canvas.current,
    };
    let release = () => {};
    let cancelled = false;
    loadThree().catch(() => {});
    import("@/lib/webgl/print-image")
      .then(({ attachPrint }) => {
        if (cancelled) return;
        release = attachPrint({
          ...elements,
          paper,
          sweep,
          contrast,
          lift,
          focus: [fx, fy],
          zoom,
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      release();
    };
  }, [paper, sweep, contrast, lift, fx, fy, zoom]);

  // The same crop for the duotone underneath (and for every visitor without
  // the press): the focus comes to the centre of the frame.
  const half = 0.5 / zoom;
  const cx = Math.min(Math.max(fx, half), 1 - half);
  const cy = Math.min(Math.max(fy, half), 1 - half);
  const crop =
    zoom > 1
      ? {
          transform: `scale(${zoom}) translate(${((0.5 - cx) * 100).toFixed(2)}%, ${((0.5 - cy) * 100).toFixed(2)}%)`,
        }
      : undefined;

  return (
    <div
      ref={wrap}
      className={className ? `ink-image duotone ${className}` : "ink-image duotone"}
    >
      <Image
        ref={img}
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        preload={preload}
        className="object-cover"
        style={crop}
      />
      <canvas ref={canvas} className="ink-canvas" aria-hidden="true" />
    </div>
  );
}
