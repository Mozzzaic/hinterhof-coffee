import { Bean } from "./Illustration";

/** The lots currently on the roaster — deliberately not a repeat of the
    credit bar above it, which already carries the house facts. */
const items = [
  "Ethiopia · Yirgacheffe",
  "Brazil · Cerrado",
  "Colombia · Huila",
  "Sumatra · Aceh Gayo",
  "Kenya · Nyeri",
  "Guatemala · Huehuetenango",
];

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
            {items.map((item) => (
              <li
                key={item}
                className="label flex shrink-0 items-center gap-8 px-8"
              >
                {item}
                <Bean className="h-4 w-4" />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
