import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendCustomBasketNotice, sendCustomBasketAck } from "@/lib/email";
import { rateLimitBoth, rateLimitMessage } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";
import { parseStoreDate } from "@/lib/dates";
import { validateCustomRequest } from "@/lib/custom-request";

/** Transport fields that are not part of the request itself. */
const envelope = z.object({
  locale: z.enum(["en", "fr"]).optional().default("en"),
  /** Honeypot — must stay empty. */
  website: z.string().max(200).optional().default(""),
  turnstileToken: z.string().max(2048).optional(),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const meta = envelope.safeParse(body);
  if (!meta.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const { locale, website, turnstileToken } = meta.data;
  const fr = locale === "fr";

  // A bot filled the hidden field: report success so it learns nothing.
  if (website.trim()) return NextResponse.json({ ok: true });

  const result = validateCustomRequest(body);
  if (!result.ok) {
    return NextResponse.json({ error: "invalid", fields: result.errors }, { status: 400 });
  }
  // Normalised once so the database, the rate limit and both emails agree.
  const data = { ...result.data, email: result.data.email.toLowerCase() };

  // Per IP and per contact, so one person cannot flood the inbox by rotating
  // either. Email is preferred as the subject; phone when that is all we have.
  const limit = await rateLimitBoth("customBasket", data.email || data.phone.replace(/\D/g, ""));
  if (!limit.ok) {
    return NextResponse.json(
      { error: "rateLimited", message: rateLimitMessage(limit, fr) },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  if (!(await verifyTurnstile(turnstileToken))) {
    return NextResponse.json({ error: "verification" }, { status: 400 });
  }

  try {
    await prisma.customBasketRequest.create({
      data: {
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        products: data.products,
        occasion: data.occasion || null,
        budget: data.budget || null,
        neededBy: data.neededBy ? parseStoreDate(data.neededBy) : null,
        deliveryArea: data.deliveryArea || null,
        locale,
      },
    });
  } catch (err) {
    console.error("[custom-basket] request failed:", err);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }

  // The request is saved and visible in admin. Emails are best-effort on top:
  // send() logs and returns false rather than throwing, so a mail outage can
  // never turn a stored request into an error the customer retries.
  const mail = { ...data, locale };
  await sendCustomBasketNotice(mail);
  await sendCustomBasketAck(mail);

  return NextResponse.json({ ok: true });
}
