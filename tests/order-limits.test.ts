import { describe, expect, it } from "vitest";
import { LARGE_ORDER_ITEMS, MAX_ORDER_ITEMS, sizeLeadDays } from "@/lib/order-limits";

describe("order size rules", () => {
  it("caps an online order at 10 baskets", () => {
    expect(MAX_ORDER_ITEMS).toBe(10);
  });

  it("adds no preparation below 3 baskets", () => {
    expect(sizeLeadDays(1)).toBe(0);
    expect(sizeLeadDays(2)).toBe(0);
  });

  it("needs 2 days from 3 baskets up", () => {
    expect(LARGE_ORDER_ITEMS).toBe(3);
    expect(sizeLeadDays(3)).toBe(2);
    expect(sizeLeadDays(10)).toBe(2);
  });
});
