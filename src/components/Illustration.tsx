/**
 * Hand-drawn line art.
 *
 * The paths are plain geometry; the pencil quality comes from a turbulence +
 * displacement filter, which wobbles every stroke exactly the way a hand does.
 * That way the drawings stay editable as vectors instead of becoming assets.
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
  return (
    <svg
      viewBox="0 0 380 470"
      className={className}
      role="img"
      aria-label="A gooseneck kettle pouring water through a filter cone into a glass carafe."
    >
      <defs>
        <RoughFilter id="rough-pour" scale={2.4} />
      </defs>
      <g filter="url(#rough-pour)" {...stroke}>
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

/** A cup on a saucer with a little flower — the poster's quieter motif. */
export function CupAndFlower({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 240" className={className} aria-hidden="true">
      <defs>
        <RoughFilter id="rough-cup" scale={2} />
      </defs>
      <g filter="url(#rough-cup)" {...stroke}>
        <path d="M74 116h128v42c0 28-24 50-56 50h-16c-32 0-56-22-56-50v-42Z" />
        <path d="M202 132c20 2 33 12 33 25s-13 23-33 25" />
        <ellipse cx="138" cy="116" rx="64" ry="13" />
        <path d="M46 214c0-9 41-16 92-16s92 7 92 16-41 16-92 16-92-7-92-16Z" />
        <path d="M120 116c0-24 6-42 18-54" />
        <circle cx="146" cy="52" r="17" />
        <circle cx="146" cy="52" r="7" />
        <path d="M138 62c-16 6-28 14-36 24" />
      </g>
    </svg>
  );
}

/** A single bean, used as a bullet and a divider. */
export function Bean({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <RoughFilter id="rough-bean" scale={1} />
      </defs>
      <g filter="url(#rough-bean)" {...stroke} strokeWidth={2}>
        <ellipse cx="12" cy="12" rx="9" ry="6.5" transform="rotate(-38 12 12)" />
        <path d="M6.5 17.5C10 15 14 9 17.5 6.5" />
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
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      <defs>
        <path
          id="arc-path"
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
        <textPath href="#arc-path" startOffset="0%">
          {text}
        </textPath>
      </text>
    </svg>
  );
}
