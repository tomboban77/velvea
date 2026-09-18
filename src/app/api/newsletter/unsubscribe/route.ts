import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/env";

export const runtime = "nodejs";

/**
 * One-click unsubscribe, as CASL requires. Deliberately idempotent and
 * unauthenticated: the token in the footer link is the only thing needed.
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? "";
  const site = siteUrl();
  if (!token) return NextResponse.redirect(`${site}/?newsletter=invalid`);

  try {
    const subscriber = await prisma.newsletterSubscriber.findUnique({ where: { token } });
    if (!subscriber) return NextResponse.redirect(`${site}/?newsletter=invalid`);

    if (!subscriber.unsubscribedAt) {
      await prisma.newsletterSubscriber.update({
        where: { id: subscriber.id },
        data: { unsubscribedAt: new Date() },
      });
    }
    const prefix = subscriber.locale === "fr" ? "/fr" : "";
    return NextResponse.redirect(`${site}${prefix}/?newsletter=unsubscribed`);
  } catch (err) {
    console.error("[newsletter] unsubscribe failed:", err);
    return NextResponse.redirect(`${site}/?newsletter=invalid`);
  }
}

/** Mail clients that support List-Unsubscribe-Post send a POST. */
export async function POST(req: NextRequest) {
  return GET(req);
}
