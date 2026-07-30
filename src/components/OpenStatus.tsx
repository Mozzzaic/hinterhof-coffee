"use client";

import { useEffect, useRef } from "react";
import { site } from "@/lib/site";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function formatHour(hour: number) {
  const h = String(Math.floor(hour)).padStart(2, "0");
  const m = String(Math.round((hour % 1) * 60)).padStart(2, "0");
  return `${h}:${m}`;
}

/**
 * Evaluated in Europe/Berlin regardless of the visitor's own timezone — a
 * Kreuzberg opening line should read the same in Berlin and in Tokyo. Does
 * not account for the holiday closures named alongside the hours table; wire
 * that in if it ever needs to be exact rather than illustrative.
 */
function computeOpenStatus(): string {
  const berlin = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Europe/Berlin" }),
  );
  const day = berlin.getDay();
  const now = berlin.getHours() + berlin.getMinutes() / 60;
  const [open, close] = site.weeklyHours[day];

  if (now >= open && now < close) {
    return `Open now — until ${formatHour(close)} Berlin time`;
  }

  const i = now < open ? 0 : 1;
  const d = (day + i) % 7;
  const [opensAt] = site.weeklyHours[d];
  const when = i === 0 ? "today" : i === 1 ? "tomorrow" : DAY_NAMES[d];
  return `Closed — opens ${when} at ${formatHour(opensAt)}`;
}

/**
 * This can only be known at the moment someone loads the page — the homepage
 * is statically prerendered, so a value baked in at build time would stay
 * frozen to whichever minute the site was last deployed. Written straight to
 * the DOM after mount rather than through state: there is nothing here for
 * React to re-render around, only the browser's clock to read once.
 */
export default function OpenStatus() {
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = textRef.current;
    if (el) el.textContent = computeOpenStatus();
  }, []);

  return (
    <p className="label mt-7 flex items-center gap-2.5">
      <span
        aria-hidden
        className="block h-2.5 w-2.5 shrink-0 rounded-full bg-ink"
      />
      <span ref={textRef} />
    </p>
  );
}
