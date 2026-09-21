import { describe, expect, it, vi } from "vitest";
import type { DeliveryZone, DiscountCode } from "@prisma/client";
import { computeDiscount, computeShipping, computeTotals } from "@/lib/pricing";
import { DEFAULT_SETTINGS, type SiteSettings } from "@/lib/settings";

// pricing.ts pulls in settings.ts, which constructs a PrismaClient at import.
vi.mock("@/lib/prisma", () => ({ prisma: {} }));

const DAY = 24 * 60 * 60 * 1000;
const future = () => new Date(Date.now() + DAY);
const past = () => new Date(Date.now() - DAY);

function code(over: Partial<DiscountCode> = {}): DiscountCode {
  return {
    code: "TEST",
    type: "PERCENT",
    value: 10,
    minSubtotalCents: 0,
    usageLimit: null,
    usedCount: 0,
    perCustomerLimit: null,
    startsAt: null,
    endsAt: null,
    active: true,
    createdAt: new Date(0),
    ...over,
  };
}

type Zone = Pick<
  DeliveryZone,
  "kind" | "baseFeeCents" | "extraItemCents" | "sameDaySurchargeCents" | "freeThresholdCents"
>;

const localZone: Zone = {
  kind: "LOCAL",
  baseFeeCents: 1500,
  extraItemCents: 0,
  sameDaySurchargeCents: 1000,
  freeThresholdCents: 15000,
};
const shippingZone: Zone = {
  kind: "SHIPPING",
  baseFeeCents: 1999,
  extraItemCents: 800,
  sameDaySurchargeCents: 0,
  freeThresholdCents: null,
};
const pickupZone: Zone = {
  kind: "PICKUP",
  baseFeeCents: 0,
  extraItemCents: 0,
  sameDaySurchargeCents: 0,
  freeThresholdCents: null,
};

const taxed: SiteSettings = {
  ...DEFAULT_SETTINGS,
  tax: { rates: { ON: 13, QC: 14.975 }, default: 5 },
};

describe("computeDiscount", () => {
  it("returns an invalid, zero result for no code", () => {
    expect(computeDiscount(null, 10000)).toEqual({
      discountCents: 0,
      freeShipping: false,
      valid: false,
    });
  });

  it("rejects inactive codes", () => {
    const r = computeDiscount(code({ active: false }), 10000);
    expect(r.valid).toBe(false);
    expect(r.reason).toBe("inactive");
    expect(r.discountCents).toBe(0);
  });

  it("checks active before the other conditions", () => {
    const r = computeDiscount(code({ active: false, endsAt: past() }), 10000);
    expect(r.reason).toBe("inactive");
  });

  it("rejects a code whose window has not started", () => {
    expect(computeDiscount(code({ startsAt: future() }), 10000).reason).toBe("not started");
  });

  it("accepts a code whose startsAt is in the past", () => {
    expect(computeDiscount(code({ startsAt: past() }), 10000).valid).toBe(true);
  });

  it("rejects an expired code", () => {
    expect(computeDiscount(code({ endsAt: past() }), 10000).reason).toBe("expired");
  });

  it("accepts a code whose endsAt is in the future", () => {
    expect(computeDiscount(code({ endsAt: future() }), 10000).valid).toBe(true);
  });

  it("rejects a code whose usage limit is exhausted", () => {
    const r = computeDiscount(code({ usageLimit: 5, usedCount: 5 }), 10000);
    expect(r.valid).toBe(false);
    expect(r.reason).toBe("limit reached");
  });

  it("accepts a code with one redemption left", () => {
    expect(computeDiscount(code({ usageLimit: 5, usedCount: 4 }), 10000).valid).toBe(true);
  });

  it("treats a null usage limit as unlimited", () => {
    expect(computeDiscount(code({ usageLimit: null, usedCount: 9999 }), 10000).valid).toBe(true);
  });

  it("rejects a subtotal below the minimum", () => {
    const r = computeDiscount(code({ minSubtotalCents: 5000 }), 4999);
    expect(r.valid).toBe(false);
    expect(r.reason).toBe("minimum not met");
  });

  it("accepts a subtotal exactly at the minimum", () => {
    expect(computeDiscount(code({ minSubtotalCents: 5000 }), 5000).valid).toBe(true);
  });

  it("computes a percent discount", () => {
    expect(computeDiscount(code({ type: "PERCENT", value: 10 }), 10000)).toEqual({
      discountCents: 1000,
      freeShipping: false,
      valid: true,
    });
  });

  it("rounds percent discounts to the nearest cent", () => {
    // 10% of $10.05 = 100.5 cents -> 101 (Math.round)
    expect(computeDiscount(code({ type: "PERCENT", value: 10 }), 1005).discountCents).toBe(101);
    // 15% of $10.05 = 150.75 -> 151
    expect(computeDiscount(code({ type: "PERCENT", value: 15 }), 1005).discountCents).toBe(151);
    // 33% of $1.01 = 33.33 -> 33
    expect(computeDiscount(code({ type: "PERCENT", value: 33 }), 101).discountCents).toBe(33);
  });

  it("computes a fixed discount", () => {
    expect(computeDiscount(code({ type: "FIXED", value: 500 }), 10000).discountCents).toBe(500);
  });

  it("caps a fixed discount at the subtotal", () => {
    expect(computeDiscount(code({ type: "FIXED", value: 5000 }), 3000).discountCents).toBe(3000);
  });

  it("returns free shipping with no monetary discount for FREE_SHIPPING", () => {
    expect(computeDiscount(code({ type: "FREE_SHIPPING", value: 0 }), 10000)).toEqual({
      discountCents: 0,
      freeShipping: true,
      valid: true,
    });
  });
});

describe("computeShipping", () => {
  it("is free for PICKUP regardless of zone", () => {
    expect(computeShipping(shippingZone, "PICKUP", 100, 1)).toEqual({
      shippingCents: 0,
      freeShipping: false,
    });
  });

  it("is free for a PICKUP zone regardless of method", () => {
    expect(computeShipping(pickupZone, "SHIPPING", 100, 1)).toEqual({
      shippingCents: 0,
      freeShipping: false,
    });
  });

  it("charges the zone base fee for one local basket", () => {
    expect(computeShipping(localZone, "LOCAL_STANDARD", 5000, 1).shippingCents).toBe(1500);
  });

  it("adds the same-day surcharge for LOCAL_SAMEDAY", () => {
    expect(computeShipping(localZone, "LOCAL_SAMEDAY", 5000, 1).shippingCents).toBe(2500);
  });

  it("does not charge extra baskets when extraItemCents is zero", () => {
    expect(computeShipping(localZone, "LOCAL_STANDARD", 5000, 3).shippingCents).toBe(1500);
  });

  it("charges extraItemCents for every parcel beyond the first", () => {
    expect(computeShipping(shippingZone, "SHIPPING", 5000, 3).shippingCents).toBe(1999 + 2 * 800);
  });

  it("never charges negative extras for an empty cart", () => {
    expect(computeShipping(shippingZone, "SHIPPING", 0, 0).shippingCents).toBe(1999);
  });

  it("waives the fee at the free threshold (inclusive)", () => {
    expect(computeShipping(localZone, "LOCAL_STANDARD", 15000, 1)).toEqual({
      shippingCents: 0,
      freeShipping: true,
    });
    expect(computeShipping(localZone, "LOCAL_STANDARD", 14999, 1).freeShipping).toBe(false);
  });

  it("never waives the fee when the zone has no threshold", () => {
    expect(computeShipping(shippingZone, "SHIPPING", 1_000_000, 1).freeShipping).toBe(false);
  });

  it("honours a free-shipping override on local delivery, including same-day", () => {
    expect(computeShipping(localZone, "LOCAL_STANDARD", 100, 1, true)).toEqual({
      shippingCents: 0,
      freeShipping: true,
    });
    expect(computeShipping(localZone, "LOCAL_SAMEDAY", 100, 1, true).shippingCents).toBe(0);
  });

  it("honours a free-shipping override on carrier shipping", () => {
    expect(computeShipping(shippingZone, "SHIPPING", 100, 4, true)).toEqual({
      shippingCents: 0,
      freeShipping: true,
    });
  });

  it("does not flag pickup as free shipping even with an override", () => {
    expect(computeShipping(pickupZone, "PICKUP", 100, 1, true).freeShipping).toBe(false);
  });
});

describe("computeTotals", () => {
  const lines = [
    { unitPriceCents: 2000, quantity: 2 },
    { unitPriceCents: 1500, quantity: 1 },
  ];

  it("sums line items and item counts", () => {
    const r = computeTotals({
      settings: DEFAULT_SETTINGS,
      zone: shippingZone,
      lines,
      method: "SHIPPING",
      discount: null,
    });
    expect(r.subtotalCents).toBe(5500);
    // 3 items -> base + 2 extra parcels
    expect(r.shippingCents).toBe(1999 + 2 * 800);
    expect(r.discountCents).toBe(0);
    expect(r.taxCents).toBe(0);
    expect(r.taxRate).toBe(0);
    expect(r.totalCents).toBe(5500 + 3599);
  });

  it("returns all zeros for an empty cart picked up", () => {
    const r = computeTotals({
      settings: DEFAULT_SETTINGS,
      zone: pickupZone,
      lines: [],
      method: "PICKUP",
      discount: null,
    });
    expect(r).toMatchObject({ subtotalCents: 0, shippingCents: 0, taxCents: 0, totalCents: 0 });
  });

  it("applies the province rate case-insensitively and rounds tax", () => {
    const r = computeTotals({
      settings: taxed,
      zone: pickupZone,
      lines: [{ unitPriceCents: 9999, quantity: 1 }],
      province: "on",
      method: "PICKUP",
      discount: null,
    });
    expect(r.taxRate).toBe(13);
    // 9999 * 0.13 = 1299.87 -> 1300
    expect(r.taxCents).toBe(1300);
    expect(r.totalCents).toBe(11299);
  });

  it("rounds a half cent of tax up", () => {
    const r = computeTotals({
      settings: taxed,
      zone: pickupZone,
      lines: [{ unitPriceCents: 10000, quantity: 1 }],
      province: "QC",
      method: "PICKUP",
      discount: null,
    });
    // 10000 * 0.14975 = 1497.5 -> 1498
    expect(r.taxCents).toBe(1498);
    expect(r.totalCents).toBe(11498);
  });

  it("falls back to the default rate for unknown or missing provinces", () => {
    const base = {
      settings: taxed,
      zone: pickupZone,
      lines,
      method: "PICKUP" as const,
      discount: null,
    };
    expect(computeTotals({ ...base, province: "XX" }).taxRate).toBe(5);
    expect(computeTotals({ ...base }).taxRate).toBe(5);
  });

  it("taxes the discounted subtotal plus shipping", () => {
    const r = computeTotals({
      settings: taxed,
      zone: localZone,
      lines: [{ unitPriceCents: 10000, quantity: 1 }],
      province: "ON",
      method: "LOCAL_STANDARD",
      discount: code({ type: "PERCENT", value: 10 }),
    });
    expect(r.discountCents).toBe(1000);
    expect(r.shippingCents).toBe(1500);
    // (10000 - 1000 + 1500) * 0.13 = 1365
    expect(r.taxCents).toBe(1365);
    expect(r.totalCents).toBe(9000 + 1500 + 1365);
  });

  it("judges the free-shipping threshold on the pre-discount subtotal", () => {
    const r = computeTotals({
      settings: DEFAULT_SETTINGS,
      zone: localZone,
      lines: [{ unitPriceCents: 15000, quantity: 1 }],
      method: "LOCAL_STANDARD",
      discount: code({ type: "PERCENT", value: 50 }),
    });
    expect(r.discountCents).toBe(7500);
    expect(r.freeShipping).toBe(true);
    expect(r.shippingCents).toBe(0);
    expect(r.totalCents).toBe(7500);
  });

  it("never lets a fixed discount push the goods total below zero", () => {
    const r = computeTotals({
      settings: taxed,
      zone: shippingZone,
      lines: [{ unitPriceCents: 3000, quantity: 1 }],
      province: "ON",
      method: "SHIPPING",
      discount: code({ type: "FIXED", value: 5000 }),
    });
    expect(r.discountCents).toBe(3000);
    expect(r.shippingCents).toBe(1999);
    // Only shipping is taxable once the goods are fully discounted.
    expect(r.taxCents).toBe(Math.round(1999 * 0.13));
    expect(r.totalCents).toBe(1999 + Math.round(1999 * 0.13));
  });

  it("waives local same-day delivery for a FREE_SHIPPING code", () => {
    const r = computeTotals({
      settings: DEFAULT_SETTINGS,
      zone: localZone,
      lines: [{ unitPriceCents: 4000, quantity: 1 }],
      method: "LOCAL_SAMEDAY",
      discount: code({ type: "FREE_SHIPPING", value: 0 }),
    });
    expect(r.discountCents).toBe(0);
    expect(r.shippingCents).toBe(0);
    expect(r.freeShipping).toBe(true);
    expect(r.totalCents).toBe(4000);
  });

  it("ignores an invalid code entirely", () => {
    const r = computeTotals({
      settings: DEFAULT_SETTINGS,
      zone: localZone,
      lines: [{ unitPriceCents: 4000, quantity: 1 }],
      method: "LOCAL_STANDARD",
      discount: code({ type: "FREE_SHIPPING", active: false }),
    });
    expect(r.discountCents).toBe(0);
    expect(r.freeShipping).toBe(false);
    expect(r.shippingCents).toBe(1500);
    expect(r.totalCents).toBe(5500);
  });
});
