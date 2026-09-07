"use client";

import { useSyncExternalStore } from "react";
import { computeOpenStatus } from "@/lib/opening-hours";

function subscribe(update: () => void) {
  const interval = window.setInterval(update, 60_000);
  document.addEventListener("visibilitychange", update);
  return () => {
    window.clearInterval(interval);
    document.removeEventListener("visibilitychange", update);
  };
}

const serverSnapshot = () => "See opening hours below";

export default function OpenStatus() {
  const status = useSyncExternalStore(
    subscribe,
    computeOpenStatus,
    serverSnapshot,
  );
  return (
    <p className="label mt-7 flex items-center gap-2.5">
      <span
        aria-hidden="true"
        className="block h-2.5 w-2.5 shrink-0 rounded-full bg-ink"
      />
      <span>{status}</span>
    </p>
  );
}
