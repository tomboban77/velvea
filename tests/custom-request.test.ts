import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";
import { isValidPhone, validateCustomRequest } from "@/lib/custom-request";

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  notice: vi.fn(),
  ack: vi.fn(),
  rateLimitBoth: vi.fn(),
  verifyTurnstile: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({ prisma: { customBasketRequest: { create: mocks.create } } }));
vi.mock("@/lib/email", () => ({ sendCustomBasketNotice: mocks.notice, sendCustomBasketAck: mocks.ack }));
vi.mock("@/lib/rate-limit", () => ({
  rateLimitBoth: mocks.rateLimitBoth,
  rateLimitMessage: () => "Too many requests.",
}));
vi.mock("@/lib/turnstile", () => ({ verifyTurnstile: mocks.verifyTurnstile }));

import { POST } from "@/app/api/custom-basket/route";

const TODAY = "2026-10-05";
const base = { name: "Anna", products: "Lindt dark chocolate and a mug", email: "Anna@Example.com" };

function post(body: unknown) {
  return POST(
    new Request("http://localhost/api/custom-basket", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }) as unknown as NextRequest
  );
}

describe("isValidPhone", () => {
  it("accepts common Canadian formats", () => {
    for (const p of ["4165550199", "(416) 555-0199", "+1 416 555 0199", "416.555.0199"]) {
      expect(isValidPhone(p)).toBe(true);
    }
  });

  it("rejects too few digits, letters and too many digits", () => {
    expect(isValidPhone("555-0199")).toBe(false);
    expect(isValidPhone("416 CALL NOW")).toBe(false);
    expect(isValidPhone("1234567890123456")).toBe(false);
  });
});

describe("validateCustomRequest", () => {
  it("accepts a name, products and only an email", () => {
    const res = validateCustomRequest(base, TODAY);
    expect(res.ok).toBe(true);
  });

  it("accepts a name, products and only a phone", () => {
    const res = validateCustomRequest({ name: "Anna", products: "Chocolate", phone: "416 555 0199" }, TODAY);
    expect(res.ok).toBe(true);
  });

  it("requires a name and the products", () => {
    const res = validateCustomRequest({ email: "a@b.co", name: "  ", products: "" }, TODAY);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.errors).toEqual({ name: "required", products: "required" });
  });

  it("asks for at least one contact on both fields when neither is given", () => {
    const res = validateCustomRequest({ name: "Anna", products: "Chocolate" }, TODAY);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.errors).toEqual({ email: "contactRequired", phone: "contactRequired" });
  });

  it("reports a malformed contact as itself, not as missing", () => {
    const res = validateCustomRequest({ name: "Anna", products: "Chocolate", email: "nope" }, TODAY);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.errors).toEqual({ email: "invalidEmail" });
  });

  it("checks the needed-by date against the store's today", () => {
    const at = (neededBy: string) => validateCustomRequest({ ...base, neededBy }, TODAY);
    expect(at(TODAY).ok).toBe(true);
    expect(at("2027-10-05").ok).toBe(true);
    const past = at("2026-10-04");
    const far = at("2027-10-06");
    const bad = at("2026-02-30");
    expect(!past.ok && past.errors.neededBy).toBe("datePast");
    expect(!far.ok && far.errors.neededBy).toBe("dateTooFar");
    expect(!bad.ok && bad.errors.neededBy).toBe("invalidDate");
  });

  it("trims values and caps the description length", () => {
    const ok = validateCustomRequest({ ...base, name: "  Anna  " }, TODAY);
    expect(ok.ok && ok.data.name).toBe("Anna");
    const long = validateCustomRequest({ ...base, products: "x".repeat(3001) }, TODAY);
    expect(!long.ok && long.errors.products).toBe("tooLong");
  });
});

describe("POST /api/custom-basket", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.rateLimitBoth.mockResolvedValue({ ok: true });
    mocks.verifyTurnstile.mockResolvedValue(true);
    mocks.create.mockResolvedValue({ id: "r1" });
  });

  it("stores the request, lowercases the email and sends both emails", async () => {
    const res = await post({ ...base, budget: "around $150", locale: "fr" });
    expect(res.status).toBe(200);
    const data = mocks.create.mock.calls[0][0].data;
    expect(data).toMatchObject({
      name: "Anna",
      email: "anna@example.com",
      phone: null,
      budget: "around $150",
      occasion: null,
      neededBy: null,
      locale: "fr",
    });
    expect(mocks.notice).toHaveBeenCalledOnce();
    expect(mocks.ack).toHaveBeenCalledOnce();
    expect(mocks.rateLimitBoth).toHaveBeenCalledWith("customBasket", "anna@example.com");
  });

  it("rate-limits on the phone digits when no email is given", async () => {
    await post({ name: "Anna", products: "Chocolate", phone: "(416) 555-0199" });
    expect(mocks.rateLimitBoth).toHaveBeenCalledWith("customBasket", "4165550199");
  });

  it("returns field errors and saves nothing when invalid", async () => {
    const res = await post({ name: "Anna", products: "Chocolate" });
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ fields: { email: "contactRequired", phone: "contactRequired" } });
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("silently drops honeypot submissions", async () => {
    const res = await post({ ...base, website: "spam.example" });
    expect(res.status).toBe(200);
    expect(mocks.create).not.toHaveBeenCalled();
    expect(mocks.notice).not.toHaveBeenCalled();
  });

  it("refuses when rate-limited or the security check fails", async () => {
    mocks.rateLimitBoth.mockResolvedValueOnce({ ok: false, retryAfter: 60 });
    expect((await post(base)).status).toBe(429);
    mocks.verifyTurnstile.mockResolvedValueOnce(false);
    expect((await post(base)).status).toBe(400);
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("reports a server error and sends no email when saving fails", async () => {
    mocks.create.mockRejectedValueOnce(new Error("db down"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await post(base);
    expect(res.status).toBe(500);
    expect(mocks.notice).not.toHaveBeenCalled();
  });
});
