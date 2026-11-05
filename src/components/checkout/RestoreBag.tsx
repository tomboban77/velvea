"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useCart, giftLineId } from "@/components/cart/CartProvider";

export type RestorableLine = {
  productId: string;
  variantId: string | null;
  slug: string | null;
  name: string;
  variantLabel: string | null;
  imageUrl: string | null;
  unitPriceCents: number;
  quantity: number;
  giftMessage: string | null;
  cardFeeCents: number;
};

/**
 * Puts an unpaid order's baskets back in the bag and goes to checkout.
 *
 * The abandoned-checkout email lands here after the Stripe session has
 * expired, so there is nothing left to pay; the order page used to say
 * "Payment hasn't been taken yet" with no way forward. Prices are the ones
 * from the order: checkout re-prices every line and says if anything changed.
 */
export function RestoreBag({ lines }: { lines: RestorableLine[] }) {
  const fr = useLocale() === "fr";
  const router = useRouter();
  const { clear, addItem, closeCart } = useCart();
  const [busy, setBusy] = useState(false);

  if (lines.length === 0) return null;

  function restore() {
    setBusy(true);
    // Replaced rather than merged, so the bag matches the order they started
    // and two visits from the email never double it.
    clear();
    for (const l of lines) {
      const base = l.variantId ? `${l.productId}:${l.variantId}` : l.productId;
      const premiumCard = l.cardFeeCents > 0;
      addItem({
        id: giftLineId(base, l.giftMessage ?? undefined, premiumCard),
        productId: l.productId,
        slug: l.slug ?? undefined,
        name: l.name,
        variantId: l.variantId ?? undefined,
        variantLabel: l.variantLabel ?? undefined,
        image: l.imageUrl ?? undefined,
        unitPriceCents: l.unitPriceCents,
        quantity: l.quantity,
        giftMessage: l.giftMessage ?? undefined,
        premiumCard: premiumCard || undefined,
        cardFeeCents: premiumCard ? l.cardFeeCents : undefined,
      });
    }
    closeCart();
    router.push("/checkout");
  }

  return (
    <button onClick={restore} disabled={busy} className="btn btn-primary">
      {fr ? "Remettre ces paniers dans mon sac" : "Put these baskets back in my bag"}
    </button>
  );
}
