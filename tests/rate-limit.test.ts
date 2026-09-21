import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const fakeHeaders = vi.hoisted(() => ({
  values: {} as Record<string, string>,
  throws: false,
}));

vi.mock("next/headers", () => ({
  headers: async () => {
    if (fakeHeaders.throws) throw new Error("headers() called outside a request scope");
    return new Headers(fakeHeaders.values);
  },
}));

import {
  RATE_LIMITS,
  clientIp,
  isDistributedRateLimiting,
  rateLimit,
  rateLimitBoth,
  rateLimitByIp,
  rateLimitMessage,
} from "@/lib/rate-limit";

// The in-memory store is module-level and shared across tests, so every test
// uses its own identifier (and IP) to get a fresh bucket.
let seq = 0;
const uniqueId = () => `test-${++seq}`;
const uniqueIp = () => `198.51.100.${++seq}`;

beforeEach(() => {
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  fakeHeaders.values = { "x-forwarded-for": "203.0.113.7, 10.0.0.1" };
  fakeHeaders.throws = false;
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-09-20T12:00:00.000Z"));
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("clientIp", () => {
  it("takes the first x-forwarded-for entry, trimmed", async () => {
    fakeHeaders.values = { "x-forwarded-for": "  203.0.113.7 , 10.0.0.1" };
    await expect(clientIp()).resolves.toBe("203.0.113.7");
  });

  it("falls back to x-real-ip, then cf-connecting-ip", async () => {
    fakeHeaders.values = { "x-real-ip": "192.0.2.1", "cf-connecting-ip": "192.0.2.2" };
    await expect(clientIp()).resolves.toBe("192.0.2.1");
    fakeHeaders.values = { "cf-connecting-ip": "192.0.2.2" };
    await expect(clientIp()).resolves.toBe("192.0.2.2");
  });

  it("returns 'unknown' when no proxy header is present", async () => {
    fakeHeaders.values = {};
    await expect(clientIp()).resolves.toBe("unknown");
  });

  it("returns 'unknown' when headers() is unavailable", async () => {
    fakeHeaders.throws = true;
    await expect(clientIp()).resolves.toBe("unknown");
  });
});

describe("isDistributedRateLimiting", () => {
  it("is false without Upstash credentials", () => {
    expect(isDistributedRateLimiting()).toBe(false);
  });

  it("requires both the URL and the token", () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
    expect(isDistributedRateLimiting()).toBe(false);
    process.env.UPSTASH_REDIS_REST_TOKEN = "tok";
    expect(isDistributedRateLimiting()).toBe(true);
  });
});

describe("in-memory fallback", () => {
  const rule = RATE_LIMITS.adminLogin; // limit 5, 15-minute window

  it("allows exactly `limit` hits and fails the next one", async () => {
    const id = uniqueId();
    const results = [];
    for (let i = 0; i < rule.limit; i++) results.push(await rateLimit("adminLogin", id));

    expect(results.every((r) => r.ok)).toBe(true);
    expect(results.map((r) => r.remaining)).toEqual([4, 3, 2, 1, 0]);
    expect(results[0]!.retryAfter).toBe(rule.windowSeconds);

    const blocked = await rateLimit("adminLogin", id);
    expect(blocked.ok).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfter).toBeGreaterThan(0);
    expect(blocked.retryAfter).toBeLessThanOrEqual(rule.windowSeconds);
  });

  it("keeps failing within the window, then resets when it rolls over", async () => {
    const id = uniqueId();
    for (let i = 0; i < rule.limit; i++) await rateLimit("adminLogin", id);
    expect((await rateLimit("adminLogin", id)).ok).toBe(false);

    // Still inside the window a minute later.
    vi.advanceTimersByTime(60_000);
    const stillBlocked = await rateLimit("adminLogin", id);
    expect(stillBlocked.ok).toBe(false);
    expect(stillBlocked.retryAfter).toBe(rule.windowSeconds - 60);

    // Past the window: a fresh bucket.
    vi.advanceTimersByTime(rule.windowSeconds * 1000);
    const fresh = await rateLimit("adminLogin", id);
    expect(fresh.ok).toBe(true);
    expect(fresh.remaining).toBe(rule.limit - 1);
  });

  it("keeps separate buckets per rule name", async () => {
    const id = uniqueId();
    for (let i = 0; i < rule.limit; i++) await rateLimit("adminLogin", id);
    expect((await rateLimit("adminLogin", id)).ok).toBe(false);

    const other = await rateLimit("customerLogin", id);
    expect(other.ok).toBe(true);
    expect(other.remaining).toBe(RATE_LIMITS.customerLogin.limit - 1);
  });
});

describe("rateLimitByIp", () => {
  it("scopes the bucket to the caller IP", async () => {
    const a = uniqueIp();
    const b = uniqueIp();
    fakeHeaders.values = { "x-forwarded-for": a };
    for (let i = 0; i < RATE_LIMITS.adminLogin.limit; i++) await rateLimitByIp("adminLogin");
    expect((await rateLimitByIp("adminLogin")).ok).toBe(false);

    fakeHeaders.values = { "x-forwarded-for": b };
    const other = await rateLimitByIp("adminLogin");
    expect(other.ok).toBe(true);
    expect(other.remaining).toBe(RATE_LIMITS.adminLogin.limit - 1);
  });
});

describe("rateLimitBoth", () => {
  it("lower-cases the subject so case variants share one bucket", async () => {
    fakeHeaders.values = { "x-forwarded-for": uniqueIp() };
    const subject = `Victim-${uniqueId()}@Example.com`;

    const first = await rateLimitBoth("adminLogin", subject);
    const second = await rateLimitBoth("adminLogin", subject.toLowerCase());

    expect(first.remaining).toBe(RATE_LIMITS.adminLogin.limit - 1);
    expect(second.remaining).toBe(RATE_LIMITS.adminLogin.limit - 2);
  });

  it("blocks a subject sprayed from many IPs", async () => {
    const subject = `victim-${uniqueId()}@example.com`;
    for (let i = 0; i < RATE_LIMITS.adminLogin.limit; i++) {
      fakeHeaders.values = { "x-forwarded-for": uniqueIp() };
      expect((await rateLimitBoth("adminLogin", subject)).ok).toBe(true);
    }

    fakeHeaders.values = { "x-forwarded-for": uniqueIp() };
    const blocked = await rateLimitBoth("adminLogin", subject);
    expect(blocked.ok).toBe(false);
  });

  it("blocks one IP spraying many subjects, returning the IP result", async () => {
    fakeHeaders.values = { "x-forwarded-for": uniqueIp() };
    for (let i = 0; i < RATE_LIMITS.adminLogin.limit; i++) {
      expect((await rateLimitBoth("adminLogin", `${uniqueId()}@example.com`)).ok).toBe(true);
    }

    const blocked = await rateLimitBoth("adminLogin", `${uniqueId()}@example.com`);
    expect(blocked.ok).toBe(false);
    expect(blocked.remaining).toBe(0);
  });
});

describe("rateLimitMessage", () => {
  it("rounds up to whole minutes with a minimum of one", () => {
    expect(rateLimitMessage({ ok: false, remaining: 0, retryAfter: 0 })).toBe(
      "Too many attempts. Please try again in 1 minute."
    );
    expect(rateLimitMessage({ ok: false, remaining: 0, retryAfter: 30 })).toBe(
      "Too many attempts. Please try again in 1 minute."
    );
    expect(rateLimitMessage({ ok: false, remaining: 0, retryAfter: 61 })).toBe(
      "Too many attempts. Please try again in 2 minutes."
    );
  });

  it("has a French variant", () => {
    expect(rateLimitMessage({ ok: false, remaining: 0, retryAfter: 90 }, true)).toBe(
      "Trop de tentatives. Réessayez dans 2 minutes."
    );
    expect(rateLimitMessage({ ok: false, remaining: 0, retryAfter: 10 }, true)).toBe(
      "Trop de tentatives. Réessayez dans 1 minute."
    );
  });
});

describe("Upstash path", () => {
  function pipelineResponse(count: number, ttl: number) {
    return new Response(JSON.stringify([{ result: count }, { result: 1 }, { result: ttl }]), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }

  beforeEach(() => {
    process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io/";
    process.env.UPSTASH_REDIS_REST_TOKEN = "secret-token";
  });

  it("sends an INCR/EXPIRE NX/TTL pipeline and maps the counter onto the rule", async () => {
    const fetchMock = vi.fn().mockResolvedValue(pipelineResponse(3, 120));
    vi.stubGlobal("fetch", fetchMock);
    const id = uniqueId();

    const result = await rateLimit("adminLogin", id);

    expect(result).toEqual({ ok: true, remaining: RATE_LIMITS.adminLogin.limit - 3, retryAfter: 120 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0]!;
    // Trailing slash on the base URL is stripped.
    expect(url).toBe("https://example.upstash.io/pipeline");
    expect(init.method).toBe("POST");
    expect(init.headers.Authorization).toBe("Bearer secret-token");
    const commands = JSON.parse(init.body);
    expect(commands[0][0]).toBe("INCR");
    expect(commands[0][1]).toMatch(new RegExp(`^velvea:rl:adminLogin:${id}:\\d+$`));
    expect(commands[1]).toEqual(["EXPIRE", commands[0][1], String(RATE_LIMITS.adminLogin.windowSeconds), "NX"]);
    expect(commands[2]).toEqual(["TTL", commands[0][1]]);
  });

  it("fails the request once the shared counter passes the limit", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(pipelineResponse(6, 300)));

    const result = await rateLimit("adminLogin", uniqueId());

    expect(result).toEqual({ ok: false, remaining: 0, retryAfter: 300 });
  });

  it("falls back to memory when Upstash is unreachable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("ENOTFOUND")));

    const result = await rateLimit("adminLogin", uniqueId());

    expect(result.ok).toBe(true);
    expect(result.remaining).toBe(RATE_LIMITS.adminLogin.limit - 1);
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("Upstash unreachable"),
      expect.any(Error)
    );
  });

  it("falls back to memory on a non-2xx response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("nope", { status: 500 })));

    const result = await rateLimit("adminLogin", uniqueId());

    expect(result.ok).toBe(true);
    expect(result.remaining).toBe(RATE_LIMITS.adminLogin.limit - 1);
  });
});
