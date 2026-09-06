"use server";

import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { getSession } from "@/lib/auth";
import { computeTotals, computeDiscount, isGtaCity } from "@/lib/pricing";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { sendOrderConfirmation, sendAdminOrderNotice } from "@/lib/email";
import { generateOrderNumber } from "@/lib/utils";
import { t } from "@/lib/i18n-content";
import type { DeliveryMethod } from "@prisma/client";
import { z } from "zod";

const addressSchema = z.object({
  fullName: z.string().min(1),
  line1: z.string().min(1),
  line2: z.string().optional().default(""),
  city: z.string().min(1),
  province: z.string().min(2),
  postalCode: z.string().min(3),
  country: z.string().default("CA"),
  phone: z.string().optional().default(""),
});

const itemSchema = z.object({
  productId: z.string().optional(),
  variantId: z.string().optional(),
  slug: z.string().optional(),
  name: z.string(),
  unitPriceCents: z.number().int().nonnegative(),
  quantity: z.number().int().min(1).max(99),
  isCustom: z.boolean().optional(),
  customConfig: z.any().optional(),
  image: z.string().optional(),
});

const checkoutSchema = z.object({
  email: z.string().email(),
  phone: z.string().optional().default(""),
  deliveryMethod: z.enum(["SHIPPING", "LOCAL_SAMEDAY", "LOCAL_STANDARD"]),
  shipping: addressSchema,
  giftMessage: z.string().max(500).optional().default(""),
  deliveryDate: z.string().optional().default(""),
  deliveryNotes: z.string().max(500).optional().default(""),
  discountCode: z.string().optional().default(""),
  locale: z.string().optional().default("en"),
  items: z.array(itemSchema).min(1),
});

export type CheckoutInput = z.input<typeof checkoutSchema>;

type LineItem = {
  productId: string | null;
  slug: string | null;
  name: string;
  variantLabel: string | null;
  imageUrl: string | null;
  unitPriceCents: number;
  quantity: number;
  isCustom: boolean;
  customConfig: unknown;
};

/** Rebuild authoritative prices from the DB. Never trust client-sent prices. */
async function resolveLineItems(
  items: z.infer<typeof itemSchema>[],
  locale: string
): Promise<LineItem[]> {
  const lines: LineItem[] = [];

  for (const item of items) {
    if (item.isCustom && item.customConfig) {
      const cfg = item.customConfig as { containerId?: string; itemIds?: string[]; note?: string };
      const [container, addons] = await Promise.all([
        cfg.containerId
          ? prisma.builderContainer.findUnique({ where: { id: cfg.containerId } })
          : null,
        cfg.itemIds?.length
          ? prisma.builderItem.findMany({ where: { id: { in: cfg.itemIds } } })
          : Promise.resolve([]),
      ]);
      const price =
        (container?.priceCents ?? 0) + addons.reduce((s, a) => s + a.priceCents, 0);
      if (price <= 0) continue;
      lines.push({
        productId: null,
        slug: null,
        name: locale === "fr" ? "Panier personnalisé" : "Custom Basket",
        variantLabel: container ? t(container.name, locale) : null,
        imageUrl: item.image ?? null,
        unitPriceCents: price,
        quantity: item.quantity,
        isCustom: true,
        customConfig: {
          containerId: cfg.containerId,
          itemIds: cfg.itemIds,
          note: cfg.note ?? "",
          items: addons.map((a) => t(a.name, locale)),
        },
      });
      continue;
    }

    if (!item.productId) continue;
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
      include: { images: { orderBy: { position: "asc" }, take: 1 }, variants: true },
    });
    if (!product || product.status !== "ACTIVE") continue;

    let unitPrice = product.priceCents;
    let variantLabel: string | null = null;
    if (item.variantId) {
      const v = product.variants.find((x) => x.id === item.variantId);
      if (v) {
        unitPrice = v.priceCents;
        variantLabel = t(v.label, locale);
      }
    }
    lines.push({
      productId: product.id,
      slug: product.slug,
      name: t(product.name, locale),
      variantLabel,
      imageUrl: product.images[0]?.url ?? null,
      unitPriceCents: unitPrice,
      quantity: item.quantity,
      isCustom: false,
      customConfig: null,
    });
  }
  return lines;
}

export type CheckoutResult =
  | { ok: true; mode: "stripe"; url: string }
  | { ok: true; mode: "offline"; orderNumber: string }
  | { ok: false; error: string };

export async function createCheckout(rawInput: CheckoutInput): Promise<CheckoutResult> {
  let input: z.infer<typeof checkoutSchema>;
  try {
    input = checkoutSchema.parse(rawInput);
  } catch {
    return { ok: false, error: "Please complete all required fields." };
  }

  const settings = await getSettings();
  const session = await getSession();

  // Validate local delivery is within the GTA.
  let method: DeliveryMethod = input.deliveryMethod;
  if (
    (method === "LOCAL_SAMEDAY" || method === "LOCAL_STANDARD") &&
    !isGtaCity(input.shipping.city)
  ) {
    method = "SHIPPING";
  }

  const lines = await resolveLineItems(input.items, input.locale);
  if (lines.length === 0) return { ok: false, error: "Your cart is empty or unavailable." };

  // Discount
  let discount = null;
  if (input.discountCode) {
    discount = await prisma.discountCode.findUnique({
      where: { code: input.discountCode.toUpperCase() },
    });
  }
  const subtotalForDiscount = lines.reduce((s, l) => s + l.unitPriceCents * l.quantity, 0);
  const discCheck = computeDiscount(discount, subtotalForDiscount);

  const totals = computeTotals({
    settings,
    lines: lines.map((l) => ({ unitPriceCents: l.unitPriceCents, quantity: l.quantity })),
    province: input.shipping.province,
    method,
    discount: discCheck.valid ? discount : null,
  });

  const orderNumber = generateOrderNumber();

  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId: session?.sub ?? null,
      email: input.email.toLowerCase(),
      phone: input.phone || null,
      status: "PENDING",
      deliveryMethod: method,
      subtotalCents: totals.subtotalCents,
      shippingCents: totals.shippingCents,
      taxCents: totals.taxCents,
      discountCents: totals.discountCents,
      totalCents: totals.totalCents,
      discountCode: discCheck.valid ? discount?.code : null,
      giftMessage: input.giftMessage || null,
      deliveryDate: input.deliveryDate ? new Date(input.deliveryDate) : null,
      deliveryNotes: input.deliveryNotes || null,
      shipping: input.shipping,
      items: {
        create: lines.map((l) => ({
          productId: l.productId,
          slug: l.slug,
          name: l.name,
          variantLabel: l.variantLabel,
          imageUrl: l.imageUrl,
          unitPriceCents: l.unitPriceCents,
          quantity: l.quantity,
          isCustom: l.isCustom,
          customConfig: l.customConfig as object | undefined,
        })),
      },
      timeline: { create: { label: "Order placed", note: "Awaiting payment" } },
    },
  });

  const emailData = {
    orderNumber,
    email: order.email,
    items: lines.map((l) => ({
      name: l.name,
      quantity: l.quantity,
      unitPriceCents: l.unitPriceCents,
    })),
    subtotalCents: totals.subtotalCents,
    shippingCents: totals.shippingCents,
    taxCents: totals.taxCents,
    discountCents: totals.discountCents,
    totalCents: totals.totalCents,
    shipping: input.shipping,
    giftMessage: input.giftMessage,
  };

  // Stripe path
  if (isStripeConfigured()) {
    try {
      const stripe = getStripe();
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

      const lineItems = lines.map((l) => ({
        quantity: l.quantity,
        price_data: {
          currency: "cad",
          unit_amount: l.unitPriceCents,
          product_data: {
            name: l.name + (l.variantLabel ? ` — ${l.variantLabel}` : ""),
          },
        },
      }));
      if (totals.shippingCents > 0) {
        lineItems.push({
          quantity: 1,
          price_data: {
            currency: "cad",
            unit_amount: totals.shippingCents,
            product_data: { name: "Shipping" },
          },
        });
      }
      if (totals.taxCents > 0) {
        lineItems.push({
          quantity: 1,
          price_data: {
            currency: "cad",
            unit_amount: totals.taxCents,
            product_data: { name: "Sales tax (HST/GST/PST)" },
          },
        });
      }

      const discounts = [];
      if (totals.discountCents > 0) {
        const coupon = await stripe.coupons.create({
          amount_off: totals.discountCents,
          currency: "cad",
          duration: "once",
          name: discount?.code ?? "Discount",
        });
        discounts.push({ coupon: coupon.id });
      }

      const checkout = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: lineItems,
        discounts,
        customer_email: order.email,
        success_url: `${siteUrl}/order/${orderNumber}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteUrl}/checkout?canceled=1`,
        metadata: { orderId: order.id, orderNumber },
        payment_intent_data: { metadata: { orderId: order.id, orderNumber } },
      });

      await prisma.order.update({
        where: { id: order.id },
        data: { stripeSessionId: checkout.id },
      });

      return { ok: true, mode: "stripe", url: checkout.url! };
    } catch (err) {
      console.error("Stripe checkout failed:", err);
      // fall through to offline
    }
  }

  // Offline path (no Stripe configured): confirm order, notify.
  await sendOrderConfirmation(emailData);
  await sendAdminOrderNotice(emailData);
  return { ok: true, mode: "offline", orderNumber };
}

export async function validateDiscountCode(
  code: string,
  subtotalCents: number
): Promise<{ valid: boolean; label?: string; discountCents?: number; reason?: string }> {
  if (!code) return { valid: false };
  const discount = await prisma.discountCode.findUnique({
    where: { code: code.toUpperCase() },
  });
  const res = computeDiscount(discount, subtotalCents);
  if (!res.valid) return { valid: false, reason: res.reason };
  const label =
    discount!.type === "PERCENT"
      ? `${discount!.value}% off`
      : discount!.type === "FREE_SHIPPING"
      ? "Free shipping"
      : "Discount applied";
  return { valid: true, label, discountCents: res.discountCents };
}
