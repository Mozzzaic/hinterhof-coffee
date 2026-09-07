"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";

export default function VisitMotion({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const section = ref.current;
    if (!section) return;
    const media = gsap.matchMedia();
    media.add(
      {
        desktop: "(min-width: 40rem)",
        mobile: "(max-width: 39.999rem)",
        motion: "(prefers-reduced-motion: no-preference)",
      },
      (context) => {
        if (!context.conditions?.motion) return;
        const stops = Array.from(
          section.querySelectorAll<HTMLElement>(".route-stop"),
        );
        const route = section.querySelector(".courtyard-route");
        // On phones each doorway gets its own trigger as the vertical route unfolds.
        const desktop = context.conditions.desktop;
        const shared = desktop
          ? gsap.timeline({
              scrollTrigger: {
                trigger: route,
                start: "top 85%",
                end: "bottom 55%",
                scrub: 0.5,
              },
            })
          : null;
        stops.forEach((stop, index) => {
          const timeline =
            shared ??
            gsap.timeline({
              scrollTrigger: {
                trigger: stop,
                start: "top 90%",
                end: "center 65%",
                scrub: 0.5,
              },
            });
          const at = desktop ? index * 0.2 : 0;
          timeline.fromTo(
            stop.querySelector(".route-arch"),
            { y: 24, rotation: index % 2 ? 6 : -6 },
            { y: 0, rotation: 0, duration: 1, ease: "none" },
            at,
          );
          stop.querySelectorAll<SVGPathElement>("svg path").forEach((path) => {
            const length = path.getTotalLength();
            timeline.fromTo(
              path,
              { strokeDasharray: length, strokeDashoffset: length },
              { strokeDashoffset: 0, duration: 1, ease: "none" },
              at,
            );
          });
        });
      },
    );
    return () => media.revert();
  }, []);

  return (
    <section ref={ref} id="visit" className="visit-section section-shell">
      {children}
    </section>
  );
}
