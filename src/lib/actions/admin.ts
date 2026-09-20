"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getVerifiedAdmin } from "@/lib/auth";
import { can, denialMessage, type Permission } from "@/lib/permissions";
import { saveSettings as persistSettings, type SiteSettings } from "@/lib/settings";
import { clearZoneCache } from "@/lib/zones";
import { deleteImage } from "@/lib/cloudinary";
import { toSlug } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";
import { cancelOrder, markOrderShipped, markOrderDelivered, recordRefund } from "@/lib/actions/orders";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

/**
 * Every mutation re-reads the caller's role from the database (a token can
 * outlive a demotion) and checks a named permission, so STAFF no longer has
 * the same reach as ADMIN.
 */
async function guard(permission: Permission) {
  const admin = await getVerifiedAdmin();
  if (!admin) throw new Error("Unauthorized");
  if (!can(admin.role, permission)) throw new Error(denialMessage(permission));
  return admin;
}

const id = z.string().min(1).max(64);
const localizedText = z.string().max(4000);

/** Parse or throw with a message the admin UI can show. */
function parse<T extends z.ZodTypeAny>(schema: T, input: unknown): z.infer<T> {
  const result = schema.safeParse(input);
  if (!result.success) {
    const first = result.error.issues[0];
    throw new Error(
      `Invalid input${first ? ` at "${first.path.join(".")}": ${first.message}` : ""}`
    );
  }
  return result.data;
}

async function recomputeProductRating(productId: string) {
  const agg = await prisma.review.aggregate({
    where: { productId, status: "APPROVED" },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.product.update({
    where: { id: productId },
    data: { avgRating: agg._avg.rating ?? 0, reviewCount: agg._count },
  });
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

const ORDER_STATUSES = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "FULFILLED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
] as const;

const orderStatusSchema = z.object({
  id,
  status: z.enum(ORDER_STATUSES),
  note: z.string().max(500).optional(),
  notify: z.boolean().optional().default(false),
});

export async function updateOrderStatus(input: z.input<typeof orderStatusSchema>) {
  await guard("orders:write");
  const data = parse(orderStatusSchema, input);

  // CANCELLED, SHIPPED and DELIVERED have side effects (stock, discount release, email),
  // so they go through the order helpers rather than a bare status write.
  if (data.status === "CANCELLED") {
    await cancelOrder(data.id, { reason: data.note, notify: data.notify });
  } else if (data.status === "SHIPPED") {
    const order = await prisma.order.findUnique({ where: { id: data.id } });
    await markOrderShipped(
      data.id,
      {
        carrier: order?.carrier ?? null,
        trackingNumber: order?.trackingNumber ?? null,
        trackingUrl: order?.trackingUrl ?? null,
      },
      { notify: data.notify }
    );
  } else if (data.status === "DELIVERED") {
    await markOrderDelivered(data.id, { note: data.note, notify: data.notify });
  } else {
    await prisma.order.update({
      where: { id: data.id },
      data: {
        status: data.status,
        timeline: { create: { label: `Status: ${data.status}`, note: data.note || null } },
      },
    });
  }

  revalidatePath(`/admin/orders/${data.id}`);
  revalidatePath("/admin/orders");
}

const trackingSchema = z.object({
  id,
  carrier: z.string().max(80).optional().default(""),
  trackingNumber: z.string().max(120).optional().default(""),
  trackingUrl: z.union([z.string().url().max(500), z.literal("")]).optional().default(""),
  notify: z.boolean().optional().default(true),
});

/** Save tracking details and (optionally) send the shipped email. */
export async function shipOrder(input: z.input<typeof trackingSchema>) {
  await guard("orders:write");
  const data = parse(trackingSchema, input);
  await markOrderShipped(
    data.id,
    {
      carrier: data.carrier || null,
      trackingNumber: data.trackingNumber || null,
      trackingUrl: data.trackingUrl || null,
    },
    { notify: data.notify }
  );
  revalidatePath(`/admin/orders/${data.id}`);
  revalidatePath("/admin/orders");
}

const noteSchema = z.object({ id, adminNotes: z.string().max(4000) });

export async function addOrderNote(input: z.input<typeof noteSchema>) {
  await guard("orders:write");
  const data = parse(noteSchema, input);
  await prisma.order.update({
    where: { id: data.id },
    data: {
      adminNotes: data.adminNotes,
      timeline: { create: { label: "Note added", note: data.adminNotes.slice(0, 300) } },
    },
  });
  revalidatePath(`/admin/orders/${data.id}`);
}

const refundSchema = z.object({
  id,
  amountCents: z.number().int().positive(),
  notify: z.boolean().optional().default(true),
});

/**
 * Refund through Stripe when we hold a payment intent, otherwise just record it
 * so the books match a refund issued by hand.
 */
export async function refundOrder(input: z.input<typeof refundSchema>) {
  await guard("orders:refund");
  const data = parse(refundSchema, input);

  const order = await prisma.order.findUnique({ where: { id: data.id } });
  if (!order) throw new Error("Order not found");

  const remaining = order.totalCents - order.refundedCents;
  if (data.amountCents > remaining) {
    throw new Error(`Only ${(remaining / 100).toFixed(2)} CAD is left to refund on this order.`);
  }

  if (order.stripePaymentIntentId && isStripeConfigured()) {
    const stripe = getStripe();
    await stripe.refunds.create(
      { payment_intent: order.stripePaymentIntentId, amount: data.amountCents },
      { idempotencyKey: `refund_${order.id}_${order.refundedCents}_${data.amountCents}` }
    );
    // The charge.refunded webhook records it; this keeps the admin in step now.
  }

  await recordRefund(order.id, data.amountCents, { notify: data.notify });
  revalidatePath(`/admin/orders/${data.id}`);
  revalidatePath("/admin/orders");
}

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------

const moderateSchema = z.object({
  id,
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
});

export async function moderateReview(input: z.input<typeof moderateSchema>) {
  await guard("reviews:moderate");
  const data = parse(moderateSchema, input);
  const review = await prisma.review.update({
    where: { id: data.id },
    data: { status: data.status },
  });
  await recomputeProductRating(review.productId);
  revalidatePath("/admin/reviews");
  revalidatePath("/", "layout");
}

export async function deleteReview(reviewId: string) {
  await guard("reviews:delete");
  const data = parse(z.object({ id }), { id: reviewId });
  const review = await prisma.review.delete({ where: { id: data.id } });
  await recomputeProductRating(review.productId);
  revalidatePath("/admin/reviews");
}

// ---------------------------------------------------------------------------
// Inquiries
// ---------------------------------------------------------------------------

const inquirySchema = z.object({
  id,
  status: z.enum(["NEW", "CONTACTED", "QUOTED", "WON", "LOST"]),
});

export async function updateInquiryStatus(input: z.input<typeof inquirySchema>) {
  await guard("inquiries:write");
  const data = parse(inquirySchema, input);
  await prisma.corporateInquiry.update({
    where: { id: data.id },
    data: { status: data.status },
  });
  revalidatePath("/admin/inquiries");
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

const money = z.number().int().nonnegative().max(1_000_000);

const settingsSchema = z.object({
  contact: z
    .object({
      email: z.string().email().max(200),
      phone: z.string().max(60),
      addressLine: z.string().max(200),
      city: z.string().max(80),
      province: z.string().max(2),
      postalCode: z.string().max(12),
      hours: z.string().max(120),
    })
    .partial()
    .optional(),
  social: z
    .object({
      instagram: z.string().max(300),
      facebook: z.string().max(300),
      pinterest: z.string().max(300),
      tiktok: z.string().max(300),
    })
    .partial()
    .optional(),
  delivery: z
    .object({
      orderCutoff: z.string().regex(/^\d{1,2}:\d{2}$/, "Use HH:MM"),
    })
    .partial()
    .optional(),
  tax: z
    .object({
      rates: z.record(z.string().length(2), z.number().min(0).max(30)),
      default: z.number().min(0).max(30),
    })
    .partial()
    .optional(),
});

export async function updateSettings(patch: Partial<SiteSettings>) {
  await guard("settings:write");
  const data = parse(settingsSchema, patch);
  await persistSettings(data as Partial<SiteSettings>);
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
}

// ---------------------------------------------------------------------------
// Collections
// ---------------------------------------------------------------------------

const collectionSchema = z.object({
  id: id.optional(),
  type: z.enum(["OCCASION", "RECIPIENT", "CATEGORY", "THEME"]),
  slug: z.string().max(120).optional().default(""),
  nameEn: z.string().min(1).max(120),
  nameFr: z.string().max(120).optional().default(""),
  descEn: localizedText.optional().default(""),
  descFr: localizedText.optional().default(""),
  imageUrl: z.string().url().max(500).nullish(),
  imagePublicId: z.string().max(200).nullish(),
  featured: z.boolean().default(false),
  position: z.number().int().min(0).max(9999).default(0),
  seoTitleEn: z.string().max(200).optional().default(""),
  seoTitleFr: z.string().max(200).optional().default(""),
  seoDescriptionEn: z.string().max(400).optional().default(""),
  seoDescriptionFr: z.string().max(400).optional().default(""),
});

export async function upsertCollection(input: z.input<typeof collectionSchema>) {
  await guard("collections:write");
  const d = parse(collectionSchema, input);

  const pair = (en: string, fr: string) => (en || fr ? { en, fr: fr || en } : undefined);
  const data = {
    type: d.type,
    name: { en: d.nameEn, fr: d.nameFr || d.nameEn },
    description: pair(d.descEn, d.descFr),
    imageUrl: d.imageUrl ?? null,
    imagePublicId: d.imagePublicId ?? null,
    featured: d.featured,
    position: d.position,
    seoTitle: pair(d.seoTitleEn, d.seoTitleFr),
    seoDescription: pair(d.seoDescriptionEn, d.seoDescriptionFr),
  };

  if (d.id) {
    await prisma.collection.update({ where: { id: d.id }, data });
  } else {
    await prisma.collection.create({
      data: { ...data, slug: toSlug(d.slug || d.nameEn) },
    });
  }
  revalidatePath("/admin/collections");
  revalidatePath("/", "layout");
}

/** Reorder collections in one pass — the admin list is drag-sortable. */
export async function reorderCollections(order: { id: string; position: number }[]) {
  await guard("collections:write");
  const data = parse(
    z.array(z.object({ id, position: z.number().int().min(0).max(9999) })).max(200),
    order
  );
  await prisma.$transaction(
    data.map((c) =>
      prisma.collection.update({ where: { id: c.id }, data: { position: c.position } })
    )
  );
  revalidatePath("/admin/collections");
  revalidatePath("/", "layout");
}

export async function deleteCollection(collectionId: string) {
  await guard("collections:delete");
  const d = parse(z.object({ id }), { id: collectionId });
  const c = await prisma.collection.findUnique({ where: { id: d.id } });
  await prisma.collection.delete({ where: { id: d.id } });
  if (c?.imagePublicId) await deleteImage(c.imagePublicId);
  revalidatePath("/admin/collections");
}

// ---------------------------------------------------------------------------
// Discounts
// ---------------------------------------------------------------------------

const discountSchema = z
  .object({
    code: z
      .string()
      .min(3)
      .max(40)
      .regex(/^[A-Za-z0-9_-]+$/, "Letters, numbers, dash and underscore only"),
    type: z.enum(["PERCENT", "FIXED", "FREE_SHIPPING"]),
    value: z.number().int().min(0).max(1_000_000),
    minSubtotalCents: money.default(0),
    usageLimit: z.number().int().positive().max(1_000_000).nullish(),
    perCustomerLimit: z.number().int().positive().max(1000).nullish(),
    startsAt: z.string().nullish(),
    endsAt: z.string().nullish(),
    active: z.boolean().default(true),
    isNew: z.boolean().default(false),
  })
  .superRefine((d, ctx) => {
    if (d.type === "PERCENT" && (d.value < 1 || d.value > 100)) {
      ctx.addIssue({ code: "custom", path: ["value"], message: "Percent must be between 1 and 100" });
    }
    if (d.type === "FIXED" && d.value < 1) {
      ctx.addIssue({ code: "custom", path: ["value"], message: "Enter an amount in cents" });
    }
    if (d.startsAt && d.endsAt && new Date(d.startsAt) > new Date(d.endsAt)) {
      ctx.addIssue({ code: "custom", path: ["endsAt"], message: "End date is before the start date" });
    }
  });

export async function upsertDiscount(input: z.input<typeof discountSchema>) {
  await guard("discounts:write");
  const d = parse(discountSchema, input);
  const code = d.code.toUpperCase().trim();

  // Creating a code that already exists used to silently overwrite it, wiping
  // the redemption count along with it.
  const existing = await prisma.discountCode.findUnique({ where: { code } });
  if (d.isNew && existing) {
    throw new Error(`The code ${code} already exists. Edit it instead.`);
  }
  if (!d.isNew && !existing) {
    throw new Error(`The code ${code} no longer exists.`);
  }

  const data = {
    type: d.type,
    value: d.type === "FREE_SHIPPING" ? 0 : d.value,
    minSubtotalCents: d.minSubtotalCents,
    usageLimit: d.usageLimit ?? null,
    perCustomerLimit: d.perCustomerLimit ?? null,
    startsAt: d.startsAt ? new Date(d.startsAt) : null,
    endsAt: d.endsAt ? new Date(d.endsAt) : null,
    active: d.active,
  };

  if (existing) {
    await prisma.discountCode.update({ where: { code }, data });
  } else {
    await prisma.discountCode.create({ data: { code, ...data } });
  }
  revalidatePath("/admin/discounts");
}

export async function deleteDiscount(rawCode: string) {
  await guard("discounts:write");
  const { code } = parse(z.object({ code: z.string().min(1).max(40) }), { code: rawCode });
  await prisma.discountCode.delete({ where: { code: code.toUpperCase().trim() } });
  revalidatePath("/admin/discounts");
}

// ---------------------------------------------------------------------------
// Articles
// ---------------------------------------------------------------------------

const articleSchema = z.object({
  id: id.optional(),
  slug: z.string().max(140).optional().default(""),
  category: z.enum([
    "CORPORATE",
    "SYMPATHY",
    "OCCASIONS",
    "RECIPIENTS",
    "SEASONAL",
    "ETIQUETTE",
  ]),
  titleEn: z.string().min(1).max(200),
  titleFr: z.string().max(200).optional().default(""),
  excerptEn: z.string().max(600).optional().default(""),
  excerptFr: z.string().max(600).optional().default(""),
  bodyEn: z.string().max(120_000).optional().default(""),
  bodyFr: z.string().max(120_000).optional().default(""),
  coverImage: z.string().url().max(500).nullish(),
  coverPublicId: z.string().max(200).nullish(),
  author: z.string().max(120).optional().default(""),
  readMinutes: z.number().int().min(1).max(120).default(4),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  featured: z.boolean().default(false),
});

export async function upsertArticle(input: z.input<typeof articleSchema>) {
  await guard("articles:write");
  const d = parse(articleSchema, input);
  const slug = toSlug(d.slug || d.titleEn);

  // Bodies render through dangerouslySetInnerHTML, so they are sanitised on the
  // way in — a STAFF account must not be able to publish script.
  const bodyEn = sanitizeHtml(d.bodyEn);
  const bodyFr = sanitizeHtml(d.bodyFr);

  const existing = d.id
    ? await prisma.article.findUnique({ where: { id: d.id }, select: { publishedAt: true } })
    : null;

  const data = {
    category: d.category,
    title: { en: d.titleEn, fr: d.titleFr || d.titleEn },
    excerpt: { en: d.excerptEn, fr: d.excerptFr || d.excerptEn },
    body: { en: bodyEn, fr: bodyFr || bodyEn },
    coverImage: d.coverImage ?? null,
    coverPublicId: d.coverPublicId ?? null,
    author: d.author || "Velvea",
    readMinutes: d.readMinutes,
    status: d.status,
    featured: d.featured,
    // publishedAt used to reset on every save, reshuffling the guides index
    // each time a typo was fixed.
    publishedAt:
      d.status === "PUBLISHED" ? existing?.publishedAt ?? new Date() : existing?.publishedAt ?? null,
  };

  if (d.id) {
    await prisma.article.update({ where: { id: d.id }, data });
  } else {
    await prisma.article.create({ data: { ...data, slug } });
  }
  revalidatePath("/admin/articles");
  revalidatePath("/guides");
  return { slug };
}

export async function deleteArticle(articleId: string) {
  await guard("articles:delete");
  const d = parse(z.object({ id }), { id: articleId });
  const a = await prisma.article.findUnique({ where: { id: d.id } });
  await prisma.article.delete({ where: { id: d.id } });
  if (a?.coverPublicId) await deleteImage(a.coverPublicId);
  revalidatePath("/admin/articles");
}

// ---------------------------------------------------------------------------
// Builder
// ---------------------------------------------------------------------------

const containerSchema = z.object({
  id: id.optional(),
  nameEn: z.string().min(1).max(120),
  nameFr: z.string().max(120).optional().default(""),
  descEn: z.string().max(600).optional().default(""),
  descFr: z.string().max(600).optional().default(""),
  priceCents: money,
  imageUrl: z.string().url().max(500).nullish(),
  imagePublicId: z.string().max(200).nullish(),
  capacity: z.number().int().min(1).max(60),
  position: z.number().int().min(0).max(9999).default(0),
  active: z.boolean().default(true),
});

export async function upsertBuilderContainer(input: z.input<typeof containerSchema>) {
  await guard("builder:write");
  const d = parse(containerSchema, input);
  const data = {
    name: { en: d.nameEn, fr: d.nameFr || d.nameEn },
    description: d.descEn || d.descFr ? { en: d.descEn, fr: d.descFr || d.descEn } : undefined,
    priceCents: d.priceCents,
    imageUrl: d.imageUrl ?? null,
    imagePublicId: d.imagePublicId ?? null,
    capacity: d.capacity,
    position: d.position,
    active: d.active,
  };
  if (d.id) await prisma.builderContainer.update({ where: { id: d.id }, data });
  else await prisma.builderContainer.create({ data });
  revalidatePath("/admin/builder");
  revalidatePath("/custom");
}

export async function deleteBuilderContainer(containerId: string) {
  await guard("builder:delete");
  const d = parse(z.object({ id }), { id: containerId });
  const c = await prisma.builderContainer.findUnique({ where: { id: d.id } });
  await prisma.builderContainer.delete({ where: { id: d.id } });
  if (c?.imagePublicId) await deleteImage(c.imagePublicId);
  revalidatePath("/admin/builder");
  revalidatePath("/custom");
}

const builderCategorySchema = z.object({
  id: id.optional(),
  nameEn: z.string().min(1).max(120),
  nameFr: z.string().max(120).optional().default(""),
  position: z.number().int().min(0).max(9999).default(0),
});

export async function upsertBuilderCategory(input: z.input<typeof builderCategorySchema>) {
  await guard("builder:write");
  const d = parse(builderCategorySchema, input);
  const data = {
    name: { en: d.nameEn, fr: d.nameFr || d.nameEn },
    position: d.position,
  };
  if (d.id) await prisma.builderItemCategory.update({ where: { id: d.id }, data });
  else await prisma.builderItemCategory.create({ data });
  revalidatePath("/admin/builder");
  revalidatePath("/custom");
}

export async function deleteBuilderCategory(categoryId: string) {
  await guard("builder:delete");
  const d = parse(z.object({ id }), { id: categoryId });
  await prisma.builderItemCategory.delete({ where: { id: d.id } });
  revalidatePath("/admin/builder");
  revalidatePath("/custom");
}

const builderItemSchema = z.object({
  id: id.optional(),
  categoryId: id,
  nameEn: z.string().min(1).max(120),
  nameFr: z.string().max(120).optional().default(""),
  priceCents: money,
  imageUrl: z.string().url().max(500).nullish(),
  imagePublicId: z.string().max(200).nullish(),
  position: z.number().int().min(0).max(9999).default(0),
  active: z.boolean().default(true),
  shippable: z.boolean().default(true),
});

export async function upsertBuilderItem(input: z.input<typeof builderItemSchema>) {
  await guard("builder:write");
  const d = parse(builderItemSchema, input);
  const data = {
    categoryId: d.categoryId,
    name: { en: d.nameEn, fr: d.nameFr || d.nameEn },
    priceCents: d.priceCents,
    imageUrl: d.imageUrl ?? null,
    imagePublicId: d.imagePublicId ?? null,
    position: d.position,
    active: d.active,
    shippable: d.shippable,
  };
  if (d.id) await prisma.builderItem.update({ where: { id: d.id }, data });
  else await prisma.builderItem.create({ data });
  revalidatePath("/admin/builder");
  revalidatePath("/custom");
}

export async function deleteBuilderItem(itemId: string) {
  await guard("builder:delete");
  const d = parse(z.object({ id }), { id: itemId });
  const item = await prisma.builderItem.findUnique({ where: { id: d.id } });
  await prisma.builderItem.delete({ where: { id: d.id } });
  if (item?.imagePublicId) await deleteImage(item.imagePublicId);
  revalidatePath("/admin/builder");
  revalidatePath("/custom");
}

// ---------------------------------------------------------------------------
// Staff
// ---------------------------------------------------------------------------

const roleSchema = z.object({ id, role: z.enum(["CUSTOMER", "STAFF", "ADMIN"]) });

export async function setUserRole(input: z.input<typeof roleSchema>) {
  await guard("staff:manage");
  const d = parse(roleSchema, input);

  const admin = await getVerifiedAdmin();
  if (admin?.id === d.id && d.role !== "ADMIN") {
    throw new Error("You can't remove your own admin access.");
  }
  if (d.role !== "ADMIN") {
    // Never leave the store without an administrator.
    const others = await prisma.user.count({ where: { role: "ADMIN", id: { not: d.id } } });
    if (others === 0) throw new Error("At least one administrator must remain.");
  }

  await prisma.user.update({ where: { id: d.id }, data: { role: d.role } });
  revalidatePath("/admin/staff");
}

// ---------------------------------------------------------------------------
// Delivery zones
// ---------------------------------------------------------------------------

/** A Canadian FSA: letter, digit, letter. D, F, I, O, Q and U are never used. */
const FSA = /^[A-CEGHJ-NPR-TVXY]\d[A-CEGHJ-NPR-TV-Z]$/;

const zoneSchema = z
  .object({
    id: z.string().max(64).nullish(),
    key: z
      .string()
      .min(2)
      .max(40)
      .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and dashes only"),
    nameEn: z.string().min(1).max(80),
    nameFr: z.string().min(1).max(80),
    kind: z.enum(["PICKUP", "LOCAL", "SHIPPING", "QUOTE", "BLOCKED"]),
    fsaPrefixes: z.array(z.string().max(3)).max(2000).default([]),
    fsaLetters: z.array(z.string().max(1)).max(26).default([]),
    provinces: z.array(z.string().max(2)).max(13).default([]),
    baseFeeCents: z.number().int().min(0).max(100_000_00),
    extraItemCents: z.number().int().min(0).max(100_000_00),
    sameDaySurchargeCents: z.number().int().min(0).max(100_000_00),
    freeThresholdCents: z.number().int().min(0).max(100_000_00).nullish(),
    sameDayCutoff: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use 24-hour HH:MM")
      .nullish(),
    minLeadDays: z.number().int().min(0).max(60),
    maxLeadDays: z.number().int().min(0).max(90),
    position: z.number().int().min(0).max(9999),
    active: z.boolean(),
  })
  .superRefine((d, ctx) => {
    if (d.maxLeadDays < d.minLeadDays) {
      ctx.addIssue({
        code: "custom",
        path: ["maxLeadDays"],
        message: "The longest estimate cannot be shorter than the shortest",
      });
    }
    // A mistyped prefix is worse than a missing one: it silently never matches,
    // so the zone looks configured while quietly doing nothing.
    const badPrefix = d.fsaPrefixes.find((p) => !FSA.test(p.toUpperCase().trim()));
    if (badPrefix) {
      ctx.addIssue({
        code: "custom",
        path: ["fsaPrefixes"],
        message: `"${badPrefix}" is not a valid FSA — expected a form like L5B`,
      });
    }
    const badLetter = d.fsaLetters.find((l) => !/^[A-CEGHJ-NPR-TVXY]$/.test(l.toUpperCase().trim()));
    if (badLetter) {
      ctx.addIssue({
        code: "custom",
        path: ["fsaLetters"],
        message: `"${badLetter}" is not a postal-code first letter`,
      });
    }
    if (d.kind === "LOCAL" || d.kind === "SHIPPING") {
      if (d.fsaPrefixes.length === 0 && d.fsaLetters.length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["fsaPrefixes"],
          message: "Add at least one FSA or first letter, or nothing will match this zone",
        });
      }
    }
  });

export async function upsertDeliveryZone(input: z.input<typeof zoneSchema>) {
  await guard("zones:write");
  const d = parse(zoneSchema, input);
  const key = d.key.toLowerCase().trim();

  const clash = await prisma.deliveryZone.findUnique({ where: { key } });
  if (clash && clash.id !== d.id) {
    throw new Error(`The key "${key}" is already used by another zone.`);
  }

  const data = {
    key,
    name: { en: d.nameEn, fr: d.nameFr },
    kind: d.kind,
    fsaPrefixes: [...new Set(d.fsaPrefixes.map((p) => p.toUpperCase().trim()))],
    fsaLetters: [...new Set(d.fsaLetters.map((l) => l.toUpperCase().trim()))],
    provinces: [...new Set(d.provinces.map((p) => p.toUpperCase().trim()))],
    baseFeeCents: d.baseFeeCents,
    extraItemCents: d.extraItemCents,
    sameDaySurchargeCents: d.kind === "LOCAL" ? d.sameDaySurchargeCents : 0,
    freeThresholdCents: d.freeThresholdCents ?? null,
    sameDayCutoff: d.kind === "LOCAL" || d.kind === "PICKUP" ? d.sameDayCutoff ?? null : null,
    minLeadDays: d.minLeadDays,
    maxLeadDays: d.maxLeadDays,
    position: d.position,
    active: d.active,
  };

  if (d.id) {
    await prisma.deliveryZone.update({ where: { id: d.id }, data });
  } else {
    await prisma.deliveryZone.create({ data });
  }

  // Zones are cached for 30s; drop it so a corrected rate takes effect at once
  // rather than quoting the old number to the next few customers.
  clearZoneCache();
  revalidatePath("/admin/delivery-zones");
  revalidatePath("/checkout");
}

export async function deleteDeliveryZone(zoneId: string) {
  await guard("zones:write");
  const { id: zid } = parse(z.object({ id }), { id: zoneId });
  await prisma.deliveryZone.delete({ where: { id: zid } });
  clearZoneCache();
  revalidatePath("/admin/delivery-zones");
}
