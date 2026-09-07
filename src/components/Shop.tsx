import Link from "next/link";
import { products } from "@/lib/products";
import Reveal from "./Reveal";
import ProductCard from "./ProductCard";

export default function Shop() {
  return (
    <section id="coffee" className="coffee-section section-shell">
      <div className="site-container">
        <Reveal className="section-heading">
          <div>
            <p className="label">01 / Take a little Hinterhof home</p>
            <h2 className="display">
              find your
              <br />
              daily ritual.
            </h2>
          </div>
          <div className="section-heading-note">
            <p>
              Three coffees. One cold brew. All roasted in the courtyard, with
              something different to say.
            </p>
            <p className="label mt-5">Meet your next morning ↓</p>
          </div>
        </Reveal>
        <div className="ritual-shelf">
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
