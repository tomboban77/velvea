"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession, hashPassword, verifyPassword } from "@/lib/auth";
import { rateLimitBoth } from "@/lib/rate-limit";
import {
  MAX_ADDRESSES,
  POSTAL_CODE_RE,
  PROVINCES,
  normalizePostalCode,
  type AccountError,
  type AccountState,
  type AddressListStatus,
} from "@/lib/addresses";

const MIN_PASSWORD = 8;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function field(formData: FormData, name: string): string {
  return String(formData.get(name) || "").trim();
}

/** English lives at "/", French at "/fr" (see i18n/routing). */
function localized(formData: FormData, path: string): string {
  return field(formData, "locale") === "fr" ? `/fr${path}` : path;
}

/**
 * Parse or report. Unlike the admin helper this returns a code instead of
 * throwing a sentence: the account screens are bilingual and pick the wording
 * themselves. The first failing field decides which code is returned.
 */
function parse<T extends z.ZodTypeAny>(
  schema: T,
  input: unknown
): { ok: true; data: z.infer<T> } | { ok: false; error: AccountError } {
  const result = schema.safeParse(input);
  if (result.success) return { ok: true, data: result.data };
  const path = String(result.error.issues[0]?.path[0] ?? "");
  const byField: Record<string, AccountError> = {
    phone: "invalid_phone",
    postalCode: "invalid_postal",
    province: "invalid_province",
  };
  return { ok: false, error: byField[path] ?? "invalid" };
}

/** Every action operates on the caller's own rows only; a missing session is refused. */
async function requireCustomer() {
  const session = await getSession();
  return session?.sub ? session : null;
}

const phoneSchema = z
  .string()
  .trim()
  .max(40)
  .regex(/^[\d\s()+.-]*$/, "digits only");

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

const profileSchema = z.object({
  name: z.string().trim().max(120),
  phone: phoneSchema,
});

export async function updateProfileAction(
  _prev: AccountState,
  formData: FormData
): Promise<AccountState> {
  const session = await requireCustomer();
  if (!session) return { error: "unauthorized" };

  const parsed = parse(profileSchema, {
    name: field(formData, "name"),
    phone: field(formData, "phone"),
  });
  if (!parsed.ok) return { error: parsed.error };

  try {
    await prisma.user.update({
      where: { id: session.sub },
      data: {
        name: parsed.data.name || null,
        phone: parsed.data.phone || null,
      },
    });
  } catch (err) {
    console.error("[account] profile update failed:", err);
    return { error: "failed" };
  }
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Password
// ---------------------------------------------------------------------------

export async function changePasswordAction(
  _prev: AccountState,
  formData: FormData
): Promise<AccountState> {
  const session = await requireCustomer();
  if (!session) return { error: "unauthorized" };

  const current = String(formData.get("current") || "");
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm") || "");

  if (!current || password.length < MIN_PASSWORD) return { error: "password_short" };
  if (password !== confirm) return { error: "password_mismatch" };
  if (password === current) return { error: "password_same" };

  // The current-password check is a sign-in attempt in disguise, so it shares
  // the sign-in budget rather than offering an unlimited oracle.
  const limit = await rateLimitBoth("customerLogin", session.email);
  if (!limit.ok) return { error: "limited" };

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.sub },
      select: { passwordHash: true },
    });
    if (!user?.passwordHash || !(await verifyPassword(current, user.passwordHash))) {
      return { error: "password_wrong" };
    }
    await prisma.user.update({
      where: { id: session.sub },
      data: { passwordHash: await hashPassword(password) },
    });
  } catch (err) {
    console.error("[account] password change failed:", err);
    return { error: "failed" };
  }
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Addresses
// ---------------------------------------------------------------------------

const addressSchema = z.object({
  id: z.string().trim().max(40).optional(),
  label: z.string().trim().max(40),
  fullName: z.string().trim().min(1).max(120),
  line1: z.string().trim().min(1).max(160),
  line2: z.string().trim().max(160),
  city: z.string().trim().min(1).max(80),
  province: z.enum(PROVINCES),
  postalCode: z.string().trim().regex(POSTAL_CODE_RE).transform(normalizePostalCode),
  phone: phoneSchema,
  isDefault: z.boolean(),
});

/** Create (no id) or update (id) one of the caller's addresses, then return to the list. */
export async function saveAddressAction(
  _prev: AccountState,
  formData: FormData
): Promise<AccountState> {
  const session = await requireCustomer();
  if (!session) return { error: "unauthorized" };

  const parsed = parse(addressSchema, {
    id: field(formData, "id") || undefined,
    label: field(formData, "label"),
    fullName: field(formData, "fullName"),
    line1: field(formData, "line1"),
    line2: field(formData, "line2"),
    city: field(formData, "city"),
    province: field(formData, "province").toUpperCase(),
    postalCode: field(formData, "postalCode"),
    phone: field(formData, "phone"),
    isDefault: formData.get("isDefault") === "on",
  });
  if (!parsed.ok) return { error: parsed.error };

  const { id, isDefault, ...values } = parsed.data;
  const userId = session.sub;
  const data = {
    ...values,
    label: values.label || null,
    line2: values.line2 || null,
    phone: values.phone || null,
    country: "CA",
  };

  try {
    await prisma.$transaction(async (tx) => {
      const count = await tx.address.count({ where: { userId } });

      if (id) {
        const existing = await tx.address.findFirst({ where: { id, userId }, select: { id: true } });
        if (!existing) throw new AddressError("address_missing");
      } else if (count >= MAX_ADDRESSES) {
        throw new AddressError("address_limit");
      }

      // The first address is always the default; otherwise a new default
      // displaces the old one so there is never more than one.
      const makeDefault = isDefault || count === 0;
      if (makeDefault) {
        await tx.address.updateMany({
          where: { userId, isDefault: true, ...(id ? { NOT: { id } } : {}) },
          data: { isDefault: false },
        });
      }

      if (id) {
        await tx.address.update({
          where: { id },
          // Unchecking "default" on the only default leaves none; that is
          // allowed, checkout simply won't preselect anything.
          data: { ...data, isDefault: makeDefault },
        });
      } else {
        await tx.address.create({ data: { ...data, userId, isDefault: makeDefault } });
      }
    });
  } catch (err) {
    if (err instanceof AddressError) return { error: err.code };
    console.error("[account] address save failed:", err);
    return { error: "failed" };
  }

  redirect(localized(formData, `/account/addresses?status=${"saved" satisfies AddressListStatus}`));
}

/** Plain form action from the list page. */
export async function deleteAddressAction(formData: FormData): Promise<void> {
  const session = await requireCustomer();
  if (!session) redirect("/account/login");

  const id = field(formData, "id");
  const userId = session.sub;
  if (id) {
    try {
      await prisma.$transaction(async (tx) => {
        const removed = await tx.address.deleteMany({ where: { id, userId } });
        if (removed.count === 0) return;
        // Deleting the default promotes the next address so checkout still
        // has something to preselect.
        const stillDefault = await tx.address.count({ where: { userId, isDefault: true } });
        if (stillDefault === 0) {
          const next = await tx.address.findFirst({ where: { userId }, select: { id: true } });
          if (next) await tx.address.update({ where: { id: next.id }, data: { isDefault: true } });
        }
      });
    } catch (err) {
      console.error("[account] address delete failed:", err);
    }
  }
  redirect(localized(formData, `/account/addresses?status=${"deleted" satisfies AddressListStatus}`));
}

/** Plain form action from the list page. */
export async function setDefaultAddressAction(formData: FormData): Promise<void> {
  const session = await requireCustomer();
  if (!session) redirect("/account/login");

  const id = field(formData, "id");
  const userId = session.sub;
  if (id) {
    try {
      await prisma.$transaction(async (tx) => {
        const target = await tx.address.findFirst({ where: { id, userId }, select: { id: true } });
        if (!target) return;
        await tx.address.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } });
        await tx.address.update({ where: { id: target.id }, data: { isDefault: true } });
      });
    } catch (err) {
      console.error("[account] set default address failed:", err);
    }
  }
  redirect(localized(formData, `/account/addresses?status=${"default" satisfies AddressListStatus}`));
}

class AddressError extends Error {
  constructor(public code: AccountError) {
    super(code);
  }
}
