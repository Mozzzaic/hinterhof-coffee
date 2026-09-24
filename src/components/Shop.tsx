import Link from "next/link";
import { products } from "@/lib/products";
import Reveal from "./Reveal";
import LineReveal from "./LineReveal";
import ProductCard from "./ProductCard";
import { PourOver } from "./Illustration";

export default function Shop() {
  return (
    <section id="coffee" className="coffee-section section-shell">
      <div className="site-container">
        <div className="section-heading">
          <div>
            <Reveal as="p" className="label">
              01 / Take a little Hinterhof home
            </Reveal>
            <LineReveal className="display">
              find your
              <br />
              daily ritual.
            </LineReveal>
          </div>
          <Reveal className="section-heading-note" delay={0.14}>
            <PourOver className="section-heading-drawing" />
            <p>
              Three coffees. One cold brew. All roasted in the courtyard, with
              something different to say.
            </p>
            <p className="label">Meet your next morning ↓</p>
          </Reveal>
        </div>
        <div className="shelf">
          {products.map((product, index) => (
            <ProductCard key={product.slug} product={product} index={index} />
          ))}
        </div>
        <Reveal className="ritual-pickup">
          <div>
            <p className="label">From our roaster to your kitchen</p>
            <p>
              Small lots. Freshly roasted. Find your favourite over the counter.
            </p>
          </div>
          <Link href="/#visit" className="pill-button">
            Pick it up at the café <span aria-hidden="true">↗</span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
