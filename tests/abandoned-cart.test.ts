import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  findMany: vi.fn(),
  update: vi.fn(),
  optOutFindMany: vi.fn(),
  sendAbandonedCart: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    order: { findMany: mocks.findMany, update: mocks.update },
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

function order(over: Partial<Record<string, unknown>> = {}) {
  return {
    id: "o1",
    orderNumber: "VLV-1",
    email: "shopper@example.com",
    locale: "en",
    totalCents: 15900,
    items: [{ name: "Blush Bloom", quantity: 1 }],
    ...over,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.CRON_SECRET = SECRET;
  mocks.optOutFindMany.mockResolvedValue([]);
  mocks.update.mockResolvedValue({});
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
    expect(mocks.findMany).not.toHaveBeenCalled();
    expect(mocks.sendAbandonedCart).not.toHaveBeenCalled();
  });

  it("rejects a wrong or missing bearer token", async () => {
    for (const auth of [null, "Bearer nope", ""]) {
      const res = await GET(request(auth));
      expect(res.status).toBe(401);
    }
    expect(mocks.sendAbandonedCart).not.toHaveBeenCalled();
  });

  it("sends one reminder and stamps the order", async () => {
    mocks.findMany.mockResolvedValue([order()]);
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
    expect(mocks.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "o1" },
        data: expect.objectContaining({ abandonedEmailAt: expect.any(Date) }),
      })
    );
  });

  it("only queries PENDING orders that have never been reminded", async () => {
    mocks.findMany.mockResolvedValue([]);
    await GET(request());
    const where = mocks.findMany.mock.calls[0][0].where;
    expect(where.status).toBe("PENDING");
    expect(where.abandonedEmailAt).toBeNull();
    // Bounded at both ends: not racing a live checkout, not after Stripe expires it.
    expect(where.createdAt.lt).toBeInstanceOf(Date);
    expect(where.createdAt.gt).toBeInstanceOf(Date);
    expect(where.createdAt.gt.getTime()).toBeLessThan(where.createdAt.lt.getTime());
  });

  it("does not email an address that opted out, but still stamps it", async () => {
    mocks.findMany.mockResolvedValue([order()]);
    mocks.optOutFindMany.mockResolvedValue([{ email: "shopper@example.com" }]);

    const res = await GET(request());

    expect(await res.json()).toEqual({ checked: 1, sent: 0, skipped: 1 });
    expect(mocks.sendAbandonedCart).not.toHaveBeenCalled();
    // Stamped anyway, or every run re-examines it for the next 20 hours.
    expect(mocks.update).toHaveBeenCalledTimes(1);
  });

  it("matches opt-outs case-insensitively", async () => {
    mocks.findMany.mockResolvedValue([order({ email: "Shopper@Example.COM" })]);
    mocks.optOutFindMany.mockResolvedValue([{ email: "shopper@example.com" }]);

    const res = await GET(request());
    expect(await res.json()).toMatchObject({ sent: 0, skipped: 1 });
    expect(mocks.sendAbandonedCart).not.toHaveBeenCalled();
  });

  it("stamps before sending, so a failure never sends twice", async () => {
    const calls: string[] = [];
    mocks.update.mockImplementation(async () => {
      calls.push("stamp");
      return {};
    });
    mocks.sendAbandonedCart.mockImplementation(async () => {
      calls.push("send");
      return true;
    });
    mocks.findMany.mockResolvedValue([order()]);

    await GET(request());
    expect(calls).toEqual(["stamp", "send"]);
  });

  it("counts a rejected send without retrying it", async () => {
    mocks.findMany.mockResolvedValue([order()]);
    mocks.sendAbandonedCart.mockResolvedValue(false);

    const res = await GET(request());
    expect(await res.json()).toEqual({ checked: 1, sent: 0, skipped: 0 });
    expect(mocks.update).toHaveBeenCalledTimes(1);
  });

  it("reports quietly when there is nothing to do", async () => {
    mocks.findMany.mockResolvedValue([]);
    const res = await GET(request());
    expect(await res.json()).toEqual({ checked: 0, sent: 0, skipped: 0 });
    expect(mocks.optOutFindMany).not.toHaveBeenCalled();
  });

  it("returns 500 rather than throwing when the database is unreachable", async () => {
    mocks.findMany.mockRejectedValue(new Error("connection refused"));
    const res = await GET(request());
    expect(res.status).toBe(500);
  });
});
