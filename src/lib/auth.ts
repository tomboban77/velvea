import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { authSecretBytes } from "./env";
import type { Role } from "@prisma/client";

export const SESSION_COOKIE = "velvea_session";
export const ADMIN_COOKIE = "velvea_admin";

/** Customers stay signed in for a month; admin sessions are deliberately short. */
const CUSTOMER_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const ADMIN_MAX_AGE = 60 * 60 * 12; // 12 hours

export type SessionPayload = {
  sub: string;
  email: string;
  role: Role;
  name?: string;
};

export function sessionMaxAge(role: Role): number {
  return isAdminRole(role) ? ADMIN_MAX_AGE : CUSTOMER_MAX_AGE;
}

export async function hashPassword(pw: string): Promise<string> {
  return bcrypt.hash(pw, 11);
}

export async function verifyPassword(pw: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pw, hash);
}

async function signToken(payload: SessionPayload, maxAge: number): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${maxAge}s`)
    .sign(authSecretBytes());
}

/** Create a session; admins/staff also get the admin cookie the middleware checks. */
export async function createSession(user: {
  id: string;
  email: string;
  role: Role;
  name?: string | null;
}) {
  const maxAge = sessionMaxAge(user.role);
  const token = await signToken(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name ?? undefined,
    },
    maxAge
  );
  const jar = await cookies();
  const opts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
  jar.set(SESSION_COOKIE, token, opts);
  if (isAdminRole(user.role)) {
    jar.set(ADMIN_COOKIE, token, opts);
  } else {
    jar.delete(ADMIN_COOKIE);
  }
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  jar.delete(ADMIN_COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  try {
    const jar = await cookies();
    const token = jar.get(SESSION_COOKIE)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, authSecretBytes());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  try {
    return await prisma.user.findUnique({ where: { id: session.sub } });
  } catch {
    return null;
  }
}

export function isAdminRole(role?: Role | null): boolean {
  return role === "ADMIN" || role === "STAFF";
}

/**
 * Re-read the role from the database rather than trusting the one baked into
 * the token: a revoked admin must lose access on their next request, not when
 * their cookie happens to expire.
 */
export async function getVerifiedAdmin(): Promise<{
  id: string;
  email: string;
  role: Role;
  name: string | null;
} | null> {
  const session = await getSession();
  if (!session || !isAdminRole(session.role)) return null;
  try {
    const user = await prisma.user.findUnique({
      where: { id: session.sub },
      select: { id: true, email: true, role: true, name: true },
    });
    if (!user || !isAdminRole(user.role)) return null;
    return user;
  } catch {
    // A database outage must not silently promote a stale token to admin.
    return null;
  }
}
