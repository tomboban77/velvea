import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  notice: vi.fn(),
  ack: vi.fn(),
  rateLimitBoth: vi.fn(),
  verifyTurnstile: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({ prisma: { brandPartnerInquiry: { create: mocks.create } } }));
vi.mock("@/lib/email", () => ({ sendBrandPartnerNotice: mocks.notice, sendBrandPartnerAck: mocks.ack }));
vi.mock("@/lib/rate-limit", () => ({
  rateLimitBoth: mocks.rateLimitBoth,
  rateLimitMessage: () => "Too many requests.",
}));
vi.mock("@/lib/turnstile", () => ({ verifyTurnstile: mocks.verifyTurnstile }));

import { POST } from "@/app/api/partners/route";

const base = { brand: "Maple Cocoa Co.", contactName: "Sam", email: "Sam@MapleCocoa.ca" };

function post(body: unknown) {
  return POST(
    new Request("http://localhost/api/partners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }) as unknown as NextRequest
  );
}

describe("POST /api/partners", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.rateLimitBoth.mockResolvedValue({ ok: true });
    mocks.verifyTurnstile.mockResolvedValue(true);
    mocks.create.mockResolvedValue({ id: "bp_1" });
    mocks.notice.mockResolvedValue(true);
  });

  it("stores the enquiry with a lower-cased email, then notifies the owner and the brand", async () => {
    const res = await post({ ...base, website: "maplecocoa.ca", locale: "fr" });
    expect(res.status).toBe(200);
    expect(mocks.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        brand: "Maple Cocoa Co.",
        email: "sam@maplecocoa.ca",
        website: "maplecocoa.ca",
        phone: null,
        locale: "fr",
      }),
    });
    expect(mocks.notice).toHaveBeenCalledOnce();
    expect(mocks.ack).toHaveBeenCalledWith(expect.objectContaining({ email: base.email, locale: "fr" }));
  });

  it("still succeeds when the owner notice is not delivered, because the row is the record", async () => {
    mocks.notice.mockResolvedValue(false);
    const res = await post(base);
    expect(res.status).toBe(200);
    expect(mocks.create).toHaveBeenCalledOnce();
  });

  it("silently accepts and drops a filled honeypot", async () => {
    const res = await post({ ...base, company: "spam" });
    expect(res.status).toBe(200);
    expect(mocks.create).not.toHaveBeenCalled();
    expect(mocks.notice).not.toHaveBeenCalled();
  });

  it("rejects missing required fields without writing", async () => {
    const res = await post({ brand: "", contactName: "Sam", email: "not-an-email" });
    expect(res.status).toBe(400);
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("returns 429 when rate limited", async () => {
    mocks.rateLimitBoth.mockResolvedValue({ ok: false, retryAfter: 60 });
    const res = await post(base);
    expect(res.status).toBe(429);
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("refuses a failed Turnstile check", async () => {
    mocks.verifyTurnstile.mockResolvedValue(false);
    const res = await post(base);
    expect(res.status).toBe(400);
    expect(mocks.create).not.toHaveBeenCalled();
  });
});
