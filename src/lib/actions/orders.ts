import "server-only";
import { prisma } from "@/lib/prisma";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import {
  sendOrderConfirmation,
  sendAdminOrderNotice,
  sendOrderShipped,
  sendOrderCancelled,
  sendOrderRefunded,
  type OrderEmailData,
  type OrderEmailItem,
} from "@/lib/email";
import { releaseDiscount } from "@/lib/discounts";
import type { Order, OrderItem, OrderStatus } from "@prisma/client";

type OrderWithItems = Order & { items: OrderItem[] };

/** Statuses that mean the customer has paid and stock is committed. */
const PAID_STATUSES: OrderStatus[] = [
  "PAID",
  "PROCESSING",
  "FULFILLED",
  "SHIPPED",
  "DELIVERED",
];

function shippingOf(order: Order) {
  return order.shipping as OrderEmailData["shipping"];
}

function emailItemsOf(items: OrderItem[]): OrderEmailItem[] {
  return items.map((i) => {
    const cfg = i.customConfig as { items?: { name: string; qty: number }[] } | null;
    return {
      name: i.name,
      variantLabel: i.variantLabel,
      quantity: i.quantity,
      unitPriceCents: i.unitPriceCents,
      isCustom: i.isCustom,
      customItems:
        i.isCustom && cfg?.items
          ? cfg.items.map((c) => (c.qty > 1 ? `${c.name} × ${c.qty}` : c.name))
          : undefined,
      giftMessage: i.giftMessage,
    };
  });
}

function emailDataOf(order: OrderWithItems): OrderEmailData {
  return {
    orderNumber: order.orderNumber,
    email: order.email,
    locale: order.locale,
    phone: order.phone,
    items: emailItemsOf(order.items),
    subtotalCents: order.subtotalCents,
    shippingCents: order.shippingCents,
    taxCents: order.taxCents,
    discountCents: order.discountCents,
    totalCents: order.totalCents,
    discountCode: order.discountCode,
    deliveryMethod: order.deliveryMethod,
    deliveryDate: order.deliveryDate,
    deliveryNotes: order.deliveryNotes,
    shipping: shippingOf(order),
    giftMessage: order.giftMessage,
  };
}

/**
 * Commit stock for a paid order. Products with `inventory === null` are
 * unlimited and skipped; the rest are floored at zero so a race that oversells
 * by one doesn't leave a negative count in the admin.
 */
async function commitInventory(items: OrderItem[]) {
  for (const item of items) {
    if (!item.productId) continue;
    await prisma.product
      .updateMany({
        where: { id: item.productId, inventory: { not: null } },
        data: { inventory: { decrement: item.quantity } },
      })
      .catch((err) => console.error("[orders] inventory decrement failed:", err));
  }
  await prisma.product
    .updateMany({ where: { inventory: { lt: 0 } }, data: { inventory: 0 } })
    .catch(() => {});
}

/** Give stock back when a paid order is cancelled or refunded. */
async function restoreInventory(items: OrderItem[]) {
  for (const item of items) {
    if (!item.productId) continue;
    await prisma.product
      .updateMany({
        where: { id: item.productId, inventory: { not: null } },
        data: { inventory: { increment: item.quantity } },
      })
      .catch((err) => console.error("[orders] inventory restore failed:", err));
  }
}

/**
 * Mark an order paid exactly once.
 *
 * The webhook and the success page race each other, so the transition is a
 * conditional `updateMany` on status=PENDING: whoever loses sees count===0 and
 * does nothing, instead of both sending emails and committing stock twice.
 */
export async function markOrderPaid(
  orderId: string,
  opts: { paymentIntentId?: string; amountPaidCents?: number } = {}
): Promise<{ settled: boolean; reason?: string }> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return { settled: false, reason: "not found" };

  // Never mark an order paid for less than it was placed for.
  if (
    typeof opts.amountPaidCents === "number" &&
    opts.amountPaidCents !== order.totalCents
  ) {
    console.error(
      `[orders] amount mismatch on ${order.orderNumber}: charged ${opts.amountPaidCents}, expected ${order.totalCents}`
    );
    await prisma.orderEvent
      .create({
        data: {
          orderId: order.id,
          label: "Payment amount mismatch",
          note: `Charged ${opts.amountPaidCents} but order total is ${order.totalCents}. Held for review.`,
        },
      })
      .catch(() => {});
    return { settled: false, reason: "amount mismatch" };
  }

  const claimed = await prisma.order.updateMany({
    where: { id: orderId, status: "PENDING" },
    data: {
      status: "PAID",
      paidAt: new Date(),
      ...(opts.paymentIntentId ? { stripePaymentIntentId: opts.paymentIntentId } : {}),
    },
  });
  if (claimed.count !== 1) return { settled: false, reason: "already settled" };

  await prisma.orderEvent.create({
    data: { orderId, label: "Payment received", note: "Order confirmed" },
  });

  await commitInventory(order.items);

  // The discount redemption was already reserved when the checkout was created,
  // so nothing is incremented here.

  const data = emailDataOf(order);
  await sendOrderConfirmation(data);
  await sendAdminOrderNotice(data, { paid: true });
  return { settled: true };
}

/** Move an order to CANCELLED, release its discount and return its stock. */
export async function cancelOrder(
  orderId: string,
  opts: { reason?: string; notify?: boolean } = {}
): Promise<{ cancelled: boolean }> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order || order.status === "CANCELLED" || order.status === "REFUNDED") {
    return { cancelled: false };
  }

  const claimed = await prisma.order.updateMany({
    where: { id: orderId, status: { notIn: ["CANCELLED", "REFUNDED"] } },
    data: { status: "CANCELLED", cancelledAt: new Date() },
  });
  if (claimed.count !== 1) return { cancelled: false };

  await prisma.orderEvent.create({
    data: { orderId, label: "Cancelled", note: opts.reason ?? null },
  });

  if (order.discountCode) await releaseDiscount(order.discountCode);
  if (PAID_STATUSES.includes(order.status)) await restoreInventory(order.items);

  if (opts.notify) {
    await sendOrderCancelled({
      orderNumber: order.orderNumber,
      email: order.email,
      locale: order.locale,
      reason: opts.reason,
    });
  }
  return { cancelled: true };
}

/** Record a refund (Stripe is the source of truth; this mirrors it locally). */
export async function recordRefund(
  orderId: string,
  amountCents: number,
  opts: { notify?: boolean } = {}
): Promise<{ recorded: boolean }> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return { recorded: false };

  const alreadyRefunded = order.refundedCents;
  const total = Math.min(order.totalCents, alreadyRefunded + amountCents);
  if (total <= alreadyRefunded) return { recorded: false };

  const full = total >= order.totalCents;
  await prisma.order.update({
    where: { id: orderId },
    data: {
      refundedCents: total,
      ...(full ? { status: "REFUNDED" } : {}),
      timeline: {
        create: {
          label: full ? "Refunded" : "Partially refunded",
          note: `${(total - alreadyRefunded) / 100} CAD refunded`,
        },
      },
    },
  });

  if (full && PAID_STATUSES.includes(order.status)) await restoreInventory(order.items);

  if (opts.notify) {
    await sendOrderRefunded({
      orderNumber: order.orderNumber,
      email: order.email,
      locale: order.locale,
      amountCents: total - alreadyRefunded,
    });
  }
  return { recorded: true };
}

/** Mark an order shipped and email the customer their tracking details. */
export async function markOrderShipped(
  orderId: string,
  tracking: { carrier?: string | null; trackingNumber?: string | null; trackingUrl?: string | null },
  opts: { notify?: boolean } = {}
): Promise<void> {
  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "SHIPPED",
      shippedAt: new Date(),
      carrier: tracking.carrier ?? null,
      trackingNumber: tracking.trackingNumber ?? null,
      trackingUrl: tracking.trackingUrl ?? null,
      timeline: {
        create: {
          label: "Shipped",
          note: tracking.trackingNumber
            ? `${tracking.carrier ?? ""} ${tracking.trackingNumber}`.trim()
            : null,
        },
      },
    },
  });

  if (opts.notify !== false) {
    await sendOrderShipped({
      orderNumber: order.orderNumber,
      email: order.email,
      locale: order.locale,
      carrier: order.carrier,
      trackingNumber: order.trackingNumber,
      trackingUrl: order.trackingUrl,
      shipping: shippingOf(order),
    });
  }
}

/**
 * Order-confirmation page fallback: verify a Stripe session and settle the
 * order. Returns whether the caller actually owns this session, which is what
 * lets the page show the address to a customer arriving from Stripe.
 */
export async function settleFromSession(
  orderNumber: string,
  sessionId: string
): Promise<{ owns: boolean }> {
  if (!isStripeConfigured()) return { owns: false };
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.metadata?.orderNumber !== orderNumber) return { owns: false };

    if (session.payment_status === "paid" && session.metadata?.orderId) {
      await markOrderPaid(session.metadata.orderId, {
        paymentIntentId:
          typeof session.payment_intent === "string" ? session.payment_intent : undefined,
        amountPaidCents: session.amount_total ?? undefined,
      });
    }
    // Holding a valid session id for this order is proof of ownership even if
    // the payment is still processing.
    return { owns: true };
  } catch (err) {
    console.error("settleFromSession failed:", err);
    return { owns: false };
  }
}
