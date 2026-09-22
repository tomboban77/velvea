import { prisma } from "./prisma";
import { HIDDEN_PRODUCT_SLUGS } from "./features";
import type { Prisma } from "@prisma/client";

/**
 * List reads are wrapped so pages still render when the database is empty or
 * unreachable (e.g. before the first migration): they return safe fallbacks.
 *
 * Detail lookups (`getProductBySlug`, `getArticleBySlug`) and the sitemap
 * queries are the exception and rethrow. For them a fallback is a lie with
 * consequences: `null` becomes a 404 that search engines record as "this
 * product is gone", and an empty sitemap reads as "the catalogue is empty".
 * A thrown error renders the error boundary with a 500, which crawlers treat
 * as transient and retry.
 */

/** Stable ordering: a tie-breaker on id keeps pagination free of duplicates and gaps. */
function productOrder(sort?: string): Prisma.ProductOrderByWithRelationInput[] {
  const primary: Prisma.ProductOrderByWithRelationInput =
    sort === "price-asc"
      ? { priceCents: "asc" }
      : sort === "price-desc"
      ? { priceCents: "desc" }
      : sort === "rating"
      ? { avgRating: "desc" }
      : { featured: "desc" };
  return [primary, { createdAt: "desc" }, { id: "asc" }];
}

/**
 * Products that exist in the database but must not be sold yet — currently the
 * gift card, whose codes are never issued or redeemed. Excluded here so every
 * listing, search, collection, sitemap entry and PDP hides it in one place.
 */
const notHidden: Prisma.ProductWhereInput =
  HIDDEN_PRODUCT_SLUGS.length ? { slug: { notIn: HIDDEN_PRODUCT_SLUGS } } : {};

const productInclude = {
  images: { orderBy: { position: "asc" } },
  variants: { orderBy: { position: "asc" } },
} satisfies Prisma.ProductInclude;

export type ProductCard = Prisma.ProductGetPayload<{
  include: { images: true; variants: true };
}>;

export async function getFeaturedProducts(limit = 8): Promise<ProductCard[]> {
  try {
    return await prisma.product.findMany({
      where: { status: "ACTIVE", featured: true, ...notHidden },
      include: productInclude,
      orderBy: { updatedAt: "desc" },
      take: limit,
    });
  } catch {
    return [];
  }
}

export async function getBestsellers(limit = 8): Promise<ProductCard[]> {
  try {
    const rows = await prisma.product.findMany({
      where: { status: "ACTIVE", bestseller: true, ...notHidden },
      include: productInclude,
      orderBy: { reviewCount: "desc" },
      take: limit,
    });
    if (rows.length) return rows;
    return await prisma.product.findMany({
      where: { status: "ACTIVE", ...notHidden },
      include: productInclude,
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  } catch {
    return [];
  }
}

/** Rethrows on a database error — see the note at the top of this file. */
export async function getProductBySlug(slug: string) {
  if (HIDDEN_PRODUCT_SLUGS.includes(slug)) return null;
  return prisma.product.findFirst({
    where: { slug, status: { not: "ARCHIVED" } },
    include: {
      ...productInclude,
      collections: { include: { collection: true } },
      reviews: {
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        take: 12,
      },
    },
  });
}

export async function getProductsByCollection(
  type: "OCCASION" | "RECIPIENT" | "CATEGORY" | "THEME",
  slug: string,
  opts?: { sort?: string; skip?: number; take?: number; min?: number; max?: number; recipient?: string }
) {
  try {
    const collection = await prisma.collection.findUnique({ where: { slug } });
    if (!collection || collection.type !== type)
      return { collection: null, products: [] as ProductCard[], total: 0 };

    const orderBy = productOrder(opts?.sort);

    const where: Prisma.ProductWhereInput = {
      status: "ACTIVE",
      ...notHidden,
      collections: { some: { collectionId: collection.id } },
      priceCents: { gte: opts?.min, lte: opts?.max },
      ...(opts?.recipient ? { AND: [{ collections: { some: { collection: { slug: opts.recipient, type: "RECIPIENT" } } } }] } : {}),
    };
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: productInclude,
        orderBy,
        skip: opts?.skip ?? 0,
        take: opts?.take ?? 24,
      }),
      prisma.product.count({ where }),
    ]);
    return { collection, products, total };
  } catch {
    return { collection: null, products: [] as ProductCard[], total: 0 };
  }
}

/**
 * Active products for a hand-picked list (the homepage hero), returned in the
 * order the ids were given. Ids that are inactive, hidden or deleted drop out.
 */
export async function getProductsByIds(ids: string[]): Promise<ProductCard[]> {
  if (!ids.length) return [];
  try {
    const rows = await prisma.product.findMany({
      where: { id: { in: ids }, status: "ACTIVE", ...notHidden },
      include: productInclude,
    });
    const byId = new Map(rows.map((r) => [r.id, r]));
    return ids.map((id) => byId.get(id)).filter((p): p is ProductCard => Boolean(p));
  } catch {
    return [];
  }
}

export async function getAllProducts(opts?: {
  sort?: string;
  skip?: number;
  take?: number;
  q?: string;
  min?: number;
  max?: number;
}) {
  try {
    const orderBy = productOrder(opts?.sort);

    const where: Prisma.ProductWhereInput = {
      status: "ACTIVE",
      ...notHidden,
      priceCents: { gte: opts?.min, lte: opts?.max },
    };
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: productInclude,
        orderBy,
        skip: opts?.skip ?? 0,
        take: opts?.take ?? 24,
      }),
      prisma.product.count({ where }),
    ]);
    return { products, total };
  } catch {
    return { products: [] as ProductCard[], total: 0 };
  }
}

export async function getCollections(
  type: "OCCASION" | "RECIPIENT" | "CATEGORY" | "THEME"
) {
  try {
    return await prisma.collection.findMany({
      where: { type },
      orderBy: [{ position: "asc" }, { createdAt: "asc" }],
      include: { _count: { select: { products: true } } },
    });
  } catch {
    return [];
  }
}

export async function getApprovedReviews(limit = 6) {
  try {
    return await prisma.review.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { product: { select: { slug: true, name: true } } },
    });
  } catch {
    return [];
  }
}

export async function getReviewStats(): Promise<{ count: number; avg: number }> {
  try {
    const agg = await prisma.review.aggregate({
      where: { status: "APPROVED" },
      _count: true,
      _avg: { rating: true },
    });
    return { count: agg._count, avg: agg._avg.rating ?? 0 };
  } catch {
    return { count: 0, avg: 0 };
  }
}

export async function getPublishedArticles(opts?: {
  category?: string;
  limit?: number;
}) {
  try {
    return await prisma.article.findMany({
      where: {
        status: "PUBLISHED",
        ...(opts?.category ? { category: opts.category as never } : {}),
      },
      orderBy: { publishedAt: "desc" },
      take: opts?.limit ?? 12,
    });
  } catch {
    return [];
  }
}

/** Rethrows on a database error — see the note at the top of this file. */
export async function getArticleBySlug(slug: string) {
  return prisma.article.findFirst({
    where: { slug, status: "PUBLISHED" },
  });
}

// ---------------------------------------------------------------------------
// Sitemap reads. No `take` cap (the sitemap must list the whole eligible
// inventory) and no try/catch (an outage must fail the fetch, not empty it).
// ---------------------------------------------------------------------------

export function getSitemapProducts() {
  return prisma.product.findMany({
    where: { status: "ACTIVE", ...notHidden },
    select: { slug: true, updatedAt: true, description: true, tagline: true },
    orderBy: { createdAt: "asc" },
  });
}

export function getSitemapArticles() {
  return prisma.article.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, updatedAt: true, publishedAt: true, body: true },
    orderBy: { publishedAt: "asc" },
  });
}

/** Collections with how many *sellable* products each holds, so empty ones can be left out. */
export async function getSitemapCollections() {
  const rows = await prisma.collection.findMany({
    select: {
      type: true,
      slug: true,
      updatedAt: true,
      _count: { select: { products: { where: { product: { status: "ACTIVE", ...notHidden } } } } },
    },
    orderBy: [{ type: "asc" }, { position: "asc" }],
  });
  return rows.map((c) => ({ type: c.type, slug: c.slug, updatedAt: c.updatedAt, productCount: c._count.products }));
}

export async function getBuilderData() {
  try {
    const [containers, categories] = await Promise.all([
      prisma.builderContainer.findMany({
        where: { active: true },
        orderBy: { position: "asc" },
      }),
      prisma.builderItemCategory.findMany({
        orderBy: { position: "asc" },
        include: {
          items: { where: { active: true }, orderBy: { position: "asc" } },
        },
      }),
    ]);
    return { containers, categories };
  } catch {
    return { containers: [], categories: [] };
  }
}
