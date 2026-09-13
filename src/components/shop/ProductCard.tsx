"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Star, Check, Plus } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { formatMoney, cn } from "@/lib/utils";
import type { ProductView } from "@/lib/view";

export function ProductCard({ product, priority = false }: { product: ProductView; priority?: boolean }) {
  const t = useTranslations("common");
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function quickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image ?? undefined,
      unitPriceCents: product.priceCents,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  const onSale = !!product.compareAtCents && product.compareAtCents > product.priceCents;
  const badge = onSale ? "sale" : product.badges[0];
  const badgeLabel =
    badge === "new" ? t("new") : badge === "bestseller" ? t("bestseller") : badge === "limited" ? t("limited") : badge === "sale" ? t("sale") : null;

  return (
    <article className="product-card group">
      <div className="product-photo">
        <Link href={`/products/${product.slug}`} className="absolute inset-0" tabIndex={-1} aria-hidden="true">
          {product.image ? (
            <>
              <Image
                src={product.image}
                alt={product.name}
                fill
                priority={priority}
                sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
                className={cn("zoom-img object-cover transition-opacity duration-700", product.secondImage && "group-hover:opacity-0")}
              />
              {product.secondImage && (
                <Image src={product.secondImage} alt="" fill sizes="(max-width:640px) 50vw, 25vw" className="object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
              )}
            </>
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="font-caps text-xl tracking-[0.2em] text-line-strong">VELVEA</span>
            </div>
          )}
        </Link>
          {badgeLabel && <span className="product-badge">{badgeLabel}</span>}

          <button
            onClick={quickAdd}
            aria-label={`${t("quickAdd")}: ${product.name}`}
            title={added ? t("added") : t("quickAdd")}
            className={cn("product-quick-add", added && "is-added")}
          >
            {added ? <Check className="h-3.5 w-3.5" strokeWidth={2} /> : <Plus className="h-3.5 w-3.5" strokeWidth={2} />}
            <span className="sr-only" role="status">{added ? t("added") : t("quickAdd")}</span>
          </button>
      </div>

      <div className="pt-4">
        <h3 className="font-display text-[1.3rem] leading-tight text-ink transition-colors group-hover:text-violet-deep"><Link href={`/products/${product.slug}`}>{product.name}</Link></h3>
        {product.tagline && <p className="mt-1 truncate text-xs text-muted">{product.tagline}</p>}
        <p className="mt-2 flex items-baseline gap-2">
          <span className="font-sans text-sm font-medium text-ink">{formatMoney(product.priceCents)}</span>
          {onSale && <span className="text-xs text-muted line-through">{formatMoney(product.compareAtCents!)}</span>}
        </p>
        {product.reviewCount > 0 && (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-muted">
            <Star className="h-3 w-3 fill-gold text-gold" />
            <span className="font-medium text-ink-soft">{product.rating.toFixed(1)}</span>
            <span>({product.reviewCount})</span>
          </p>
        )}
      </div>
    </article>
  );
}
