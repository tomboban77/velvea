"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Star, Plus, Minus, Check, Truck, ChevronDown, PenLine, Package, ShieldCheck } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { SameDayNotice } from "@/components/ui/SameDayNotice";
import { CLIENT_SETTINGS } from "@/lib/settings-client";
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
  const t = useTranslations("pdp");
  const tc = useTranslations("common");
  const locale = useLocale();
  const { addItem, openCart } = useCart();

  const [activeImg, setActiveImg] = useState(0);
  const [variantId, setVariantId] = useState<string | null>(product.variants[0]?.id ?? null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>("about");
  const [showSticky, setShowSticky] = useState(false);
  const buyRef = useRef<HTMLDivElement>(null);

  // show the mobile sticky bar once the main buy button scrolls out of view
  useEffect(() => {
    const el = buyRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setShowSticky(!e.isIntersecting && e.boundingClientRect.top < 0), {
      threshold: 0,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const activeVariant = product.variants.find((v) => v.id === variantId) ?? null;
  const price = activeVariant?.priceCents ?? product.priceCents;
  const compareAt = activeVariant?.compareAtCents ?? product.compareAtCents;
  const onSale = !!compareAt && compareAt > price;
  const free = formatMoney(CLIENT_SETTINGS.freeShippingThresholdCents, locale === "fr" ? "fr-CA" : "en-CA").replace(/[.,]00/, "");

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

  const badge = product.badges[0];
  const badgeLabel =
    badge === "new" ? tc("new") : badge === "bestseller" ? tc("bestseller") : badge === "limited" ? tc("limited") : null;

  return (
    <>
      <div className="container-x pb-14 pt-6 lg:pt-8">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          {/* gallery */}
          <div className="lg:col-span-7 lg:sticky lg:top-28 lg:self-start">
            <div className="grid gap-3 sm:grid-cols-[4.5rem_1fr]">
              {product.images.length > 1 && (
                <div className="order-2 flex gap-2.5 sm:order-1 sm:flex-col">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      aria-label={`Image ${i + 1}`}
                      className={cn(
                        "relative aspect-square w-16 shrink-0 overflow-hidden rounded-lg border transition-colors sm:w-full",
                        activeImg === i ? "border-ink" : "border-line hover:border-line-strong"
                      )}
                    >
                      <Image src={img.url} alt="" fill sizes="72px" className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
              <figure
                className={cn(
                  "relative aspect-square overflow-hidden rounded-2xl bg-sand",
                  product.images.length > 1 ? "order-1 sm:order-2" : "sm:col-span-2"
                )}
              >
                {product.images[activeImg] ? (
                  <Image
                    key={product.images[activeImg].url}
                    src={product.images[activeImg].url}
                    alt={product.images[activeImg].alt || product.name}
                    fill
                    priority
                    sizes="(max-width:1024px) 100vw, 58vw"
                    className="anim-fade object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-[radial-gradient(120%_100%_at_50%_0%,#fbf8f2,#efe6d6)]">
                    <span className="font-display text-5xl text-line-strong">Velvéa</span>
                  </div>
                )}
                {(onSale || badgeLabel) && (
                  <span className="caps absolute left-4 top-4 bg-canvas px-2.5 py-1.5 text-[0.55rem] text-ink">
                    {onSale ? tc("sale") : badgeLabel}
                  </span>
                )}
              </figure>
            </div>
          </div>

          {/* buy box */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3 text-xs text-muted">
              {product.reviewCount > 0 ? (
                <>
                  <span className="flex text-violet">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={cn("h-3.5 w-3.5", i < Math.round(product.rating) ? "fill-current" : "opacity-30")} />
                    ))}
                  </span>
                  <a href="#reviews" className="hover:text-ink">
                    {product.rating.toFixed(1)} · {t(product.reviewCount === 1 ? "review" : "reviews", { count: product.reviewCount })}
                  </a>
                </>
              ) : (
                <span className="caps text-[0.6rem] text-violet">{t("newArrival")}</span>
              )}
            </div>

            <h1 className="mt-3 font-display text-[2.4rem] leading-[1.05] text-ink balance sm:text-[3rem]">{product.name}</h1>
            {product.tagline && <p className="mt-3 text-[1.05rem] text-ink-soft pretty">{product.tagline}</p>}

            <div className="mt-5 flex items-baseline gap-3">
              <span className="font-display text-[1.75rem] text-ink">{formatMoney(price)}</span>
              {onSale && <span className="text-base text-muted line-through">{formatMoney(compareAt!)}</span>}
            </div>

            {/* variants */}
            {product.variants.length > 0 && (
              <div className="mt-6">
                <p className="label">{t("size")}</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setVariantId(v.id)}
                      className={cn("chip", variantId === v.id && "is-active")}
                      aria-pressed={variantId === v.id}
                    >
                      {v.label} · {formatMoney(v.priceCents)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* qty + add */}
            <div ref={buyRef} className="mt-6 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center rounded-full border border-line-strong" aria-label={t("quantity")}>
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-3 text-ink-soft hover:text-ink" aria-label="−">
                  <Minus className="h-4 w-4" strokeWidth={1.6} />
                </button>
                <span className="w-8 text-center text-sm font-medium">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="p-3 text-ink-soft hover:text-ink" aria-label="+">
                  <Plus className="h-4 w-4" strokeWidth={1.6} />
                </button>
              </div>
              <button onClick={add} className={cn("btn btn-gold btn-lg min-w-52 flex-1", added && "!bg-success")}>
                {added ? (
                  <>
                    <Check /> {t("added")}
                  </>
                ) : (
                  <>
                    {t("addToBag")} · {formatMoney(price * qty)}
                  </>
                )}
              </button>
            </div>
            {added && (
              <button onClick={openCart} className="mt-3 text-sm text-ink underline-offset-4 hover:underline">
                {t("viewBag")}
              </button>
            )}

            {/* delivery promise */}
            <div className="mt-6 space-y-2 rounded-xl border border-line bg-cream/60 p-4">
              <SameDayNotice />
              <p className="flex items-start gap-2 text-sm text-ink-soft">
                <Truck className="mt-0.5 h-4 w-4 shrink-0 text-violet" strokeWidth={1.6} />
                <span>
                  {t("canadaWide")}
                  {product.leadTimeDays > 0 && <> · {t("leadTime", { days: product.leadTimeDays })}</>}
                </span>
              </p>
            </div>

            {/* gifting reassurance */}
            <ul className="mt-5 grid grid-cols-3 gap-2 text-center">
              {[
                { icon: PenLine, label: t("card") },
                { icon: ShieldCheck, label: t("noPrices") },
                { icon: Package, label: t("packed") },
              ].map((it) => (
                <li key={it.label} className="flex flex-col items-center gap-1.5 rounded-lg py-2">
                  <it.icon className="h-4 w-4 text-violet" strokeWidth={1.5} />
                  <span className="text-[0.7rem] leading-snug text-ink-soft">{it.label}</span>
                </li>
              ))}
            </ul>

            {/* what's inside — always visible; it is the product */}
            {product.contents.length > 0 && (
              <div className="mt-7 border-t border-line pt-6">
                <p className="caps text-[0.6rem] text-violet">{t("inside")}</p>
                <ul className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
                  {product.contents.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-ink-soft">
                      <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-violet-deep" strokeWidth={1.8} />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* accordions */}
            <div className="mt-6 divide-y divide-line border-y border-line">
              {product.description && (
                <Accordion title={t("about")} open={openSection === "about"} onToggle={() => setOpenSection(openSection === "about" ? null : "about")}>
                  <p className="text-[0.95rem] leading-relaxed text-ink-soft pretty">{product.description}</p>
                </Accordion>
              )}
              {product.care && (
                <Accordion title={t("care")} open={openSection === "care"} onToggle={() => setOpenSection(openSection === "care" ? null : "care")}>
                  <p className="text-[0.95rem] leading-relaxed text-ink-soft pretty">{product.care}</p>
                </Accordion>
              )}
              <Accordion title={t("shipping")} open={openSection === "shipping"} onToggle={() => setOpenSection(openSection === "shipping" ? null : "shipping")}>
                <ul className="space-y-2 text-[0.95rem] leading-relaxed text-ink-soft">
                  <li>{t("shippingLocal")}</li>
                  <li>{t("shippingCanada")}</li>
                  <li>{t("shippingFree", { amount: free })}</li>
                  <li className="pt-1 text-muted">{t("returns")}</li>
                </ul>
              </Accordion>
            </div>
          </div>
        </div>
      </div>

      {/* How it arrives */}
      <section className="border-y border-line bg-cream/60">
        <div className="container-x section-sm">
          <div className="max-w-xl">
            <p className="chapter mb-3">{t("arrives")}</p>
            <p className="font-display text-[1.6rem] leading-tight text-ink balance">{t("arrivesLede")}</p>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {[
              { n: "I", title: t("a1"), sub: t("a1Sub") },
              { n: "II", title: t("a2"), sub: t("a2Sub") },
              { n: "III", title: t("a3"), sub: t("a3Sub") },
            ].map((s) => (
              <div key={s.n} className="border-t border-line-strong pt-5">
                <span className="numeral text-4xl">{s.n}</span>
                <p className="mt-3 font-display text-lg text-ink">{s.title}</p>
                <p className="mt-1 text-sm text-ink-soft">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* sticky mobile buy bar */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-30 border-t border-line bg-canvas/95 px-4 py-3 backdrop-blur-xl transition-transform duration-400 lg:hidden",
          showSticky ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-[0.95rem] text-ink">{product.name}</p>
            <p className="text-sm text-ink-soft">{formatMoney(price)}</p>
          </div>
          <button onClick={add} className={cn("btn btn-primary btn-sm", added && "!bg-success")}>
            {added ? <Check /> : null}
            {added ? t("added") : t("addToBag")}
          </button>
        </div>
      </div>
    </>
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
    <div>
      <button onClick={onToggle} className="flex w-full items-center justify-between py-4 text-left" aria-expanded={open}>
        <span className="font-display text-[1.1rem] text-ink">{title}</span>
        <ChevronDown className={cn("h-4 w-4 text-muted transition-transform duration-300", open && "rotate-180")} strokeWidth={1.6} />
      </button>
      <div className={cn("grid transition-all duration-400", open ? "grid-rows-[1fr] pb-4 opacity-100" : "grid-rows-[0fr] opacity-0")}>
        <div className="overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
