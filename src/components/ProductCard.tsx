import Image from "next/image";
import type { Product } from "@/lib/products";
import Reveal from "./Reveal";

const personalities = [
  "Your everyday regular",
  "Light, floral, unhurried",
  "For the late hours",
  "Eighteen hours. Ice cold.",
];

export default function ProductCard({
  product,
  index,
}: {
  product: Product;
  index: number;
}) {
  return (
    <Reveal as="article" className="ritual-card" delay={index * 0.07}>
      <div className="ritual-index label">
        <span>
          0{index + 1} / {product.status || "Dark roast"}
        </span>
        <span>{product.weight}</span>
      </div>
      <div className="ritual-portrait">
        <div className="ritual-mask">
          <div className="duotone ritual-artwork">
            <Image
              src={product.image}
              alt={product.name + " — " + product.origin}
              fill
              sizes="(min-width: 1024px) 23vw, (min-width: 640px) 45vw, 85vw"
              className="object-cover"
            />
          </div>
        </div>
        <span className="ritual-price display">
          €{product.price}
          <span className="label">{product.weight}</span>
        </span>
      </div>
      <div className="ritual-title">
        <p className="label">{product.origin}</p>
        <h3 className="display">{product.name}</h3>
        <p>{personalities[index]}</p>
      </div>
      <p className="ritual-description">{product.copy}</p>
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
  );
}
