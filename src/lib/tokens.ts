import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "crypto";
import { SignJWT, jwtVerify } from "jose";
import { authSecretBytes } from "./env";
import { prisma } from "./prisma";
import type { TokenPurpose } from "@prisma/client";

// --- Order-access tokens ----------------------------------------------------
// The order-number scheme is guessable, so the confirmation page cannot be the
// only thing standing between a stranger and a customer's home address. Email
// links carry a short signed token scoped to that one order.

const ORDER_TOKEN_TTL = "30d";

export async function signOrderToken(orderNumber: string): Promise<string> {
  return new SignJWT({ scope: "order", orderNumber })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ORDER_TOKEN_TTL)
    .sign(authSecretBytes());
}

export async function verifyOrderToken(
  token: string | undefined,
  orderNumber: string
): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, authSecretBytes());
    return payload.scope === "order" && payload.orderNumber === orderNumber;
  } catch {
    return false;
  }
}

/** Absolute URL a customer can open to view their own order. */
export async function orderUrl(orderNumber: string, siteUrl: string): Promise<string> {
  const token = await signOrderToken(orderNumber);
  return `${siteUrl}/order/${encodeURIComponent(orderNumber)}?t=${encodeURIComponent(token)}`;
}

// --- Single-use database tokens --------------------------------------------
// Password reset and email verification. Only the hash is stored, so a database
// leak does not hand over working reset links.

const RESET_TTL_MS = 60 * 60 * 1000; // 1 hour
const VERIFY_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function newOpaqueToken(): string {
  return randomBytes(32).toString("base64url");
}

export async function issueToken(
  purpose: TokenPurpose,
  email: string,
  userId?: string | null
): Promise<string> {
  const token = newOpaqueToken();
  const ttl = purpose === "PASSWORD_RESET" ? RESET_TTL_MS : VERIFY_TTL_MS;
  // Any outstanding token of the same purpose is retired first: a reset request
  // should invalidate the previous link, not stack up usable ones.
  await prisma.verificationToken.updateMany({
    where: { email: email.toLowerCase(), purpose, usedAt: null },
    data: { usedAt: new Date() },
  });
  await prisma.verificationToken.create({
    data: {
      tokenHash: hashToken(token),
      purpose,
      email: email.toLowerCase(),
      userId: userId ?? null,
      expiresAt: new Date(Date.now() + ttl),
    },
  });
  return token;
}

export type ConsumedToken = { email: string; userId: string | null };

/** Validate and burn a token. Returns null when missing, expired or already used. */
export async function consumeToken(
  purpose: TokenPurpose,
  token: string
): Promise<ConsumedToken | null> {
  if (!token) return null;
  const row = await prisma.verificationToken.findUnique({
    where: { tokenHash: hashToken(token) },
  });
  if (!row || row.purpose !== purpose) return null;
  if (row.usedAt || row.expiresAt <= new Date()) return null;
  // Conditional update: two concurrent clicks must not both succeed.
  const burned = await prisma.verificationToken.updateMany({
    where: { id: row.id, usedAt: null },
    data: { usedAt: new Date() },
  });
  if (burned.count !== 1) return null;
  return { email: row.email, userId: row.userId };
}

/** Constant-time compare for short opaque secrets (e.g. unsubscribe tokens). */
export function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}
