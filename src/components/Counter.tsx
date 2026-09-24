"use client";

import { useEffect, useRef } from "react";

type Props = {
  /** The final value, e.g. "10", "07", "38" — also sets the number of wheels. */
  value: string;
  className?: string;
};

const DIGITS = Array.from({ length: 10 }, (_, digit) => digit);

/**
 * A stat on a mechanical counter: one wheel per digit, rolling from zero to
 * the value when it comes into view, the last wheel settling last.
 *
 * Server-rendered at its final value, so there is nothing to flash before
 * JavaScript arrives and nothing to read wrong without it. Screen readers get
 * the plain number; the wheels are decoration.
 */
export default function Counter({ value, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;

    el.dataset.counter = "wound";
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        // Two frames so the wound position is painted before it rolls.
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            el.dataset.counter = "rolled";
          }),
        );
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <span ref={ref} className={`counter ${className ?? ""}`}>
      <span className="sr-only">{value}</span>
      <span className="counter-wheels" aria-hidden="true">
        {value.split("").map((digit, index) => (
          <span
            className="counter-wheel"
            key={index}
            style={
              {
                "--digit": Number(digit),
                "--wheel": index,
              } as React.CSSProperties
            }
          >
            {/* The wheel is as wide as the digit it stops on: a 1 does not
                sit in the box of a 0. */}
            <span className="counter-size">{digit}</span>
            <span className="counter-strip">
              {DIGITS.map((n) => (
                <span key={n}>{n}</span>
              ))}
            </span>
          </span>
        ))}
      </span>
    </span>
  );
}
