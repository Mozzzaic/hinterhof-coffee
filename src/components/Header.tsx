"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { nav, site } from "@/lib/site";
import ArchMark from "./ArchMark";
import OpenStatus from "./OpenStatus";
import Wordmark from "./Wordmark";

export default function Header() {
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    // Where each section starts, measured once and on resize: the scroll
    // handler then only compares numbers and never asks for layout.
    let starts: Array<{ href: string; top: number }> = [];
    const measure = () => {
      starts = nav.flatMap((item) => {
        const section = document.getElementById(item.href.slice(2));
        return section
          ? [{ href: item.href, top: section.getBoundingClientRect().top + window.scrollY }]
          : [];
      });
    };
    const update = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      let current = "";
      for (const start of starts) if (start.top - y <= 180) current = start.href;
      setActive(current);
    };
    measure();
    update();
    const sizer = new ResizeObserver(() => {
      measure();
      update();
    });
    sizer.observe(document.body);
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      sizer.disconnect();
      window.removeEventListener("scroll", update);
    };
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
    const desktop = window.matchMedia("(min-width: 64rem)");
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

  const phone = `tel:${site.contact.phone.replace(/\s/g, "")}`;

  return (
    <header
      ref={headerRef}
      className="site-header"
      data-scrolled={scrolled}
      data-open={open}
    >
      <div className="site-header-bar">
        <Link
          href="/#top"
          className="site-header-brand"
          aria-label={`${site.fullName} — home`}
          onClick={() => setOpen(false)}
        >
          <ArchMark className="site-header-arch" />
          <Wordmark className="site-header-wordmark" />
        </Link>

        <OpenStatus variant="short" className="site-header-status" />

        <nav aria-label="Primary" className="site-header-nav">
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
          <a href={phone} className="pill-button pill-outline pill-small">
            Call the café <span aria-hidden="true">↗</span>
          </a>
        </nav>

        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="menu-button"
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
      </div>

      <nav
        aria-label="Mobile"
        data-lenis-prevent
        id="mobile-nav"
        hidden={!open}
        className="mobile-navigation"
      >
        <ul>
          {nav.map((item, index) => (
            <li key={item.href} style={{ "--i": index } as React.CSSProperties}>
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
        <OpenStatus className="mobile-navigation-status" />
        <a href={phone} className="pill-button mobile-navigation-call">
          Call the café <span aria-hidden="true">↗</span>
        </a>
        <p className="label mobile-navigation-address">
          {site.address.street} · Kreuzberg
        </p>
      </nav>
    </header>
  );
}
