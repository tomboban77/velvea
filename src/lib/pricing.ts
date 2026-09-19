import type { SiteSettings } from "./settings";
import { taxRateForProvince } from "./settings";
import type { DeliveryMethod, DiscountCode, DeliveryZone } from "@prisma/client";

export type PriceLine = { unitPriceCents: number; quantity: number };

export type PriceBreakdown = {
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
  freeShipping: boolean;
  taxRate: number;
};

/**
 * The delivery fee for a resolved zone.
 *
 * Every rate now comes from the zone row rather than a global setting, so
 * Mississauga and Thunder Bay are no longer quoted the same number. Baskets
 * beyond the first add `extraItemCents`: local zones set that to zero because
 * one trip carries any number of boxes, while a shipped order pays for each
 * additional parcel.
 */
export function computeShipping(
  zone: Pick<
    DeliveryZone,
    "kind" | "baseFeeCents" | "extraItemCents" | "sameDaySurchargeCents" | "freeThresholdCents"
  >,
  method: DeliveryMethod,
  subtotalCents: number,
  itemCount: number,
  freeShippingOverride = false
): { shippingCents: number; freeShipping: boolean } {
  if (method === "PICKUP" || zone.kind === "PICKUP") {
    return { shippingCents: 0, freeShipping: false };
  }

  // A FREE_SHIPPING code now waives local delivery too. Previously the local
  // branch returned before the override was ever consulted, so the code was
  // accepted, shown as applied, and the customer still paid the fee.
  const threshold = zone.freeThresholdCents;
  const free =
    freeShippingOverride || (threshold !== null && subtotalCents >= threshold);
  if (free) return { shippingCents: 0, freeShipping: true };

  const extras = Math.max(0, itemCount - 1) * zone.extraItemCents;
  const sameDay = method === "LOCAL_SAMEDAY" ? zone.sameDaySurchargeCents : 0;
  return { shippingCents: zone.baseFeeCents + extras + sameDay, freeShipping: false };
}

export function computeDiscount(
  discount: DiscountCode | null,
  subtotalCents: number
): { discountCents: number; freeShipping: boolean; valid: boolean; reason?: string } {
  if (!discount) return { discountCents: 0, freeShipping: false, valid: false };
  const now = new Date();
  if (!discount.active) return { discountCents: 0, freeShipping: false, valid: false, reason: "inactive" };
  if (discount.startsAt && discount.startsAt > now)
    return { discountCents: 0, freeShipping: false, valid: false, reason: "not started" };
  if (discount.endsAt && discount.endsAt < now)
    return { discountCents: 0, freeShipping: false, valid: false, reason: "expired" };
  if (discount.usageLimit && discount.usedCount >= discount.usageLimit)
    return { discountCents: 0, freeShipping: false, valid: false, reason: "limit reached" };
  if (subtotalCents < discount.minSubtotalCents)
    return { discountCents: 0, freeShipping: false, valid: false, reason: "minimum not met" };

  if (discount.type === "FREE_SHIPPING")
    return { discountCents: 0, freeShipping: true, valid: true };
  if (discount.type === "PERCENT")
    return {
      discountCents: Math.round((subtotalCents * discount.value) / 100),
      freeShipping: false,
      valid: true,
    };
  // FIXED
  return {
    discountCents: Math.min(discount.value, subtotalCents),
    freeShipping: false,
    valid: true,
  };
}

export function computeTotals({
  settings,
  zone,
  lines,
  province,
  method,
  discount,
}: {
  settings: SiteSettings;
  zone: Pick<
    DeliveryZone,
    "kind" | "baseFeeCents" | "extraItemCents" | "sameDaySurchargeCents" | "freeThresholdCents"
  >;
  lines: PriceLine[];
  province?: string;
  method: DeliveryMethod;
  discount: DiscountCode | null;
}): PriceBreakdown {
  const subtotalCents = lines.reduce((s, l) => s + l.unitPriceCents * l.quantity, 0);
  const itemCount = lines.reduce((s, l) => s + l.quantity, 0);
  const disc = computeDiscount(discount, subtotalCents);
  const discountCents = disc.discountCents;
  const { shippingCents, freeShipping } = computeShipping(
    zone,
    method,
    subtotalCents,
    itemCount,
    disc.freeShipping
  );
  const taxRate = taxRateForProvince(settings, province);
  const taxable = Math.max(0, subtotalCents - discountCents) + shippingCents;
  const taxCents = Math.round((taxable * taxRate) / 100);
  const totalCents = Math.max(0, subtotalCents - discountCents) + shippingCents + taxCents;
  return {
    subtotalCents,
    discountCents,
    shippingCents,
    taxCents,
    totalCents,
    freeShipping,
    taxRate,
  };
}
