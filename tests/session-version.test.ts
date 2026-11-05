import { beforeEach, describe, expect, it, vi } from "vitest";
import { SignJWT } from "jose";

const SECRET = new TextEncoder().encode("test-secret-at-least-32-characters-long!!");

const { prisma, jar } = vi.hoisted(() => ({
  prisma: { user: { findUnique: vi.fn(), findUniqueOrThrow: vi.fn(), update: vi.fn() } },
  jar: { get: vi.fn(), set: vi.fn(), delete: vi.fn() },
}));

vi.mock("@/lib/prisma", () => ({ prisma }));
vi.mock("@/lib/env", () => ({ authSecretBytes: () => SECRET }));
vi.mock("next/headers", () => ({ cookies: async () => jar }));
// getSession is wrapped in React's per-request cache; tests call it once per case.
vi.mock("react", () => ({ cache: <T>(fn: T) => fn }));

import { endAllSessions, getSession } from "@/lib/auth";

async function token(claims: Record<string, unknown>) {
  return new SignJWT({ sub: "user_1", email: "a@example.com", role: "CUSTOMER", ...claims })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(SECRET);
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe("session version", () => {
  it("accepts a token issued for the account's current version", async () => {
    jar.get.mockReturnValue({ value: await token({ sv: 2 }) });
    prisma.user.findUnique.mockResolvedValue({ sessionVersion: 2 });

    await expect(getSession()).resolves.toMatchObject({ sub: "user_1", sv: 2 });
  });

  it("rejects a token from before a password change", async () => {
    jar.get.mockReturnValue({ value: await token({ sv: 1 }) });
    prisma.user.findUnique.mockResolvedValue({ sessionVersion: 2 });

    await expect(getSession()).resolves.toBeNull();
  });

  it("treats a token issued before versions existed as version 0", async () => {
    jar.get.mockReturnValue({ value: await token({}) });
    prisma.user.findUnique.mockResolvedValue({ sessionVersion: 0 });
    await expect(getSession()).resolves.not.toBeNull();

    prisma.user.findUnique.mockResolvedValue({ sessionVersion: 1 });
    await expect(getSession()).resolves.toBeNull();
  });

  it("signs out a deleted account, and fails closed when the database is down", async () => {
    jar.get.mockReturnValue({ value: await token({ sv: 0 }) });
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(getSession()).resolves.toBeNull();

    prisma.user.findUnique.mockRejectedValue(new Error("db down"));
    await expect(getSession()).resolves.toBeNull();
  });

  it("ends every session by raising the version", async () => {
    await endAllSessions("user_1");
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user_1" },
      data: { sessionVersion: { increment: 1 } },
    });
  });
});
