import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";
import { PourOver, ArcText } from "./Illustration";
import ArchMark from "./ArchMark";
import OpenStatus from "./OpenStatus";

export default function Hero() {
  return (
    <section id="top" className="poster-hero section-shell">
      <div className="site-container">
        <div className="poster-credits label">
          <span>Independent coffee bar & roastery</span>
          <span>Kreuzberg, Berlin · Since {site.founded}</span>
        </div>
        <h1 className="poster-wordmark animate-rise">
          <span className="sr-only">Hinterhof Coffee</span>
          <svg viewBox="0 0 1000 185" aria-hidden="true">
            <text
              x="0"
              y="157"
              textLength="1000"
              lengthAdjust="spacingAndGlyphs"
              fontSize="200"
              fill="currentColor"
              className="display"
            >
              hinterhof
            </text>
          </svg>
        </h1>
        <div className="poster-scene">
          <div className="poster-intro animate-rise">
            <p className="label">A little off the beaten path.</p>
            <h2 className="display">
              good things
              <br />
              happen
              <br />
              out back.
            </h2>
            <p className="poster-description">
              Small-batch coffee. A slower morning. <br />
              Your own little corner of Kreuzberg.
            </p>
            <Link href="/#visit" className="pill-button">
              Find the courtyard <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <figure className="poster-image animate-rise">
            <div className="poster-image-outline" aria-hidden="true" />
            <div className="duotone poster-image-crop">
              <Image
                src="/images/products/goerli.jpg"
                alt="A freshly poured coffee beside a portafilter and coffee beans."
                fill
                preload
                sizes="(min-width: 1024px) 42vw, 90vw"
                className="object-cover"
              />
            </div>
            <div className="poster-stamp" aria-hidden="true">
              <div className="animate-spin-slow">
                <ArcText
                  text="GOOD COFFEE · GOOD COMPANY · "
                  className="h-full w-full"
                />
              </div>
              <ArchMark className="h-10 w-auto" />
            </div>
            <figcaption className="label">
              Roasted here. Poured here. Stay a while.
            </figcaption>
          </figure>
          <aside className="poster-aside animate-rise">
            <PourOver className="poster-pour" />
            <p className="display">
              take the
              <br />
              long way.
            </p>
            <span className="poster-small-rule" />
            <p className="label">
              Second courtyard.
              <br />
              Third door.
              <br />
              You’re in the right place.
            </p>
            <Link href="/#bar" className="link-draw label">
              What’s pouring? ↗
            </Link>
          </aside>
        </div>
        <div className="poster-baseline">
          <OpenStatus />
          <p className="label">
            {site.address.street} · {site.address.detail}
          </p>
          <Link href="/#coffee" className="label link-draw">
            A coffee for every kind of day ↓
          </Link>
        </div>
      </div>
    </section>
  );
}
