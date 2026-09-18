import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimitBoth, rateLimitMessage } from "@/lib/rate-limit";
import { newOpaqueToken } from "@/lib/tokens";
import { sendNewsletterConfirm } from "@/lib/email";
import { verifyTurnstile } from "@/lib/turnstile";

const schema = z.object({
  email: z.string().email().max(200),
  locale: z.enum(["en", "fr"]).default("en"),
  /** Honeypot — must stay empty. */
  company: z.string().max(200).optional().default(""),
  turnstileToken: z.string().max(2048).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { email, locale, company, turnstileToken } = schema.parse(await req.json());

    // Silent success: a bot learns nothing, a person never sees this branch.
    if (company.trim()) return NextResponse.json({ ok: true });

    const limit = await rateLimitBoth("newsletter", email);
    if (!limit.ok) {
      return NextResponse.json(
        { error: rateLimitMessage(limit, locale === "fr") },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
      );
    }

    if (!(await verifyTurnstile(turnstileToken))) {
      return NextResponse.json({ error: "Verification failed. Please try again." }, { status: 400 });
    }

    const normalized = email.toLowerCase();
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: normalized },
    });

    // CASL: nothing is mailed to this address until the subscriber confirms,
    // and re-subscribing after an unsubscribe requires a fresh confirmation.
    if (existing?.confirmedAt && !existing.unsubscribedAt) {
      return NextResponse.json({ ok: true, status: "already-subscribed" });
    }

    const token = existing?.token ?? newOpaqueToken();
    await prisma.newsletterSubscriber.upsert({
      where: { email: normalized },
      create: { email: normalized, locale, token },
      update: { locale, unsubscribedAt: null, confirmedAt: null },
    });

    await sendNewsletterConfirm({ email: normalized, token, locale });
    return NextResponse.json({ ok: true, status: "confirm-sent" });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    console.error("[newsletter] subscribe failed:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
