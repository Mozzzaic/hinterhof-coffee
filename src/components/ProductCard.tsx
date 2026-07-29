import Image from "next/image";
import type { Product } from "@/lib/products";

const roastDots: Record<Product["roast"], number> = {
  Light: 1,
  Medium: 2,
  Dark: 3,
};

export default function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group flex h-full flex-col">
      <div className="relative">
        {/* Round frame — the motif. Duotone keeps the photography on-palette. */}
        <div className="duotone relative aspect-square w-full rounded-full">
          <Image
            src={product.image}
            alt={`${product.name} — ${product.origin}`}
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 23vw"
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
          />
        </div>

        {product.status && (
          <span className="label absolute -top-1 right-2 rounded-full bg-ink px-3.5 py-1.5 text-sky">
            {product.status}
          </span>
        )}
      </div>

      <div className="mt-5 flex flex-1 flex-col">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="display text-3xl lowercase">{product.name}</h3>
          <span className="text-lg font-bold">€{product.price}</span>
        </div>

        <p className="label mt-1.5">
          {product.origin} · {product.weight}
        </p>

        {/* mb-5 guarantees a gap even on the shortest card, where mt-auto
            below has no spare space to distribute. */}
        <p className="mt-3 mb-5 text-[0.9375rem] leading-snug">
          {product.copy}
        </p>

        <div className="mt-auto flex items-center justify-between gap-4 border-t-2 border-ink pt-4">
          <p className="text-[0.8125rem] leading-tight">
            {product.notes.join(" · ")}
          </p>
          <span className="flex shrink-0 items-center gap-1">
            <span className="sr-only">{product.roast} roast</span>
            {[1, 2, 3].map((step) => (
              <span
                key={step}
                aria-hidden
                className={`h-2.5 w-2.5 rounded-full border-2 border-ink ${
                  step <= roastDots[product.roast] ? "bg-ink" : ""
                }`}
              />
            ))}
          </span>
        </div>
      </div>
    </article>
  );
}
