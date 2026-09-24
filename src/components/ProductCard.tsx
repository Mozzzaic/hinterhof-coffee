import type { Product } from "@/lib/products";
import InkImage from "./InkImage";
import Reveal from "./Reveal";

const personalities = [
  "Your everyday regular",
  "Light, floral, unhurried",
  "For the late hours",
  "Eighteen hours. Ice cold.",
];

/**
 * One bag on the shelf. The card spans five rows of the shelf grid
 * (subgrid), so labels, names, copy and notes line up across all four,
 * and every jar stands on the same shelf line whatever its size.
 */
export default function ProductCard({
  product,
  index,
}: {
  product: Product;
  index: number;
}) {
  return (
    <article
      className="shelf-item"
      style={{ "--i": index } as React.CSSProperties}
    >
      <Reveal as="p" className="shelf-index label" delay={index * 0.07}>
        <span>
          0{index + 1} / {product.status || "Dark roast"}
        </span>
        <span>{product.weight}</span>
      </Reveal>
      <div className="shelf-object">
        <InkImage
          src={product.image}
          alt={product.name + " — " + product.origin}
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 85vw"
          paper="chalk"
          sweep="radial"
          className="shelf-jar"
          focus={product.focus}
          zoom={product.zoom}
        />
        <span className="shelf-price display">
          €{product.price}
          <span className="label">{product.weight}</span>
        </span>
      </div>
      <Reveal className="shelf-title" delay={0.07 + index * 0.07}>
        <p className="label">{product.origin}</p>
        <h3 className="display">{product.name}</h3>
        <p>{personalities[index]}</p>
      </Reveal>
      <Reveal as="p" className="shelf-copy" delay={0.14 + index * 0.07}>
        {product.copy}
      </Reveal>
      <Reveal className="shelf-meta" delay={0.21 + index * 0.07}>
        <ul className="flavour-notes" aria-label="Tasting notes">
          {product.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
        <div className="roast-scale">
          <span className="label">Roast</span>
          <span
            className="roast-dots"
            role="img"
            aria-label={product.roast + " out of 5"}
          >
            {Array.from({ length: 5 }, (_, i) => (
              <span key={i} data-filled={i < product.roast} aria-hidden="true" />
            ))}
          </span>
          <span className="label">{product.pricePerKg}</span>
        </div>
      </Reveal>
    </article>
  );
}
