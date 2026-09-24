import {
  WORDMARK_LETTERS,
  WORDMARK_PATH,
  WORDMARK_VIEWBOX,
} from "@/lib/wordmark";

const { x, y, width, height } = WORDMARK_VIEWBOX;

/**
 * Bagel Fat One converted to outlines, with padded bounds to avoid clipping.
 * `split` draws one path per letter so the hero can set them one by one.
 */
export default function Wordmark({
  className = "",
  split = false,
}: {
  className?: string;
  split?: boolean;
}) {
  return (
    <svg
      viewBox={`${x} ${y} ${width} ${height}`}
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      {split ? (
        WORDMARK_LETTERS.map((d, index) => (
          <path
            key={index}
            d={d}
            className="wordmark-letter"
            style={{ "--i": index } as React.CSSProperties}
          />
        ))
      ) : (
        <path d={WORDMARK_PATH} />
      )}
    </svg>
  );
}
