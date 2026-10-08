import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendBrandPartnerNotice, sendBrandPartnerAck } from "@/lib/email";
import { rateLimitBoth, rateLimitMessage } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";

const schema = z.object({
  brand: z.string().min(1).max(160),
  contactName: z.string().min(1).max(120),
  email: z.string().email().max(200),
  phone: z.string().max(40).optional(),
  website: z.string().max(300).optional(),
  category: z.string().max(120).optional(),
  location: z.string().max(120).optional(),
  pricing: z.string().max(300).optional(),
  message: z.string().max(2000).optional(),
  locale: z.enum(["en", "fr"]).optional().default("en"),
  /** Honeypot — must stay empty. Named "company" because "website" is a real field here. */
  company: z.string().max(200).optional().default(""),
  turnstileToken: z.string().max(2048).optional(),
});

/** Brand / maker partnership enquiries, listed in /admin/partners. */
export async function POST(req: NextRequest) {
  try {
    const data = schema.parse(await req.json());

    if (data.company.trim()) return NextResponse.json({ ok: true });

    const limit = await rateLimitBoth("brandPartner", data.email);
    if (!limit.ok) {
      return NextResponse.json(
        { error: rateLimitMessage(limit, data.locale === "fr") },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
      );
    }

    if (!(await verifyTurnstile(data.turnstileToken))) {
      return NextResponse.json({ error: "Verification failed. Please try again." }, { status: 400 });
    }

    const email = data.email.toLowerCase();
    await prisma.brandPartnerInquiry.create({
      data: {
        brand: data.brand,
        contactName: data.contactName,
        email,
        phone: data.phone || null,
        website: data.website || null,
        category: data.category || null,
        location: data.location || null,
        pricing: data.pricing || null,
        message: data.message || null,
        locale: data.locale,
      },
    });

    // The row is the record; a failed notice is logged inside send() and the
    // enquiry still shows in admin.
    await sendBrandPartnerNotice({ ...data, email });

    await sendBrandPartnerAck({
      contactName: data.contactName,
      email: data.email,
      brand: data.brand,
      locale: data.locale,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Please complete the required fields." }, { status: 400 });
    }
    console.error("[partners] enquiry failed:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
