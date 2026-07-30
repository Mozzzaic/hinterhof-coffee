import Image from "next/image";
import type { Product } from "@/lib/products";

/**
 * Split in two — an image cell and a details cell — because the shelf lays
 * out as two aligned grid rows (all four circles, then all four detail
 * blocks), so a single 8px rule can run under every photo at once instead of
 * curving around each circle individually.
 */
export function ProductImage({ product }: { product: Product }) {
  return (
    <div className="relative flex min-w-0 flex-col justify-end pt-7">
      {product.status && (
        <span className="label absolute top-0 left-0">{product.status}</span>
      )}
      <div className="duotone aspect-square w-full rounded-full">
        <Image
          src={product.image}
          alt={`${product.name} — ${product.origin}`}
          fill
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 23vw"
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-105"
        />
      </div>
    </div>
  );
}

export function ProductDetails({
  product,
  lead = false,
}: {
  product: Product;
  /** The wide first column gets a larger name. */
  lead?: boolean;
}) {
  return (
    <div className="flex h-full min-w-0 flex-col pt-5">
      <h3
        className={`display min-w-0 [overflow-wrap:anywhere] lowercase ${
          lead
            ? "text-[clamp(2rem,3vw,2.75rem)]"
            : "text-[clamp(1.25rem,2.1vw,1.875rem)]"
        }`}
      >
        {product.name}
      </h3>

      <div className="mt-3.5 flex items-baseline justify-between gap-4">
        <p className="label">
          {product.origin} · {product.weight} · {product.pricePerKg}
        </p>
        <span className="display shrink-0 text-[1.625rem] whitespace-nowrap">
          €{product.price}
        </span>
      </div>

      <p className="mt-3.5 mb-5.5 text-base leading-snug text-pretty">
        {product.copy}
      </p>

      <div className="mt-auto flex flex-col gap-3 border-t-2 border-ink pt-3.5">
        <p className="text-sm leading-tight">{product.notes.join(" · ")}</p>
        <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1.5">
          <span className="label">Roast</span>
          <span className="flex min-w-0 max-w-[7rem] flex-1 basis-[5.625rem] gap-[3px]">
            {Array.from({ length: 5 }, (_, i) => (
              <span
                key={i}
                aria-hidden
                className={`h-2 flex-1 ${
                  i < product.roast ? "bg-ink" : "border-2 border-ink"
                }`}
              />
            ))}
          </span>
          <span className="sr-only">{product.roast} of 5</span>
        </div>
      </div>
    </div>
  );
}
