import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendAbandonedCart } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * One reminder to anyone who reached checkout and did not pay.
 *
 * Timing sits between two bounds. Wait long enough that the email is not
 * racing a customer who is still on the Stripe page (they come back and find
 * "you didn't finish" in their inbox), and send before Stripe expires the
 * session and the webhook cancels the order — after that the link is dead and
 * the message is worse than useless.
 */
const MIN_AGE_MINUTES = 90;
const MAX_AGE_HOURS = 20; // Stripe sessions expire at 24h; leave room.
/** Per run. A backlog drains over the following runs rather than in one burst. */
const BATCH = 25;

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
        status: "PENDING",
        abandonedEmailAt: null,
        createdAt: { lt: before, gt: after },
      },
      orderBy: { createdAt: "asc" },
      take: BATCH,
      select: {
        id: true,
        orderNumber: true,
        email: true,
        locale: true,
        totalCents: true,
        items: { select: { name: true, quantity: true } },
      },
    });

    if (orders.length === 0) return NextResponse.json({ checked: 0, sent: 0, skipped: 0 });

    // One query for the whole batch rather than one per order.
    const emails = [...new Set(orders.map((o) => o.email.toLowerCase()))];
    const optedOut = new Set(
      (
        await prisma.emailOptOut.findMany({
          where: { email: { in: emails } },
          select: { email: true },
        })
      ).map((r) => r.email)
    );

    let sent = 0;
    let skipped = 0;

    for (const order of orders) {
      if (optedOut.has(order.email.toLowerCase())) {
        // Stamp it anyway: this order is done being considered, and leaving it
        // null would re-examine it on every run for the next 20 hours.
        await prisma.order.update({
          where: { id: order.id },
          data: { abandonedEmailAt: new Date() },
        });
        skipped++;
        continue;
      }

      // Stamped before sending, not after. A crash between the two costs one
      // reminder; the other order sends it twice, and twice is a complaint.
      await prisma.order.update({
        where: { id: order.id },
        data: { abandonedEmailAt: new Date() },
      });

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
