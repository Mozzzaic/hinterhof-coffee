"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { drinks, goodToKnow } from "@/lib/products";
import { Flip, gsap } from "@/lib/gsap";
import Reveal from "./Reveal";
import LineReveal from "./LineReveal";
import { LeverMachine } from "./Illustration";

const categories = ["Everything", "The classics", "House originals"] as const;
type Category = (typeof categories)[number];

const inCategory = (index: number, category: Category) =>
  category === "Everything" ||
  (category === "The classics" ? index < 6 : index >= 6);

export default function Bar() {
  const [category, setCategory] = useState<Category>("Everything");
  const [pulling, setPulling] = useState(false);
  const list = useRef<HTMLDListElement>(null);
  const flip = useRef<Flip.FlipState | null>(null);
  const count = drinks.filter((_, index) => inCategory(index, category)).length;

  const choose = (next: Category) => {
    if (next === category) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (list.current && !reduced)
      flip.current = Flip.getState(list.current.querySelectorAll(".drink-item"));
    setCategory(next);
  };

  // The menu reshuffles like cards on a counter: rows that stay slide to
  // their new place, rows that arrive rise out of a cut, rows that go sink.
  useLayoutEffect(() => {
    const state = flip.current;
    if (!state) return;
    flip.current = null;
    Flip.from(state, {
      duration: 0.45,
      absolute: true,
      nested: true,
      onEnter: (elements) =>
        gsap.fromTo(
          elements,
          { yPercent: 30, clipPath: "inset(0% 0% 100% 0%)" },
          {
            yPercent: 0,
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 0.45,
            stagger: 0.05,
            clearProps: "clipPath,transform",
          },
        ),
      onLeave: (elements) =>
        gsap.to(elements, {
          yPercent: -20,
          clipPath: "inset(100% 0% 0% 0%)",
          duration: 0.3,
        }),
    });
  }, [category]);

  return (
    <section id="bar" className="bar-section section-shell">
      <div className="site-container bar-layout">
        <div className="bar-intro">
          <Reveal as="p" className="label">
            02 / The coffee bar
          </Reveal>
          <LineReveal className="display">
            come in.
            <br />
            settle in.
          </LineReveal>
          <Reveal as="p" delay={0.14}>
            A quick one at the counter or a whole afternoon. There’s a cup for
            that.
          </Reveal>
          <div className="bar-machine" data-pulling={pulling}>
            <LeverMachine />
          </div>
          <Reveal className="bar-note" delay={0.07}>
            <span className="label">A few house rules</span>
            {goodToKnow.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </Reveal>
        </div>
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
                onClick={() => choose(item)}
              >
                {item}
                {item === "Everything" && <span>09</span>}
              </button>
            ))}
          </div>
          <p className="sr-only" role="status">
            {count} drinks shown
          </p>
          <dl
            id="drinks-list"
            ref={list}
            className="drinks-list"
            onPointerLeave={() => setPulling(false)}
          >
            {drinks.map((drink, index) => (
              <div
                className="drink-item"
                key={drink.name}
                hidden={!inCategory(index, category)}
                onPointerEnter={() => setPulling(true)}
              >
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
