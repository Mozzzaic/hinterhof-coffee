"use client";

import { useEffect } from "react";
import { gsap } from "@/lib/gsap";

/**
 * The page's physical layer: one loop, on GSAP's ticker, for everything that
 * follows the pointer or the momentum of the scroll.
 *
 * Nothing here has a duration. Each value chases its target on a critically
 * damped spring, so it arrives without ever overshooting (the system's "no
 * bounce", said for springs):
 *
 * - momentum: the scroll's speed, smoothed and bounded to ±1, published once
 *   as `--momentum` on the titles. Section titles lean with it; the origins
 *   band speeds up and turns with the scroll; the stamps spin faster.
 * - depth: arches and stamps drift a little against the scroll.
 * - touch (mouse only): pills lean toward the pointer, a shelf jar tilts
 *   toward it, the letters of "say hallo." rise in a wave under it.
 *
 * Reduced motion: none of it runs; the CSS fallbacks (a steady band, a
 * steady stamp) stay as they are.
 *
 * Cost: the loop never reads layout. What is on screen comes from
 * IntersectionObservers, positions from a map of the page measured once
 * (and again on resize), so a frame only writes. `--momentum` is set on the
 * titles in view, never on the root: a custom property on <html> would
 * restyle the whole page every frame.
 */

type Spring = { value: number; target: number };

const HAND = 14;
const SCROLL = 6;
const MAX_SPEED = 3000;

const approach = (spring: Spring, rate: number, dt: number) => {
  spring.value += (spring.target - spring.value) * (1 - Math.exp(-dt * rate));
  if (Math.abs(spring.target - spring.value) < 1e-4) spring.value = spring.target;
};

export default function MotionLayer() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");

    // ---- What is on screen, without asking every frame --------------------
    const onScreen = new Set<Element>();
    const seen = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) onScreen.add(entry.target);
          else onScreen.delete(entry.target);
        }
      },
      { rootMargin: "50% 0px" },
    );

    // ---- Momentum ---------------------------------------------------------
    const momentum: Spring = { value: 0, target: 0 };
    let lastScroll = window.scrollY;
    let published = 0;
    let direction = 1;
    const titles = [...document.querySelectorAll<HTMLElement>("h2.display")];
    titles.forEach((title) => seen.observe(title));

    // ---- The origins band: driven here once the page is alive -------------
    const bands = [...document.querySelectorAll<HTMLElement>("[data-marquee]")].map(
      (track) => {
        track.dataset.driven = "true";
        seen.observe(track);
        return { track, x: 0, half: 0 };
      },
    );

    // ---- Stamps that spin -------------------------------------------------
    const stamps = [...document.querySelectorAll<HTMLElement>(".animate-spin-slow")].map(
      (el) => {
        el.dataset.driven = "true";
        seen.observe(el);
        return { el, angle: 0 };
      },
    );

    // ---- Depth ------------------------------------------------------------
    const drifters = [...document.querySelectorAll<HTMLElement>("[data-drift]")].map(
      (el) => {
        seen.observe(el);
        return { el, centre: 0, spring: { value: 0, target: 0 } as Spring };
      },
    );

    // ---- The map of the page: measured once, and on resize ----------------
    const measure = () => {
      for (const band of bands) band.half = band.track.scrollWidth / 2;
      for (const drifter of drifters) {
        const rect = drifter.el.getBoundingClientRect();
        // Measured where it stands now, minus the drift it already has.
        drifter.centre = rect.top + rect.height / 2 + window.scrollY - drifter.spring.value;
      }
    };
    measure();
    const sizer = new ResizeObserver(() => measure());
    sizer.observe(document.body);
    document.fonts?.ready.then(measure).catch(() => {});

    // ---- Under the hand ---------------------------------------------------
    type Handled = { el: HTMLElement; x: Spring; y: Spring };
    const handled = new Map<HTMLElement, Handled>();
    const hold = (el: HTMLElement) => {
      let entry = handled.get(el);
      if (!entry) {
        entry = { el, x: { value: 0, target: 0 }, y: { value: 0, target: 0 } };
        handled.set(el, entry);
      }
      return entry;
    };
    let pill: HTMLElement | null = null;
    let jar: HTMLElement | null = null;
    let hallo: HTMLElement | null = null;
    const letters = new Map<HTMLElement, Spring>();

    const onPointer = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || !fine.matches) return;
      const target = event.target instanceof Element ? event.target : null;

      // Pills: lean toward the pointer, 8px at most.
      const nextPill = target?.closest<HTMLElement>(".pill-button") ?? null;
      if (pill && pill !== nextPill) {
        const entry = hold(pill);
        entry.x.target = 0;
        entry.y.target = 0;
      }
      pill = nextPill;
      if (pill) {
        const rect = pill.getBoundingClientRect();
        const entry = hold(pill);
        const dx = event.clientX - (rect.left + rect.width / 2);
        const dy = event.clientY - (rect.top + rect.height / 2);
        entry.x.target = Math.max(-8, Math.min(8, dx * 0.25));
        entry.y.target = Math.max(-6, Math.min(6, dy * 0.35));
      }

      // Shelf jars: tilt toward the pointer, 4° at most.
      const nextJar = target?.closest<HTMLElement>(".shelf-item") ?? null;
      if (jar && jar !== nextJar) hold(jar).x.target = 0;
      jar = nextJar;
      if (jar) {
        const rect = jar.getBoundingClientRect();
        const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        hold(jar).x.target = Math.max(-1, Math.min(1, nx));
      }

      // "say hallo.": the letters rise in a wave under the pointer.
      const nextHallo = target?.closest<HTMLElement>(".footer-hallo") ?? null;
      if (hallo && hallo !== nextHallo) letters.forEach((spring) => (spring.target = 0));
      hallo = nextHallo;
      if (hallo) {
        hallo.querySelectorAll<HTMLElement>(".wave-letter").forEach((letter) => {
          const rect = letter.getBoundingClientRect();
          const d = (event.clientX - (rect.left + rect.width / 2)) / (rect.height * 0.9);
          let spring = letters.get(letter);
          if (!spring) {
            spring = { value: 0, target: 0 };
            letters.set(letter, spring);
          }
          spring.target = Math.exp(-d * d);
        });
      }
    };
    const onLeave = () => {
      if (pill) {
        const entry = hold(pill);
        entry.x.target = 0;
        entry.y.target = 0;
        pill = null;
      }
      if (jar) hold(jar).x.target = 0;
      jar = null;
      letters.forEach((spring) => (spring.target = 0));
      hallo = null;
    };

    let last = 0;
    const tick = () => {
      const now = performance.now() / 1000;
      const dt = Math.min(0.1, last ? now - last : 1 / 60);
      last = now;
      const view = window.innerHeight;

      // Momentum, written on the titles in view, and only when it changes
      // enough to show.
      const scroll = window.scrollY;
      const speed = (scroll - lastScroll) / Math.max(dt, 0.001);
      lastScroll = scroll;
      momentum.target = Math.max(-1, Math.min(1, speed / MAX_SPEED));
      approach(momentum, SCROLL, dt);
      if (Math.abs(momentum.value) > 0.02) direction = Math.sign(momentum.value);
      if (
        Math.abs(momentum.value - published) > 0.004 ||
        (momentum.value === 0 && published !== 0)
      ) {
        published = Math.round(momentum.value * 1000) / 1000;
        for (const title of titles) {
          if (onScreen.has(title)) title.style.setProperty("--momentum", String(published));
          else if (published === 0) title.style.removeProperty("--momentum");
        }
      }
      const push = Math.abs(momentum.value);

      // The band: 60 s a lap at rest, up to four times faster, in the
      // direction the page is going.
      for (const band of bands) {
        if (!onScreen.has(band.track) || band.half <= 0) continue;
        band.x -= (band.half / 60) * (1 + push * 3) * direction * dt;
        band.x = ((band.x % band.half) - band.half) % band.half;
        band.track.style.transform = `translate3d(${band.x.toFixed(2)}px, 0, 0)`;
      }

      // Stamps: a lap in 26 s at rest, faster with the scroll.
      for (const stamp of stamps) {
        if (!onScreen.has(stamp.el)) continue;
        stamp.angle = (stamp.angle + (360 / 26) * (1 + push * 3) * dt) % 360;
        stamp.el.style.transform = `rotate(${stamp.angle.toFixed(2)}deg)`;
      }

      // Depth: marks drift against the scroll, 40px at most.
      for (const drifter of drifters) {
        if (!onScreen.has(drifter.el)) continue;
        const centre = (drifter.centre - scroll - view / 2) / view;
        drifter.spring.target = Math.max(-1, Math.min(1, centre)) * -40;
        const before = drifter.spring.value;
        approach(drifter.spring, SCROLL, dt);
        if (Math.abs(drifter.spring.value - before) > 0.01 || drifter.spring.value === drifter.spring.target)
          drifter.el.style.setProperty("--drift", `${drifter.spring.value.toFixed(1)}px`);
      }

      // Under the hand.
      handled.forEach((entry, el) => {
        approach(entry.x, HAND, dt);
        approach(entry.y, HAND, dt);
        if (el.classList.contains("shelf-item")) {
          el.style.setProperty("--tilt", entry.x.value.toFixed(4));
        } else {
          el.style.setProperty("--mx", `${entry.x.value.toFixed(2)}px`);
          el.style.setProperty("--my", `${entry.y.value.toFixed(2)}px`);
        }
        if (entry.x.value === 0 && entry.y.value === 0 && entry.x.target === 0 && entry.y.target === 0) {
          handled.delete(el);
        }
      });
      letters.forEach((spring, letter) => {
        approach(spring, HAND, dt);
        letter.style.setProperty("--lift", spring.value.toFixed(4));
        if (spring.value === 0 && spring.target === 0) letters.delete(letter);
      });
    };

    document.addEventListener("pointermove", onPointer, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      seen.disconnect();
      sizer.disconnect();
      titles.forEach((title) => title.style.removeProperty("--momentum"));
      document.removeEventListener("pointermove", onPointer);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      for (const band of bands) {
        delete band.track.dataset.driven;
        band.track.style.transform = "";
      }
      for (const stamp of stamps) {
        delete stamp.el.dataset.driven;
        stamp.el.style.transform = "";
      }
    };
  }, []);

  return null;
}
