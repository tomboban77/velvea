import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendCorporateInquiryNotice, sendCorporateInquiryAck } from "@/lib/email";
import { rateLimitBoth, rateLimitMessage } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";

const schema = z.object({
  company: z.string().min(1).max(160),
  contactName: z.string().min(1).max(120),
  email: z.string().email().max(200),
  phone: z.string().max(40).optional(),
  budget: z.string().max(60).optional(),
  quantity: z.string().max(60).optional(),
  occasion: z.string().max(120).optional(),
  message: z.string().max(2000).optional(),
  locale: z.enum(["en", "fr"]).optional().default("en"),
  /** Honeypot — must stay empty. */
  website: z.string().max(200).optional().default(""),
  turnstileToken: z.string().max(2048).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const data = schema.parse(await req.json());

    if (data.website.trim()) return NextResponse.json({ ok: true });

    const limit = await rateLimitBoth("corporate", data.email);
    if (!limit.ok) {
      return NextResponse.json(
        { error: rateLimitMessage(limit, data.locale === "fr") },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
      );
    }

    if (!(await verifyTurnstile(data.turnstileToken))) {
      return NextResponse.json({ error: "Verification failed. Please try again." }, { status: 400 });
    }

    await prisma.corporateInquiry.create({
      data: {
        company: data.company,
        contactName: data.contactName,
        email: data.email.toLowerCase(),
        phone: data.phone || null,
        budget: data.budget || null,
        quantity: data.quantity || null,
        occasion: data.occasion || null,
        message: data.message || null,
      },
    });

    await sendCorporateInquiryNotice(data);
    // The enquirer now gets a receipt instead of silence.
    await sendCorporateInquiryAck({
      contactName: data.contactName,
      email: data.email,
      company: data.company,
      locale: data.locale,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Please complete the required fields." }, { status: 400 });
    }
    console.error("[corporate] inquiry failed:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
