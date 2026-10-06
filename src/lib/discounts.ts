import "server-only";
import { prisma } from "./prisma";

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
 * Whether this email or account has ever completed an order. Refunded orders
 * count: the customer still bought from us, so they are not new.
 */
export async function hasPriorOrder(email: string, userId?: string | null): Promise<boolean> {
  const count = await prisma.order.count({
    where: {
      status: { in: ["PAID", "PROCESSING", "FULFILLED", "SHIPPED", "DELIVERED", "REFUNDED"] },
      OR: [{ email: email.toLowerCase() }, ...(userId ? [{ userId }] : [])],
    },
  });
  return count > 0;
}

/** How many paid orders this customer has already placed with the code. */
export async function customerRedemptions(
  code: string,
  email: string,
  userId?: string | null
): Promise<number> {
  return prisma.order.count({
    where: {
      discountCode: code,
      status: { in: ["PAID", "PROCESSING", "FULFILLED", "SHIPPED", "DELIVERED"] },
      OR: [{ email: email.toLowerCase() }, ...(userId ? [{ userId }] : [])],
    },
  });
}
