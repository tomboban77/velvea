"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession, isAdminRole } from "@/lib/auth";
import { saveSettings as persistSettings, type SiteSettings } from "@/lib/settings";
import { deleteImage } from "@/lib/cloudinary";
import { toSlug } from "@/lib/utils";
import type { OrderStatus, ReviewStatus, InquiryStatus, DiscountType } from "@prisma/client";

async function guard() {
  const session = await getSession();
  if (!session || !isAdminRole(session.role)) throw new Error("Unauthorized");
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

// --- Orders ---
export async function updateOrderStatus(id: string, status: OrderStatus, note?: string) {
  await guard();
  await prisma.order.update({
    where: { id },
    data: {
      status,
      timeline: { create: { label: `Status: ${status}`, note: note || null } },
    },
  });
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
}

export async function addOrderNote(id: string, adminNotes: string) {
  await guard();
  await prisma.order.update({ where: { id }, data: { adminNotes } });
  revalidatePath(`/admin/orders/${id}`);
}

// --- Reviews ---
export async function moderateReview(id: string, status: ReviewStatus) {
  await guard();
  const review = await prisma.review.update({ where: { id }, data: { status } });
  await recomputeProductRating(review.productId);
  revalidatePath("/admin/reviews");
  revalidatePath("/", "layout");
}

export async function deleteReview(id: string) {
  await guard();
  const review = await prisma.review.delete({ where: { id } });
  await recomputeProductRating(review.productId);
  revalidatePath("/admin/reviews");
}

// --- Inquiries ---
export async function updateInquiryStatus(id: string, status: InquiryStatus) {
  await guard();
  await prisma.corporateInquiry.update({ where: { id }, data: { status } });
  revalidatePath("/admin/inquiries");
}

// --- Settings ---
export async function updateSettings(patch: Partial<SiteSettings>) {
  await guard();
  await persistSettings(patch);
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
}

// --- Collections ---
export async function upsertCollection(input: {
  id?: string;
  type: "OCCASION" | "RECIPIENT" | "CATEGORY" | "THEME";
  slug: string;
  nameEn: string;
  nameFr: string;
  descEn: string;
  descFr: string;
  imageUrl?: string | null;
  imagePublicId?: string | null;
  featured: boolean;
  position: number;
}) {
  await guard();
  const name = { en: input.nameEn, fr: input.nameFr || input.nameEn };
  const description =
    input.descEn || input.descFr ? { en: input.descEn, fr: input.descFr || input.descEn } : undefined;
  const slug = toSlug(input.slug || input.nameEn);
  const data = {
    type: input.type,
    name,
    description,
    imageUrl: input.imageUrl ?? null,
    imagePublicId: input.imagePublicId ?? null,
    featured: input.featured,
    position: input.position,
  };
  if (input.id) {
    await prisma.collection.update({ where: { id: input.id }, data });
  } else {
    await prisma.collection.create({ data: { ...data, slug } });
  }
  revalidatePath("/admin/collections");
  revalidatePath("/", "layout");
}

export async function deleteCollection(id: string) {
  await guard();
  const c = await prisma.collection.findUnique({ where: { id } });
  await prisma.collection.delete({ where: { id } });
  if (c?.imagePublicId) await deleteImage(c.imagePublicId);
  revalidatePath("/admin/collections");
}

// --- Discounts ---
export async function upsertDiscount(input: {
  code: string;
  type: DiscountType;
  value: number;
  minSubtotalCents: number;
  usageLimit?: number | null;
  active: boolean;
  isNew: boolean;
}) {
  await guard();
  const code = input.code.toUpperCase().trim();
  const data = {
    type: input.type,
    value: input.value,
    minSubtotalCents: input.minSubtotalCents,
    usageLimit: input.usageLimit ?? null,
    active: input.active,
  };
  await prisma.discountCode.upsert({
    where: { code },
    create: { code, ...data },
    update: data,
  });
  revalidatePath("/admin/discounts");
}

export async function deleteDiscount(code: string) {
  await guard();
  await prisma.discountCode.delete({ where: { code } });
  revalidatePath("/admin/discounts");
}

// --- Articles ---
export async function upsertArticle(input: {
  id?: string;
  slug: string;
  category: "CORPORATE" | "SYMPATHY" | "OCCASIONS" | "RECIPIENTS" | "SEASONAL" | "ETIQUETTE";
  titleEn: string; titleFr: string;
  excerptEn: string; excerptFr: string;
  bodyEn: string; bodyFr: string;
  coverImage?: string | null;
  coverPublicId?: string | null;
  author: string;
  readMinutes: number;
  status: "DRAFT" | "PUBLISHED";
  featured: boolean;
}) {
  await guard();
  const slug = toSlug(input.slug || input.titleEn);
  const data = {
    category: input.category,
    title: { en: input.titleEn, fr: input.titleFr || input.titleEn },
    excerpt: { en: input.excerptEn, fr: input.excerptFr || input.excerptEn },
    body: { en: input.bodyEn, fr: input.bodyFr || input.bodyEn },
    coverImage: input.coverImage ?? null,
    coverPublicId: input.coverPublicId ?? null,
    author: input.author || "Velvea",
    readMinutes: input.readMinutes,
    status: input.status,
    featured: input.featured,
    publishedAt: input.status === "PUBLISHED" ? new Date() : null,
  };
  if (input.id) {
    await prisma.article.update({ where: { id: input.id }, data });
  } else {
    await prisma.article.create({ data: { ...data, slug } });
  }
  revalidatePath("/admin/articles");
  revalidatePath("/guides");
  return { slug };
}

export async function deleteArticle(id: string) {
  await guard();
  const a = await prisma.article.findUnique({ where: { id } });
  await prisma.article.delete({ where: { id } });
  if (a?.coverPublicId) await deleteImage(a.coverPublicId);
  revalidatePath("/admin/articles");
}

// --- Builder ---
export async function upsertBuilderContainer(input: {
  id?: string; nameEn: string; nameFr: string; priceCents: number;
  imageUrl?: string | null; imagePublicId?: string | null; capacity: number; active: boolean;
}) {
  await guard();
  const data = {
    name: { en: input.nameEn, fr: input.nameFr || input.nameEn },
    priceCents: input.priceCents,
    imageUrl: input.imageUrl ?? null,
    imagePublicId: input.imagePublicId ?? null,
    capacity: input.capacity,
    active: input.active,
  };
  if (input.id) await prisma.builderContainer.update({ where: { id: input.id }, data });
  else await prisma.builderContainer.create({ data });
  revalidatePath("/admin/builder");
  revalidatePath("/custom");
}

export async function deleteBuilderContainer(id: string) {
  await guard();
  await prisma.builderContainer.delete({ where: { id } });
  revalidatePath("/admin/builder");
}

export async function upsertBuilderCategory(input: { id?: string; nameEn: string; nameFr: string }) {
  await guard();
  const name = { en: input.nameEn, fr: input.nameFr || input.nameEn };
  if (input.id) await prisma.builderItemCategory.update({ where: { id: input.id }, data: { name } });
  else await prisma.builderItemCategory.create({ data: { name } });
  revalidatePath("/admin/builder");
  revalidatePath("/custom");
}

export async function deleteBuilderCategory(id: string) {
  await guard();
  await prisma.builderItemCategory.delete({ where: { id } });
  revalidatePath("/admin/builder");
}

export async function upsertBuilderItem(input: {
  id?: string; categoryId: string; nameEn: string; nameFr: string; priceCents: number;
  imageUrl?: string | null; imagePublicId?: string | null; active: boolean;
}) {
  await guard();
  const data = {
    categoryId: input.categoryId,
    name: { en: input.nameEn, fr: input.nameFr || input.nameEn },
    priceCents: input.priceCents,
    imageUrl: input.imageUrl ?? null,
    imagePublicId: input.imagePublicId ?? null,
    active: input.active,
  };
  if (input.id) await prisma.builderItem.update({ where: { id: input.id }, data });
  else await prisma.builderItem.create({ data });
  revalidatePath("/admin/builder");
  revalidatePath("/custom");
}

export async function deleteBuilderItem(id: string) {
  await guard();
  await prisma.builderItem.delete({ where: { id } });
  revalidatePath("/admin/builder");
}
