"use client";

import Image from "next/image";
import { useState } from "react";
import { route } from "@/lib/site";
import ArchMark from "./ArchMark";
import Courtyard from "./Courtyard";

/**
 * The courtyard guide. With the press, a map of the block printed from
 * above: as the section scrolls by, the way from Oranienstraße to the café
 * door draws itself on the ground and the three stops light up in turn.
 * Pointing at a stop in the list (or tapping it) leans the map toward it.
 * Without the press, a photograph of the passage and the same three stops.
 */
export default function VisitWalk() {
  const [station, setStation] = useState(-1);
  const [focus, setFocus] = useState(-1);

  return (
    <div className="courtyard-guide" data-station={station}>
      <div className="guide-heading label">
        <span>Finding us is part of it.</span>
        <span>A courtyard guide · Not to scale</span>
      </div>
      <Courtyard
        paper="sky"
        className="guide-view"
        onStation={setStation}
        focus={focus}
      >
        <div className="courtyard-poster duotone">
          <Image
            src="/images/street.jpg"
            alt=""
            fill
            sizes="(min-width: 1024px) 56vw, 92vw"
            className="object-cover"
          />
        </div>
        {route.map((stop, index) => (
          <span
            key={stop.title}
            className="map-stop label"
            data-reached={station >= index}
            data-focus={focus === index}
            aria-hidden="true"
            style={
              {
                left: `var(--stop-${index}-x)`,
                top: `var(--stop-${index}-y)`,
              } as React.CSSProperties
            }
          >
            0{index + 1}
          </span>
        ))}
      </Courtyard>
      <ol className="courtyard-route">
        {route.map((stop, index) => (
          <li
            key={stop.title}
            className="route-stop"
            data-active={index === station}
            data-passed={station > index}
            data-destination={index === route.length - 1}
            data-focus={focus === index}
            onPointerEnter={(event) => {
              if (event.pointerType === "mouse") setFocus(index);
            }}
            onPointerLeave={(event) => {
              if (event.pointerType === "mouse") setFocus(-1);
            }}
            onPointerUp={(event) => {
              if (event.pointerType !== "mouse")
                setFocus((current) => (current === index ? -1 : index));
            }}
          >
            <span className="route-number label">0{index + 1}</span>
            <span className="route-arch" aria-hidden="true">
              <ArchMark />
            </span>
            <h3 className="display">{stop.title}</h3>
            <p>
              {stop.lines[0]}
              <br />
              {stop.lines[1]}
            </p>
          </li>
        ))}
      </ol>
      <div className="guide-bottom">
        <p className="display">
          looks closed.
          <br />
          probably isn’t.
        </p>
        <p>
          The passage is unmarked.
          <br />
          Come on through.
        </p>
      </div>
    </div>
  );
}
