import "server-only";
import { prisma } from "@/lib/prisma";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import {
  sendOrderConfirmation,
  sendAdminOrderNotice,
  sendOrderShipped,
  sendOrderDelivered,
  sendOrderCancelled,
  sendOrderRefunded,
  sendOwnerAlert,
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
    // The customer has been charged but the order stays PENDING: a human has to look.
    await sendOwnerAlert(
      `Payment amount mismatch on ${order.orderNumber}`,
      `Stripe charged ${(opts.amountPaidCents / 100).toFixed(2)} CAD but the order total is ${(order.totalCents / 100).toFixed(2)} CAD. The order is held as PENDING. Check the payment in Stripe and either mark it paid or refund it.`,
      `/admin/orders/${order.id}`
    );
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
  if (claimed.count !== 1) {
    // Normal when the webhook and the success page race: the loser lands here.
    // Not normal when the order was cancelled first: the customer has paid for
    // an order nobody will pack, so record it and alert the owner.
    if (order.status === "CANCELLED" || order.status === "REFUNDED") {
      await prisma.orderEvent
        .create({
          data: {
            orderId,
            label: "Payment received on cancelled order",
            note: "Stripe confirmed payment after this order was cancelled. Refund it in Stripe or reinstate it.",
          },
        })
        .catch(() => {});
      await sendOwnerAlert(
        `Payment received on cancelled order ${order.orderNumber}`,
        `The customer completed payment after the order was ${order.status.toLowerCase()}. Refund it in the Stripe dashboard, or contact the customer and reinstate the order.`,
        `/admin/orders/${order.id}`
      );
    }
    return { settled: false, reason: "already settled" };
  }

  // The claim above is the point of no return; a failure writing the timeline
  // must not turn into a webhook 500, which would make Stripe retry into an
  // order that is now PAID and skip the stock commit and emails below.
  await prisma.orderEvent
    .create({ data: { orderId, label: "Payment received", note: "Order confirmed" } })
    .catch((err) => console.error("[orders] timeline write failed:", err));

  await commitInventory(order.items);

  // The discount redemption was already reserved when the checkout was created,
  // so nothing is incremented here.

  const data = emailDataOf(order);
  const confirmed = await sendOrderConfirmation(data);
  if (!confirmed) {
    // The order is paid regardless; leave a trace so the owner can resend by hand.
    await prisma.orderEvent
      .create({ data: { orderId, label: "Confirmation email failed", note: `Could not send to ${order.email}` } })
      .catch(() => {});
  }
  await sendAdminOrderNotice(data, { paid: true });
  return { settled: true };
}

/**
 * Move an order to CANCELLED, release its discount and return its stock.
 *
 * Only unpaid orders can be cancelled here. A paid order has money attached,
 * so it goes through the refund flow instead: a full refund moves it to
 * REFUNDED and restores stock. Cancelling a PENDING order also expires its
 * Stripe Checkout session so the customer cannot pay for it afterwards.
 */
export async function cancelOrder(
  orderId: string,
  opts: { reason?: string; notify?: boolean } = {}
): Promise<{ cancelled: boolean; reason?: "not-found" | "already-closed" | "paid" }> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return { cancelled: false, reason: "not-found" };
  if (order.status === "CANCELLED" || order.status === "REFUNDED") {
    return { cancelled: false, reason: "already-closed" };
  }
  if (PAID_STATUSES.includes(order.status)) return { cancelled: false, reason: "paid" };

  const claimed = await prisma.order.updateMany({
    where: { id: orderId, status: "PENDING" },
    data: { status: "CANCELLED", cancelledAt: new Date() },
  });
  if (claimed.count !== 1) return { cancelled: false, reason: "already-closed" };

  if (order.stripeSessionId && isStripeConfigured()) {
    try {
      await getStripe().checkout.sessions.expire(order.stripeSessionId);
    } catch {
      // Already expired or completed. If it completed, markOrderPaid will
      // notice the CANCELLED status and alert the owner.
    }
  }

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

/**
 * Record a refund (Stripe is the source of truth; this mirrors it locally).
 *
 * `amountCents` is a delta by default (the admin refund control passes the
 * amount just refunded). Stripe's `charge.refunded` event carries the
 * *cumulative* `amount_refunded`, so the webhook passes `cumulative: true` and
 * only the difference from what is already recorded is applied. Without that,
 * an admin refund followed by its own webhook counted twice.
 *
 * The write is conditional on `refundedCents` still being what we read, so a
 * webhook and an admin click landing together cannot both apply.
 */
export async function recordRefund(
  orderId: string,
  amountCents: number,
  opts: { notify?: boolean; cumulative?: boolean } = {}
): Promise<{ recorded: boolean }> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return { recorded: false };

  const alreadyRefunded = order.refundedCents;
  const target = opts.cumulative ? amountCents : alreadyRefunded + amountCents;
  const total = Math.min(order.totalCents, target);
  if (total <= alreadyRefunded) return { recorded: false };

  const full = total >= order.totalCents;
  const claimed = await prisma.order.updateMany({
    where: { id: orderId, refundedCents: alreadyRefunded },
    data: {
      refundedCents: total,
      ...(full ? { status: "REFUNDED" } : {}),
    },
  });
  if (claimed.count !== 1) return { recorded: false };

  await prisma.orderEvent
    .create({
      data: {
        orderId,
        label: full ? "Refunded" : "Partially refunded",
        note: `${((total - alreadyRefunded) / 100).toFixed(2)} CAD refunded`,
      },
    })
    .catch((err) => console.error("[orders] refund timeline write failed:", err));

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
  await assertOpenOrder(orderId, "shipped");
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
 * A cancelled or refunded order must not be moved along the fulfilment path,
 * however two admin tabs race. Throws a message the admin UI can show.
 */
async function assertOpenOrder(orderId: string, verb: string): Promise<void> {
  const current = await prisma.order.findUnique({ where: { id: orderId }, select: { status: true } });
  if (!current) throw new Error("Order not found.");
  if (current.status === "CANCELLED" || current.status === "REFUNDED") {
    throw new Error(`This order is ${current.status.toLowerCase()} and cannot be ${verb}.`);
  }
}

/** Mark an order delivered (or picked up) and let the customer know. */
export async function markOrderDelivered(
  orderId: string,
  opts: { note?: string | null; notify?: boolean } = {}
): Promise<void> {
  await assertOpenOrder(orderId, "marked delivered");
  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "DELIVERED",
      deliveredAt: new Date(),
      timeline: { create: { label: "Delivered", note: opts.note || null } },
    },
  });

  if (opts.notify !== false) {
    await sendOrderDelivered({
      orderNumber: order.orderNumber,
      email: order.email,
      locale: order.locale,
      deliveryMethod: order.deliveryMethod,
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
