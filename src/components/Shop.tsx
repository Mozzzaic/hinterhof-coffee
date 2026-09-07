"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { products } from "@/lib/products";
import Reveal from "./Reveal";

const personalities = [
  "Your everyday regular",
  "Light, floral, unhurried",
  "For the late hours",
  "Eighteen hours. Ice cold.",
];

export default function Shop() {
  const [selected, setSelected] = useState(0);
  const product = products[selected];
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
            <p className="label mt-5">Choose your coffee below ↙</p>
          </div>
        </Reveal>
        <Reveal className="coffee-explorer">
          <div
            className="coffee-selection"
            role="group"
            aria-label="Choose a coffee"
          >
            {products.map((item, index) => (
              <button
                key={item.slug}
                type="button"
                aria-pressed={selected === index}
                aria-controls="coffee-profile"
                onClick={() => setSelected(index)}
                className="coffee-choice"
              >
                <span className="label">0{index + 1}</span>
                <span>
                  <span className="display coffee-choice-name">
                    {item.name}
                  </span>
                  <span className="coffee-choice-note">
                    {personalities[index]}
                  </span>
                </span>
                <span aria-hidden="true" className="coffee-choice-arrow">
                  ↗
                </span>
              </button>
            ))}
            <p className="label coffee-selection-foot">
              Small lots. Freshly roasted.
              <br />
              Available at the café.
            </p>
          </div>
          <div
            id="coffee-profile"
            className="coffee-profile"
            aria-live="polite"
            aria-atomic="true"
          >
            <div className="coffee-portrait" key={product.image}>
              <div className="duotone coffee-portrait-image">
                <Image
                  src={product.image}
                  alt={`${product.name} — ${product.origin}`}
                  fill
                  sizes="(min-width: 1024px) 30vw, 80vw"
                  className="object-cover"
                />
              </div>
              <span className="coffee-price display">
                €{product.price}
                <span className="label">{product.weight}</span>
              </span>
            </div>
            <div className="coffee-profile-copy" key={product.slug}>
              <p className="label">{product.origin}</p>
              <h3 className="display">{product.name}</h3>
              <p className="coffee-profile-description">{product.copy}</p>
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
                  aria-label={`${product.roast} out of 5`}
                >
                  {Array.from({ length: 5 }, (_, i) => (
                    <span
                      key={i}
                      data-filled={i < product.roast}
                      aria-hidden="true"
                    />
                  ))}
                </span>
                <span className="label">{product.pricePerKg}</span>
              </div>
              <Link href="/#visit" className="pill-button">
                Pick it up at the café <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
        </Reveal>
        <div className="shelf-footnote">
          <span className="label">From our roaster to your kitchen</span>
          <p>
            Rested ten days. Never more than three weeks off roast. Cash or
            card, over the counter.
          </p>
        </div>
      </div>
    </section>
  );
}
