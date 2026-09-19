"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import {
  Star, Plus, Minus, Check, Truck, ChevronDown, PenLine, Package, ShieldCheck,
  Expand, X, ChevronLeft, ChevronRight, Gift, BadgePercent,
} from "lucide-react";
import { useCart, giftLineId } from "@/components/cart/CartProvider";
import { SameDayNotice } from "@/components/ui/SameDayNotice";
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
  shippable: boolean;
};

export function ProductDetail({
  product,
  sameDayCutoff,
}: {
  product: ProductDetailView;
  /** Home-zone cutoff for the live countdown; null hides it. */
  sameDayCutoff: string | null;
}) {
  const t = useTranslations("pdp");
  const tc = useTranslations("common");
  const locale = useLocale();
  const fr = locale === "fr";
  const { addItem, openCart } = useCart();

  const [activeImg, setActiveImg] = useState(0);
  const [variantId, setVariantId] = useState<string | null>(product.variants[0]?.id ?? null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>("care");
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
  const money = (c: number) => formatMoney(c, fr ? "fr-CA" : "en-CA");

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
      <div className="container-x pb-14 pt-4 lg:pt-6">
        <div className="pdp-grid">
          {/* ---------- gallery ---------- */}
          <div className="lg:sticky lg:top-[72px] lg:self-start">
            <figure className="relative aspect-square overflow-hidden rounded-lg bg-cream">
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
                    sizes="(max-width:1023px) 100vw, 55vw"
                    className="anim-fade object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                  />
                  <span className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm backdrop-blur transition-opacity duration-300 lg:opacity-0 lg:group-hover:opacity-100">
                    <Expand className="h-4 w-4" strokeWidth={1.7} />
                  </span>
                </button>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="font-display text-5xl text-line-strong">Velvéa</span>
                </div>
              )}
              {(onSale || badgeLabel) && (
                <span className={cn("badge absolute left-4 top-4", onSale ? "badge-ink" : badge === "bestseller" ? "badge-plum" : "badge-gold")}>
                  {onSale ? tc("sale") : badgeLabel}
                </span>
              )}
              {product.images.length > 1 && (
                <>
                  <button type="button" onClick={() => step(-1)} aria-label={t("prevImage")} className="circle-arrow absolute left-4 top-1/2 h-10 w-10 -translate-y-1/2">
                    <ChevronLeft className="h-4 w-4" strokeWidth={1.8} />
                  </button>
                  <button type="button" onClick={() => step(1)} aria-label={t("nextImage")} className="circle-arrow absolute right-4 top-1/2 h-10 w-10 -translate-y-1/2">
                    <ChevronRight className="h-4 w-4" strokeWidth={1.8} />
                  </button>
                </>
              )}
            </figure>

            {product.images.length > 1 && (
              <div className="mt-3 grid grid-cols-6 gap-3 sm:grid-cols-8">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    aria-label={`Image ${i + 1}`}
                    className={cn("pdp-thumb", activeImg === i && "is-active")}
                  >
                    <Image src={img.url} alt="" fill sizes="96px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ---------- buy box ---------- */}
          <div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
              {badgeLabel && <span className={cn("badge", badge === "bestseller" ? "badge-plum" : "badge-gold")}>{badgeLabel}</span>}
              {product.reviewCount > 0 ? (
                <>
                  <span className="stars" aria-hidden>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={cn(i < Math.round(product.rating) ? "fill-current" : "opacity-25")} />
                    ))}
                  </span>
                  <a href="#reviews" className="underline underline-offset-4 hover:text-ink">
                    {product.rating.toFixed(1)} · {t(product.reviewCount === 1 ? "review" : "reviews", { count: product.reviewCount })}
                  </a>
                </>
              ) : (
                <span>{tc("noReviewsYet")}</span>
              )}
            </div>

            <h1 className="mt-3 font-display text-[2rem] font-medium leading-[1.08] text-ink balance sm:text-[2.5rem] xl:text-[2.75rem]">{product.name}</h1>
            {product.tagline && <p className="mt-3 text-[1.05rem] leading-relaxed text-ink-soft pretty">{product.tagline}</p>}

            <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-2">
              <span className="price text-[1.85rem] text-ink">{money(price)}</span>
              {onSale && (
                <>
                  <span className="text-base text-muted line-through">{money(compareAt!)}</span>
                  <span className="badge badge-soft">{t("youSave", { amount: money(savingsCents) })}</span>
                </>
              )}
              <span className="text-xs text-muted">{fr ? "CAD · taxes calculées à la caisse" : "CAD · taxes calculated at checkout"}</span>
            </div>

            {/* variants */}
            {product.variants.length > 0 && (
              <div className="mt-6">
                <p className="label">{t("selectSize")}</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setVariantId(v.id)}
                      disabled={!v.inStock}
                      className={cn("chip !rounded-[4px]", variantId === v.id && "is-active", !v.inStock && "cursor-not-allowed opacity-40 line-through")}
                      aria-pressed={variantId === v.id}
                    >
                      {v.label} · {money(v.priceCents)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* handwritten card */}
            <div className="mt-6 rounded-lg border border-line">
              <button
                type="button"
                onClick={() => setGiftOpen((o) => !o)}
                aria-expanded={giftOpen}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
              >
                <PenLine className="h-5 w-5 shrink-0 text-violet-deep" strokeWidth={1.6} />
                <span className="flex-1">
                  <span className="block text-[0.95rem] font-semibold text-ink">{t("giftCardTitle")}</span>
                  <span className="block text-sm text-muted">
                    {giftMessage.trim() ? truncate(giftMessage.trim(), 48) : t("giftCardHint")}
                  </span>
                </span>
                <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted transition-transform duration-300", giftOpen && "rotate-180")} strokeWidth={1.8} />
              </button>
              <div className={cn("grid transition-all duration-300", giftOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
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
                    <div className="mt-1.5 flex items-center justify-between text-xs text-muted">
                      <span>{t("giftCardNote")}</span>
                      <span>{giftMessage.length}/{GIFT_MAX}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* qty + add */}
            <div ref={buyRef} className="mt-4 flex flex-wrap items-stretch gap-3">
              <div className="qty" aria-label={t("qtyLabel")}>
                <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="−">
                  <Minus className="h-4 w-4" strokeWidth={1.8} />
                </button>
                <span>{qty}</span>
                <button onClick={() => setQty(Math.min(maxQty, qty + 1))} disabled={qty >= maxQty} aria-label="+">
                  <Plus className="h-4 w-4" strokeWidth={1.8} />
                </button>
              </div>
              <button
                onClick={add}
                disabled={unavailable}
                className={cn("btn btn-primary btn-lg min-w-[14rem] flex-1", added && "!border-success !bg-success")}
              >
                {unavailable ? tc("soldOut") : added ? (<><Check /> {t("added")}</>) : (<>{t("addToBag")} · {money(price * qty)}</>)}
              </button>
            </div>
            {!unavailable && stock !== null && stock <= 5 && (
              <p className="mt-2 text-sm font-semibold text-violet-deep">
                {fr ? `Plus que ${stock} en stock` : `Only ${stock} left in stock`}
              </p>
            )}
            {added && (
              <button onClick={openCart} className="link-draw mt-3">
                {t("viewBag")}
              </button>
            )}

            {/* delivery */}
            <div className="mt-6 space-y-3 rounded-lg bg-cream p-5">
              {sameDayCutoff && <SameDayNotice cutoff={sameDayCutoff} />}
              <p className="info-row">
                <Truck strokeWidth={1.6} />
                <span>
                  {product.shippable ? t("ontarioWide") : t("localOnly")}
                  {product.leadTimeDays > 0 && <> · {t("leadTime", { days: product.leadTimeDays })}</>}
                </span>
              </p>
              <p className="info-row">
                <BadgePercent strokeWidth={1.6} />
                <span>{t("deliveryAtCheckout")}</span>
              </p>
            </div>

            {/* gifting reassurance */}
            <ul className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                { icon: PenLine, label: t("card") },
                { icon: ShieldCheck, label: t("noPrices") },
                { icon: Package, label: t("packed") },
              ].map((it) => (
                <li key={it.label} className="flex items-center gap-2.5 rounded-md border border-line px-3 py-2.5 text-[0.82rem] font-medium text-ink-soft">
                  <it.icon className="h-4 w-4 shrink-0 text-violet-deep" strokeWidth={1.6} />
                  {it.label}
                </li>
              ))}
            </ul>

            {/* what's inside — always visible; it is the product */}
            {product.contents.length > 0 && (
              <div className="mt-8 border-t border-line pt-6">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="font-display text-[1.35rem] font-medium text-ink">{t("inside")}</h2>
                  <span className="text-sm text-muted">{t("itemsInside", { count: product.contents.length })}</span>
                </div>
                <ul className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2">
                  {product.contents.map((c, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-[0.95rem] text-ink-soft">
                      <Check className="mt-1 h-4 w-4 shrink-0 text-violet-deep" strokeWidth={2} />
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
              <Accordion title={t("tabShipping")} open={openSection === "shipping"} onToggle={() => setOpenSection(openSection === "shipping" ? null : "shipping")}>
                <ul className="space-y-2 text-[0.95rem] leading-relaxed text-ink-soft">
                  <li>{t("shippingLocal")}</li>
                  <li>{product.shippable ? t("shippingOntario") : t("shippingLocalOnly")}</li>
                  <li>{t("shippingPickup")}</li>
                  <li className="pt-1 text-muted">{t("returns")}</li>
                </ul>
              </Accordion>
            </div>
          </div>
        </div>
      </div>

      {/* About this basket */}
      {product.description && (
        <section className="border-t border-line">
          <div className="container-x section-sm">
            <div className="grid gap-8 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-4">
                <p className="caps">{t("description")}</p>
                <h2 className="h-sub mt-3 balance">{product.tagline || product.name}</h2>
              </div>
              <div className="lg:col-span-8">
                <p className="max-w-3xl text-[1.05rem] leading-[1.75] text-ink-soft pretty">{product.description}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* How it arrives */}
      <section className="band-cream border-y border-line">
        <div className="container-x section-sm">
          <div className="max-w-2xl">
            <p className="caps">{t("arrives")}</p>
            <h2 className="h-sub mt-3 balance">{t("arrivesLede")}</h2>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3 sm:gap-6">
            {[
              { icon: Gift, title: t("a1"), sub: t("a1Sub") },
              { icon: PenLine, title: t("a2"), sub: t("a2Sub") },
              { icon: Truck, title: t("a3"), sub: t("a3Sub") },
            ].map((s) => (
              <div key={s.title} className="rounded-lg border border-line bg-white p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-lilac text-violet-deep">
                  <s.icon className="h-5 w-5" strokeWidth={1.6} />
                </span>
                <p className="mt-4 text-[1.05rem] font-semibold text-ink">{s.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* sticky mobile buy bar */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 px-4 py-3 backdrop-blur-xl transition-transform duration-300 lg:hidden",
          showSticky ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[0.95rem] font-semibold text-ink">{product.name}</p>
            <p className="price text-sm text-ink-soft">{money(price)}</p>
          </div>
          <button
            onClick={add}
            disabled={unavailable}
            className={cn("btn btn-primary", added && "!border-success !bg-success")}
          >
            {added && !unavailable ? <Check /> : null}
            {unavailable ? tc("soldOut") : added ? t("added") : t("addToBag")}
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
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <X className="h-5 w-5" strokeWidth={1.6} />
          </button>

          {product.images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); step(-1); }}
                aria-label={t("prevImage")}
                className="absolute left-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <ChevronLeft className="h-5 w-5" strokeWidth={1.6} />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); step(1); }}
                aria-label={t("nextImage")}
                className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <ChevronRight className="h-5 w-5" strokeWidth={1.6} />
              </button>
            </>
          )}

          <figure className="relative h-full max-h-[86vh] w-full max-w-[86vw]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={product.images[activeImg].url}
              alt={product.images[activeImg].alt || product.name}
              fill
              sizes="86vw"
              className="object-contain"
            />
          </figure>

          {product.images.length > 1 && (
            <p className="absolute bottom-6 text-xs text-white/60">
              {activeImg + 1} / {product.images.length}
            </p>
          )}
        </div>
      )}
    </>
  );
}

function Accordion({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div>
      <button onClick={onToggle} className="flex w-full items-center justify-between py-4 text-left" aria-expanded={open}>
        <span className="text-[1rem] font-semibold text-ink">{title}</span>
        <ChevronDown className={cn("h-4 w-4 text-muted transition-transform duration-300", open && "rotate-180")} strokeWidth={1.8} />
      </button>
      <div className={cn("grid transition-all duration-300", open ? "grid-rows-[1fr] pb-5 opacity-100" : "grid-rows-[0fr] opacity-0")}>
        <div className="overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
