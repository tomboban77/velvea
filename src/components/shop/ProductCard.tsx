"use client";

import { useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Star, Plus, Check } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { formatMoney, cn } from "@/lib/utils";
import type { ProductView } from "@/lib/view";

const BADGE_LABEL: Record<string, string> = {
  new: "New",
  bestseller: "Bestseller",
  limited: "Limited",
  sale: "Sale",
};

export function ProductCard({ product }: { product: ProductView }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function quickAdd(e: React.MouseEvent) {
    e.preventDefault();
    addItem({
      id: product.id,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image ?? undefined,
      unitPriceCents: product.priceCents,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }

  const onSale =
    product.compareAtCents && product.compareAtCents > product.priceCents;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-shell card-hover"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-cream">
        {product.image ? (
          <>
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
              className={cn(
                "object-cover transition-all duration-700 group-hover:scale-[1.04]",
                product.secondImage && "group-hover:opacity-0"
              )}
            />
            {product.secondImage && (
              <Image
                src={product.secondImage}
                alt=""
                fill
                sizes="(max-width:640px) 50vw, 25vw"
                className="object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
              />
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center bg-[radial-gradient(120%_100%_at_50%_0%,#fbf8f2,#efe6d6)]">
            <span className="font-display text-3xl text-line-strong">Velvéa</span>
          </div>
        )}

        {/* badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {onSale && (
            <span className="rounded-full bg-iris px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-white">
              Sale
            </span>
          )}
          {product.badges.slice(0, 1).map((b) => (
            <span
              key={b}
              className="rounded-full bg-canvas/90 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-ink backdrop-blur"
            >
              {BADGE_LABEL[b] ?? b}
            </span>
          ))}
        </div>

        {/* quick add */}
        <button
          onClick={quickAdd}
          aria-label="Add to bag"
          className={cn(
            "absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full shadow-md transition-all duration-300",
            added
              ? "bg-success text-white"
              : "translate-y-2 bg-ink text-canvas opacity-0 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-charcoal"
          )}
        >
          {added ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        {product.reviewCount > 0 && (
          <div className="mb-1.5 flex items-center gap-1 text-xs text-muted">
            <Star className="h-3 w-3 fill-gold text-gold" />
            <span className="font-semibold text-ink-soft">
              {product.rating.toFixed(1)}
            </span>
            <span>({product.reviewCount})</span>
          </div>
        )}
        <h3 className="text-[0.95rem] font-semibold leading-snug text-ink">
          {product.name}
        </h3>
        {product.tagline && (
          <p className="mt-1 line-clamp-2 text-xs text-muted">{product.tagline}</p>
        )}
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-semibold text-ink">
            {formatMoney(product.priceCents)}
          </span>
          {onSale && (
            <span className="text-xs text-muted line-through">
              {formatMoney(product.compareAtCents!)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
