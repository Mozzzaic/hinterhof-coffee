"use client";

import { useState } from "react";
import { drinks, goodToKnow } from "@/lib/products";
import Reveal from "./Reveal";
import { LeverMachine } from "./Illustration";

const categories = ["Everything", "The classics", "House originals"] as const;

export default function Bar() {
  const [category, setCategory] =
    useState<(typeof categories)[number]>("Everything");
  const visible = drinks.filter(
    (_, index) =>
      category === "Everything" ||
      (category === "The classics" ? index < 6 : index >= 6),
  );
  return (
    <section id="bar" className="bar-section section-shell">
      <div className="site-container bar-layout">
        <Reveal className="bar-intro">
          <p className="label">02 / The coffee bar</p>
          <h2 className="display">
            come in.
            <br />
            settle in.
          </h2>
          <p>
            A quick one at the counter or a whole afternoon. There’s a cup for
            that.
          </p>
          <LeverMachine className="bar-machine" />
          <div className="bar-note">
            <span className="label">A few house rules</span>
            {goodToKnow.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </Reveal>
        <div className="bar-menu">
          <div className="menu-heading">
            <span className="label">Made to order. Worth the wait.</span>
            <span className="label">EUR</span>
          </div>
          <div
            className="menu-filters"
            role="group"
            aria-label="Filter the drinks menu"
          >
            {categories.map((item) => (
              <button
                type="button"
                key={item}
                aria-pressed={category === item}
                aria-controls="drinks-list"
                onClick={() => setCategory(item)}
              >
                {item}
                {item === "Everything" && <span>09</span>}
              </button>
            ))}
          </div>
          <p className="sr-only" role="status">
            {visible.length} drinks shown
          </p>
          <dl id="drinks-list" className="drinks-list">
            {visible.map((drink) => (
              <div className="drink-item" key={drink.name}>
                <dt className="display">{drink.name}</dt>
                <dd className="drink-price">
                  {drink.price.toFixed(2).replace(".", ",")}
                </dd>
                <dd className="label drink-meta">
                  {drink.german} <span>·</span> {drink.meta}
                </dd>
                <dd className="drink-description">{drink.copy}</dd>
              </div>
            ))}
          </dl>
          <div className="menu-end label">
            <span>Whole milk or oat. Same price.</span>
            <span>Stay for another ↗</span>
          </div>
        </div>
      </div>
    </section>
  );
}
