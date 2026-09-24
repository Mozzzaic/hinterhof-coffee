"use client";

import { useEffect, useEffectEvent, useRef, type ReactNode } from "react";
import { loadThree, pressFailed, pressOn } from "@/lib/webgl/support";

type Props = {
  paper?: "sky" | "chalk";
  className?: string;
  /** Static stand-in for visitors without the press. */
  children?: ReactNode;
  onStation?: (index: number) => void;
  /** The stop the visitor points at in the list, or -1. */
  focus?: number;
};

/**
 * A place on the page for the courtyard map: the block from above, and the
 * way to the café door drawing itself as the map crosses the screen.
 */
export default function Courtyard({
  paper = "sky",
  className = "",
  children,
  onStation,
  focus = -1,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const station = useEffectEvent((index: number) => onStation?.(index));
  const focused = useEffectEvent(() => focus);

  useEffect(() => {
    const el = ref.current;
    if (!el || !pressOn()) return;
    const progress = () => {
      const rect = el.getBoundingClientRect();
      const view = window.innerHeight;
      return (view * 0.85 - rect.top) / (view * 0.7);
    };

    // Neither the scene nor three.js is in the first bundle: both are fetched
    // side by side once the page is up.
    let release = () => {};
    let cancelled = false;
    loadThree().catch(() => {});
    import("@/lib/webgl/courtyard")
      .then(({ mountCourtyard }) => {
        if (cancelled) return;
        release = mountCourtyard({
          el,
          paper,
          progress,
          onStation: (index) => station(index),
          focus: () => focused(),
        });
      })
      .catch(pressFailed);
    return () => {
      cancelled = true;
      release();
    };
  }, [paper]);

  return (
    <div
      ref={ref}
      className={`courtyard ${className}`}
      role="img"
      aria-label="Map of the block from above: the passage off Oranienstraße, the first courtyard, the second passage and the café door."
    >
      {children}
    </div>
  );
}
