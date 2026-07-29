import { brewMethods } from "@/lib/products";
import Reveal from "./Reveal";
import AnimatedTitle from "./AnimatedTitle";
import { CupAndFlower } from "./Illustration";

export default function Bar() {
  return (
    <section
      id="bar"
      className="scroll-mt-20 bg-ink px-6 py-20 text-sky md:px-10 md:py-28"
    >
      <div className="mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <Reveal>
            <p className="label">On the bar</p>
          </Reveal>
          <AnimatedTitle className="display mt-3 text-[clamp(2.5rem,6vw,4.5rem)] lowercase">
            three ways in
          </AnimatedTitle>
          <Reveal>
            <p className="mt-5 max-w-[34ch] text-[0.9375rem] leading-snug">
              No syrups, no sizes, no secret menu. Whichever you order, we will
              tell you what is in the cup before you drink it.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <CupAndFlower className="mt-10 hidden w-52 lg:block" />
          </Reveal>
        </div>

        {/* A printed price list, not three photo cards. Half the height. */}
        <dl className="lg:col-span-7">
          {brewMethods.map((method, index) => (
            <Reveal
              key={method.name}
              delay={index * 0.07}
              className="flex flex-wrap items-baseline gap-x-6 gap-y-2 border-t-2 border-sky py-6 last:border-b-2"
            >
              <dt className="display text-[clamp(2rem,4.5vw,3rem)] lowercase">
                {method.name}
              </dt>
              <dd className="label">{method.german}</dd>
              <dd className="label ml-auto">{method.time}</dd>
              <dd className="display w-20 text-right text-2xl md:text-3xl">
                €{method.price.toFixed(2).replace(".", ",")}
              </dd>
              <dd className="w-full max-w-[54ch] text-[0.9375rem] leading-snug">
                {method.copy}
              </dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
