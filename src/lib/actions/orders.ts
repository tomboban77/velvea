import "server-only";
import { prisma } from "@/lib/prisma";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { sendOrderConfirmation, sendAdminOrderNotice } from "@/lib/email";

/** Mark an order paid exactly once, send emails, bump discount usage. */
export async function markOrderPaid(orderId: string, paymentIntentId?: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return;
  if (order.status !== "PENDING") return; // idempotent

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "PAID",
      paidAt: new Date(),
      stripePaymentIntentId: paymentIntentId ?? order.stripePaymentIntentId,
      timeline: { create: { label: "Payment received", note: "Order confirmed" } },
    },
  });

  if (order.discountCode) {
    await prisma.discountCode
      .update({ where: { code: order.discountCode }, data: { usedCount: { increment: 1 } } })
      .catch(() => {});
  }

  const shipping = order.shipping as {
    fullName: string; line1: string; city: string; province: string; postalCode: string;
  };
  const emailData = {
    orderNumber: order.orderNumber,
    email: order.email,
    items: order.items.map((i) => ({
      name: i.name,
      quantity: i.quantity,
      unitPriceCents: i.unitPriceCents,
    })),
    subtotalCents: order.subtotalCents,
    shippingCents: order.shippingCents,
    taxCents: order.taxCents,
    discountCents: order.discountCents,
    totalCents: order.totalCents,
    shipping,
    giftMessage: order.giftMessage,
  };
  await sendOrderConfirmation(emailData);
  await sendAdminOrderNotice(emailData);
}

/** Order-confirmation page fallback: verify a Stripe session and settle the order. */
export async function settleFromSession(orderNumber: string, sessionId: string) {
  if (!isStripeConfigured()) return;
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status === "paid" && session.metadata?.orderId) {
      await markOrderPaid(
        session.metadata.orderId,
        typeof session.payment_intent === "string" ? session.payment_intent : undefined
      );
    }
  } catch (err) {
    console.error("settleFromSession failed:", err);
  }
}
