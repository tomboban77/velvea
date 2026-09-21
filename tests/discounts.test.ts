import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const prisma = vi.hoisted(() => ({
  discountCode: {
    findUnique: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
  },
  order: {
    count: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma }));

import { customerRedemptions, releaseDiscount, reserveDiscount } from "@/lib/discounts";

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

describe("customerRedemptions", () => {
  it("counts paid-status orders by lower-cased email when there is no user", async () => {
    prisma.order.count.mockResolvedValue(2);

    await expect(customerRedemptions("VIP", "Anna@Example.com")).resolves.toBe(2);

    expect(prisma.order.count).toHaveBeenCalledWith({
      where: {
        discountCode: "VIP",
        status: { in: ["PAID", "PROCESSING", "FULFILLED", "SHIPPED", "DELIVERED"] },
        OR: [{ email: "anna@example.com" }],
      },
    });
  });

  it("also matches on userId when one is supplied", async () => {
    prisma.order.count.mockResolvedValue(0);

    await customerRedemptions("VIP", "anna@example.com", "user_1");

    const where = prisma.order.count.mock.calls[0]![0].where;
    expect(where.OR).toEqual([{ email: "anna@example.com" }, { userId: "user_1" }]);
  });
});
