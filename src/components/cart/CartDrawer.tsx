"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { X, Plus, Minus, ShoppingBag, ArrowRight, Trash2 } from "lucide-react";
import { useCart } from "./CartProvider";
import { formatMoney, cn } from "@/lib/utils";
import { getSettingsClient } from "@/lib/settings-client";

export function CartDrawer() {
  const t = useTranslations();
  const { items, isOpen, closeCart, updateQty, removeItem, subtotalCents } = useCart();
  const threshold = getSettingsClient().freeShippingThresholdCents;
  const remaining = Math.max(0, threshold - subtotalCents);
  const progress = Math.min(100, (subtotalCents / threshold) * 100);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[70]",
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      )}
      aria-hidden={!isOpen}
    >
      <div
        className={cn(
          "absolute inset-0 bg-charcoal/40 backdrop-blur-sm transition-opacity duration-400",
          isOpen ? "opacity-100" : "opacity-0"
        )}
        onClick={closeCart}
      />
      <aside
        className={cn(
          "absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-canvas shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <header className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 className="font-display text-xl">{t("nav.cart")}</h2>
          <button onClick={closeCart} className="btn-ghost p-2" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cream">
              <ShoppingBag className="h-7 w-7 text-muted" />
            </div>
            <p className="font-display text-2xl">Your bag is empty</p>
            <p className="max-w-xs text-sm text-muted">
              Discover beautifully hand-packed baskets for every occasion.
            </p>
            <Link href="/baskets" onClick={closeCart} className="btn btn-primary mt-2">
              {t("common.shopGiftBaskets")}
            </Link>
          </div>
        ) : (
          <>
            {/* free shipping meter */}
            <div className="border-b border-line bg-cream/60 px-6 py-3.5">
              {remaining > 0 ? (
                <p className="text-xs text-ink-soft">
                  You&apos;re {formatMoney(remaining)} away from{" "}
                  <span className="font-semibold text-ink">free shipping</span>.
                </p>
              ) : (
                <p className="text-xs font-semibold text-success">
                  You&apos;ve unlocked free shipping.
                </p>
              )}
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sand">
                <div
                  className="h-full rounded-full bg-iris transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              <ul className="divide-y divide-line">
                {items.map((item) => (
                  <li key={item.id} className="flex gap-4 py-4">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-sand">
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col">
                      <div className="flex justify-between gap-2">
                        <p className="font-display text-[0.98rem] leading-snug text-ink">
                          {item.name}
                        </p>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-muted transition-colors hover:text-danger"
                          aria-label="Remove"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      {item.variantLabel && (
                        <p className="text-xs text-muted">{item.variantLabel}</p>
                      )}
                      {item.isCustom && (
                        <p className="text-xs text-violet">Custom basket</p>
                      )}
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <div className="inline-flex items-center rounded-full border border-line-strong">
                          <button
                            onClick={() => updateQty(item.id, item.quantity - 1)}
                            className="p-1.5 text-ink-soft hover:text-ink"
                            aria-label="Decrease"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-7 text-center text-sm font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQty(item.id, item.quantity + 1)}
                            className="p-1.5 text-ink-soft hover:text-ink"
                            aria-label="Increase"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <span className="text-sm font-semibold text-ink">
                          {formatMoney(item.unitPriceCents * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <footer className="border-t border-line px-6 py-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">{t("common.subtotal")}</span>
                <span className="font-display text-2xl">{formatMoney(subtotalCents)}</span>
              </div>
              <p className="mt-1 text-xs text-muted">
                Shipping &amp; taxes calculated at checkout. Handwritten card included · no prices on the slip.
              </p>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="btn btn-gold btn-lg mt-4 w-full"
              >
                {t("common.checkout")} <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                onClick={closeCart}
                className="mt-2 w-full py-2 text-center text-sm text-muted transition-colors hover:text-ink"
              >
                {t("common.continueShopping")}
              </button>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
