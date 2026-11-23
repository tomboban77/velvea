"use client";

import { useEffect } from "react";
import { useCart } from "@/components/cart/CartProvider";

/**
 * Empties the bag once the customer is back from Stripe with a paid order.
 * Renders nothing.
 *
 * The Stripe path leaves the site with a full bag (it has to: the customer may
 * back out of the payment page), and nothing emptied it on return, so the
 * baskets just paid for were still in the bag and could be ordered again by
 * accident.
 *
 * Waits for the bag to load from storage, because emptying it before then is
 * undone by the load. Runs once per order per browser: the confirmation URL
 * can be reloaded later, and that must not empty a bag filled since.
 */
export function ClearBagOnPaid({ orderNumber }: { orderNumber: string }) {
  const { hydrated, clear } = useCart();

  useEffect(() => {
    if (!hydrated) return;
    const key = `velvea_bag_cleared_${orderNumber}`;
    try {
      if (window.localStorage.getItem(key)) return;
      window.localStorage.setItem(key, "1");
    } catch {
      // Storage blocked: the bag only lives in memory then, so emptying it is safe.
    }
    clear();
  }, [hydrated, orderNumber, clear]);

  return null;
}
