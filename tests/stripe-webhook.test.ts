import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  isStripeConfigured: vi.fn(),
  constructEvent: vi.fn(),
  retrieve: vi.fn(),
  couponDel: vi.fn(),
  markOrderPaid: vi.fn(),
  cancelOrder: vi.fn(),
  recordRefund: vi.fn(),
  findFirst: vi.fn(),
  createEvent: vi.fn(),
}));

vi.mock("@/lib/stripe", () => ({
  isStripeConfigured: mocks.isStripeConfigured,
  getStripe: () => ({
    webhooks: { constructEvent: mocks.constructEvent },
    paymentIntents: { retrieve: mocks.retrieve },
    coupons: { del: mocks.couponDel },
  }),
}));

vi.mock("@/lib/actions/orders", () => ({
  markOrderPaid: mocks.markOrderPaid,
  cancelOrder: mocks.cancelOrder,
  recordRefund: mocks.recordRefund,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    order: { findFirst: mocks.findFirst },
    orderEvent: { create: mocks.createEvent },
  },
}));

import { POST } from "@/app/api/stripe/webhook/route";

const SECRET = "whsec_test_secret";
const SIG = "t=1700000000,v1=deadbeef";

function request(opts: { signature?: string | null; body?: string } = {}): NextRequest {
  const headers = new Headers({ "content-type": "application/json" });
  if (opts.signature !== null) headers.set("stripe-signature", opts.signature ?? SIG);
  return new Request("http://x/api/stripe/webhook", {
    method: "POST",
    headers,
    body: opts.body ?? "{}",
  }) as unknown as NextRequest;
}

function event(type: string, object: Record<string, unknown>) {
  return { id: "evt_1", type, data: { object } };
}

function sideEffects() {
  return [
    mocks.markOrderPaid,
    mocks.cancelOrder,
    mocks.recordRefund,
    mocks.createEvent,
    mocks.couponDel,
    mocks.retrieve,
    mocks.findFirst,
  ];
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  mocks.isStripeConfigured.mockReturnValue(true);
  mocks.couponDel.mockResolvedValue({});
  process.env.STRIPE_WEBHOOK_SECRET = SECRET;
});

afterEach(() => {
  vi.restoreAllMocks();
  delete process.env.STRIPE_WEBHOOK_SECRET;
});

describe("POST /api/stripe/webhook — gatekeeping", () => {
  it("returns 503 when Stripe is not configured", async () => {
    mocks.isStripeConfigured.mockReturnValue(false);

    const res = await POST(request());

    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: "Stripe not configured" });
    expect(mocks.constructEvent).not.toHaveBeenCalled();
  });

  it("returns 503 and refuses to parse when STRIPE_WEBHOOK_SECRET is missing", async () => {
    delete process.env.STRIPE_WEBHOOK_SECRET;

    const res = await POST(request({ body: JSON.stringify(event("checkout.session.completed", {})) }));

    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: "Webhook not configured" });
    expect(mocks.constructEvent).not.toHaveBeenCalled();
    expect(mocks.markOrderPaid).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });

  it("returns 400 when the stripe-signature header is missing", async () => {
    const res = await POST(request({ signature: null }));

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Missing signature" });
    expect(mocks.constructEvent).not.toHaveBeenCalled();
  });

  it("returns 400 when signature verification throws", async () => {
    mocks.constructEvent.mockImplementation(() => {
      throw new Error("No signatures found matching the expected signature for payload");
    });

    const res = await POST(request());

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Invalid signature" });
    expect(sideEffects().every((fn) => fn.mock.calls.length === 0)).toBe(true);
  });

  it("verifies the raw body against the header and the configured secret", async () => {
    const body = '{"id":"evt_raw","type":"ping","data":{"object":{}}}';
    mocks.constructEvent.mockReturnValue(event("ping", {}));

    await POST(request({ body }));

    expect(mocks.constructEvent).toHaveBeenCalledWith(body, SIG, SECRET);
  });
});

describe("checkout.session.completed", () => {
  it("marks the order paid with the payment intent and the amount Stripe charged", async () => {
    mocks.constructEvent.mockReturnValue(
      event("checkout.session.completed", {
        payment_status: "paid",
        payment_intent: "pi_123",
        amount_total: 12345,
        metadata: { orderId: "ord_1" },
      })
    );
    mocks.markOrderPaid.mockResolvedValue(undefined);

    const res = await POST(request());

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ received: true });
    expect(mocks.markOrderPaid).toHaveBeenCalledTimes(1);
    expect(mocks.markOrderPaid).toHaveBeenCalledWith("ord_1", {
      paymentIntentId: "pi_123",
      amountPaidCents: 12345,
    });
    expect(mocks.cancelOrder).not.toHaveBeenCalled();
    expect(mocks.recordRefund).not.toHaveBeenCalled();
  });

  it("omits the payment intent when it is an expanded object and the amount when null", async () => {
    mocks.constructEvent.mockReturnValue(
      event("checkout.session.completed", {
        payment_status: "paid",
        payment_intent: { id: "pi_obj" },
        amount_total: null,
        metadata: { orderId: "ord_1" },
      })
    );

    await POST(request());

    expect(mocks.markOrderPaid).toHaveBeenCalledWith("ord_1", {
      paymentIntentId: undefined,
      amountPaidCents: undefined,
    });
  });

  it("does not mark the order paid when payment_status is not 'paid'", async () => {
    mocks.constructEvent.mockReturnValue(
      event("checkout.session.completed", {
        payment_status: "unpaid",
        payment_intent: "pi_123",
        amount_total: 12345,
        metadata: { orderId: "ord_1", couponId: "cpn_1" },
      })
    );

    const res = await POST(request());

    expect(res.status).toBe(200);
    expect(mocks.markOrderPaid).not.toHaveBeenCalled();
    // The single-use coupon is still cleaned up.
    expect(mocks.couponDel).toHaveBeenCalledWith("cpn_1");
  });

  it("does nothing without an orderId in the metadata", async () => {
    mocks.constructEvent.mockReturnValue(
      event("checkout.session.completed", { payment_status: "paid", metadata: {} })
    );

    const res = await POST(request());

    expect(res.status).toBe(200);
    expect(mocks.markOrderPaid).not.toHaveBeenCalled();
    expect(mocks.couponDel).not.toHaveBeenCalled();
  });

  it("deletes the checkout coupon and tolerates a failed deletion", async () => {
    mocks.constructEvent.mockReturnValue(
      event("checkout.session.completed", {
        payment_status: "paid",
        payment_intent: "pi_123",
        amount_total: 1000,
        metadata: { orderId: "ord_1", couponId: "cpn_gone" },
      })
    );
    mocks.couponDel.mockRejectedValue(new Error("No such coupon"));

    const res = await POST(request());

    expect(res.status).toBe(200);
    expect(mocks.couponDel).toHaveBeenCalledWith("cpn_gone");
    expect(mocks.markOrderPaid).toHaveBeenCalledTimes(1);
  });

  it("treats checkout.session.async_payment_succeeded the same way", async () => {
    mocks.constructEvent.mockReturnValue(
      event("checkout.session.async_payment_succeeded", {
        payment_status: "paid",
        payment_intent: "pi_async",
        amount_total: 777,
        metadata: { orderId: "ord_async" },
      })
    );

    await POST(request());

    expect(mocks.markOrderPaid).toHaveBeenCalledWith("ord_async", {
      paymentIntentId: "pi_async",
      amountPaidCents: 777,
    });
  });

  it("returns 500 when the order handler throws", async () => {
    mocks.constructEvent.mockReturnValue(
      event("checkout.session.completed", {
        payment_status: "paid",
        payment_intent: "pi_123",
        amount_total: 1000,
        metadata: { orderId: "ord_1" },
      })
    );
    mocks.markOrderPaid.mockRejectedValue(new Error("db down"));

    const res = await POST(request());

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Handler error" });
  });
});

describe("checkout.session.expired / async_payment_failed", () => {
  it("cancels the order (releasing its discount) when the session expires", async () => {
    mocks.constructEvent.mockReturnValue(
      event("checkout.session.expired", { metadata: { orderId: "ord_1", couponId: "cpn_1" } })
    );

    const res = await POST(request());

    expect(res.status).toBe(200);
    expect(mocks.cancelOrder).toHaveBeenCalledTimes(1);
    expect(mocks.cancelOrder).toHaveBeenCalledWith("ord_1", { reason: "Checkout expired" });
    expect(mocks.couponDel).toHaveBeenCalledWith("cpn_1");
    expect(mocks.markOrderPaid).not.toHaveBeenCalled();
  });

  it("acknowledges an expired session with no orderId without cancelling anything", async () => {
    mocks.constructEvent.mockReturnValue(event("checkout.session.expired", { metadata: {} }));

    const res = await POST(request());

    expect(res.status).toBe(200);
    expect(mocks.cancelOrder).not.toHaveBeenCalled();
  });

  it("cancels with a customer notification when an async payment fails", async () => {
    mocks.constructEvent.mockReturnValue(
      event("checkout.session.async_payment_failed", { metadata: { orderId: "ord_1" } })
    );

    await POST(request());

    expect(mocks.cancelOrder).toHaveBeenCalledWith("ord_1", {
      reason: "Payment failed",
      notify: true,
    });
  });
});

describe("charge.refunded", () => {
  it("records the refund against the order named in the payment intent metadata", async () => {
    mocks.constructEvent.mockReturnValue(
      event("charge.refunded", { payment_intent: "pi_9", amount_refunded: 2500 })
    );
    mocks.retrieve.mockResolvedValue({ metadata: { orderId: "ord_9" } });

    const res = await POST(request());

    expect(res.status).toBe(200);
    expect(mocks.retrieve).toHaveBeenCalledWith("pi_9");
    expect(mocks.recordRefund).toHaveBeenCalledTimes(1);
    expect(mocks.recordRefund).toHaveBeenCalledWith("ord_9", 2500, { notify: true, cumulative: true });
    expect(mocks.findFirst).not.toHaveBeenCalled();
  });

  it("falls back to the local order lookup when Stripe cannot be reached", async () => {
    mocks.constructEvent.mockReturnValue(
      event("charge.refunded", { payment_intent: "pi_9", amount_refunded: 1000 })
    );
    mocks.retrieve.mockRejectedValue(new Error("network"));
    mocks.findFirst.mockResolvedValue({ id: "ord_db" });

    await POST(request());

    expect(mocks.findFirst).toHaveBeenCalledWith({
      where: { stripePaymentIntentId: "pi_9" },
      select: { id: true },
    });
    expect(mocks.recordRefund).toHaveBeenCalledWith("ord_db", 1000, { notify: true, cumulative: true });
  });

  it("does not record anything when no order matches the payment intent", async () => {
    mocks.constructEvent.mockReturnValue(
      event("charge.refunded", { payment_intent: "pi_unknown", amount_refunded: 1000 })
    );
    mocks.retrieve.mockResolvedValue({ metadata: {} });
    mocks.findFirst.mockResolvedValue(null);

    const res = await POST(request());

    expect(res.status).toBe(200);
    expect(mocks.recordRefund).not.toHaveBeenCalled();
  });

  it("ignores charges without a payment intent id", async () => {
    mocks.constructEvent.mockReturnValue(
      event("charge.refunded", { payment_intent: null, amount_refunded: 1000 })
    );

    const res = await POST(request());

    expect(res.status).toBe(200);
    expect(mocks.retrieve).not.toHaveBeenCalled();
    expect(mocks.recordRefund).not.toHaveBeenCalled();
  });
});

describe("disputes and failed payment intents", () => {
  it("logs a dispute as an order event", async () => {
    mocks.constructEvent.mockReturnValue(
      event("charge.dispute.created", {
        id: "dp_1",
        reason: "fraudulent",
        payment_intent: "pi_9",
      })
    );
    mocks.retrieve.mockResolvedValue({ metadata: { orderId: "ord_9" } });

    await POST(request());

    expect(mocks.createEvent).toHaveBeenCalledTimes(1);
    const data = mocks.createEvent.mock.calls[0]![0].data;
    expect(data.orderId).toBe("ord_9");
    expect(data.label).toBe("Payment disputed");
    expect(data.note).toContain("dp_1");
    expect(data.note).toContain("fraudulent");
  });

  it("logs a failed payment intent with the decline message", async () => {
    mocks.constructEvent.mockReturnValue(
      event("payment_intent.payment_failed", {
        metadata: { orderId: "ord_1" },
        last_payment_error: { message: "Your card was declined." },
      })
    );

    await POST(request());

    expect(mocks.createEvent).toHaveBeenCalledWith({
      data: { orderId: "ord_1", label: "Payment failed", note: "Your card was declined." },
    });
  });

  it("stores a null note when the decline has no message", async () => {
    mocks.constructEvent.mockReturnValue(
      event("payment_intent.payment_failed", { metadata: { orderId: "ord_1" } })
    );

    await POST(request());

    expect(mocks.createEvent).toHaveBeenCalledWith({
      data: { orderId: "ord_1", label: "Payment failed", note: null },
    });
  });
});

describe("unhandled events", () => {
  it("acknowledges unknown event types with 200 and no side effects", async () => {
    mocks.constructEvent.mockReturnValue(event("customer.created", { id: "cus_1" }));

    const res = await POST(request());

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ received: true });
    for (const fn of sideEffects()) expect(fn).not.toHaveBeenCalled();
  });
});
