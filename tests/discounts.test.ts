import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const prisma = vi.hoisted(() => ({
  discountCode: {
    findUnique: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
  },
  order: {
    findMany: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma }));

import {
  canonicalEmail,
  customerRedemptions,
  FIRST_ORDER_CODES,
  hasPriorOrder,
  releaseDiscount,
  reserveDiscount,
} from "@/lib/discounts";

beforeEach(() => {
  vi.resetAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("reserveDiscount", () => {
  it("returns false and writes nothing for an unknown code", async () => {
    prisma.discountCode.findUnique.mockResolvedValue(null);

    await expect(reserveDiscount("NOPE")).resolves.toBe(false);

    expect(prisma.discountCode.findUnique).toHaveBeenCalledWith({ where: { code: "NOPE" } });
    expect(prisma.discountCode.update).not.toHaveBeenCalled();
    expect(prisma.discountCode.updateMany).not.toHaveBeenCalled();
  });

  it("increments unconditionally when the code has no usage limit", async () => {
    prisma.discountCode.findUnique.mockResolvedValue({
      code: "OPEN",
      usageLimit: null,
      usedCount: 7,
    });
    prisma.discountCode.update.mockResolvedValue({});

    await expect(reserveDiscount("OPEN")).resolves.toBe(true);

    expect(prisma.discountCode.update).toHaveBeenCalledWith({
      where: { code: "OPEN" },
      data: { usedCount: { increment: 1 } },
    });
    expect(prisma.discountCode.updateMany).not.toHaveBeenCalled();
  });

  it("claims a redemption only while usedCount is below the limit", async () => {
    prisma.discountCode.findUnique.mockResolvedValue({ code: "LTD", usageLimit: 3, usedCount: 2 });
    prisma.discountCode.updateMany.mockResolvedValue({ count: 1 });

    await expect(reserveDiscount("LTD")).resolves.toBe(true);

    expect(prisma.discountCode.updateMany).toHaveBeenCalledTimes(1);
    const args = prisma.discountCode.updateMany.mock.calls[0]![0];
    expect(args.where).toEqual({ code: "LTD", usedCount: { lt: 3 } });
    expect(args.data).toEqual({ usedCount: { increment: 1 } });
    // The unconditional path must not be used for limited codes.
    expect(prisma.discountCode.update).not.toHaveBeenCalled();
  });

  it("returns false when the conditional update matched no row (limit exhausted)", async () => {
    prisma.discountCode.findUnique.mockResolvedValue({ code: "LTD", usageLimit: 3, usedCount: 3 });
    prisma.discountCode.updateMany.mockResolvedValue({ count: 0 });

    await expect(reserveDiscount("LTD")).resolves.toBe(false);

    expect(prisma.discountCode.updateMany).toHaveBeenCalledWith({
      where: { code: "LTD", usedCount: { lt: 3 } },
      data: { usedCount: { increment: 1 } },
    });
  });

  it("uses the limit it read, not the used count, in the predicate", async () => {
    prisma.discountCode.findUnique.mockResolvedValue({ code: "ONE", usageLimit: 1, usedCount: 0 });
    prisma.discountCode.updateMany.mockResolvedValue({ count: 1 });

    await reserveDiscount("ONE");

    expect(prisma.discountCode.updateMany.mock.calls[0]![0].where.usedCount).toEqual({ lt: 1 });
  });
});

describe("releaseDiscount", () => {
  it("decrements only when usedCount is above zero", async () => {
    prisma.discountCode.updateMany.mockResolvedValue({ count: 1 });

    await releaseDiscount("LTD");

    expect(prisma.discountCode.updateMany).toHaveBeenCalledWith({
      where: { code: "LTD", usedCount: { gt: 0 } },
      data: { usedCount: { decrement: 1 } },
    });
  });

  it("swallows and logs database errors instead of throwing", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    prisma.discountCode.updateMany.mockRejectedValue(new Error("db down"));

    await expect(releaseDiscount("LTD")).resolves.toBeUndefined();

    expect(error).toHaveBeenCalledWith("[discounts] release failed:", expect.any(Error));
  });
});

describe("canonicalEmail", () => {
  it("drops +tags and case", () => {
    expect(canonicalEmail(" Anna+Promo@Example.com ")).toBe("anna@example.com");
  });

  it("ignores dots for Gmail only, and treats googlemail as gmail", () => {
    expect(canonicalEmail("a.n.n.a+x@googlemail.com")).toBe("anna@gmail.com");
    expect(canonicalEmail("a.nna@example.com")).toBe("a.nna@example.com");
  });
});

describe("customerRedemptions", () => {
  it("counts every spelling of the same mailbox, and nobody else", async () => {
    prisma.order.findMany.mockResolvedValue([
      { email: "anna@example.com", userId: null },
      { email: "anna+2@example.com", userId: null },
      { email: "annabelle@example.com", userId: null },
    ]);

    await expect(customerRedemptions("VIP", "Anna@Example.com")).resolves.toBe(2);

    const [filter, who] = prisma.order.findMany.mock.calls[0]![0].where.AND;
    expect(filter.discountCode).toBe("VIP");
    expect(who.OR).toEqual([{ email: { startsWith: "anna", endsWith: "@example.com" } }]);
  });

  it("counts refunded orders and open checkouts, not cancelled ones", async () => {
    prisma.order.findMany.mockResolvedValue([]);

    await customerRedemptions("VIP", "anna@example.com");

    const [purchased, held] = prisma.order.findMany.mock.calls[0]![0].where.AND[0].OR;
    expect(purchased.status.in).toContain("REFUNDED");
    expect(purchased.status.in).not.toContain("CANCELLED");
    expect(held.status).toBe("PENDING");
  });

  it("matches Gmail addresses written with dots", async () => {
    prisma.order.findMany.mockResolvedValue([{ email: "j.ane@gmail.com", userId: null }]);

    await expect(customerRedemptions("VIP", "jane+x@gmail.com")).resolves.toBe(1);
  });

  it("also matches on userId when one is supplied", async () => {
    prisma.order.findMany.mockResolvedValue([{ email: "other@example.com", userId: "user_1" }]);

    await expect(customerRedemptions("VIP", "anna@example.com", "user_1")).resolves.toBe(1);

    const who = prisma.order.findMany.mock.calls[0]![0].where.AND[1];
    expect(who.OR).toContainEqual({ userId: "user_1" });
  });
});

describe("hasPriorOrder", () => {
  it("treats WELCOME10 as a first-order-only code", () => {
    expect(FIRST_ORDER_CODES.has("WELCOME10")).toBe(true);
  });

  it("is false for a customer with no completed orders", async () => {
    prisma.order.findMany.mockResolvedValue([]);

    await expect(hasPriorOrder("New@Example.com")).resolves.toBe(false);
  });

  it("counts any completed order, with or without a code, refunds included", async () => {
    prisma.order.findMany.mockResolvedValue([{ email: "anna@example.com", userId: null }]);

    await expect(hasPriorOrder("anna@example.com", "user_1")).resolves.toBe(true);

    const where = prisma.order.findMany.mock.calls[0][0].where.AND[0];
    expect(where.discountCode).toBeUndefined();
    expect(where.status.in).toContain("REFUNDED");
    expect(where.status.in).not.toContain("PENDING");
    expect(where.status.in).not.toContain("CANCELLED");
  });
});
