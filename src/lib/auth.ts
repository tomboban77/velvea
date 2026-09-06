import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import type { Role } from "@prisma/client";

export const SESSION_COOKIE = "velvea_session";
export const ADMIN_COOKIE = "velvea_admin";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function secret() {
  return new TextEncoder().encode(
    process.env.AUTH_SECRET || "dev-insecure-secret-change-me"
  );
}

export type SessionPayload = {
  sub: string;
  email: string;
  role: Role;
  name?: string;
};

export async function hashPassword(pw: string): Promise<string> {
  return bcrypt.hash(pw, 11);
}

export async function verifyPassword(pw: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pw, hash);
}

async function signToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
}

/** Create a session; admins/staff also get the admin cookie the middleware checks. */
export async function createSession(user: {
  id: string;
  email: string;
  role: Role;
  name?: string | null;
}) {
  const token = await signToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.name ?? undefined,
  });
  const jar = await cookies();
  const opts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: MAX_AGE,
  };
  jar.set(SESSION_COOKIE, token, opts);
  if (user.role === "ADMIN" || user.role === "STAFF") {
    jar.set(ADMIN_COOKIE, token, opts);
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
    const { payload } = await jwtVerify(token, secret());
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
