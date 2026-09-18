import "server-only";
import { headers } from "next/headers";

/**
 * Fixed-window rate limiting.
 *
 * Uses Upstash Redis over its REST API when UPSTASH_REDIS_REST_URL /
 * UPSTASH_REDIS_REST_TOKEN are set — the only option that actually holds on
 * serverless, where every request may land on a fresh instance. Without it we
 * fall back to a per-instance in-memory window, which still blunts a naive
 * script but must not be relied on in production.
 */

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  /** Seconds until the current window rolls over. */
  retryAfter: number;
};

export type RateLimitRule = {
  /** Max requests allowed inside the window. */
  limit: number;
  /** Window length in seconds. */
  windowSeconds: number;
};

/** Named rules, so limits live in one place instead of scattered magic numbers. */
export const RATE_LIMITS = {
  adminLogin: { limit: 5, windowSeconds: 15 * 60 },
  customerLogin: { limit: 10, windowSeconds: 15 * 60 },
  customerRegister: { limit: 5, windowSeconds: 60 * 60 },
  passwordReset: { limit: 5, windowSeconds: 60 * 60 },
  discountCheck: { limit: 20, windowSeconds: 5 * 60 },
  checkout: { limit: 10, windowSeconds: 10 * 60 },
  review: { limit: 5, windowSeconds: 60 * 60 },
  newsletter: { limit: 5, windowSeconds: 60 * 60 },
  corporate: { limit: 5, windowSeconds: 60 * 60 },
} as const satisfies Record<string, RateLimitRule>;

export type RateLimitName = keyof typeof RATE_LIMITS;

const upstashUrl = () => process.env.UPSTASH_REDIS_REST_URL?.replace(/\/$/, "");
const upstashToken = () => process.env.UPSTASH_REDIS_REST_TOKEN;

export function isDistributedRateLimiting(): boolean {
  return Boolean(upstashUrl() && upstashToken());
}

// --- In-memory fallback -----------------------------------------------------

type Window = { count: number; resetAt: number };
const memory = new Map<string, Window>();
const MEMORY_MAX_KEYS = 10_000;

function memoryHit(key: string, rule: RateLimitRule): RateLimitResult {
  const now = Date.now();
  const existing = memory.get(key);
  if (!existing || existing.resetAt <= now) {
    if (memory.size > MEMORY_MAX_KEYS) {
      for (const [k, v] of memory) if (v.resetAt <= now) memory.delete(k);
      if (memory.size > MEMORY_MAX_KEYS) memory.clear();
    }
    memory.set(key, { count: 1, resetAt: now + rule.windowSeconds * 1000 });
    return { ok: true, remaining: rule.limit - 1, retryAfter: rule.windowSeconds };
  }
  existing.count += 1;
  const retryAfter = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
  return {
    ok: existing.count <= rule.limit,
    remaining: Math.max(0, rule.limit - existing.count),
    retryAfter,
  };
}

// --- Upstash ----------------------------------------------------------------

async function upstashHit(key: string, rule: RateLimitRule): Promise<RateLimitResult | null> {
  const url = upstashUrl();
  const token = upstashToken();
  if (!url || !token) return null;
  try {
    const res = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", key],
        ["EXPIRE", key, String(rule.windowSeconds), "NX"],
        ["TTL", key],
      ]),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const payload = (await res.json()) as { result?: number; error?: string }[];
    const count = Number(payload[0]?.result ?? 0);
    const ttl = Number(payload[2]?.result ?? rule.windowSeconds);
    if (!count) return null;
    return {
      ok: count <= rule.limit,
      remaining: Math.max(0, rule.limit - count),
      retryAfter: ttl > 0 ? ttl : rule.windowSeconds,
    };
  } catch (err) {
    console.error("[rate-limit] Upstash unreachable, falling back to memory:", err);
    return null;
  }
}

// --- Public API -------------------------------------------------------------

/** Best-effort client IP from the proxy headers Vercel sets. */
export async function clientIp(): Promise<string> {
  try {
    const h = await headers();
    const forwarded = h.get("x-forwarded-for");
    if (forwarded) return forwarded.split(",")[0]!.trim();
    return h.get("x-real-ip") || h.get("cf-connecting-ip") || "unknown";
  } catch {
    return "unknown";
  }
}

/**
 * Consume one token for `name` scoped to `identifier` (an IP, an email, or
 * both). Fails open on infrastructure errors — a broken Redis must not take
 * checkout down — but never on an actual limit breach.
 */
export async function rateLimit(
  name: RateLimitName,
  identifier: string
): Promise<RateLimitResult> {
  const rule = RATE_LIMITS[name];
  const window = Math.floor(Date.now() / (rule.windowSeconds * 1000));
  const key = `velvea:rl:${name}:${identifier}:${window}`;
  const remote = await upstashHit(key, rule);
  return remote ?? memoryHit(key, rule);
}

/** Rate limit by caller IP alone. */
export async function rateLimitByIp(name: RateLimitName): Promise<RateLimitResult> {
  return rateLimit(name, `ip:${await clientIp()}`);
}

/**
 * Rate limit by IP *and* by a subject (usually an email), so one attacker
 * cannot spray a single account from many IPs, nor one IP across many accounts.
 */
export async function rateLimitBoth(
  name: RateLimitName,
  subject: string
): Promise<RateLimitResult> {
  const ip = await clientIp();
  const [byIp, bySubject] = await Promise.all([
    rateLimit(name, `ip:${ip}`),
    rateLimit(name, `sub:${subject.toLowerCase()}`),
  ]);
  return byIp.ok ? bySubject : byIp;
}

/** Standard message shown when a limit is hit. */
export function rateLimitMessage(result: RateLimitResult, fr = false): string {
  const minutes = Math.max(1, Math.ceil(result.retryAfter / 60));
  return fr
    ? `Trop de tentatives. Réessayez dans ${minutes} minute${minutes > 1 ? "s" : ""}.`
    : `Too many attempts. Please try again in ${minutes} minute${minutes > 1 ? "s" : ""}.`;
}
