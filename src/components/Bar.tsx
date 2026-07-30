import { drinks, goodToKnow } from "@/lib/products";
import Reveal from "./Reveal";
import { LeverMachine } from "./Illustration";

export default function Bar() {
  return (
    <section
      id="bar"
      className="scroll-mt-20 bg-ink px-6 pt-16 pb-16 text-sky md:px-10 md:py-20"
    >
      <div className="mx-auto max-w-[1400px]">
        <Reveal
          className="grid grid-cols-1 items-end gap-x-14 gap-y-5 border-t-[6px] border-sky pt-5 min-[620px]:grid-cols-[minmax(0,1fr)_minmax(0,34ch)]"
        >
          <div>
            <p className="label">02 / On the bar</p>
            <h2 className="display mt-3.5 text-[clamp(2.75rem,6.5vw,5.5rem)] lowercase">
              nine ways in
            </h2>
          </div>
          <p className="mb-2 text-base leading-snug">
            No sizes, no secret menu. The whole list is here — including the
            last three, which are ours, and whose ingredients we can name in
            one breath.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 items-start gap-x-14 gap-y-10 min-[620px]:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)]">
          <dl className="m-0">
            {drinks.map((drink, index) => (
              <Reveal
                as="div"
                key={drink.name}
                delay={index * 0.05}
                className={`grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-8 gap-y-1 border-t-2 border-sky py-5.5 ${
                  index === drinks.length - 1 ? "border-b-2" : ""
                }`}
              >
                <dt className="display min-w-0 text-[clamp(1.75rem,3.2vw,3.25rem)] lowercase">
                  {drink.name}
                </dt>
                <dd className="display text-right text-[clamp(1.5rem,2.6vw,2.25rem)] whitespace-nowrap">
                  €{drink.price.toFixed(2).replace(".", ",")}
                </dd>
                <dd className="label flex flex-wrap gap-x-4.5 gap-y-1.5">
                  <span>{drink.german}</span>
                  <span>{drink.meta}</span>
                </dd>
                <dd className="col-span-full mt-2 max-w-[60ch] text-base leading-snug">
                  {drink.copy}
                </dd>
              </Reveal>
            ))}
          </dl>

          <div className="flex min-w-0 flex-col gap-7 min-[620px]:sticky min-[620px]:top-22">
            <Reveal>
              <LeverMachine className="mt-2 ml-auto w-full max-w-[21.25rem] text-sky" />
            </Reveal>
            <Reveal className="flex flex-col gap-3 border-t-2 border-sky pt-4">
              <p className="label">Good to know</p>
              {goodToKnow.map((line) => (
                <p key={line} className="text-base leading-snug">
                  {line}
                </p>
              ))}
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
