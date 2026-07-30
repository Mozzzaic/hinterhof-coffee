import { useId } from "react";

/**
 * Hand-drawn line art.
 *
 * The paths are plain geometry; the pencil quality comes from a turbulence +
 * displacement filter, which wobbles every stroke exactly the way a hand does.
 * That way the drawings stay editable as vectors instead of becoming assets.
 *
 * Every filter/path id here is generated with useId() rather than hardcoded —
 * an SVG id is global to the document, so two instances of the same component
 * (e.g. Bean repeated down the marquee) would otherwise collide and all
 * render whichever filter the browser resolves first.
 */

function RoughFilter({ id, scale = 2.4 }: { id: string; scale?: number }) {
  return (
    <filter id={id} x="-8%" y="-8%" width="116%" height="116%">
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.028"
        numOctaves="3"
        seed="9"
        result="noise"
      />
      <feDisplacementMap
        in="SourceGraphic"
        in2="noise"
        scale={scale}
        xChannelSelector="R"
        yChannelSelector="G"
      />
    </filter>
  );
}

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.4,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/** The hero drawing: a gooseneck kettle pouring through a cone into a carafe. */
export function PourOver({ className = "" }: { className?: string }) {
  const filterId = useId();
  return (
    <svg
      viewBox="0 0 380 470"
      className={className}
      role="img"
      aria-label="A gooseneck kettle pouring water through a filter cone into a glass carafe."
    >
      <defs>
        <RoughFilter id={filterId} scale={2.4} />
      </defs>
      <g filter={`url(#${filterId})`} {...stroke}>
        {/* kettle body */}
        <path d="M36 116h112l-9 82c-1 9-8 15-17 15H62c-9 0-16-6-17-15l-9-82Z" />
        <ellipse cx="92" cy="116" rx="56" ry="12" />
        {/* lid knob */}
        <path d="M92 104v-9" />
        <circle cx="92" cy="88" r="8" />
        {/* carry handle */}
        <path d="M50 108c4-32 20-48 42-48s38 16 42 48" />
        {/* gooseneck spout */}
        <path d="M147 142c30 2 47 14 55 33 6 15 6 30 4 43" />
        {/* the pour */}
        <path d="M206 224v30" strokeDasharray="12 10" />
        {/* cone */}
        <ellipse cx="190" cy="262" rx="92" ry="14" />
        <path d="M98 262l84 84c4 4 12 4 16 0l84-84" />
        <path d="M148 300h84" />
        {/* coffee bed */}
        <path d="M166 322c8 6 18 8 28 5M180 334c8 4 16 3 22-2" />
        {/* carafe */}
        <ellipse cx="190" cy="348" rx="72" ry="11" />
        <path d="M118 348v76c0 25 20 44 46 44h52c26 0 46-19 46-44v-76" />
        <path d="M262 372c25 3 40 15 40 32s-15 29-40 32" />
        {/* liquid line */}
        <path d="M126 418c20 10 41 15 64 15s44-5 64-15" />
      </g>
    </svg>
  );
}

/** The bar's lever machine: group head, portafilter, steam wand, gauges. */
export function LeverMachine({ className = "" }: { className?: string }) {
  const filterId = useId();
  return (
    <svg
      viewBox="0 0 350 420"
      className={className}
      role="img"
      aria-label="The lever espresso machine, a cup under the group head."
    >
      <defs>
        <RoughFilter id={filterId} scale={2} />
      </defs>
      <g filter={`url(#${filterId})`} {...stroke}>
        <path d="M70 122h190c17 0 30 13 30 30v118c0 17-13 30-30 30H70c-17 0-30-13-30-30V152c0-17 13-30 30-30Z" />
        <path d="M62 122c16-18 48-28 103-28s87 10 103 28" />
        <path d="M165 92V80" />
        <circle cx="165" cy="70" r="10" />
        <circle cx="112" cy="186" r="28" />
        <circle cx="112" cy="186" r="4" />
        <path d="M112 186l16-14" />
        <path d="M196 168h68" />
        <path d="M196 200h68" />
        <path d="M286 130l40-32" />
        <circle cx="332" cy="92" r="9" />
        <path d="M40 236c-18 6-26 22-24 44" />
        <path d="M16 288v12" />
        <path d="M141 300v18c0 6 5 11 11 11h32c6 0 11-5 11-11v-18" />
        <path d="M195 320h44" />
        <circle cx="248" cy="320" r="8" />
        <path d="M158 329v9M178 329v9" />
        <ellipse cx="168" cy="356" rx="27" ry="7" />
        <path d="M141 356v14c0 12 12 21 27 21s27-9 27-21v-14" />
        <path d="M195 362c10 1 16 5 16 11s-6 10-16 11" />
        <path d="M78 300v94M266 300v94" />
        <path d="M58 394h230" />
        <path d="M58 394v11M288 394v11" />
      </g>
    </svg>
  );
}

/** Text set on a circular path, like the poster's arc lockup. */
export function ArcText({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const pathId = useId();
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      <defs>
        <path
          id={pathId}
          d="M100 100m-78 0a78 78 0 1 1 156 0a78 78 0 1 1 -156 0"
          fill="none"
        />
      </defs>
      <text
        fill="currentColor"
        fontSize="15.5"
        fontWeight="700"
        letterSpacing="2.6"
      >
        <textPath href={`#${pathId}`} startOffset="0%">
          {text}
        </textPath>
      </text>
    </svg>
  );
}
