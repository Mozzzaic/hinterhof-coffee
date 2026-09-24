"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { pour } from "@/lib/site";
import { loadThree, pressFailed, pressOn } from "@/lib/webgl/support";
import ArchMark from "./ArchMark";
import { ArcText, HandArrow } from "./Illustration";

/**
 * The hero's cup: a flat white seen from above, printed live. It pours
 * itself when it first comes into view (shot, milk, heart); after that the
 * pointer stirs it and a press drops milk. Without the press, a photograph
 * of the same cup.
 */
export default function HeroLatte() {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const replay = useRef<() => void>(() => {});
  const [stage, setStage] = useState(-1);

  useEffect(() => {
    const el = wrap.current;
    const surface = canvas.current;
    if (!el || !surface || !pressOn()) return;
    let release = () => {};
    let cancelled = false;
    loadThree().catch(() => {});
    import("@/lib/webgl/latte")
      .then(({ attachLatte }) => {
        if (cancelled) return;
        const latte = attachLatte({
          wrap: el,
          canvas: surface,
          paper: "sky",
          onStage: setStage,
        });
        release = latte.release;
        replay.current = latte.replay;
      })
      .catch(pressFailed);
    return () => {
      cancelled = true;
      release();
    };
  }, []);

  return (
    <figure className="poster-latte">
      <div
        ref={wrap}
        className="latte-frame"
        role="img"
        aria-label="A flat white seen from above, on its saucer with a spoon: the shot, then the milk, poured into a heart."
      >
        <div className="latte-poster">
          <div className="latte-photo duotone">
            <Image
              src="/images/products/goerli.jpg"
              alt=""
              fill
              preload
              sizes="(min-width: 1024px) 34vw, 70vw"
              className="object-cover"
            />
          </div>
        </div>
        <canvas ref={canvas} className="ink-canvas" aria-hidden="true" />
      </div>
      <div className="poster-stamp" aria-hidden="true" data-drift>
        <div className="animate-spin-slow">
          <ArcText
            text="GOOD COFFEE · GOOD COMPANY · "
            className="h-full w-full"
          />
        </div>
        <ArchMark className="poster-stamp-mark" />
      </div>
      <div className="poster-latte-foot">
        <div className="poster-note" aria-hidden="true">
          {/* A finger taps a drop in; a mouse stirs. */}
          <p className="display">
            <span className="note-pointer">stir it,</span>
            <span className="note-touch">tap it,</span>
            <br />
            it’s yours.
          </p>
          <HandArrow className="poster-note-arrow" />
        </div>
        <div className="poster-pour">
          <ol
            className="stage-rail"
            aria-label="The pour"
            style={
              {
                "--pour": stage < 0 ? 0 : stage / (pour.length - 1),
              } as React.CSSProperties
            }
          >
            {pour.map((step, index) => (
              <li
                key={step.title}
                className="stage-stop"
                data-active={index === stage}
                data-passed={stage > index}
              >
                <span className="stage-dot" aria-hidden="true" />
                <span className="label stage-label">
                  <span>0{index + 1}</span> <span>{step.title}</span>
                </span>
              </li>
            ))}
          </ol>
          <div className="pour-foot">
            <figcaption className="label">
              A flat white, the way the counter pours it.
            </figcaption>
            <button
              type="button"
              className="pour-again label link-draw"
              onClick={() => replay.current()}
            >
              Pour another <span aria-hidden="true">↻</span>
            </button>
          </div>
        </div>
      </div>
    </figure>
  );
}
