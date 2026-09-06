"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession, isAdminRole } from "@/lib/auth";
import { deleteImage } from "@/lib/cloudinary";
import { toSlug } from "@/lib/utils";

async function guard() {
  const session = await getSession();
  if (!session || !isAdminRole(session.role)) throw new Error("Unauthorized");
  return session;
}

const localizedSchema = z.object({ en: z.string().default(""), fr: z.string().default("") });

const imageSchema = z.object({
  url: z.string().url(),
  publicId: z.string().optional().nullable(),
  alt: z.string().optional().nullable(),
  width: z.number().optional().nullable(),
  height: z.number().optional().nullable(),
});

const variantSchema = z.object({
  label: localizedSchema,
  priceCents: z.number().int().nonnegative(),
  compareAtCents: z.number().int().nonnegative().nullable().optional(),
  sku: z.string().optional().nullable(),
});

const productSchema = z.object({
  slug: z.string().optional(),
  name: localizedSchema,
  tagline: localizedSchema.optional(),
  description: localizedSchema.optional(),
  contents: z.array(localizedSchema).default([]),
  care: localizedSchema.optional(),
  priceCents: z.number().int().nonnegative(),
  compareAtCents: z.number().int().nonnegative().nullable().optional(),
  sku: z.string().optional().nullable(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).default("DRAFT"),
  featured: z.boolean().default(false),
  bestseller: z.boolean().default(false),
  badges: z.array(z.string()).default([]),
  leadTimeDays: z.number().int().min(0).default(1),
  weightGrams: z.number().int().nonnegative().nullable().optional(),
  inventory: z.number().int().nonnegative().nullable().optional(),
  collectionIds: z.array(z.string()).default([]),
  images: z.array(imageSchema).default([]),
  variants: z.array(variantSchema).default([]),
  seoTitle: localizedSchema.optional(),
  seoDescription: localizedSchema.optional(),
});

export type ProductInput = z.infer<typeof productSchema>;

function clean(v?: { en: string; fr: string }) {
  if (!v) return undefined;
  if (!v.en && !v.fr) return undefined;
  return { en: v.en, fr: v.fr || v.en };
}

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  const root = toSlug(base) || "product";
  let slug = root;
  let n = 1;
  while (true) {
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    slug = `${root}-${++n}`;
  }
}

export async function createProduct(input: ProductInput) {
  await guard();
  const data = productSchema.parse(input);
  const slug = await uniqueSlug(data.slug || data.name.en || data.name.fr);

  const product = await prisma.product.create({
    data: {
      slug,
      name: { en: data.name.en, fr: data.name.fr || data.name.en },
      tagline: clean(data.tagline),
      description: clean(data.description),
      contents: data.contents.filter((c) => c.en || c.fr),
      care: clean(data.care),
      priceCents: data.priceCents,
      compareAtCents: data.compareAtCents ?? null,
      sku: data.sku || null,
      status: data.status,
      featured: data.featured,
      bestseller: data.bestseller,
      badges: data.badges,
      leadTimeDays: data.leadTimeDays,
      weightGrams: data.weightGrams ?? null,
      inventory: data.inventory ?? null,
      seoTitle: clean(data.seoTitle),
      seoDescription: clean(data.seoDescription),
      images: {
        create: data.images.map((img, i) => ({
          url: img.url,
          publicId: img.publicId || null,
          alt: img.alt || null,
          width: img.width ?? null,
          height: img.height ?? null,
          position: i,
        })),
      },
      variants: {
        create: data.variants.map((v, i) => ({
          label: { en: v.label.en, fr: v.label.fr || v.label.en },
          priceCents: v.priceCents,
          compareAtCents: v.compareAtCents ?? null,
          sku: v.sku || null,
          position: i,
        })),
      },
      collections: {
        create: data.collectionIds.map((cid, i) => ({
          collectionId: cid,
          position: i,
        })),
      },
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
  return { id: product.id };
}

export async function updateProduct(id: string, input: ProductInput) {
  await guard();
  const data = productSchema.parse(input);
  const slug = data.slug
    ? await uniqueSlug(data.slug, id)
    : undefined;

  // Replace nested collections/images/variants wholesale for simplicity.
  await prisma.$transaction([
    prisma.productImage.deleteMany({ where: { productId: id } }),
    prisma.productVariant.deleteMany({ where: { productId: id } }),
    prisma.productCollection.deleteMany({ where: { productId: id } }),
    prisma.product.update({
      where: { id },
      data: {
        ...(slug ? { slug } : {}),
        name: { en: data.name.en, fr: data.name.fr || data.name.en },
        tagline: clean(data.tagline) ?? {},
        description: clean(data.description) ?? {},
        contents: data.contents.filter((c) => c.en || c.fr),
        care: clean(data.care) ?? {},
        priceCents: data.priceCents,
        compareAtCents: data.compareAtCents ?? null,
        sku: data.sku || null,
        status: data.status,
        featured: data.featured,
        bestseller: data.bestseller,
        badges: data.badges,
        leadTimeDays: data.leadTimeDays,
        weightGrams: data.weightGrams ?? null,
        inventory: data.inventory ?? null,
        seoTitle: clean(data.seoTitle) ?? {},
        seoDescription: clean(data.seoDescription) ?? {},
        images: {
          create: data.images.map((img, i) => ({
            url: img.url,
            publicId: img.publicId || null,
            alt: img.alt || null,
            width: img.width ?? null,
            height: img.height ?? null,
            position: i,
          })),
        },
        variants: {
          create: data.variants.map((v, i) => ({
            label: { en: v.label.en, fr: v.label.fr || v.label.en },
            priceCents: v.priceCents,
            compareAtCents: v.compareAtCents ?? null,
            sku: v.sku || null,
            position: i,
          })),
        },
        collections: {
          create: data.collectionIds.map((cid, i) => ({
            collectionId: cid,
            position: i,
          })),
        },
      },
    }),
  ]);

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  revalidatePath("/", "layout");
  return { id };
}

export async function deleteProduct(id: string) {
  await guard();
  const images = await prisma.productImage.findMany({
    where: { productId: id, publicId: { not: null } },
    select: { publicId: true },
  });
  await prisma.product.delete({ where: { id } });
  for (const img of images) if (img.publicId) await deleteImage(img.publicId);
  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
}

export async function setProductStatus(
  id: string,
  status: "DRAFT" | "ACTIVE" | "ARCHIVED"
) {
  await guard();
  await prisma.product.update({ where: { id }, data: { status } });
  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
}
