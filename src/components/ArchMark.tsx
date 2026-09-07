/** Clean courtyard mark, padded to include the rounded stroke caps. */
export default function ArchMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 34"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <g
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 31V16a13 13 0 0 1 26 0V31" />
        <path d="M11 31v-9a5 5 0 0 1 10 0v9" />
      </g>
    </svg>
  );
}
