import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  /** Candidate orders: the query filtered on status CANCELLED. */
  candidates: vi.fn(),
  /** Later orders from the same addresses: every other findMany. */
  laterOrders: vi.fn(),
  updateMany: vi.fn(),
  optOutFindMany: vi.fn(),
  sendAbandonedCart: vi.fn(),
}));

const findMany = vi.fn((args: { where: { status?: unknown } }) =>
  args.where.status === "CANCELLED" ? mocks.candidates(args) : mocks.laterOrders(args)
);

vi.mock("@/lib/prisma", () => ({
  prisma: {
    order: { findMany: (args: { where: { status?: unknown } }) => findMany(args), updateMany: mocks.updateMany },
    emailOptOut: { findMany: mocks.optOutFindMany },
  },
}));

vi.mock("@/lib/email", () => ({ sendAbandonedCart: mocks.sendAbandonedCart }));

import { GET } from "@/app/api/cron/abandoned-carts/route";

const SECRET = "cron_test_secret";

function request(auth?: string | null): NextRequest {
  const headers = new Headers();
  if (auth !== null) headers.set("authorization", auth ?? `Bearer ${SECRET}`);
  return new Request("https://www.velvea.ca/api/cron/abandoned-carts", {
    method: "GET",
    headers,
  }) as unknown as NextRequest;
}

const CREATED = new Date("2026-11-05T15:00:00Z");

function order(over: Partial<Record<string, unknown>> = {}) {
  return {
    id: "o1",
    orderNumber: "VLV-1",
    email: "shopper@example.com",
    locale: "en",
    totalCents: 15900,
    createdAt: CREATED,
    items: [{ name: "Blush Bloom", quantity: 1 }],
    ...over,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.CRON_SECRET = SECRET;
  mocks.optOutFindMany.mockResolvedValue([]);
  mocks.laterOrders.mockResolvedValue([]);
  mocks.updateMany.mockResolvedValue({ count: 1 });
  mocks.sendAbandonedCart.mockResolvedValue(true);
});

afterEach(() => {
  delete process.env.CRON_SECRET;
});

describe("abandoned cart cron", () => {
  it("refuses to run at all when CRON_SECRET is unset", async () => {
    delete process.env.CRON_SECRET;
    const res = await GET(request());
    expect(res.status).toBe(503);
    // An open endpoint that emails customers must not be reachable by accident.
    expect(findMany).not.toHaveBeenCalled();
    expect(mocks.sendAbandonedCart).not.toHaveBeenCalled();
  });

  it("rejects a wrong or missing bearer token", async () => {
    for (const auth of [null, "Bearer nope", ""]) {
      const res = await GET(request(auth));
      expect(res.status).toBe(401);
    }
    expect(mocks.sendAbandonedCart).not.toHaveBeenCalled();
  });

  it("sends one reminder and claims the order", async () => {
    mocks.candidates.mockResolvedValue([order()]);
    const res = await GET(request());

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ checked: 1, sent: 1, skipped: 0 });
    expect(mocks.sendAbandonedCart).toHaveBeenCalledTimes(1);
    expect(mocks.sendAbandonedCart.mock.calls[0][0]).toMatchObject({
      orderNumber: "VLV-1",
      email: "shopper@example.com",
      totalCents: 15900,
      itemNames: ["Blush Bloom"],
    });
    expect(mocks.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "o1", abandonedEmailAt: null },
        data: expect.objectContaining({ abandonedEmailAt: expect.any(Date) }),
      })
    );
  });

  it("only queries expired checkouts that have never been reminded", async () => {
    mocks.candidates.mockResolvedValue([]);
    await GET(request());
    const where = mocks.candidates.mock.calls[0][0].where;
    // Not PENDING: a PENDING order this old is held after a payment problem
    // and its customer has been charged.
    expect(where.status).toBe("CANCELLED");
    expect(where.timeline).toEqual({ some: { label: "Cancelled", note: "Checkout expired" } });
    expect(where.abandonedEmailAt).toBeNull();
    expect(where.createdAt.lt).toBeInstanceOf(Date);
    expect(where.createdAt.gt).toBeInstanceOf(Date);
    expect(where.createdAt.gt.getTime()).toBeLessThan(where.createdAt.lt.getTime());
  });

  it("skips a customer who placed another order afterwards", async () => {
    mocks.candidates.mockResolvedValue([order()]);
    mocks.laterOrders.mockResolvedValue([
      { email: "shopper@example.com", createdAt: new Date(CREATED.getTime() + 60_000) },
    ]);
    const res = await GET(request());
    expect(await res.json()).toEqual({ checked: 1, sent: 0, skipped: 1 });
    expect(mocks.sendAbandonedCart).not.toHaveBeenCalled();
  });

  it("still sends when the other order came before this one", async () => {
    mocks.candidates.mockResolvedValue([order()]);
    mocks.laterOrders.mockResolvedValue([
      { email: "shopper@example.com", createdAt: new Date(CREATED.getTime() - 60_000) },
    ]);
    const res = await GET(request());
    expect(await res.json()).toMatchObject({ sent: 1 });
  });

  it("does not email an address that opted out, but still stamps it", async () => {
    mocks.candidates.mockResolvedValue([order()]);
    mocks.optOutFindMany.mockResolvedValue([{ email: "shopper@example.com" }]);

    const res = await GET(request());

    expect(await res.json()).toEqual({ checked: 1, sent: 0, skipped: 1 });
    expect(mocks.sendAbandonedCart).not.toHaveBeenCalled();
    // Stamped anyway, or every run re-examines it for the next 20 hours.
    expect(mocks.updateMany).toHaveBeenCalledTimes(1);
  });

  it("matches opt-outs case-insensitively", async () => {
    mocks.candidates.mockResolvedValue([order({ email: "Shopper@Example.COM" })]);
    mocks.optOutFindMany.mockResolvedValue([{ email: "shopper@example.com" }]);

    const res = await GET(request());
    expect(await res.json()).toMatchObject({ sent: 0, skipped: 1 });
    expect(mocks.sendAbandonedCart).not.toHaveBeenCalled();
  });

  it("does not send when another run already claimed the order", async () => {
    mocks.candidates.mockResolvedValue([order()]);
    mocks.updateMany.mockResolvedValue({ count: 0 });
    const res = await GET(request());
    expect(await res.json()).toEqual({ checked: 1, sent: 0, skipped: 0 });
    expect(mocks.sendAbandonedCart).not.toHaveBeenCalled();
  });

  it("claims before sending, so a failure never sends twice", async () => {
    const calls: string[] = [];
    mocks.updateMany.mockImplementation(async () => {
      calls.push("claim");
      return { count: 1 };
    });
    mocks.sendAbandonedCart.mockImplementation(async () => {
      calls.push("send");
      return true;
    });
    mocks.candidates.mockResolvedValue([order()]);

    await GET(request());
    expect(calls).toEqual(["claim", "send"]);
  });

  it("counts a rejected send without retrying it", async () => {
    mocks.candidates.mockResolvedValue([order()]);
    mocks.sendAbandonedCart.mockResolvedValue(false);

    const res = await GET(request());
    expect(await res.json()).toEqual({ checked: 1, sent: 0, skipped: 0 });
    expect(mocks.updateMany).toHaveBeenCalledTimes(1);
  });

  it("reports quietly when there is nothing to do", async () => {
    mocks.candidates.mockResolvedValue([]);
    const res = await GET(request());
    expect(await res.json()).toEqual({ checked: 0, sent: 0, skipped: 0 });
    expect(mocks.optOutFindMany).not.toHaveBeenCalled();
  });

  it("returns 500 rather than throwing when the database is unreachable", async () => {
    mocks.candidates.mockRejectedValue(new Error("connection refused"));
    const res = await GET(request());
    expect(res.status).toBe(500);
  });
});
