"use client";

import { useEffect, useRef } from "react";
import { loadThree, pressOn } from "@/lib/webgl/support";
import Wordmark from "./Wordmark";

type Props = {
  className?: string;
  /** Blue letters on the pale pages, pale letters on the blue footer. */
  letters?: "ink" | "sky";
  /** One path per letter, for the hero's entrance. */
  split?: boolean;
  /** Milliseconds before the canvas takes over from the SVG. */
  delay?: number;
};

/**
 * The wordmark, still wet. The SVG is always there; when the press runs, a
 * canvas prints the same letters on top and lets the pointer smear them.
 */
export default function InkWordmark({
  className = "",
  letters = "sky",
  split = false,
  delay = 0,
}: Props) {
  const wrap = useRef<HTMLSpanElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!wrap.current || !canvas.current || !pressOn()) return;
    const elements = { wrap: wrap.current, canvas: canvas.current };
    let release = () => {};
    let cancelled = false;
    // Wait until it is close before fetching anything.
    const near = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        near.disconnect();
        loadThree().catch(() => {});
        import("@/lib/webgl/wordmark-melt")
          .then(({ attachMelt }) => {
            if (!cancelled)
              release = attachMelt({ ...elements, letters, delay });
          })
          .catch(() => {});
      },
      { rootMargin: "100% 0px" },
    );
    near.observe(elements.wrap);
    return () => {
      cancelled = true;
      near.disconnect();
      release();
    };
  }, [letters, delay]);

  // A span, so it can sit inside the hero's h1.
  return (
    <span ref={wrap} className={`ink-wordmark ${className}`} aria-hidden="true">
      <Wordmark className="ink-wordmark-svg" split={split} />
      <canvas ref={canvas} className="ink-canvas" />
    </span>
  );
}
