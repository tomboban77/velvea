/**
 * GA4 ecommerce events. Client-side only; every call is a no-op when GA isn't
 * configured. Consent is handled by Consent Mode in <GoogleAnalytics>: before
 * the visitor accepts, these go out as cookieless pings, never with a cookie.
 *
 * Revenue reported here will always sit below Stripe's (declined consent, ad
 * blockers). Stripe is the source of truth; GA is for funnels and sources.
 */

const ENABLED = Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim());

export type AnalyticsItem = {
  /** Product slug: readable in GA reports, stable across renames of the name. */
  id: string;
  name: string;
  variant?: string | null;
  priceCents: number;
  quantity: number;
};

const dollars = (cents: number) => Math.round(cents) / 100;

function toGaItems(items: AnalyticsItem[]) {
  return items.map((i) => ({
    item_id: i.id,
    item_name: i.name,
    ...(i.variant ? { item_variant: i.variant } : {}),
    price: dollars(i.priceCents),
    quantity: i.quantity,
  }));
}

/**
 * The GA tag is injected after hydration and after the page's own effects, so
 * an event fired on first load (view_item, purchase) would find no gtag yet and
 * be lost. Wait briefly for it; the inline stub isn't blocked by ad blockers,
 * so it turns up within a frame or two whenever GA is configured.
 */
function gtag(...args: unknown[]) {
  if (!ENABLED || typeof window === "undefined") return;
  let tries = 0;
  const run = () => {
    if (window.gtag) window.gtag(...args);
    else if (tries++ < 20) setTimeout(run, 250);
  };
  run();
}

function ecommerce(event: string, items: AnalyticsItem[], extra: Record<string, unknown> = {}) {
  const value = items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0);
  gtag("event", event, { currency: "CAD", value: dollars(value), items: toGaItems(items), ...extra });
}

export const trackViewItem = (item: AnalyticsItem) => ecommerce("view_item", [item]);

export const trackAddToCart = (item: AnalyticsItem) => ecommerce("add_to_cart", [item]);

export const trackBeginCheckout = (items: AnalyticsItem[]) => ecommerce("begin_checkout", items);

/**
 * Fires once per order per browser. The confirmation page can be reloaded or
 * reopened from the email, and each of those must not count as another sale.
 */
export function trackPurchase(order: {
  orderNumber: string;
  totalCents: number;
  shippingCents: number;
  taxCents: number;
  coupon?: string | null;
  items: AnalyticsItem[];
}) {
  if (!ENABLED || typeof window === "undefined") return;
  const key = `velvea_ga_purchase_${order.orderNumber}`;
  try {
    if (window.localStorage.getItem(key)) return;
    window.localStorage.setItem(key, "1");
  } catch {
    // Storage blocked: still send. GA also de-duplicates on transaction_id.
  }
  gtag("event", "purchase", {
    transaction_id: order.orderNumber,
    currency: "CAD",
    value: dollars(order.totalCents),
    shipping: dollars(order.shippingCents),
    tax: dollars(order.taxCents),
    ...(order.coupon ? { coupon: order.coupon } : {}),
    items: toGaItems(order.items),
  });
}
