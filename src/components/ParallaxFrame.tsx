"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";

type Props = {
  children: ReactNode;
  /** Shape of the frame: aspect ratio, rounding, width. */
  className?: string;
  /**
   * Classes for the moving track. Blend-mode treatments such as `duotone`
   * belong HERE, not on the frame: the track carries a GSAP transform, which
   * opens a new stacking context, so an image inside it can no longer blend
   * against a background painted on the frame.
   */
  innerClassName?: string;
  /** Travel in percent of the frame height, each way. Keep it under 12. */
  strength?: number;
};

/**
 * Scroll-linked parallax for a framed image.
 *
 * The track is deliberately taller than the frame (100% + 4×strength) so the
 * picture can slide without ever exposing an edge. Only `yPercent` is
 * animated, so it stays on the compositor.
 */
export default function ParallaxFrame({
  children,
  className = "",
  innerClassName = "",
  strength = 8,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const frame = ref.current;
    const inner = track.current;
    if (!frame || !inner) return;

    const context = gsap.context(() => {
      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          inner,
          { yPercent: -strength },
          {
            yPercent: strength,
            ease: "none",
            scrollTrigger: {
              trigger: frame,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      });
    }, ref);

    return () => context.revert();
  }, [strength]);

  const overscan = strength * 2;

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <div
        ref={track}
        className={`absolute inset-x-0 ${innerClassName}`}
        style={{
          top: `-${overscan}%`,
          height: `${100 + overscan * 2}%`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
