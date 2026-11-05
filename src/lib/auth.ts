import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { authSecretBytes } from "./env";
import { can, type Permission } from "./permissions";
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
  /** The account's sessionVersion when this token was issued. Absent on older tokens: 0. */
  sv?: number;
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
  // Read here rather than passed in, so no caller can issue a token for an
  // older version and sign the user straight back out.
  const { sessionVersion } = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: { sessionVersion: true },
  });
  const token = await signToken(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name ?? undefined,
      sv: sessionVersion,
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

/**
 * The signed-in user, or null.
 *
 * A signed token alone used to be enough, so a session stayed valid for its
 * full 30 days (12 for admin) after the password changed: whoever had stolen
 * it kept access. The token now has to carry the account's current
 * sessionVersion. Cached per request, so pages that ask several times cost one
 * lookup. A database error counts as signed out: never trust an unchecked token.
 */
export const getSession = cache(async (): Promise<SessionPayload | null> => {
  try {
    const jar = await cookies();
    const token = jar.get(SESSION_COOKIE)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, authSecretBytes());
    const session = payload as unknown as SessionPayload;
    const user = await prisma.user.findUnique({
      where: { id: session.sub },
      select: { sessionVersion: true },
    });
    if (!user || user.sessionVersion !== (session.sv ?? 0)) return null;
    return session;
  } catch {
    return null;
  }
});

/** Sign this account out everywhere. The caller re-issues the current device's session. */
export async function endAllSessions(userId: string) {
  await prisma.user.update({ where: { id: userId }, data: { sessionVersion: { increment: 1 } } });
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

/**
 * Auth gate for every admin panel page, called before it touches data.
 *
 * The (panel) layout already checks, but Next does not re-render a layout on
 * every navigation (partial rendering), so a layout is not a reliable auth
 * boundary on its own. No session goes to the sign-in page; a role without
 * the page's permission gets a 404, matching the menu that hides the entry.
 */
export async function requireAdminPage(permission?: Permission) {
  const admin = await getVerifiedAdmin();
  if (!admin) redirect("/admin/login");
  if (permission && !can(admin.role, permission)) notFound();
  return admin;
}
