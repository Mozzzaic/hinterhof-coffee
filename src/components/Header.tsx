"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { nav, site } from "@/lib/site";
import ArchMark from "./ArchMark";
import Wordmark from "./Wordmark";

export default function Header() {
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const updateActive = () => {
      let current = "";
      for (const item of nav) {
        const section = document.getElementById(item.href.slice(2));
        if (section && section.getBoundingClientRect().top <= 180)
          current = item.href;
      }
      setActive(current);
    };
    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    return () => window.removeEventListener("scroll", updateActive);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    const outside = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !headerRef.current?.contains(event.target)
      )
        setOpen(false);
    };
    const desktop = window.matchMedia("(min-width: 48rem)");
    const resize = () => {
      if (desktop.matches) setOpen(false);
    };
    document.addEventListener("keydown", dismiss);
    document.addEventListener("pointerdown", outside);
    desktop.addEventListener("change", resize);
    return () => {
      document.removeEventListener("keydown", dismiss);
      document.removeEventListener("pointerdown", outside);
      desktop.removeEventListener("change", resize);
    };
  }, [open]);

  return (
    <header
      ref={headerRef}
      className={`sticky top-0 z-50 bg-sky transition-shadow duration-300 ${
        scrolled ? "shadow-[0_2px_0_0_var(--color-ink)]" : ""
      }`}
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4 md:px-10 lg:py-5">
        <Link
          href="/#top"
          className="flex items-center gap-2.5"
          aria-label={`${site.fullName} — home`}
          onClick={() => setOpen(false)}
        >
          <ArchMark className="h-7 w-auto" />
          <Wordmark className="h-6 w-auto" />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active === item.href ? "location" : undefined}
              className="link-draw label"
            >
              {item.label}
            </Link>
          ))}
          <a
            href={`tel:${site.contact.phone.replace(/\s/g, "")}`}
            className="label rounded-full border-2 border-ink px-5 py-2.5 transition-colors duration-200 hover:bg-ink hover:text-sky"
          >
            Call the café ↗
          </a>
        </nav>

        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="-mr-2 flex h-12 w-12 flex-col items-center justify-center gap-1.5 md:hidden"
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

      <nav
        aria-label="Mobile"
        data-lenis-prevent
        id="mobile-nav"
        hidden={!open}
        className="mobile-navigation md:hidden"
      >
        <ul>
          {nav.map((item, index) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className="mobile-navigation-link"
              >
                <span className="label">0{index + 1}</span>
                <span className="display">{item.label}</span>
                <span aria-hidden="true">↗</span>
              </Link>
            </li>
          ))}
        </ul>
        <a
          href={`tel:${site.contact.phone.replace(/\s/g, "")}`}
          className="label mt-6 block rounded-full bg-ink px-6 py-4 text-center text-sky"
        >
          Call the café ↗
        </a>
        <p className="label mt-5">{site.address.street} · Kreuzberg</p>
      </nav>
    </header>
  );
}
