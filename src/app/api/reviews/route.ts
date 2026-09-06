import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const schema = z.object({
  productId: z.string(),
  name: z.string().min(1).max(80),
  location: z.string().max(80).optional(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional(),
  body: z.string().min(4).max(2000),
});

export async function POST(req: NextRequest) {
  try {
    const data = schema.parse(await req.json());
    const session = await getSession();
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
        verified: false,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid review" }, { status: 400 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
