"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Seconds. Use ~0.06–0.08 steps between siblings — choreography, not lag. */
  delay?: number;
  /** Travel distance in px. */
  y?: number;
  className?: string;
  as?: ElementType;
};

/**
 * Scroll reveal — transform + opacity only, so it stays GPU-composited.
 *
 * Deliberately not a Motion component: the reveal is two properties, and a
 * plain IntersectionObserver keeps the JS payload (and the Lighthouse score)
 * where we want it. Reduced motion and no-JS are handled in globals.css.
 */
export default function Reveal({
  children,
  delay = 0,
  y = 32,
  className,
  as: Component = "div",
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (!("IntersectionObserver" in window)) {
      node.dataset.revealed = "true";
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.revealed = "true";
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Component
      ref={ref}
      className={className ? `reveal ${className}` : "reveal"}
      style={
        {
          "--reveal-delay": `${delay}s`,
          "--reveal-y": `${y}px`,
        } as React.CSSProperties
      }
    >
      {children}
    </Component>
  );
}
