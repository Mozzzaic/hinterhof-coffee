"use client";

import { useLayoutEffect, type RefObject } from "react";
import { gsap } from "@/lib/gsap";

type Options = {
  axis: "x" | "y";
  /** Starting percent — defaults to 0, i.e. "animate to" rather than "animate between". */
  from?: number;
  to: number;
  scrub?: number | boolean;
  /** Defaults to the animated element itself. */
  trigger?: RefObject<HTMLElement | null>;
};

/**
 * One scroll-linked transform, shared by the hero illustration (yPercent) and
 * the wordmark band (xPercent). Only ever touches `transform`, so it stays
 * off the main thread's layout/paint work, and it no-ops entirely under
 * `prefers-reduced-motion`.
 */
export function useScrollParallax(
  ref: RefObject<HTMLElement | SVGSVGElement | null>,
  { axis, from = 0, to, scrub = true, trigger }: Options,
) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const triggerEl = trigger?.current ?? el;

    const context = gsap.context(() => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          el,
          { [`${axis}Percent`]: from },
          {
            [`${axis}Percent`]: to,
            ease: "none",
            scrollTrigger: {
              trigger: triggerEl,
              start: "top bottom",
              end: "bottom top",
              scrub,
            },
          },
        );
      });
    });

    return () => context.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [axis, from, to, scrub]);
}
