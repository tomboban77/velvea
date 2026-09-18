"use client";

import { useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Star, Check, Plus } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { formatMoney, cn } from "@/lib/utils";
import type { ProductView } from "@/lib/view";

/**
 * Catalogue card: square photo tile, badge, name, rating, price and a full-width
 * add-to-bag button. The whole card links to the product; the buttons don't.
 */
export function ProductCard({ product, priority = false }: { product: ProductView; priority?: boolean }) {
  const t = useTranslations("common");
  const locale = useLocale();
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

  const money = (c: number) => formatMoney(c, locale === "fr" ? "fr-CA" : "en-CA");
  const onSale = !!product.compareAtCents && product.compareAtCents > product.priceCents;
  const badge = onSale ? "sale" : product.badges[0];
  const badgeLabel =
    badge === "new" ? t("new") : badge === "bestseller" ? t("bestseller") : badge === "limited" ? t("limited") : badge === "sale" ? t("sale") : null;
  const badgeTone = badge === "bestseller" ? "badge-plum" : badge === "sale" ? "badge-ink" : "badge-gold";

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
                sizes="(max-width:767px) 50vw, (max-width:1279px) 33vw, (max-width:1791px) 25vw, 20vw"
                className={cn("zoom-img object-cover transition-opacity duration-700", product.secondImage && "group-hover:opacity-0")}
              />
              {product.secondImage && (
                <Image src={product.secondImage} alt="" fill sizes="(max-width:767px) 50vw, 25vw" className="object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
              )}
            </>
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="font-display text-2xl tracking-[0.1em] text-line-strong">Velvéa</span>
            </div>
          )}
        </Link>
        {badgeLabel && <span className={cn("badge product-badge", badgeTone)}>{badgeLabel}</span>}
        <button
          onClick={quickAdd}
          aria-label={`${t("quickAdd")}: ${product.name}`}
          title={added ? t("added") : t("quickAdd")}
          className={cn("product-quick-add", added && "is-added")}
        >
          {added ? <Check className="h-4 w-4" strokeWidth={2} /> : <Plus className="h-4 w-4" strokeWidth={2} />}
        </button>
      </div>

      <div className="flex flex-1 flex-col pt-4">
        <h3 className="product-name">
          <Link href={`/products/${product.slug}`} className="transition-colors hover:text-violet-deep">
            {product.name}
          </Link>
        </h3>
        {product.tagline && <p className="mt-1 line-clamp-1 text-[0.85rem] text-muted">{product.tagline}</p>}

        {product.reviewCount > 0 && (
          <div className="mt-2 flex items-center gap-2 text-[0.8rem] text-muted">
              <span className="stars" aria-hidden>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={cn(i < Math.round(product.rating) ? "fill-current" : "opacity-25")} />
                ))}
              </span>
              <Link href={`/products/${product.slug}#reviews`} className="underline underline-offset-2 hover:text-ink">
                {t("reviewsCount", { count: product.reviewCount })}
              </Link>
          </div>
        )}

        <p className="mt-2 flex items-baseline gap-2">
          <span className="price text-[1.15rem] text-ink">{money(product.priceCents)}</span>
          {onSale && <span className="text-sm text-muted line-through">{money(product.compareAtCents!)}</span>}
        </p>

        <button onClick={quickAdd} className={cn("btn btn-outline btn-sm mt-4 w-full", added && "!border-success !bg-success !text-white")}>
          {added ? (
            <>
              <Check /> {t("added")}
            </>
          ) : (
            t("addToBag")
          )}
        </button>
      </div>
    </article>
  );
}
