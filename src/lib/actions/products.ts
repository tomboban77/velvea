"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getVerifiedAdmin } from "@/lib/auth";
import { can, denialMessage, type Permission } from "@/lib/permissions";
import { deleteImage } from "@/lib/cloudinary";
import { toSlug } from "@/lib/utils";

/**
 * Next strips thrown error messages from Server Action responses in
 * production, so the dashboard used to show an opaque failure for every
 * expired session, denied permission or invalid field. These actions return a
 * result instead, and only unexpected errors are swallowed into a generic
 * message (and logged).
 */
export type ActionResult<T = { id: string }> =
  | ({ ok: true } & T)
  | { ok: false; error: string };

/** An error whose message is safe — and useful — to show the admin. */
class AdminError extends Error {}

const SESSION_EXPIRED =
  "Your admin session expired. Open the dashboard in a new tab, sign in, then save again.";

function failure(err: unknown, context: string): { ok: false; error: string } {
  if (err instanceof AdminError) return { ok: false, error: err.message };
  if (err instanceof z.ZodError) {
    const issue = err.issues[0];
    const field = issue?.path.join(".") || "A field";
    return { ok: false, error: `${field}: ${issue?.message ?? "is invalid"}` };
  }
  console.error(`${context} failed:`, err);
  return { ok: false, error: "Something went wrong saving to the database. Try again." };
}

async function guard(permission: Permission) {
  const admin = await getVerifiedAdmin();
  if (!admin) throw new AdminError(SESSION_EXPIRED);
  if (!can(admin.role, permission)) throw new AdminError(denialMessage(permission));
  return admin;
}

const localizedSchema = z.object({
  en: z.string().max(8000).default(""),
  fr: z.string().max(8000).default(""),
});

const imageSchema = z.object({
  url: z.string().url().max(500),
  publicId: z.string().max(200).optional().nullable(),
  alt: z.string().max(300).optional().nullable(),
  width: z.number().int().optional().nullable(),
  height: z.number().int().optional().nullable(),
});

const variantSchema = z.object({
  /** Present for variants that already exist, so carts keep working. */
  id: z.string().max(64).optional().nullable(),
  label: localizedSchema,
  priceCents: z.number().int().nonnegative().max(10_000_000),
  compareAtCents: z.number().int().nonnegative().max(10_000_000).nullable().optional(),
  sku: z.string().max(80).optional().nullable(),
  inStock: z.boolean().optional().default(true),
});

const productSchema = z.object({
  slug: z.string().max(140).optional(),
  name: localizedSchema,
  tagline: localizedSchema.optional(),
  description: localizedSchema.optional(),
  contents: z.array(localizedSchema).max(60).default([]),
  care: localizedSchema.optional(),
  priceCents: z.number().int().nonnegative().max(10_000_000),
  compareAtCents: z.number().int().nonnegative().max(10_000_000).nullable().optional(),
  sku: z.string().max(80).optional().nullable(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).default("DRAFT"),
  featured: z.boolean().default(false),
  bestseller: z.boolean().default(false),
  badges: z.array(z.string().max(40)).max(10).default([]),
  leadTimeDays: z.number().int().min(0).max(60).default(1),
  weightGrams: z.number().int().nonnegative().max(100_000).nullable().optional(),
  shippable: z.boolean().default(true),
  inventory: z.number().int().nonnegative().max(1_000_000).nullable().optional(),
  collectionIds: z.array(z.string().max(64)).max(40).default([]),
  images: z.array(imageSchema).max(20).default([]),
  variants: z.array(variantSchema).max(20).default([]),
  seoTitle: localizedSchema.optional(),
  seoDescription: localizedSchema.optional(),
});

export type ProductInput = z.input<typeof productSchema>;

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

export async function createProduct(input: ProductInput): Promise<ActionResult> {
  try {
    return await createProductImpl(input);
  } catch (err) {
    return failure(err, "createProduct");
  }
}

async function createProductImpl(input: ProductInput): Promise<ActionResult> {
  await guard("products:write");
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
      shippable: data.shippable,
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
          inStock: v.inStock ?? true,
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
  return { ok: true, id: product.id };
}

export async function updateProduct(
  productId: string,
  input: ProductInput
): Promise<ActionResult> {
  try {
    return await updateProductImpl(productId, input);
  } catch (err) {
    return failure(err, "updateProduct");
  }
}

async function updateProductImpl(
  productId: string,
  input: ProductInput
): Promise<ActionResult> {
  await guard("products:write");
  const data = productSchema.parse(input);
  const slug = data.slug ? await uniqueSlug(data.slug, productId) : undefined;

  const existingVariants = await prisma.productVariant.findMany({
    where: { productId },
    select: { id: true },
  });
  const existingIds = new Set(existingVariants.map((v) => v.id));
  const keptIds = new Set(
    data.variants.map((v) => v.id).filter((vid): vid is string => Boolean(vid) && existingIds.has(vid!))
  );
  const removedIds = [...existingIds].filter((vid) => !keptIds.has(vid));

  const variantData = (v: (typeof data.variants)[number], i: number) => ({
    label: { en: v.label.en, fr: v.label.fr || v.label.en },
    priceCents: v.priceCents,
    compareAtCents: v.compareAtCents ?? null,
    sku: v.sku || null,
    inStock: v.inStock ?? true,
    position: i,
  });

  await prisma.$transaction([
    // Images and collection links are positional and carry no external
    // references, so replacing them wholesale is safe.
    prisma.productImage.deleteMany({ where: { productId } }),
    prisma.productCollection.deleteMany({ where: { productId } }),

    // Variants are *not* replaced wholesale: their ids live in customers' carts
    // and on past order lines. Deleting and recreating them made a $200 gift
    // card silently fall back to the $50 base price at checkout.
    ...(removedIds.length
      ? [prisma.productVariant.deleteMany({ where: { productId, id: { in: removedIds } } })]
      : []),
    ...data.variants.map((v, i) =>
      v.id && existingIds.has(v.id)
        ? prisma.productVariant.update({ where: { id: v.id }, data: variantData(v, i) })
        : prisma.productVariant.create({ data: { productId, ...variantData(v, i) } })
    ),

    prisma.product.update({
      where: { id: productId },
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
        shippable: data.shippable,
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
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/", "layout");
  return { ok: true, id: productId };
}

export async function deleteProduct(productId: string): Promise<ActionResult> {
  try {
    return await deleteProductImpl(productId);
  } catch (err) {
    return failure(err, "deleteProduct");
  }
}

async function deleteProductImpl(productId: string): Promise<ActionResult> {
  await guard("products:delete");
  const images = await prisma.productImage.findMany({
    where: { productId, publicId: { not: null } },
    select: { publicId: true },
  });
  await prisma.product.delete({ where: { id: productId } });
  for (const img of images) if (img.publicId) await deleteImage(img.publicId);
  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
  return { ok: true, id: productId };
}

export async function setProductStatus(
  productId: string,
  status: "DRAFT" | "ACTIVE" | "ARCHIVED"
): Promise<ActionResult> {
  try {
    await guard("products:write");
    const parsed = z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).parse(status);
    await prisma.product.update({ where: { id: productId }, data: { status: parsed } });
    revalidatePath("/admin/products");
    revalidatePath("/", "layout");
    return { ok: true, id: productId };
  } catch (err) {
    return failure(err, "setProductStatus");
  }
}
