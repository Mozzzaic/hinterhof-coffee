"use client";

import { useRef } from "react";
import { useScrollParallax } from "@/lib/useScrollParallax";
import Wordmark from "./Wordmark";

/**
 * The oversized "hinterhof · hinterhof · hinterhof" line between the shelf
 * and the bar. Purely decorative (aria-hidden) — it drifts sideways as the
 * band crosses the viewport, giving the page one full-width beat of motion
 * between two dense sections.
 */
export default function WordmarkBand() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const bandRef = useRef<HTMLDivElement>(null);

  useScrollParallax(bandRef, {
    axis: "x",
    from: -18,
    to: 8,
    scrub: 0.5,
    trigger: wrapRef,
  });

  return (
    <div
      aria-hidden
      ref={wrapRef}
      className="overflow-hidden bg-chalk py-5 md:py-8 lg:py-11"
    >
      <div
        ref={bandRef}
        className="display flex w-max items-baseline gap-5 text-nowrap lowercase md:gap-8"
        style={{ fontSize: "clamp(3.5rem, 13vw, 11rem)" }}
      >
        <Wordmark className="h-[0.88em] w-auto" />
        <span className="text-[0.4em]">·</span>
        <Wordmark className="h-[0.88em] w-auto" />
        <span className="text-[0.4em]">·</span>
        <Wordmark className="h-[0.88em] w-auto" />
      </div>
    </div>
  );
}
