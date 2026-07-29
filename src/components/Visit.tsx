import Image from "next/image";
import { site } from "@/lib/site";
import Reveal from "./Reveal";
import AnimatedTitle from "./AnimatedTitle";
import ParallaxFrame from "./ParallaxFrame";

const mapsQuery = encodeURIComponent(
  `${site.address.street}, ${site.address.postcode} ${site.address.city}`,
);

export default function Visit() {
  return (
    <section
      id="visit"
      className="scroll-mt-20 bg-chalk px-6 py-20 md:px-10 md:py-28"
    >
      <div className="mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-7">
          <Reveal>
            <p className="label">Visit</p>
          </Reveal>
          <AnimatedTitle className="display mt-3 max-w-[12ch] text-[clamp(2.5rem,6vw,4.5rem)] lowercase">
            through the passage, keep going
          </AnimatedTitle>

          <Reveal delay={0.08}>
            <address className="mt-8 flex flex-wrap items-baseline gap-x-6 gap-y-1 not-italic">
              <p className="display text-2xl lowercase">
                {site.address.street}
              </p>
              <p className="label">
                {site.address.detail} · {site.address.postcode}{" "}
                {site.address.city}
              </p>
            </address>
            <p className="label mt-2">{site.transit}</p>
          </Reveal>

          <Reveal delay={0.12}>
            <dl className="mt-8 border-t-2 border-ink">
              {site.hours.map((slot) => (
                <div
                  key={slot.days}
                  className="flex items-baseline justify-between gap-6 border-b-2 border-ink py-3"
                >
                  <dt className="text-[0.9375rem] font-medium">{slot.days}</dt>
                  <dd className="text-[0.9375rem] font-bold tabular-nums">
                    {slot.time}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={0.16}>
            <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
                target="_blank"
                rel="noreferrer noopener"
                className="label group inline-flex items-center gap-2.5 rounded-full bg-ink px-7 py-4 text-sky transition-colors duration-200 hover:bg-ink-deep"
              >
                Open in maps
                <span className="transition-transform duration-200 group-hover:translate-x-1">
                  →
                </span>
              </a>
              <a
                href={`mailto:${site.contact.email}`}
                className="link-draw label"
              >
                {site.contact.email}
              </a>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.1} y={40} className="lg:col-span-5">
          <figure>
            <ParallaxFrame
              className="aspect-4/5 w-full rounded-[14rem_14rem_1rem_1rem]"
              innerClassName="duotone"
            >
              <Image
                src="/images/street.jpg"
                alt="The lit passage on Oranienstraße that leads to the second courtyard."
                fill
                sizes="(max-width: 1024px) 90vw, 40vw"
                className="object-cover"
              />
            </ParallaxFrame>
            <figcaption className="mt-4 max-w-[38ch] text-[0.9375rem] leading-snug">
              The passage is unmarked and looks closed. It is not. Walk past the
              bins, cross the first yard, we are the lit door on your right.
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
