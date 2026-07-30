import Image from "next/image";
import { site } from "@/lib/site";
import Reveal from "./Reveal";
import OpenStatus from "./OpenStatus";

const mapsQuery = encodeURIComponent(site.mapsQuery);

export default function Visit() {
  return (
    <section
      id="visit"
      className="scroll-mt-20 bg-chalk px-6 py-16 md:px-10 md:py-20"
    >
      <div className="mx-auto max-w-[1400px]">
        <Reveal className="border-t-[6px] border-ink" />

        <div className="mt-10 grid grid-cols-1 items-start gap-x-14 gap-y-10 min-[620px]:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <div className="min-w-0">
            <Reveal>
              <p className="label">04 / Visit</p>
              <h2 className="display mt-3.5 max-w-[20ch] text-[clamp(2.5rem,5vw,4.25rem)] lowercase">
                through the passage, keep going
              </h2>
            </Reveal>

            <Reveal>
              <address className="mt-8 flex flex-wrap items-baseline gap-x-6 gap-y-1.5 not-italic">
                <p className="display text-[1.875rem] lowercase">
                  {site.address.street}
                </p>
                <p className="label">
                  {site.address.detail} · {site.address.postcode}{" "}
                  {site.address.city}
                </p>
              </address>
              <p className="label mt-2.5">{site.transit}</p>
              <OpenStatus />
            </Reveal>

            <Reveal>
              <dl className="mt-4.5 border-t-2 border-ink">
                {site.hours.map((slot) => (
                  <div
                    key={slot.days}
                    className="flex items-baseline justify-between gap-6 border-b-2 border-ink py-2.5"
                  >
                    <dt className="text-sm font-medium">{slot.days}</dt>
                    <dd className="text-sm font-bold tabular-nums">
                      {slot.time}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3.5 max-w-[44ch] text-sm leading-snug">
                {site.toursNote}
              </p>
            </Reveal>

            <Reveal>
              <div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-4">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="label group inline-flex items-center gap-2.5 rounded-full bg-ink px-7 py-4 text-chalk transition-colors duration-200 hover:bg-ink-deep"
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

          <Reveal as="figure" className="m-0 min-w-0">
            <div className="duotone aspect-4/5 w-full rounded-[14rem_14rem_1rem_1rem]">
              <Image
                src="/images/street.jpg"
                alt="The lit passage on Oranienstraße that leads to the second courtyard."
                fill
                sizes="(max-width: 1024px) 90vw, 40vw"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-4 max-w-[38ch] text-base leading-snug">
              The passage is unmarked and looks closed. It is not. Walk past
              the bins, cross the first yard, we are the lit door on your
              right.
            </figcaption>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
