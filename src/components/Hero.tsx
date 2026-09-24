import Link from "next/link";
import { site } from "@/lib/site";
import InkWordmark from "./InkWordmark";
import OpenStatus from "./OpenStatus";
import HeroMotion from "./HeroMotion";
import HeroLatte from "./HeroLatte";

export default function Hero() {
  return (
    <HeroMotion>
      <div className="site-container">
        <div className="poster-credits label">
          <span>Independent coffee bar & roastery</span>
          <span>Kreuzberg, Berlin · Since {site.founded}</span>
        </div>
        <h1 className="poster-wordmark">
          <span className="sr-only">Hinterhof Coffee</span>
          {/* The letters rise one by one (SVG), then the press takes over
              and they smear under the pointer. */}
          <InkWordmark split letters="ink" delay={1800} />
        </h1>
        <div className="poster-scene">
          <div className="poster-intro">
            <p className="label poster-rise">A little off the beaten path.</p>
            <h2 className="display">
              <span className="poster-line">
                <span>good things</span>
              </span>
              <span className="poster-line">
                <span>happen</span>
              </span>
              <span className="poster-line">
                <span>out back.</span>
              </span>
            </h2>
            <p className="poster-description poster-rise">
              Small-batch coffee. A slower morning. <br />
              Your own little corner of Kreuzberg.
            </p>
            <div className="poster-actions poster-rise">
              <Link href="/#visit" className="pill-button">
                Find the courtyard <span aria-hidden="true">↗</span>
              </Link>
              <Link href="/#bar" className="link-draw label">
                What’s pouring? ↗
              </Link>
            </div>
            <div className="poster-today poster-rise">
              <OpenStatus />
              <p className="label">
                {site.address.street} · {site.address.detail}
              </p>
            </div>
          </div>
          <HeroLatte />
        </div>
        <div className="poster-baseline">
          <p className="label">Roasted here. Poured here. Stay a while.</p>
          <p className="label">{site.transit}</p>
          <Link href="/#coffee" className="label link-draw">
            A coffee for every kind of day ↓
          </Link>
        </div>
      </div>
    </HeroMotion>
  );
}
