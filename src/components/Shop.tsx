import { products } from "@/lib/products";
import ProductCard from "./ProductCard";
import Reveal from "./Reveal";
import AnimatedTitle from "./AnimatedTitle";

export default function Shop() {
  return (
    <section
      id="coffee"
      className="scroll-mt-20 bg-chalk px-6 py-20 md:px-10 md:py-28"
    >
      <div className="mx-auto max-w-[1400px]">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Reveal>
              <p className="label">The shelf</p>
            </Reveal>
            <AnimatedTitle className="display mt-3 text-[clamp(2.5rem,6vw,4.5rem)] lowercase">
              four bags, no filler
            </AnimatedTitle>
          </div>
          <Reveal delay={0.08}>
            <p className="max-w-[38ch] text-[0.9375rem] leading-snug">
              What is on the shelf is what came off the roaster this fortnight.
              When a lot runs out it does not come back.
            </p>
          </Reveal>
        </div>

        <ul className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product, index) => (
            <Reveal
              as="li"
              key={product.slug}
              delay={index * 0.07}
              className="h-full"
            >
              <ProductCard product={product} />
            </Reveal>
          ))}
        </ul>

        <Reveal>
          <p className="label mt-12 border-t-2 border-ink pt-5">
            Sold over the counter and at the roastery window, Thursdays from
            16:00
          </p>
        </Reveal>
      </div>
    </section>
  );
}
