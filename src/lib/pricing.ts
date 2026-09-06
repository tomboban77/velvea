import type { SiteSettings } from "./settings";
import { taxRateForProvince } from "./settings";
import type { DeliveryMethod, DiscountCode } from "@prisma/client";

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

export function computeShipping(
  settings: SiteSettings,
  method: DeliveryMethod,
  subtotalCents: number,
  freeShippingOverride = false
): { shippingCents: number; freeShipping: boolean } {
  const d = settings.delivery;
  if (method === "LOCAL_SAMEDAY")
    return { shippingCents: d.localSameDayFeeCents, freeShipping: false };
  if (method === "LOCAL_STANDARD")
    return { shippingCents: d.localStandardFeeCents, freeShipping: false };
  // SHIPPING
  const free =
    freeShippingOverride || subtotalCents >= d.freeShippingThresholdCents;
  return { shippingCents: free ? 0 : d.standardShippingCents, freeShipping: free };
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
  lines,
  province,
  method,
  discount,
}: {
  settings: SiteSettings;
  lines: PriceLine[];
  province?: string;
  method: DeliveryMethod;
  discount: DiscountCode | null;
}): PriceBreakdown {
  const subtotalCents = lines.reduce((s, l) => s + l.unitPriceCents * l.quantity, 0);
  const disc = computeDiscount(discount, subtotalCents);
  const discountCents = disc.discountCents;
  const { shippingCents, freeShipping } = computeShipping(
    settings,
    method,
    subtotalCents,
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

// GTA cities eligible for local same-day / local standard.
export const GTA_CITIES = [
  "mississauga", "toronto", "brampton", "vaughan", "markham", "richmond hill",
  "oakville", "burlington", "milton", "whitby", "ajax", "pickering", "oshawa",
  "etobicoke", "scarborough", "north york", "north york", "thornhill",
];

export function isGtaCity(city?: string): boolean {
  if (!city) return false;
  return GTA_CITIES.includes(city.trim().toLowerCase());
}
