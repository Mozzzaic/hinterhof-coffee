"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Pause the hero's looping CSS motion (the stamp) while it is off screen. */
export default function HeroMotion({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      node.dataset.motionPaused = String(!entry.isIntersecting);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return (
    <section ref={ref} id="top" className="poster-hero section-shell">
      {children}
    </section>
  );
}
