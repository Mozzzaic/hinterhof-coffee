"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Keep pointer motion outside React renders and pause the ambient scene offscreen. */
export default function HeroMotion({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const media = matchMedia(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    let frame = 0;
    const reset = () => {
      cancelAnimationFrame(frame);
      node.style.setProperty("--scene-x", "0");
      node.style.setProperty("--scene-y", "0");
    };
    const move = (event: PointerEvent) => {
      if (!media.matches) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const bounds = node.getBoundingClientRect();
        node.style.setProperty(
          "--scene-x",
          String(
            Math.max(
              -1,
              Math.min(
                1,
                ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
              ),
            ),
          ),
        );
        node.style.setProperty(
          "--scene-y",
          String(
            Math.max(
              -1,
              Math.min(
                1,
                ((event.clientY - bounds.top) / bounds.height) * 2 - 1,
              ),
            ),
          ),
        );
      });
    };
    const observer = new IntersectionObserver(([entry]) => {
      node.dataset.motionPaused = String(!entry.isIntersecting);
      if (!entry.isIntersecting) reset();
    });
    observer.observe(node);
    node.addEventListener("pointermove", move, { passive: true });
    node.addEventListener("pointerleave", reset);
    media.addEventListener("change", reset);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      node.removeEventListener("pointermove", move);
      node.removeEventListener("pointerleave", reset);
      media.removeEventListener("change", reset);
    };
  }, []);
  return (
    <section ref={ref} id="top" className="poster-hero section-shell">
      {children}
    </section>
  );
}
