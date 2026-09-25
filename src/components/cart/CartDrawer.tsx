"use client";

import { useEffect, useId, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { X, Plus, Minus, ShoppingBag, ArrowRight, Trash2 } from "lucide-react";
import { useCart, lineUnitCents } from "./CartProvider";
import { formatMoney, cn } from "@/lib/utils";

export function CartDrawer() {
  const t = useTranslations();
  const locale = useLocale();
  const money = (c: number) => formatMoney(c, locale === "fr" ? "fr-CA" : "en-CA");
  const { items, isOpen, closeCart, updateQty, removeItem, subtotalCents } = useCart();

  const panelRef = useRef<HTMLElement>(null);
  const titleId = useId();

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Keyboard parity with MobileMenu, which already did all of this. The drawer
  // is a modal surface: Escape closes it, Tab cycles inside it rather than
  // wandering onto the page behind, and focus returns to whatever opened it.
  // Without the restore, dismissing the cart drops focus back to <body> and a
  // keyboard user starts again from the top of the document.
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    panelRef.current?.querySelector<HTMLButtonElement>("button")?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCart();
      if (event.key !== "Tab") return;
      const focusable = Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), select, input, [tabindex="0"]'
        ) ?? []
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [isOpen, closeCart]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[70]",
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      )}
      aria-hidden={!isOpen}
      inert={!isOpen}
    >
      <div
        className={cn(
          "absolute inset-0 bg-charcoal/40 backdrop-blur-sm transition-opacity duration-400",
          isOpen ? "opacity-100" : "opacity-0"
        )}
        onClick={closeCart}
      />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-canvas shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <header className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 id={titleId} className="font-display text-xl">{t("nav.cart")}</h2>
          <button onClick={closeCart} className="btn-ghost p-2" aria-label={t("nav.close")}>
            <X className="h-5 w-5" />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cream">
              <ShoppingBag className="h-7 w-7 text-muted" />
            </div>
            <p className="font-display text-2xl">{t("cart.emptyTitle")}</p>
            <p className="max-w-xs text-sm text-muted">{t("cart.emptyLede")}</p>
            <Link href="/baskets" onClick={closeCart} className="btn btn-primary mt-2">
              {t("common.shopGiftBaskets")}
            </Link>
          </div>
        ) : (
          <>
            {/* Delivery is priced by destination, so there is nothing to
                promise here until we know the postal code. */}
            <div className="border-b border-line bg-cream/60 px-6 py-3">
              <p className="text-xs text-ink-soft">
                Delivery is calculated at checkout from the postal code. Pickup from our
                Mississauga studio is always free.
              </p>
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
                          aria-label={t("cart.remove")}
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
                      {item.giftMessage && (
                        <p className="mt-1 line-clamp-2 rounded-lg bg-cream px-2 py-1 text-[0.7rem] italic text-ink-soft">
                          &ldquo;{item.giftMessage}&rdquo;
                        </p>
                      )}
                      {item.premiumCard && (
                        <p className="mt-1 text-[0.7rem] text-violet">
                          {t("cart.premiumCard")}
                          {item.cardFeeCents ? ` · +${money(item.cardFeeCents)}` : ""}
                        </p>
                      )}
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <div className="inline-flex items-center rounded-full border border-line-strong">
                          <button
                            onClick={() => updateQty(item.id, item.quantity - 1)}
                            className="p-1.5 text-ink-soft hover:text-ink"
                            aria-label={t("cart.decrease")}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-7 text-center text-sm font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQty(item.id, item.quantity + 1)}
                            className="p-1.5 text-ink-soft hover:text-ink"
                            aria-label={t("cart.increase")}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <span className="text-sm font-semibold text-ink">
                          {money(lineUnitCents(item) * item.quantity)}
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
                <span className="font-display text-2xl">{money(subtotalCents)}</span>
              </div>
              <p className="mt-1 text-xs text-muted">
                {t("cart.footerNote")}
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
