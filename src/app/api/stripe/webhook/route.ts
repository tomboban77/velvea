import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { markOrderPaid, cancelOrder, recordRefund } from "@/lib/actions/orders";

export const runtime = "nodejs";

/** Best-effort cleanup of the single-use coupon minted for this checkout. */
async function deleteCoupon(stripe: Stripe, couponId?: string) {
  if (!couponId) return;
  try {
    await stripe.coupons.del(couponId);
  } catch {
    // Already gone, or expired on Stripe's side — nothing to do.
  }
}

async function orderIdFromPaymentIntent(
  stripe: Stripe,
  paymentIntentId: string
): Promise<string | null> {
  try {
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (intent.metadata?.orderId) return intent.metadata.orderId;
  } catch {
    // fall through to the local lookup
  }
  const order = await prisma.order.findFirst({
    where: { stripePaymentIntentId: paymentIntentId },
    select: { id: true },
  });
  return order?.id ?? null;
}

export async function POST(req: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    // Without a signing secret there is no way to tell Stripe from anyone else,
    // and an unsigned body used to be enough to mark an order PAID.
    console.error("[stripe] STRIPE_WEBHOOK_SECRET is not set — refusing webhooks.");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const stripe = getStripe();
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;
        if (orderId && session.payment_status === "paid") {
          await markOrderPaid(orderId, {
            paymentIntentId:
              typeof session.payment_intent === "string" ? session.payment_intent : undefined,
            // Guard against a tampered or stale session charging the wrong amount.
            amountPaidCents: session.amount_total ?? undefined,
          });
        }
        await deleteCoupon(stripe, session.metadata?.couponId);
        break;
      }

      case "checkout.session.async_payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.metadata?.orderId) {
          await cancelOrder(session.metadata.orderId, {
            reason: "Payment failed",
            notify: true,
          });
        }
        await deleteCoupon(stripe, session.metadata?.couponId);
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.metadata?.orderId) {
          // Releases the reserved discount redemption back to the pool.
          await cancelOrder(session.metadata.orderId, { reason: "Checkout expired" });
        }
        await deleteCoupon(stripe, session.metadata?.couponId);
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const intentId =
          typeof charge.payment_intent === "string" ? charge.payment_intent : null;
        if (intentId) {
          const orderId = await orderIdFromPaymentIntent(stripe, intentId);
          if (orderId) {
            await recordRefund(orderId, charge.amount_refunded, { notify: true });
          }
        }
        break;
      }

      case "charge.dispute.created": {
        const dispute = event.data.object as Stripe.Dispute;
        const intentId =
          typeof dispute.payment_intent === "string" ? dispute.payment_intent : null;
        if (intentId) {
          const orderId = await orderIdFromPaymentIntent(stripe, intentId);
          if (orderId) {
            await prisma.orderEvent.create({
              data: {
                orderId,
                label: "Payment disputed",
                note: `Stripe dispute ${dispute.id} — reason: ${dispute.reason}. Respond in the Stripe dashboard.`,
              },
            });
          }
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const intent = event.data.object as Stripe.PaymentIntent;
        if (intent.metadata?.orderId) {
          await prisma.orderEvent.create({
            data: {
              orderId: intent.metadata.orderId,
              label: "Payment failed",
              note: intent.last_payment_error?.message ?? null,
            },
          });
        }
        break;
      }

      default:
        // Unhandled types are acknowledged so Stripe stops retrying them.
        break;
    }
  } catch (err) {
    console.error(`Webhook handler error (${event.type}):`, err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
