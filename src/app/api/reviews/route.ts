import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { rateLimitBoth, rateLimitByIp, rateLimitMessage } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";

const schema = z.object({
  productId: z.string().min(1).max(64),
  name: z.string().min(1).max(80),
  location: z.string().max(80).optional(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional(),
  body: z.string().min(4).max(2000),
  email: z.string().email().max(200).optional(),
  /** Honeypot — must stay empty. */
  company: z.string().max(200).optional().default(""),
  turnstileToken: z.string().max(2048).optional(),
});

/** True when this person has a paid order containing the product. */
async function hasPurchased(productId: string, email?: string, userId?: string) {
  if (!email && !userId) return false;
  const count = await prisma.orderItem.count({
    where: {
      productId,
      order: {
        status: { in: ["PAID", "PROCESSING", "FULFILLED", "SHIPPED", "DELIVERED"] },
        OR: [
          ...(userId ? [{ userId }] : []),
          ...(email ? [{ email: email.toLowerCase() }] : []),
        ],
      },
    },
  });
  return count > 0;
}

export async function POST(req: NextRequest) {
  try {
    const data = schema.parse(await req.json());

    if (data.company.trim()) return NextResponse.json({ ok: true });

    const session = await getSession();
    const subject = session?.email ?? data.email;
    const limit = subject
      ? await rateLimitBoth("review", subject)
      : await rateLimitByIp("review");
    if (!limit.ok) {
      return NextResponse.json(
        { error: rateLimitMessage(limit) },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
      );
    }

    if (!(await verifyTurnstile(data.turnstileToken))) {
      return NextResponse.json({ error: "Verification failed. Please try again." }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: data.productId },
      select: { id: true },
    });
    if (!product) {
      return NextResponse.json({ error: "Unknown product" }, { status: 400 });
    }

    // One review per product per signed-in customer.
    if (session) {
      const existing = await prisma.review.findFirst({
        where: { productId: data.productId, userId: session.sub },
        select: { id: true },
      });
      if (existing) {
        return NextResponse.json(
          { error: "You've already reviewed this basket." },
          { status: 409 }
        );
      }
    }

    // "Verified buyer" is only earned through a signed-in account whose email
    // is confirmed. Matching on a typed-in email let anyone claim a stranger's
    // purchase by guessing the address they ordered with.
    const verifiedAccount = session
      ? await prisma.user
          .findUnique({ where: { id: session.sub }, select: { emailVerified: true } })
          .then((u) => Boolean(u?.emailVerified))
          .catch(() => false)
      : false;
    const verified = verifiedAccount
      ? await hasPurchased(data.productId, session!.email, session!.sub)
      : false;

    await prisma.review.create({
      data: {
        productId: data.productId,
        userId: session?.sub ?? null,
        authorName: data.name,
        authorLocation: data.location || null,
        rating: data.rating,
        title: data.title || null,
        body: data.body,
        status: "PENDING",
        verified,
      },
    });
    return NextResponse.json({ ok: true, verified });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid review" }, { status: 400 });
    }
    console.error("[reviews] submit failed:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
