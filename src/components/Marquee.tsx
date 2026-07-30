"use client";

import { useLayoutEffect, useRef } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import { origins } from "@/lib/site";

const Dot = () => (
  <span aria-hidden className="block h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
);

/**
 * The lots currently on the roaster, scrolling right to left. Speeds up under
 * a fast scroll and eases back to its base pace — a small tell that the page
 * is listening, without ever fighting for attention.
 */
export default function Marquee() {
  const trackRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let current = 1;
    const trigger = ScrollTrigger.create({
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        const target = 1 + Math.min(Math.abs(self.getVelocity()) / 1400, 2.2);
        current += (target - current) * 0.18;
        track.style.animationDuration = `${(34 / current).toFixed(2)}s`;
      },
    });

    return () => trigger.kill();
  }, []);

  return (
    <div className="overflow-hidden bg-ink py-3 text-sky">
      <div ref={trackRef} className="flex w-max animate-marquee">
        {[0, 1].map((copy) => (
          <ul
            key={copy}
            aria-hidden={copy === 1}
            className="flex shrink-0 items-center"
          >
            {origins.map((origin) => (
              <li
                key={origin.line}
                className="label flex shrink-0 items-center gap-8 px-8"
              >
                {origin.line}
                <Dot />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
