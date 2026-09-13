import { prisma } from "./prisma";
import type { Prisma } from "@prisma/client";

/**
 * All reads are wrapped so pages still render when the database is empty or
 * unreachable (e.g. before the first migration). They return safe fallbacks.
 */

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
      where: { status: "ACTIVE", featured: true },
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
      where: { status: "ACTIVE", bestseller: true },
      include: productInclude,
      orderBy: { reviewCount: "desc" },
      take: limit,
    });
    if (rows.length) return rows;
    return await prisma.product.findMany({
      where: { status: "ACTIVE" },
      include: productInclude,
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  } catch {
    return [];
  }
}

export async function getProductBySlug(slug: string) {
  try {
    return await prisma.product.findFirst({
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
  } catch {
    return null;
  }
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

    const orderBy: Prisma.ProductOrderByWithRelationInput =
      opts?.sort === "price-asc"
        ? { priceCents: "asc" }
        : opts?.sort === "price-desc"
        ? { priceCents: "desc" }
        : opts?.sort === "rating"
        ? { avgRating: "desc" }
        : { featured: "desc" };

    const where: Prisma.ProductWhereInput = {
      status: "ACTIVE",
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

export async function getAllProducts(opts?: {
  sort?: string;
  skip?: number;
  take?: number;
  q?: string;
  min?: number;
  max?: number;
}) {
  try {
    const orderBy: Prisma.ProductOrderByWithRelationInput =
      opts?.sort === "price-asc"
        ? { priceCents: "asc" }
        : opts?.sort === "price-desc"
        ? { priceCents: "desc" }
        : opts?.sort === "rating"
        ? { avgRating: "desc" }
        : { featured: "desc" };

    const where: Prisma.ProductWhereInput = { status: "ACTIVE", priceCents: { gte: opts?.min, lte: opts?.max } };
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

export async function getArticleBySlug(slug: string) {
  try {
    return await prisma.article.findFirst({
      where: { slug, status: "PUBLISHED" },
    });
  } catch {
    return null;
  }
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
