/**
 * The logo mark: the courtyard arch with a doorway inside it, drawn with the
 * same rough stroke as the illustrations so the whole set reads as one hand.
 */
export default function ArchMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 30 32"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <filter id="rough-mark" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.05"
            numOctaves="2"
            seed="4"
            result="n"
          />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="0.9" />
        </filter>
      </defs>
      <g
        filter="url(#rough-mark)"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 30V14.5a13 13 0 0 1 26 0V30" />
        <path d="M10 30v-8.5a5 5 0 0 1 10 0V30" />
      </g>
    </svg>
  );
}
