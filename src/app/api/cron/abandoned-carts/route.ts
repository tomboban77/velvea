import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendAbandonedCart } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * One reminder to anyone who reached checkout and did not pay.
 *
 * The Stripe session now expires after about 40 minutes (it used to live 24
 * hours while the delivery slot was only held for 45), and the expired webhook
 * cancels the order. So this looks for orders cancelled as "Checkout expired",
 * not PENDING ones: a PENDING order this old is one held for review after a
 * payment problem, and its customer has already been charged. The email links
 * to the order page, which offers to put the same baskets back in the bag.
 */
const MIN_AGE_MINUTES = 90;
const MAX_AGE_HOURS = 20;
/** Per run. A backlog drains over the following runs rather than in one burst. */
const BATCH = 25;
/** The note cancelOrder records for the checkout.session.expired webhook. */
const EXPIRED_NOTE = "Checkout expired";

export async function GET(req: NextRequest) {
  // Vercel Cron signs its calls with CRON_SECRET. Without the secret set the
  // route refuses outright: an open endpoint that emails customers is not
  // something to leave available by accident.
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("[cron] CRON_SECRET is not set; abandoned-cart run refused.");
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const before = new Date(now - MIN_AGE_MINUTES * 60_000);
  const after = new Date(now - MAX_AGE_HOURS * 3_600_000);

  try {
    const orders = await prisma.order.findMany({
      where: {
        status: "CANCELLED",
        abandonedEmailAt: null,
        createdAt: { lt: before, gt: after },
        timeline: { some: { label: "Cancelled", note: EXPIRED_NOTE } },
      },
      orderBy: { createdAt: "asc" },
      take: BATCH,
      select: {
        id: true,
        orderNumber: true,
        email: true,
        locale: true,
        totalCents: true,
        createdAt: true,
        items: { select: { name: true, quantity: true } },
      },
    });

    if (orders.length === 0) return NextResponse.json({ checked: 0, sent: 0, skipped: 0 });

    // One query for the whole batch rather than one per order.
    const emails = [...new Set(orders.map((o) => o.email.toLowerCase()))];
    const [optOutRows, laterOrders] = await Promise.all([
      prisma.emailOptOut.findMany({
        where: { email: { in: emails } },
        select: { email: true },
      }),
      // Someone who tried again and got through (or is paying right now) has
      // not abandoned anything.
      prisma.order.findMany({
        where: {
          email: { in: emails },
          status: { notIn: ["CANCELLED", "REFUNDED"] },
          createdAt: { gt: after },
        },
        select: { email: true, createdAt: true },
      }),
    ]);
    const optedOut = new Set(optOutRows.map((r) => r.email));

    let sent = 0;
    let skipped = 0;

    for (const order of orders) {
      // Claimed with a conditional write before sending. The hourly GitHub run
      // and the daily Vercel run can overlap; whichever loses sees count 0.
      // A crash after the claim costs one reminder; sending twice is a complaint.
      const claimed = await prisma.order.updateMany({
        where: { id: order.id, abandonedEmailAt: null },
        data: { abandonedEmailAt: new Date() },
      });
      if (claimed.count !== 1) continue;

      const email = order.email.toLowerCase();
      const retried = laterOrders.some(
        (o) => o.email.toLowerCase() === email && o.createdAt > order.createdAt
      );
      // Stamped anyway (above): this order is done being considered, and
      // leaving it null would re-examine it on every run for the next 20 hours.
      if (optedOut.has(email) || retried) {
        skipped++;
        continue;
      }

      const ok = await sendAbandonedCart({
        orderNumber: order.orderNumber,
        email: order.email,
        locale: order.locale,
        totalCents: order.totalCents,
        itemNames: order.items.map((i) =>
          i.quantity > 1 ? `${i.name} × ${i.quantity}` : i.name
        ),
      });
      if (ok) sent++;
    }

    return NextResponse.json({ checked: orders.length, sent, skipped });
  } catch (err) {
    console.error("[cron] abandoned-cart run failed:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
