import Link from "next/link";
import { nav, site } from "@/lib/site";
import ArchMark from "./ArchMark";
import InkWordmark from "./InkWordmark";
import Reveal from "./Reveal";

export default function Footer() {
  return (
    <footer className="site-footer section-shell">
      <div className="site-container">
        <div className="footer-top">
          <div>
            <p className="label">A table, a tour, a question?</p>
            <a
              href={`mailto:${site.contact.email}`}
              className="footer-hallo"
              aria-label={`Say hallo: write to ${site.contact.email}`}
            >
              {/* One span per letter: they rise in a wave under the pointer. */}
              <Reveal as="span" className="display">
                {[..."say hallo."].map((letter, index) => (
                  <span key={index} className="wave-letter">
                    {letter === " " ? " " : letter}
                  </span>
                ))}{" "}
                <span className="hallo-arrow">↗</span>
              </Reveal>
            </a>
          </div>
          <div className="footer-contact">
            <a href={`mailto:${site.contact.email}`} className="link-draw">
              {site.contact.email}
            </a>
            <a
              href={`tel:${site.contact.phone.replace(/\s/g, "")}`}
              className="link-draw"
            >
              {site.contact.phone}
            </a>
            <p>
              Second courtyard, third door.
              <br />
              Kreuzberg, Berlin.
            </p>
          </div>
          <Link href="/#top" className="footer-back">
            <ArchMark className="footer-back-mark" />
            <span className="label">Back to the top ↑</span>
          </Link>
        </div>
        <div className="footer-bottom">
          <nav aria-label="Footer">
            {nav.map((item) => (
              <Link
                className="label link-draw"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <span className="label">Independent since {site.founded}</span>
          <p className="label">© {new Date().getFullYear()} Hinterhof Coffee</p>
        </div>
        <InkWordmark className="footer-wordmark" letters="sky" />
      </div>
    </footer>
  );
}
