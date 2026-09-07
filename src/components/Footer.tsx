import Link from "next/link";
import { nav, site } from "@/lib/site";
import ArchMark from "./ArchMark";

export default function Footer() {
  return (
    <footer className="site-footer section-shell">
      <div className="site-container">
        <div className="footer-top">
          <div>
            <p className="label">A table, a tour, a question?</p>
            <a
              href={`mailto:${site.contact.email}`}
              className="display footer-hallo"
            >
              say hallo. <span aria-hidden="true">↗</span>
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
            <ArchMark className="h-10 w-auto" />
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
        <svg
          viewBox="0 0 1000 172"
          className="footer-wordmark"
          aria-hidden="true"
        >
          <text
            x="0"
            y="155"
            textLength="1000"
            lengthAdjust="spacingAndGlyphs"
            fontSize="200"
            fill="currentColor"
            className="display"
          >
            hinterhof
          </text>
        </svg>
      </div>
    </footer>
  );
}
