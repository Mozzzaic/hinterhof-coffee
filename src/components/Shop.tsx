import { products } from "@/lib/products";
import { ProductImage, ProductDetails } from "./ProductCard";
import Reveal from "./Reveal";

const gridCols = "grid-cols-[1.4fr_1fr_1fr_1fr] max-[620px]:grid-cols-2 max-[440px]:grid-cols-1";

export default function Shop() {
  return (
    <section
      id="coffee"
      className="scroll-mt-20 bg-chalk px-6 pt-16 pb-14 md:px-10 md:pt-20 md:pb-24"
    >
      <div className="mx-auto max-w-[1400px]">
        <Reveal
          className="grid grid-cols-1 items-end gap-x-14 gap-y-5 border-t-[6px] border-ink pt-5 min-[620px]:grid-cols-[minmax(0,1fr)_minmax(0,34ch)]"
        >
          <div>
            <p className="label">01 / The shelf</p>
            <h2 className="display mt-3.5 text-[clamp(2.75rem,6.5vw,5.5rem)] lowercase">
              four bags, no filler
            </h2>
          </div>
          <p className="mb-2 text-base leading-snug">
            What is on the shelf is what came off the roaster this fortnight.
            When a lot runs out it does not come back.
          </p>
        </Reveal>

        <div className={`mt-18 grid items-stretch gap-x-9 gap-y-7 border-b-8 border-ink pb-5.5 ${gridCols}`}>
          {products.map((product, index) => (
            <Reveal
              key={product.slug}
              delay={index * 0.07}
              className="min-w-0"
            >
              <ProductImage product={product} />
            </Reveal>
          ))}
        </div>

        <ul className={`grid gap-x-9 gap-y-7 ${gridCols}`}>
          {products.map((product, index) => (
            <Reveal as="li" key={product.slug} delay={index * 0.07}>
              <ProductDetails product={product} lead={index === 0} />
            </Reveal>
          ))}
        </ul>

        <Reveal>
          <p className="label mt-14 border-t-2 border-ink pt-4.5">
            Sold over the counter, or at the roastery window on Thursdays from
            16:00. Cash and card, no bag over three weeks past its roast date.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
