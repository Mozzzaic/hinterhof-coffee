"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

type Props = {
  /** Optional — a bare divider rule can reveal with nothing inside it. */
  children?: ReactNode;
  /** Seconds. Use 0.07 steps between siblings — choreography, not lag. */
  delay?: number;
  /** Travel distance in px. */
  y?: number;
  className?: string;
  as?: ElementType;
};

/**
 * Scroll reveal, the printed way: the block slides up out of a cut in the
 * page (clip-path and transform, never opacity). Only blocks that start
 * below the fold are ever hidden, so nothing that is already on screen at
 * load, or reached through a deep link, blinks. Without JavaScript, or with
 * reduced motion, everything is simply there.
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
    if (!node || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (node.getBoundingClientRect().top < window.innerHeight * 0.92) return;

    node.dataset.reveal = "pending";
    let timer = 0;
    const settle = () => {
      node.dataset.reveal = "done";
    };
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        node.dataset.reveal = "shown";
        timer = window.setTimeout(settle, 900 + delay * 1000);
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [delay]);

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
