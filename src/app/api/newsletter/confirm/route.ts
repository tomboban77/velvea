import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendNewsletterWelcome } from "@/lib/email";
import { siteUrl } from "@/lib/env";

export const runtime = "nodejs";

/** Landing point for the double opt-in link in the confirmation email. */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? "";
  const site = siteUrl();
  const fail = NextResponse.redirect(`${site}/?newsletter=invalid`);
  if (!token) return fail;

  try {
    const subscriber = await prisma.newsletterSubscriber.findUnique({ where: { token } });
    if (!subscriber) return fail;

    if (!subscriber.confirmedAt || subscriber.unsubscribedAt) {
      await prisma.newsletterSubscriber.update({
        where: { id: subscriber.id },
        data: { confirmedAt: new Date(), unsubscribedAt: null },
      });
      await sendNewsletterWelcome({
        email: subscriber.email,
        token: subscriber.token,
        locale: subscriber.locale,
      });
    }

    const prefix = subscriber.locale === "fr" ? "/fr" : "";
    return NextResponse.redirect(`${site}${prefix}/?newsletter=confirmed`);
  } catch (err) {
    console.error("[newsletter] confirm failed:", err);
    return fail;
  }
}
