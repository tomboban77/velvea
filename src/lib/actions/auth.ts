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

const MIN_PASSWORD = 8;

/**
 * Every message a shopper can see, in both languages. The storefront forms send
 * a hidden `locale` field; the admin forms do not, so they stay in English.
 *
 * INVALID_CREDENTIALS is one message for "no such user", "wrong password" and
 * "not an admin". The old copy ("Invalid credentials or insufficient access")
 * told an attacker which addresses were admin accounts.
 */
const MESSAGES = {
  en: {
    INVALID_CREDENTIALS: "Invalid email or password.",
    missingCredentials: "Enter your email and password.",
    generic: "Something went wrong. Please try again.",
    refused: "We couldn't process that request.",
    registerInvalid: `Use a valid email and a password of at least ${MIN_PASSWORD} characters.`,
    accountExists: "An account with this email already exists.",
    registerFailed: "Could not create the account. Please try again.",
    signInFailed: "Sign-in failed. Please try again.",
    resetNotice: "If that email has an account, a reset link is on its way.",
    resetNoticeAdmin: "If that email has an admin account, a reset link is on its way.",
    invalidEmail: "Enter a valid email address.",
    passwordTooShort: `Choose a password of at least ${MIN_PASSWORD} characters.`,
    passwordMismatch: "Those passwords don't match.",
    resetFailed: "Could not reset the password. Please try again.",
    resetExpired: "That reset link has expired or was already used.",
    resetInvalid: "That reset link is no longer valid.",
  },
  fr: {
    INVALID_CREDENTIALS: "Courriel ou mot de passe invalide.",
    missingCredentials: "Entrez votre courriel et votre mot de passe.",
    generic: "Une erreur s'est produite. Veuillez réessayer.",
    refused: "Nous n'avons pas pu traiter cette demande.",
    registerInvalid: `Entrez un courriel valide et un mot de passe d'au moins ${MIN_PASSWORD} caractères.`,
    accountExists: "Un compte existe déjà avec ce courriel.",
    registerFailed: "Le compte n'a pas pu être créé. Veuillez réessayer.",
    signInFailed: "La connexion a échoué. Veuillez réessayer.",
    resetNotice: "Si ce courriel correspond à un compte, un lien de réinitialisation est en route.",
    resetNoticeAdmin: "Si ce courriel correspond à un compte administrateur, un lien de réinitialisation est en route.",
    invalidEmail: "Entrez une adresse courriel valide.",
    passwordTooShort: `Choisissez un mot de passe d'au moins ${MIN_PASSWORD} caractères.`,
    passwordMismatch: "Les mots de passe ne correspondent pas.",
    resetFailed: "Le mot de passe n'a pas pu être réinitialisé. Veuillez réessayer.",
    resetExpired: "Ce lien de réinitialisation a expiré ou a déjà été utilisé.",
    resetInvalid: "Ce lien de réinitialisation n'est plus valide.",
  },
} as const;

function isFrench(formData: FormData): boolean {
  return formData.get("locale") === "fr";
}

function messagesFor(formData: FormData) {
  return isFrench(formData) ? MESSAGES.fr : MESSAGES.en;
}

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
  const msg = messagesFor(formData);

  if (!email || !password) return { error: msg.missingCredentials };

  const limit = await rateLimitBoth("adminLogin", email);
  if (!limit.ok) return { error: rateLimitMessage(limit) };

  let user;
  try {
    user = await prisma.user.findUnique({ where: { email } });
  } catch (err) {
    // The detail stays in the logs; the form only says something went wrong.
    console.error("[auth] admin login database error:", err);
    return { error: msg.generic };
  }

  if (!user || !user.passwordHash || !isAdminRole(user.role)) {
    // Spend roughly the same time as a real comparison so the response time
    // doesn't reveal whether the account exists.
    await verifyPassword(password, "$2a$11$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidin");
    return { error: msg.INVALID_CREDENTIALS };
  }
  if (!(await verifyPassword(password, user.passwordHash))) {
    return { error: msg.INVALID_CREDENTIALS };
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
  const msg = messagesFor(formData);
  if (trippedHoneypot(formData)) return { error: msg.refused };

  const name = field(formData, "name").slice(0, 120);
  const email = field(formData, "email").toLowerCase();
  const password = String(formData.get("password") || "");

  if (!emailSchema.safeParse(email).success || password.length < MIN_PASSWORD) {
    return { error: msg.registerInvalid };
  }

  const limit = await rateLimitBoth("customerRegister", email);
  if (!limit.ok) return { error: rateLimitMessage(limit, isFrench(formData)) };

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return { error: msg.accountExists };

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
    return { error: msg.registerFailed };
  }
  // The French site lives under /fr; a bare "/account" dropped French shoppers
  // onto the English pages after signing up or in.
  redirect(isFrench(formData) ? "/fr/account" : "/account");
}

export async function customerLoginAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = field(formData, "email").toLowerCase();
  const password = String(formData.get("password") || "");
  const msg = messagesFor(formData);
  if (!email || !password) return { error: msg.missingCredentials };

  const limit = await rateLimitBoth("customerLogin", email);
  if (!limit.ok) return { error: rateLimitMessage(limit, isFrench(formData)) };

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      await verifyPassword(password, "$2a$11$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidin");
      return { error: msg.INVALID_CREDENTIALS };
    }
    if (!(await verifyPassword(password, user.passwordHash))) {
      return { error: msg.INVALID_CREDENTIALS };
    }
    await createSession(user);
  } catch (err) {
    console.error("[auth] customer login error:", err);
    return { error: msg.signInFailed };
  }
  redirect(isFrench(formData) ? "/fr/account" : "/account");
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
  const msg = messagesFor(formData);
  if (trippedHoneypot(formData)) return { notice: msg.resetNotice };

  const email = field(formData, "email").toLowerCase();
  const admin = field(formData, "admin") === "1";
  const locale = field(formData, "locale") || "en";
  const notice = admin ? msg.resetNoticeAdmin : msg.resetNotice;

  if (!emailSchema.safeParse(email).success) return { error: msg.invalidEmail };

  const limit = await rateLimitBoth("passwordReset", email);
  if (!limit.ok) return { error: rateLimitMessage(limit, isFrench(formData)) };

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
  const msg = messagesFor(formData);

  if (password.length < MIN_PASSWORD) {
    return { error: msg.passwordTooShort };
  }
  if (password !== confirm) return { error: msg.passwordMismatch };

  const limit = await rateLimitBoth("passwordReset", token.slice(0, 24) || "unknown");
  if (!limit.ok) return { error: rateLimitMessage(limit, isFrench(formData)) };

  let consumed;
  try {
    consumed = await consumeToken("PASSWORD_RESET", token);
  } catch (err) {
    console.error("[auth] password reset failed:", err);
    return { error: msg.resetFailed };
  }
  if (!consumed) return { error: msg.resetExpired };

  const user = await prisma.user.findUnique({ where: { email: consumed.email } });
  if (!user) return { error: msg.resetInvalid };

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
