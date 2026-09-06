"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  Star,
  Plus,
  Minus,
  Check,
  Truck,
  Clock,
  ShieldCheck,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { formatMoney, cn } from "@/lib/utils";

export type ProductDetailView = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  care: string;
  contents: string[];
  priceCents: number;
  compareAtCents: number | null;
  rating: number;
  reviewCount: number;
  badges: string[];
  leadTimeDays: number;
  images: { url: string; alt: string }[];
  variants: { id: string; label: string; priceCents: number; compareAtCents: number | null }[];
};

export function ProductDetail({ product }: { product: ProductDetailView }) {
  const t = useTranslations();
  const { addItem, openCart } = useCart();
  const [activeImg, setActiveImg] = useState(0);
  const [variantId, setVariantId] = useState<string | null>(
    product.variants[0]?.id ?? null
  );
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>("contents");

  const activeVariant = product.variants.find((v) => v.id === variantId) ?? null;
  const price = activeVariant?.priceCents ?? product.priceCents;
  const compareAt = activeVariant?.compareAtCents ?? product.compareAtCents;
  const onSale = compareAt && compareAt > price;

  function add() {
    addItem({
      id: variantId ? `${product.id}:${variantId}` : product.id,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      variantId: variantId ?? undefined,
      variantLabel: activeVariant?.label,
      image: product.images[0]?.url,
      unitPriceCents: price,
      quantity: qty,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  const sections = [
    { key: "description", label: t("common.seeDetails"), body: product.description },
    { key: "contents", label: t("faq.title") === "" ? "" : "What's inside", body: null },
    { key: "care", label: "Care & notes", body: product.care },
    { key: "delivery", label: t("footer.shipping"), body: null },
  ].filter((s) => (s.key === "contents" ? product.contents.length : s.key === "delivery" ? true : s.body));

  return (
    <div className="container-x py-10">
      <div className="grid gap-10 lg:grid-cols-2">
        {/* gallery */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="relative aspect-square overflow-hidden rounded-[1.75rem] border border-line bg-cream">
            {product.images[activeImg] ? (
              <Image
                src={product.images[activeImg].url}
                alt={product.images[activeImg].alt || product.name}
                fill
                priority
                sizes="(max-width:1024px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-[radial-gradient(120%_100%_at_50%_0%,#fbf8f2,#efe6d6)]">
                <span className="font-display text-5xl text-line-strong">Velvéa</span>
              </div>
            )}
            {onSale && (
              <span className="absolute left-4 top-4 rounded-full bg-iris px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                Sale
              </span>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={cn(
                    "relative h-20 w-20 overflow-hidden rounded-xl border-2 transition-colors",
                    activeImg === i ? "border-gold" : "border-line"
                  )}
                >
                  <Image src={img.url} alt="" fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* buy box */}
        <div>
          {product.reviewCount > 0 && (
            <div className="mb-3 flex items-center gap-2">
              <div className="flex text-gold">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn("h-4 w-4", i < Math.round(product.rating) ? "fill-current" : "opacity-30")}
                  />
                ))}
              </div>
              <span className="text-sm text-muted">
                {product.rating.toFixed(1)} · {product.reviewCount} {t("common.reviewed")}
              </span>
            </div>
          )}

          <h1 className="font-display text-4xl leading-tight balance">{product.name}</h1>
          {product.tagline && <p className="mt-3 text-lg text-ink-soft">{product.tagline}</p>}

          <div className="mt-5 flex items-baseline gap-3">
            <span className="font-display text-3xl">{formatMoney(price)}</span>
            {onSale && (
              <span className="text-lg text-muted line-through">{formatMoney(compareAt!)}</span>
            )}
          </div>

          {/* variants */}
          {product.variants.length > 0 && (
            <div className="mt-6">
              <p className="label">Size</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVariantId(v.id)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                      variantId === v.id
                        ? "border-ink bg-ink text-canvas"
                        : "border-line-strong text-ink hover:border-ink"
                    )}
                  >
                    {v.label} · {formatMoney(v.priceCents)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* qty + add */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center rounded-full border border-line-strong">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-3 text-ink-soft hover:text-ink" aria-label="Decrease">
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center font-semibold">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="p-3 text-ink-soft hover:text-ink" aria-label="Increase">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button onClick={add} className={cn("btn btn-gold btn-lg flex-1 min-w-48", added && "!bg-success")}>
              {added ? (
                <>
                  <Check className="h-4 w-4" /> {t("common.added")}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> {t("common.addToBag")} · {formatMoney(price * qty)}
                </>
              )}
            </button>
          </div>
          <button onClick={openCart} className="mt-3 text-sm text-muted underline-offset-4 hover:text-ink hover:underline">
            {t("common.checkout")}
          </button>

          {/* trust */}
          <div className="mt-7 grid grid-cols-3 gap-3 border-y border-line py-5">
            {[
              { icon: Sparkles, label: t("hero.badge") },
              { icon: Clock, label: t("delivery.tileSameDaySub") },
              { icon: Truck, label: t("delivery.tileReliableSub") },
            ].map((it) => (
              <div key={it.label} className="flex flex-col items-center gap-1.5 text-center">
                <it.icon className="h-5 w-5 text-gold" />
                <span className="text-xs text-ink-soft">{it.label}</span>
              </div>
            ))}
          </div>

          {/* accordions */}
          <div className="mt-6 divide-y divide-line border-y border-line">
            {product.description && (
              <Accordion
                title="Description"
                open={openSection === "description"}
                onToggle={() => setOpenSection(openSection === "description" ? null : "description")}
              >
                <p className="text-sm leading-relaxed text-ink-soft">{product.description}</p>
              </Accordion>
            )}
            {product.contents.length > 0 && (
              <Accordion
                title="What's inside"
                open={openSection === "contents"}
                onToggle={() => setOpenSection(openSection === "contents" ? null : "contents")}
              >
                <ul className="space-y-2">
                  {product.contents.map((c, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-ink-soft">
                      <Check className="h-3.5 w-3.5 text-teal-deep" /> {c}
                    </li>
                  ))}
                </ul>
              </Accordion>
            )}
            {product.care && (
              <Accordion
                title="Care & notes"
                open={openSection === "care"}
                onToggle={() => setOpenSection(openSection === "care" ? null : "care")}
              >
                <p className="text-sm leading-relaxed text-ink-soft">{product.care}</p>
              </Accordion>
            )}
            <Accordion
              title={t("footer.shipping")}
              open={openSection === "delivery"}
              onToggle={() => setOpenSection(openSection === "delivery" ? null : "delivery")}
            >
              <div className="space-y-2 text-sm text-ink-soft">
                <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-gold" /> {t("delivery.gtaLocalSub")}</p>
                <p className="flex items-center gap-2"><Truck className="h-4 w-4 text-gold" /> {t("delivery.allProvincesSub")}</p>
                <p className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-gold" /> {t("hero.badge")}</p>
              </div>
            </Accordion>
          </div>
        </div>
      </div>
    </div>
  );
}

function Accordion({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="py-1">
      <button onClick={onToggle} className="flex w-full items-center justify-between py-4 text-left">
        <span className="font-semibold text-ink">{title}</span>
        <ChevronDown className={cn("h-4 w-4 text-muted transition-transform", open && "rotate-180")} />
      </button>
      <div className={cn("grid transition-all duration-300", open ? "grid-rows-[1fr] pb-4" : "grid-rows-[0fr]")}>
        <div className="overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
