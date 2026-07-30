"use client";

import Link from "next/link";
import { useRef } from "react";
import { site, stats } from "@/lib/site";
import { PourOver, ArcText } from "./Illustration";
import { useScrollParallax } from "@/lib/useScrollParallax";
import Counter from "./Counter";

export default function Hero() {
  const illustrationRef = useRef<HTMLDivElement>(null);
  useScrollParallax(illustrationRef, { axis: "y", to: -14, scrub: 0.6 });

  return (
    <section
      id="top"
      className="relative overflow-hidden px-6 pt-9 pb-0 md:px-10 md:pt-9"
    >
      <div className="mx-auto max-w-[1400px]">
        <p
          className="label animate-rise"
          style={{ animationDelay: "0s" }}
        >
          Specialty coffee · Kreuzberg, {site.address.city} · Est.{" "}
          {site.founded}
        </p>

        <div className="mt-5 grid items-start gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <h1
              className="display animate-rise text-[clamp(3.5rem,11vw,9rem)] lowercase"
              style={{ animationDelay: "0.12s" }}
            >
              {site.name.toLowerCase()}
            </h1>

            <p
              className="animate-rise mt-6 max-w-[34ch] text-xl leading-snug font-medium text-pretty md:text-2xl"
              style={{ animationDelay: "0.2s" }}
            >
              {site.tagline} A roastery and coffee bar two yards back from
              Oranienstraße.
            </p>

            <div
              className="animate-rise mt-6 flex flex-wrap items-center gap-3.5"
              style={{ animationDelay: "0.26s" }}
            >
              <Link
                href="/#coffee"
                className="label group inline-flex items-center gap-2.5 rounded-full bg-ink px-7 py-4 text-sky transition-colors duration-200 hover:bg-ink-deep"
              >
                See the coffee
                <span className="transition-transform duration-200 group-hover:translate-x-1">
                  →
                </span>
              </Link>
              <Link
                href="/#visit"
                className="label rounded-full border-2 border-ink px-7 py-4 transition-colors duration-200 hover:bg-ink hover:text-sky"
              >
                Find the door
              </Link>
            </div>

            <ul
              className="animate-rise mt-1.5 grid grid-cols-3 border-t-2 border-ink"
              style={{ animationDelay: "0.34s" }}
            >
              {stats.map((stat, index) => (
                <li
                  key={stat.unit}
                  className={`py-4 ${index === 0 ? "pr-5" : index === 1 ? "border-x-2 border-ink px-5" : "pl-5"}`}
                >
                  <Counter
                    value={stat.figure}
                    className="display block text-[2.75rem] leading-[.88]"
                  />
                  <span className="label mt-2 block">{stat.unit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative lg:col-span-5">
            <div
              className="animate-rise"
              style={{ animationDelay: "0.12s" }}
            >
              <div ref={illustrationRef}>
                <PourOver className="mx-auto w-full max-w-[28.75rem] text-ink lg:max-w-none" />
              </div>
            </div>

            {/* Rotating badge, straight off the poster's arc lockup.
                `top` is set in globals.css (.hero-badge): on mobile it just
                pins to the illustration's corner, but from `lg:` up the
                columns sit side by side, so it switches to a calc() that
                tracks the tagline paragraph's own top edge in the other
                column — h1's rendered height plus the paragraph's margin —
                so the badge stays level with "Second courtyard, third door…"
                continuously as the viewport resizes, instead of jumping at
                a breakpoint. */}
            <div className="hero-badge pointer-events-none absolute right-0 h-24 w-24 sm:h-28 sm:w-28 lg:h-[7.375rem] lg:w-[7.375rem]">
              <ArcText
                text="ROASTED IN THE COURTYARD · SINCE 2016 · "
                className="h-full w-full animate-spin-slow text-ink"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
