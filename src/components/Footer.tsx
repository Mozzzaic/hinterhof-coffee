import Link from "next/link";
import { nav, site } from "@/lib/site";
import ArchMark from "./ArchMark";
import Newsletter from "./Newsletter";

export default function Footer() {
  return (
    <footer className="overflow-hidden bg-ink px-6 pt-16 pb-6 text-sky md:px-10">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid gap-10 border-b-2 border-sky pb-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Link href="/" className="flex items-center gap-2.5">
              <ArchMark className="h-7 w-auto" />
              <span className="display text-2xl lowercase">{site.name}</span>
            </Link>
            <p className="display mt-5 max-w-[14ch] text-3xl lowercase">
              {site.tagline}
            </p>
          </div>

          <div className="lg:col-span-4">
            <p className="label">Find us</p>
            <address className="mt-3 space-y-0.5 text-[0.9375rem] not-italic">
              <p>{site.address.street}</p>
              <p>{site.address.detail}</p>
              <p>
                {site.address.postcode} {site.address.city}
              </p>
            </address>
            <div className="mt-4 space-y-1 text-[0.9375rem]">
              <p>
                <a
                  href={`tel:${site.contact.phone.replace(/\s/g, "")}`}
                  className="link-draw"
                >
                  {site.contact.phone}
                </a>
              </p>
              <p>
                <a href={`mailto:${site.contact.email}`} className="link-draw">
                  {site.contact.email}
                </a>
              </p>
              <p>
                <a
                  href={site.contact.instagram}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="link-draw"
                >
                  {site.contact.instagramHandle}
                </a>
              </p>
            </div>
          </div>

          <div className="lg:col-span-4">
            <Newsletter />
          </div>
        </div>

        <div className="flex flex-col gap-5 py-6 md:flex-row md:items-center md:justify-between">
          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-7 gap-y-2">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="link-draw label">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <p className="label">
            © {new Date().getFullYear()} {site.fullName} · Roasted in Kreuzberg
          </p>
        </div>

        {/* Closing wordmark. Set in SVG with an explicit textLength so it spans
            the container exactly at any viewport instead of overflowing. */}
        <svg
          viewBox="0 0 1000 172"
          className="mt-2 -mb-[3%] w-full"
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
