"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  createSession,
  destroySession,
  verifyPassword,
  hashPassword,
  getSession,
  isAdminRole,
} from "@/lib/auth";
import { rateLimitBoth, rateLimitMessage } from "@/lib/rate-limit";
import { issueToken, consumeToken } from "@/lib/tokens";
import { sendPasswordReset, sendEmailVerification } from "@/lib/email";

export type AuthState = { error?: string; notice?: string } | null;

/**
 * One message for "no such user", "wrong password" and "not an admin".
 * The old copy ("Invalid credentials or insufficient access") told an attacker
 * which addresses were admin accounts.
 */
const INVALID_CREDENTIALS = "Invalid email or password.";
const MIN_PASSWORD = 8;

const emailSchema = z.string().email().max(200);

function field(formData: FormData, name: string): string {
  return String(formData.get(name) || "").trim();
}

/** Bots fill every input; a real browser leaves the hidden one empty. */
function trippedHoneypot(formData: FormData): boolean {
  return Boolean(String(formData.get("company") || "").trim());
}

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

export async function adminLoginAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = field(formData, "email").toLowerCase();
  const password = String(formData.get("password") || "");
  const next = field(formData, "next") || "/admin";

  if (!email || !password) return { error: "Enter your email and password." };

  const limit = await rateLimitBoth("adminLogin", email);
  if (!limit.ok) return { error: rateLimitMessage(limit) };

  let user;
  try {
    user = await prisma.user.findUnique({ where: { email } });
  } catch (err) {
    console.error("[auth] admin login database error:", err);
    return { error: "Database unavailable. Check the connection and try again." };
  }

  if (!user || !user.passwordHash || !isAdminRole(user.role)) {
    // Spend roughly the same time as a real comparison so the response time
    // doesn't reveal whether the account exists.
    await verifyPassword(password, "$2a$11$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidin");
    return { error: INVALID_CREDENTIALS };
  }
  if (!(await verifyPassword(password, user.passwordHash))) {
    return { error: INVALID_CREDENTIALS };
  }

  await createSession(user);
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function adminLogoutAction() {
  await destroySession();
  redirect("/admin/login");
}

// ---------------------------------------------------------------------------
// Customer auth
// ---------------------------------------------------------------------------

export async function customerRegisterAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  if (trippedHoneypot(formData)) return { error: "We couldn't process that request." };

  const name = field(formData, "name").slice(0, 120);
  const email = field(formData, "email").toLowerCase();
  const password = String(formData.get("password") || "");

  if (!emailSchema.safeParse(email).success || password.length < MIN_PASSWORD) {
    return { error: `Use a valid email and a password of at least ${MIN_PASSWORD} characters.` };
  }

  const limit = await rateLimitBoth("customerRegister", email);
  if (!limit.ok) return { error: rateLimitMessage(limit) };

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return { error: "An account with this email already exists." };

    const user = await prisma.user.create({
      data: { name, email, passwordHash: await hashPassword(password), role: "CUSTOMER" },
    });
    await createSession(user);

    // Orders placed as a guest are only linked to the account once the address
    // is proven, so verification is offered immediately.
    const token = await issueToken("EMAIL_VERIFY", email, user.id);
    await sendEmailVerification({ email, token });
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
  const email = field(formData, "email").toLowerCase();
  const password = String(formData.get("password") || "");
  if (!email || !password) return { error: "Enter your email and password." };

  const limit = await rateLimitBoth("customerLogin", email);
  if (!limit.ok) return { error: rateLimitMessage(limit) };

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      await verifyPassword(password, "$2a$11$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidin");
      return { error: INVALID_CREDENTIALS };
    }
    if (!(await verifyPassword(password, user.passwordHash))) {
      return { error: INVALID_CREDENTIALS };
    }
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

// ---------------------------------------------------------------------------
// Password reset
// ---------------------------------------------------------------------------

/**
 * Always reports success. Telling the caller whether an address is registered
 * turns this form into an account-enumeration oracle.
 */
export async function requestPasswordResetAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  if (trippedHoneypot(formData)) return { notice: "If that email has an account, a reset link is on its way." };

  const email = field(formData, "email").toLowerCase();
  const admin = field(formData, "admin") === "1";
  const locale = field(formData, "locale") || "en";
  const notice = admin
    ? "If that email has an admin account, a reset link is on its way."
    : "If that email has an account, a reset link is on its way.";

  if (!emailSchema.safeParse(email).success) return { error: "Enter a valid email address." };

  const limit = await rateLimitBoth("passwordReset", email);
  if (!limit.ok) return { error: rateLimitMessage(limit) };

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user && (!admin || isAdminRole(user.role))) {
      const token = await issueToken("PASSWORD_RESET", email, user.id);
      await sendPasswordReset({ email, token, locale, admin });
    }
  } catch (err) {
    console.error("[auth] password reset request failed:", err);
  }
  return { notice };
}

export async function resetPasswordAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const token = field(formData, "token");
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm") || "");
  const admin = field(formData, "admin") === "1";

  if (password.length < MIN_PASSWORD) {
    return { error: `Choose a password of at least ${MIN_PASSWORD} characters.` };
  }
  if (password !== confirm) return { error: "Those passwords don't match." };

  const limit = await rateLimitBoth("passwordReset", token.slice(0, 24) || "unknown");
  if (!limit.ok) return { error: rateLimitMessage(limit) };

  let consumed;
  try {
    consumed = await consumeToken("PASSWORD_RESET", token);
  } catch (err) {
    console.error("[auth] password reset failed:", err);
    return { error: "Could not reset the password. Please try again." };
  }
  if (!consumed) return { error: "That reset link has expired or was already used." };

  const user = await prisma.user.findUnique({ where: { email: consumed.email } });
  if (!user) return { error: "That reset link is no longer valid." };

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: await hashPassword(password),
      // Proving control of the inbox also verifies the address.
      emailVerified: user.emailVerified ?? new Date(),
    },
  });

  await createSession(user);
  redirect(admin && isAdminRole(user.role) ? "/admin" : "/account");
}

// ---------------------------------------------------------------------------
// Email verification
// ---------------------------------------------------------------------------

export async function verifyEmailToken(token: string): Promise<boolean> {
  if (!token) return false;
  try {
    const consumed = await consumeToken("EMAIL_VERIFY", token);
    if (!consumed) return false;
    await prisma.user.updateMany({
      where: { email: consumed.email, emailVerified: null },
      data: { emailVerified: new Date() },
    });
    return true;
  } catch (err) {
    console.error("[auth] email verification failed:", err);
    return false;
  }
}

/** Outcome of a "Resend email" click, carried back to the account page as ?verify=… */
export type ResendVerificationStatus = "sent" | "limited" | "failed" | "verified";

/**
 * Plain form action used from the account page. Every path used to return
 * silently, which made a refused or rate-limited send look identical to a
 * successful one. Now each outcome redirects back with a status the page shows.
 */
export async function resendVerificationAction(formData: FormData): Promise<void> {
  const locale = field(formData, "locale") === "fr" ? "fr" : "en";
  const back = (status: ResendVerificationStatus) => redirect(`/account?verify=${status}`);

  const session = await getSession();
  if (!session) redirect("/account/login");

  const limit = await rateLimitBoth("passwordReset", session.email);
  if (!limit.ok) back("limited");

  const user = await prisma.user.findUnique({ where: { id: session.sub } });
  if (!user) redirect("/account/login");
  if (user.emailVerified) back("verified");

  let ok = false;
  try {
    const token = await issueToken("EMAIL_VERIFY", user.email, user.id);
    ok = await sendEmailVerification({ email: user.email, token, locale });
  } catch (err) {
    console.error("[auth] resend verification failed:", err);
  }
  back(ok ? "sent" : "failed");
}

// ---------------------------------------------------------------------------
// Guards
// ---------------------------------------------------------------------------

export async function requireAdminSession() {
  const session = await getSession();
  if (!session || !isAdminRole(session.role)) redirect("/admin/login");
  return session;
}
