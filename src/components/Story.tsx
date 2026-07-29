import Image from "next/image";
import Reveal from "./Reveal";
import AnimatedTitle from "./AnimatedTitle";
import ParallaxFrame from "./ParallaxFrame";

/**
 * Manifesto and history, merged into one block. The old version ran a
 * statement section, a stats row and a four-entry timeline; this says the
 * same thing in a third of the scroll.
 */
export default function Story() {
  return (
    <section
      id="story"
      className="scroll-mt-20 px-6 py-20 md:px-10 md:py-28"
    >
      <div className="mx-auto grid max-w-[1400px] items-center gap-12 lg:grid-cols-12 lg:gap-14">
        <Reveal y={40} className="lg:col-span-5">
          <ParallaxFrame
            className="aspect-square w-full rounded-full"
            innerClassName="duotone"
          >
            <Image
              src="/images/roastery.jpg"
              alt="The drum roaster mid-batch, beans tumbling behind the glass."
              fill
              sizes="(max-width: 1024px) 90vw, 40vw"
              className="object-cover"
            />
          </ParallaxFrame>
        </Reveal>

        <div className="lg:col-span-7">
          <Reveal>
            <p className="label">Our story</p>
          </Reveal>
          <AnimatedTitle className="display mt-3 text-[clamp(2.5rem,6vw,4.5rem)] lowercase">
            nine years, one courtyard
          </AnimatedTitle>

          <Reveal delay={0.08}>
            <p className="mt-6 max-w-[46ch] text-xl leading-snug font-medium md:text-2xl">
              Rent on the street is for people selling something you already
              know you want. We are two courtyards back.
            </p>
          </Reveal>

          <Reveal delay={0.14}>
            <div className="mt-6 max-w-[52ch] space-y-4 text-[0.9375rem] leading-snug">
              <p>
                Hinterhof started in 2016 with a second-hand 5 kg roaster and a
                lease nobody else wanted. The Probat came up the passage on a
                pallet truck in 2019; three neighbours helped, two are still
                regulars. Since 2022 we have bought straight from producers,
                with a price on the invoice we are happy to show anyone.
              </p>
              <p>
                The arithmetic has not changed: small lots, roasted forty steps
                from the bar, rested until they are actually ready. That last
                part costs us storage and patience, and it is the only part
                that is not negotiable.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
