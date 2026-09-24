"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { gsap, SplitText } from "@/lib/gsap";

type Props = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
};

/**
 * A display heading whose lines rise out of their own masks as it scrolls
 * into view, the way the hero's lines do on load. Headings already on screen
 * at load are left alone; so is everything under reduced motion.
 */
export default function LineReveal({ children, as: Tag = "h2", className }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;

    let split: SplitText | null = null;
    const context = gsap.context(() => {
      split = SplitText.create(el, {
        type: "lines",
        mask: "lines",
        linesClass: "split-line",
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 112,
            rotate: 2,
            transformOrigin: "0% 100%",
            duration: 1.1,
            stagger: 0.07,
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          }),
      });
    });
    return () => {
      context.revert();
      split?.revert();
    };
  }, []);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
