"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

type Props = {
  /** The final value, e.g. "10", "07", "38" — also sets the zero-pad width. */
  value: string;
  className?: string;
};

/**
 * Count-up stat. Server-rendered as its final value (so there is nothing to
 * flash before JS arrives), then — once scrolled into view, and only if the
 * visitor hasn't asked for reduced motion — tweened from 0 up to that value.
 *
 * Plain IntersectionObserver rather than a ScrollTrigger-driven tween: the
 * same mechanism Reveal.tsx already uses reliably, and it sidesteps
 * ScrollTrigger's play/reverse semantics fighting React's dev-mode double
 * effect invocation, which was leaving the tween paused mid-count.
 */
export default function Counter({ value, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const target = parseFloat(value);
    const counter = { v: 0 };
    const finish = () => {
      el.textContent = value;
    };

    let tween: gsap.core.Tween | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.disconnect();
          tween = gsap.to(counter, {
            v: target,
            duration: 1.5,
            ease: "power2.out",
            onUpdate: () => {
              el.textContent = String(Math.round(counter.v)).padStart(
                value.length,
                "0",
              );
            },
            onComplete: finish,
          });
          tween.eventCallback("onInterrupt", finish);
        }
      },
      { threshold: 0 },
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      tween?.kill();
    };
  }, [value]);

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}
