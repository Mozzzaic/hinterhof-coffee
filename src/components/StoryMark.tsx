"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import ArchMark from "./ArchMark";

export default function StoryMark() {
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const frame = ref.current;
    if (!frame) return;
    const media = gsap.matchMedia();
    media.add(
      "(min-width: 64rem) and (prefers-reduced-motion: no-preference)",
      () => {
        const mark = frame.querySelector("svg");
        // The stationary frame is the trigger, so rotation cannot alter its bounds.
        gsap
          .timeline({
            scrollTrigger: {
              trigger: frame,
              start: "center bottom",
              end: "center top",
              scrub: 0.35,
            },
            defaults: { duration: 1, ease: "none" },
          })
          .fromTo(mark, { rotation: 10 }, { rotation: 0 })
          .to(mark, { rotation: 10 });
      },
    );
    return () => media.revert();
  }, []);

  return (
    <span ref={ref} className="story-arch" aria-hidden="true">
      <ArchMark />
    </span>
  );
}
