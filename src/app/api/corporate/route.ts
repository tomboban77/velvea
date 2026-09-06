import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendCorporateInquiryNotice } from "@/lib/email";

const schema = z.object({
  company: z.string().min(1).max(160),
  contactName: z.string().min(1).max(120),
  email: z.string().email(),
  phone: z.string().max(40).optional(),
  budget: z.string().max(60).optional(),
  quantity: z.string().max(60).optional(),
  occasion: z.string().max(120).optional(),
  message: z.string().max(2000).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const data = schema.parse(await req.json());
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
    await sendCorporateInquiryNotice({
      company: data.company,
      contactName: data.contactName,
      email: data.email,
      message: data.message,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Please complete the required fields." }, { status: 400 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
