import Link from "next/link";
import { site, stats } from "@/lib/site";
import { PourOver, ArcText } from "./Illustration";
import AnimatedTitle from "./AnimatedTitle";

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pt-10 pb-0 md:px-10 md:pt-14">
      <div className="mx-auto grid max-w-[1400px] items-center gap-10 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-7">
          <p
            className="label animate-rise"
            style={{ animationDelay: "0.1s" }}
          >
            Specialty coffee · Kreuzberg, {site.address.city} · Est.{" "}
            {site.founded}
          </p>

          <AnimatedTitle
            as="h1"
            split="chars"
            on="load"
            delay={0.2}
            className="display mt-5 text-[clamp(3.5rem,12vw,9.5rem)] lowercase"
          >
            hinterhof
          </AnimatedTitle>

          <p
            className="animate-rise mt-6 max-w-[34ch] text-xl leading-snug font-medium md:text-2xl"
            style={{ animationDelay: "0.28s" }}
          >
            {site.tagline} A roastery and coffee bar two yards back from
            Oranienstraße.
          </p>

          <div
            className="animate-rise mt-9 flex flex-wrap items-center gap-4"
            style={{ animationDelay: "0.38s" }}
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
        </div>

        <div className="relative lg:col-span-5">
          <PourOver className="animate-rise mx-auto w-full max-w-[26rem] text-ink lg:max-w-none" />

          {/* Rotating stamp, straight off the poster's arc lockup.
              Sits right on small screens so it clears the kettle. */}
          <div className="pointer-events-none absolute -top-4 right-0 h-24 w-24 sm:h-28 sm:w-28 lg:top-0 lg:right-auto lg:-left-6 lg:h-32 lg:w-32">
            <ArcText
              text="ROASTED IN THE COURTYARD · SINCE 2016 · "
              className="h-full w-full animate-spin-slow text-ink"
            />
          </div>
        </div>
      </div>

      {/* Poster credit bar */}
      <ul className="mx-auto mt-10 flex max-w-[1400px] flex-wrap items-center justify-between gap-x-8 gap-y-3 border-t-2 border-ink py-5">
        {stats.map((stat) => (
          <li key={stat.unit} className="flex items-baseline gap-2">
            <span className="display text-2xl md:text-3xl">{stat.figure}</span>
            <span className="label">{stat.unit}</span>
          </li>
        ))}
        <li className="label">{site.transit}</li>
      </ul>
    </section>
  );
}
