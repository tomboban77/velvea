import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  productFindUnique: vi.fn(),
  reviewCreate: vi.fn(),
  reviewFindFirst: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: { findUnique: mocks.productFindUnique },
    review: { create: mocks.reviewCreate, findFirst: mocks.reviewFindFirst },
    user: { findUnique: vi.fn() },
    orderItem: { count: vi.fn() },
  },
}));
vi.mock("@/lib/auth", () => ({ getSession: vi.fn(async () => null) }));
vi.mock("@/lib/rate-limit", () => ({
  rateLimitBoth: vi.fn(async () => ({ ok: true })),
  rateLimitByIp: vi.fn(async () => ({ ok: true })),
  rateLimitMessage: vi.fn(() => "slow down"),
}));
vi.mock("@/lib/turnstile", () => ({ verifyTurnstile: vi.fn(async () => true) }));

import { POST } from "@/app/api/reviews/route";

function post(body: unknown) {
  return POST(
    new Request("http://localhost/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }) as unknown as NextRequest
  );
}

/** Exactly what ProductReviews.tsx posts for a guest when Turnstile is off. */
const formPayload = {
  productId: "prod_1",
  name: "Danny",
  location: "Toronto, ON",
  rating: 5,
  title: "",
  body: "Ordered it for my aunt, and she absolutely loved it. Great packing.",
  email: "",
  company: "",
  turnstileToken: null,
  locale: "en",
};

describe("POST /api/reviews", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.productFindUnique.mockResolvedValue({ id: "prod_1" });
    mocks.reviewCreate.mockResolvedValue({ id: "rev_1" });
  });

  // Regression: the empty email and null Turnstile token the form always sends
  // used to fail zod, so no guest review could ever be submitted.
  it("accepts the storefront form's payload and stores a pending review", async () => {
    const res = await post(formPayload);
    expect(res.status).toBe(200);
    expect(mocks.reviewCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        productId: "prod_1",
        authorName: "Danny",
        authorLocation: "Toronto, ON",
        rating: 5,
        title: null,
        status: "PENDING",
        verified: false,
      }),
    });
  });

  it("still rejects a review with no words", async () => {
    const res = await post({ ...formPayload, body: "" });
    expect(res.status).toBe(400);
    expect(mocks.reviewCreate).not.toHaveBeenCalled();
  });

  it("still rejects a malformed email", async () => {
    const res = await post({ ...formPayload, email: "not-an-email" });
    expect(res.status).toBe(400);
  });

  it("drops a filled honeypot without storing anything", async () => {
    const res = await post({ ...formPayload, company: "Acme" });
    expect(res.status).toBe(200);
    expect(mocks.reviewCreate).not.toHaveBeenCalled();
  });
});
