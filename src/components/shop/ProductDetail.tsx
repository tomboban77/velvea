"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import {
  Star, Plus, Minus, Check, Truck, ChevronDown, PenLine, Package, ShieldCheck,
  Expand, X, ChevronLeft, ChevronRight,
} from "lucide-react";
import { useCart, giftLineId } from "@/components/cart/CartProvider";
import { SameDayNotice } from "@/components/ui/SameDayNotice";
import { CLIENT_SETTINGS } from "@/lib/settings-client";
import { formatMoney, cn, truncate } from "@/lib/utils";

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
  variants: {
    id: string;
    label: string;
    priceCents: number;
    compareAtCents: number | null;
    inStock: boolean;
  }[];
  /** null = unlimited. Enforced again at checkout. */
  inventory: number | null;
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
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState(false);
  const [giftOpen, setGiftOpen] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");
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

  // Inventory was tracked but never shown, so a sold-out basket could be added
  // to the bag and only failed at checkout.
  const stock = product.inventory;
  const soldOut =
    (stock !== null && stock <= 0) ||
    (product.variants.length > 0 && product.variants.every((v) => !v.inStock));
  const variantSoldOut = activeVariant ? !activeVariant.inStock : false;
  const maxQty = stock === null ? 99 : Math.min(99, Math.max(1, stock));
  const unavailable = soldOut || variantSoldOut;

  const price = activeVariant?.priceCents ?? product.priceCents;
  const compareAt = activeVariant?.compareAtCents ?? product.compareAtCents;
  const onSale = !!compareAt && compareAt > price;
  const savingsCents = onSale ? compareAt! - price : 0;
  const hasImages = product.images.length > 0;
  const money = (c: number) => formatMoney(c, locale === "fr" ? "fr-CA" : "en-CA");

  const step = (delta: number) =>
    setActiveImg((i) => (i + delta + product.images.length) % product.images.length);

  // Lightbox: Esc closes, arrows page through, and the page behind stays put.
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightbox, product.images.length]);
  const free = formatMoney(CLIENT_SETTINGS.freeShippingThresholdCents, locale === "fr" ? "fr-CA" : "en-CA").replace(/[.,]00/, "");

  const GIFT_MAX = 300;

  function add() {
    if (unavailable) return;
    const base = variantId ? `${product.id}:${variantId}` : product.id;
    addItem({
      // The card message is part of the line identity, so the same basket
      // bought for two people stays two lines with two different cards.
      id: giftLineId(base, giftMessage),
      giftMessage: giftMessage.trim() || undefined,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      variantId: variantId ?? undefined,
      variantLabel: activeVariant?.label,
      image: product.images[0]?.url,
      unitPriceCents: price,
      quantity: Math.min(qty, maxQty),
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
                  <button
                    type="button"
                    onClick={() => setLightbox(true)}
                    aria-label={t("viewLarger")}
                    className="group absolute inset-0 cursor-zoom-in"
                  >
                    <Image
                      key={product.images[activeImg].url}
                      src={product.images[activeImg].url}
                      alt={product.images[activeImg].alt || product.name}
                      fill
                      priority
                      sizes="(max-width:1024px) 100vw, 58vw"
                      className="anim-fade object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                    <span className="absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-canvas/85 text-ink opacity-0 backdrop-blur transition-opacity duration-300 group-hover:opacity-100">
                      <Expand className="h-4 w-4" strokeWidth={1.6} />
                    </span>
                  </button>
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

            <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-2">
              <span className="font-display text-[1.75rem] text-ink">{money(price)}</span>
              {onSale && (
                <>
                  <span className="text-base text-muted line-through">{money(compareAt!)}</span>
                  <span className="caps rounded-full bg-violet-deep/10 px-2.5 py-1 text-[0.55rem] text-violet-deep">
                    {t("save", { amount: money(savingsCents) })}
                  </span>
                </>
              )}
            </div>
            <p className="mt-1.5 text-xs text-muted">
              {locale === "fr" ? "CAD · taxes calculées à la caisse" : "CAD · taxes calculated at checkout"}
            </p>

            {/* variants */}
            {product.variants.length > 0 && (
              <div className="mt-6">
                <p className="label">{t("size")}</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setVariantId(v.id)}
                      disabled={!v.inStock}
                      className={cn(
                        "chip",
                        variantId === v.id && "is-active",
                        !v.inStock && "cursor-not-allowed opacity-40 line-through"
                      )}
                      aria-pressed={variantId === v.id}
                    >
                      {v.label} · {formatMoney(v.priceCents)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* handwritten card */}
            <div className="mt-6 rounded-xl border border-line bg-cream/40">
              <button
                type="button"
                onClick={() => setGiftOpen((o) => !o)}
                aria-expanded={giftOpen}
                className="flex w-full items-center gap-3 px-4 py-3 text-left"
              >
                <PenLine className="h-4 w-4 shrink-0 text-violet" strokeWidth={1.6} />
                <span className="flex-1">
                  <span className="block text-sm font-semibold text-ink">{t("giftCardTitle")}</span>
                  <span className="block text-xs text-muted">
                    {giftMessage.trim() ? truncate(giftMessage.trim(), 48) : t("giftCardHint")}
                  </span>
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-muted transition-transform duration-300",
                    giftOpen && "rotate-180"
                  )}
                  strokeWidth={1.6}
                />
              </button>
              <div
                className={cn(
                  "grid transition-all duration-400",
                  giftOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                )}
              >
                <div className="overflow-hidden">
                  <div className="px-4 pb-4">
                    <textarea
                      rows={3}
                      maxLength={GIFT_MAX}
                      value={giftMessage}
                      onChange={(e) => setGiftMessage(e.target.value)}
                      placeholder={t("giftCardPlaceholder")}
                      className="field w-full resize-y text-sm"
                    />
                    <div className="mt-1.5 flex items-center justify-between text-[0.7rem] text-muted">
                      <span>{t("giftCardNote")}</span>
                      <span>
                        {giftMessage.length}/{GIFT_MAX}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* qty + add */}
            <div ref={buyRef} className="mt-4 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center rounded-full border border-line-strong" aria-label={t("quantity")}>
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-3 text-ink-soft hover:text-ink" aria-label="−">
                  <Minus className="h-4 w-4" strokeWidth={1.6} />
                </button>
                <span className="w-8 text-center text-sm font-medium">{qty}</span>
                <button
                  onClick={() => setQty(Math.min(maxQty, qty + 1))}
                  disabled={qty >= maxQty}
                  className="p-3 text-ink-soft hover:text-ink disabled:opacity-40"
                  aria-label="+"
                >
                  <Plus className="h-4 w-4" strokeWidth={1.6} />
                </button>
              </div>
              <button
                onClick={add}
                disabled={unavailable}
                className={cn(
                  "btn btn-gold btn-lg min-w-52 flex-1",
                  added && "!bg-success",
                  unavailable && "cursor-not-allowed opacity-50"
                )}
              >
                {unavailable ? (
                  locale === "fr" ? "Épuisé" : "Sold out"
                ) : added ? (
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
            {!unavailable && stock !== null && stock <= 5 && (
              <p className="mt-2 text-sm font-medium text-violet">
                {locale === "fr"
                  ? `Plus que ${stock} en stock`
                  : `Only ${stock} left in stock`}
              </p>
            )}
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
                <div className="flex items-baseline justify-between gap-3">
                  <p className="caps text-[0.6rem] text-violet">{t("inside")}</p>
                  <span className="text-[0.7rem] text-muted">
                    {t("itemsInside", { count: product.contents.length })}
                  </span>
                </div>
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

      {/* The details — the long description, given room to breathe */}
      {product.description && (
        <section className="border-t border-line">
          <div className="container-x section-sm">
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-4">
                <p className="chapter mb-3">{t("details")}</p>
                <h2 className="font-display text-[1.6rem] leading-tight text-ink balance">
                  {product.tagline || product.name}
                </h2>
              </div>
              <div className="lg:col-span-8">
                <p className="text-[1.05rem] leading-[1.75] text-ink-soft pretty">
                  {product.description}
                </p>
                {product.contents.length > 0 && (
                  <ul className="mt-8 grid gap-x-10 gap-y-3 border-t border-line pt-8 sm:grid-cols-2">
                    {product.contents.map((c, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-[0.95rem] text-ink-soft"
                      >
                        <span className="numeral mt-0.5 w-5 shrink-0 text-xs text-violet-deep">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        {c}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

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
          <button
            onClick={add}
            disabled={unavailable}
            className={cn(
              "btn btn-primary btn-sm",
              added && "!bg-success",
              unavailable && "cursor-not-allowed opacity-50"
            )}
          >
            {added && !unavailable ? <Check /> : null}
            {unavailable
              ? locale === "fr"
                ? "Épuisé"
                : "Sold out"
              : added
              ? t("added")
              : t("addToBag")}
          </button>
        </div>
      </div>
      {/* lightbox */}
      {lightbox && hasImages && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={product.name}
          className="anim-fade fixed inset-0 z-50 flex items-center justify-center bg-charcoal/92 p-4 backdrop-blur-sm"
          onClick={() => setLightbox(false)}
        >
          <button
            type="button"
            onClick={() => setLightbox(false)}
            aria-label={t("closeImage")}
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-canvas transition-colors hover:bg-white/20"
          >
            <X className="h-5 w-5" strokeWidth={1.6} />
          </button>

          {product.images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  step(-1);
                }}
                aria-label={t("prevImage")}
                className="absolute left-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-canvas transition-colors hover:bg-white/20"
              >
                <ChevronLeft className="h-5 w-5" strokeWidth={1.6} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  step(1);
                }}
                aria-label={t("nextImage")}
                className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-canvas transition-colors hover:bg-white/20"
              >
                <ChevronRight className="h-5 w-5" strokeWidth={1.6} />
              </button>
            </>
          )}

          <figure
            className="relative h-full max-h-[86vh] w-full max-w-[86vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={product.images[activeImg].url}
              alt={product.images[activeImg].alt || product.name}
              fill
              sizes="86vw"
              className="object-contain"
            />
          </figure>

          {product.images.length > 1 && (
            <p className="absolute bottom-6 text-xs text-canvas/60">
              {activeImg + 1} / {product.images.length}
            </p>
          )}
        </div>
      )}
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
