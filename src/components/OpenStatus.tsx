"use client";

import { useSyncExternalStore } from "react";
import {
  computeOpenShort,
  computeOpenState,
  computeOpenStatus,
  computeOpenTiny,
} from "@/lib/opening-hours";

function subscribe(update: () => void) {
  const interval = window.setInterval(update, 60_000);
  document.addEventListener("visibilitychange", update);
  return () => {
    window.clearInterval(interval);
    document.removeEventListener("visibilitychange", update);
  };
}

type Variant = "line" | "short";

const state = () => (computeOpenState().open ? "open" : "closed");

const snapshots: Record<Variant, () => string> = {
  line: () => `${state()}|${computeOpenStatus()}|`,
  short: () => `${state()}|${computeOpenShort()}|${computeOpenTiny()}`,
};

const server: Record<Variant, () => string> = {
  line: () => "unknown|See opening hours below|",
  short: () => "unknown|Opening hours|Hours",
};

/**
 * Live open or closed, in Berlin time. The dot is full when the bar is
 * pulling shots and hollow when it is not: no colour, just ink.
 * The short variant also carries a phone-sized text; CSS shows one of them.
 */
export default function OpenStatus({
  variant = "line",
  className = "",
}: {
  variant?: Variant;
  className?: string;
}) {
  const snapshot = useSyncExternalStore(
    subscribe,
    snapshots[variant],
    server[variant],
  );
  const [open, text, tiny] = snapshot.split("|");
  return (
    <p className={`open-status label ${className}`} data-state={open}>
      <span aria-hidden="true" className="open-dot" />
      <span className={tiny ? "open-text" : undefined}>{text}</span>
      {tiny ? <span className="open-tiny">{tiny}</span> : null}
    </p>
  );
}
