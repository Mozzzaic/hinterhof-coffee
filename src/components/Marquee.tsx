import { origins } from "@/lib/site";

const Dot = () => (
  <span
    aria-hidden
    className="block h-1.5 w-1.5 shrink-0 rounded-full bg-current"
  />
);

/** A steady CSS-only loop, independent of scroll speed and direction. */
export default function Marquee() {
  return (
    <div className="overflow-hidden bg-ink py-3 text-sky">
      <div className="flex w-max animate-marquee">
        {[0, 1].map((copy) => (
          <ul
            key={copy}
            aria-hidden={copy === 1}
            className="flex shrink-0 items-center"
          >
            {origins.map((origin) => (
              <li
                key={origin.line}
                className="label flex shrink-0 items-center gap-8 px-8"
              >
                {origin.line}
                <Dot />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
