"use client";

import { useLayoutEffect, useRef, type ElementType } from "react";
import { gsap, SplitText, EASE } from "@/lib/gsap";

type Props = {
  /** Plain text only — SplitText needs to own the element's contents. */
  children: string;
  as?: ElementType;
  className?: string;
  /** `chars` for the one-word hero cascade, `lines` for section headings. */
  split?: "chars" | "lines";
  /** `load` fires immediately, `scroll` waits until the heading comes up. */
  on?: "load" | "scroll";
  delay?: number;
};

/**
 * Masked title reveal. Each line (or character) slides up from behind its own
 * clipping mask, which is the one thing CSS cannot do here — it needs the text
 * broken into boxes first, and the break points depend on the loaded webfont.
 *
 * Accessibility: SplitText's `aria: "auto"` puts the original string back as an
 * aria-label and hides the generated spans, so screen readers still read one
 * heading rather than a pile of letters.
 */
export default function AnimatedTitle({
  children,
  as: Component = "h2",
  className = "",
  split = "lines",
  on = "scroll",
  delay = 0,
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(el, { autoAlpha: 1 });
      return;
    }

    let instance: SplitText | undefined;
    let tween: gsap.core.Tween | undefined;
    let cancelled = false;

    const run = () => {
      if (cancelled || !ref.current) return;

      instance = SplitText.create(ref.current, {
        type: split,
        mask: split,
        aria: "auto",
      });

      const targets = split === "chars" ? instance.chars : instance.lines;
      gsap.set(ref.current, { autoAlpha: 1 });

      tween = gsap.from(targets, {
        yPercent: 118,
        duration: split === "chars" ? 0.8 : 0.95,
        ease: EASE,
        stagger: split === "chars" ? 0.035 : 0.09,
        delay,
        ...(on === "scroll"
          ? {
              scrollTrigger: {
                trigger: ref.current,
                start: "top 88%",
                once: true,
              },
            }
          : {}),
      });
    };

    // Splitting before the webfont lands gives the wrong line breaks. The
    // timeout is a safety net so a font that never resolves cannot leave the
    // heading invisible.
    const fonts = document.fonts?.ready ?? Promise.resolve();
    Promise.race([
      fonts,
      new Promise((resolve) => setTimeout(resolve, 1500)),
    ]).then(run);

    return () => {
      cancelled = true;
      tween?.scrollTrigger?.kill();
      tween?.kill();
      instance?.revert();
    };
  }, [children, split, on, delay]);

  return (
    <Component ref={ref} className={`split-title ${className}`}>
      {children}
    </Component>
  );
}
