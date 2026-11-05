import "server-only";
import { prisma } from "./prisma";
import { heldPendingWhere } from "./delivery-schedule";
import type { OrderStatus, Prisma } from "@prisma/client";

/**
 * Redemption accounting for discount codes.
 *
 * Deliberately *not* in a "use server" module: these move a shared counter and
 * have no business being reachable as server actions.
 */

/**
 * Take one redemption off the code before the customer reaches Stripe.
 * Without reserving, every shopper holding the last redemption gets it.
 * Released again if the session expires or the order is cancelled.
 */
export async function reserveDiscount(code: string): Promise<boolean> {
  const discount = await prisma.discountCode.findUnique({ where: { code } });
  if (!discount) return false;

  if (discount.usageLimit === null) {
    await prisma.discountCode.update({
      where: { code },
      data: { usedCount: { increment: 1 } },
    });
    return true;
  }

  // Conditional on the limit we just read. Postgres evaluates the predicate
  // under the row lock, so only one of N concurrent callers claims the last one.
  const claimed = await prisma.discountCode.updateMany({
    where: { code, usedCount: { lt: discount.usageLimit } },
    data: { usedCount: { increment: 1 } },
  });
  return claimed.count === 1;
}

export async function releaseDiscount(code: string): Promise<void> {
  await prisma.discountCode
    .updateMany({
      where: { code, usedCount: { gt: 0 } },
      data: { usedCount: { decrement: 1 } },
    })
    .catch((err) => console.error("[discounts] release failed:", err));
}

/**
 * Codes that only a customer's first order may use. A per-customer limit of 1
 * is not the same thing: it still lets a returning customer, who simply never
 * used the code before, claim a welcome discount on order number five.
 */
export const FIRST_ORDER_CODES: ReadonlySet<string> = new Set(["WELCOME10"]);

/**
 * One mailbox, however it is spelled. Gmail ignores dots and everything after
 * a "+", and most providers honour "+tags", so "jane+2@x.com" and
 * "j.ane@gmail.com" used to count as new customers for one-per-customer and
 * first-order codes.
 */
export function canonicalEmail(email: string): string {
  const lower = email.trim().toLowerCase();
  const at = lower.lastIndexOf("@");
  if (at < 1) return lower;
  let local = lower.slice(0, at).split("+")[0];
  let domain = lower.slice(at + 1);
  if (domain === "googlemail.com") domain = "gmail.com";
  if (domain === "gmail.com") local = local.replace(/\./g, "");
  return `${local}@${domain}`;
}

/**
 * Count orders matching `where` that belong to this customer: the account, or
 * any spelling of the email. Stored emails are lower-cased but not
 * canonical, so the query narrows by domain (and, outside Gmail, by the start
 * of the address) and the exact comparison happens here.
 */
async function countCustomerOrders(
  where: Prisma.OrderWhereInput,
  email: string,
  userId?: string | null
): Promise<number> {
  const canon = canonicalEmail(email);
  const [local, domain] = canon.split("@");
  const byEmail: Prisma.OrderWhereInput[] =
    domain === "gmail.com"
      ? [{ email: { endsWith: "@gmail.com" } }, { email: { endsWith: "@googlemail.com" } }]
      : [{ email: { startsWith: local, endsWith: `@${domain}` } }];
  const rows = await prisma.order.findMany({
    where: { AND: [where, { OR: [...byEmail, ...(userId ? [{ userId }] : [])] }] },
    select: { email: true, userId: true },
  });
  return rows.filter((r) => (userId && r.userId === userId) || canonicalEmail(r.email) === canon).length;
}

/** Orders that count as a purchase. Refunded ones too: the customer still bought from us. */
const PURCHASED: OrderStatus[] = ["PAID", "PROCESSING", "FULFILLED", "SHIPPED", "DELIVERED", "REFUNDED"];

/** Whether this email or account has ever completed an order. */
export async function hasPriorOrder(email: string, userId?: string | null): Promise<boolean> {
  return (await countCustomerOrders({ status: { in: PURCHASED } }, email, userId)) > 0;
}

/**
 * How many times this customer has used the code. A refund doesn't hand the
 * code back, and an open checkout with it counts as well: otherwise two
 * checkouts opened side by side, in two browsers, could both be paid.
 */
export async function customerRedemptions(
  code: string,
  email: string,
  userId?: string | null
): Promise<number> {
  return countCustomerOrders(
    { discountCode: code, OR: [{ status: { in: PURCHASED } }, heldPendingWhere()] },
    email,
    userId
  );
}
