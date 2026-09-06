"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  createSession,
  destroySession,
  verifyPassword,
  hashPassword,
  getSession,
  isAdminRole,
} from "@/lib/auth";

export type AuthState = { error?: string } | null;

export async function adminLoginAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") || "").toLowerCase().trim();
  const password = String(formData.get("password") || "");
  const next = String(formData.get("next") || "/admin");

  if (!email || !password) return { error: "Enter your email and password." };

  let user;
  try {
    user = await prisma.user.findUnique({ where: { email } });
  } catch (err) {
    console.error("[auth] admin login database error:", err);
    return { error: "Database unavailable. Check the connection and try again." };
  }
  if (!user || !user.passwordHash || !isAdminRole(user.role)) {
    return { error: "Invalid credentials or insufficient access." };
  }
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return { error: "Invalid credentials." };

  await createSession(user);
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function adminLogoutAction() {
  await destroySession();
  redirect("/admin/login");
}

// --- Customer auth ---
export async function customerRegisterAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").toLowerCase().trim();
  const password = String(formData.get("password") || "");

  if (!email || password.length < 8)
    return { error: "Use a valid email and a password of at least 8 characters." };

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return { error: "An account with this email already exists." };
    const user = await prisma.user.create({
      data: { name, email, passwordHash: await hashPassword(password), role: "CUSTOMER" },
    });
    await createSession(user);
  } catch (err) {
    console.error("[auth] customer register error:", err);
    return { error: "Could not create the account. Please try again." };
  }
  redirect("/account");
}

export async function customerLoginAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") || "").toLowerCase().trim();
  const password = String(formData.get("password") || "");
  if (!email || !password) return { error: "Enter your email and password." };

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) return { error: "Invalid credentials." };
    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) return { error: "Invalid credentials." };
    await createSession(user);
  } catch (err) {
    console.error("[auth] customer login error:", err);
    return { error: "Sign-in failed. Please try again." };
  }
  redirect("/account");
}

export async function customerLogoutAction() {
  await destroySession();
  redirect("/");
}

export async function requireAdminSession() {
  const session = await getSession();
  if (!session || !isAdminRole(session.role)) redirect("/admin/login");
  return session;
}
