"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { nav, site } from "@/lib/site";
import ArchMark from "./ArchMark";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-50 bg-sky transition-shadow duration-300 ${
        scrolled ? "shadow-[0_2px_0_0_var(--color-ink)]" : ""
      }`}
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4 md:px-10">
        <Link
          href="/"
          className="flex items-center gap-2.5"
          aria-label={`${site.fullName} — home`}
          onClick={() => setOpen(false)}
        >
          <ArchMark className="h-7 w-auto" />
          <span className="display text-2xl lowercase">{site.name}</span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="link-draw label">
              {item.label}
            </Link>
          ))}
          <a
            href={`tel:${site.contact.phone.replace(/\s/g, "")}`}
            className="label rounded-full border-2 border-ink px-5 py-2.5 transition-colors duration-200 hover:bg-ink hover:text-sky"
          >
            Reserve
          </a>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="-mr-2 flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          <span
            className={`block h-0.5 w-6 rounded-full bg-ink transition-transform duration-300 ${
              open ? "translate-y-[4px] rotate-45" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-6 rounded-full bg-ink transition-transform duration-300 ${
              open ? "-translate-y-[4px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      <div
        id="mobile-nav"
        hidden={!open}
        className="border-t-2 border-ink px-6 pt-2 pb-8 md:hidden"
      >
        <ul>
          {nav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className="display block py-3 text-4xl lowercase"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <a
          href={`tel:${site.contact.phone.replace(/\s/g, "")}`}
          className="label mt-6 block rounded-full bg-ink px-6 py-4 text-center text-sky"
        >
          Reserve a table
        </a>
      </div>
    </header>
  );
}
