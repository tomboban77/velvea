import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/env";
import { verifyOrderToken } from "@/lib/tokens";

export const runtime = "nodejs";

/**
 * Opt an address out of non-transactional email.
 *
 * CASL requires a working unsubscribe on any commercial electronic message,
 * and the abandoned-checkout reminder is the one such message this application
 * sends. Unauthenticated by design: the signed token in the link is the proof,
 * exactly as with the order-view links, so nobody has to sign in to stop
 * hearing from us.
 *
 * Opting out never affects transactional mail. Order confirmations, shipping
 * notices, refunds and password resets still send, because those are not
 * marketing and a customer who bought something is entitled to them.
 */
export async function GET(req: NextRequest) {
  const site = siteUrl();
  const orderNumber = req.nextUrl.searchParams.get("order") ?? "";
  const token = req.nextUrl.searchParams.get("t") ?? undefined;

  if (!orderNumber || !(await verifyOrderToken(token, orderNumber))) {
    return NextResponse.redirect(`${site}/?email=invalid`);
  }

  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      select: { email: true, locale: true },
    });
    if (!order) return NextResponse.redirect(`${site}/?email=invalid`);

    const email = order.email.toLowerCase();
    // Idempotent: clicking twice, or a mail client prefetching the link, must
    // not error. createMany with skipDuplicates keeps the first timestamp.
    await prisma.emailOptOut.createMany({ data: [{ email }], skipDuplicates: true });

    const prefix = order.locale === "fr" ? "/fr" : "";
    return NextResponse.redirect(`${site}${prefix}/?email=unsubscribed`);
  } catch (err) {
    console.error("[email] opt-out failed:", err);
    return NextResponse.redirect(`${site}/?email=invalid`);
  }
}

/** Mail clients that support one-click List-Unsubscribe-Post send a POST. */
export async function POST(req: NextRequest) {
  return GET(req);
}
