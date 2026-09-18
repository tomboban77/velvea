import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { PageHeader, Badge, EmptyState, AdminLink } from "@/components/admin/ui";
import { formatMoney } from "@/lib/utils";
import { t } from "@/lib/i18n-content";
import { Plus, Search } from "lucide-react";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

const statusTone = { ACTIVE: "green", DRAFT: "amber", ARCHIVED: "gray" } as const;

/**
 * Search runs in the database across both languages, the slug and the SKU.
 * It used to filter the first 100 rows in memory against English names only,
 * so anything past row 100 — or named only in French — was unfindable.
 */
function productWhere(q?: string, status?: string): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {};
  if (status && status !== "all" && ["ACTIVE", "DRAFT", "ARCHIVED"].includes(status)) {
    where.status = status as Prisma.ProductWhereInput["status"];
  }
  const term = q?.trim();
  if (term) {
    where.OR = [
      { name: { path: ["en"], string_contains: term } },
      { name: { path: ["fr"], string_contains: term } },
      { slug: { contains: term, mode: "insensitive" } },
      { sku: { contains: term, mode: "insensitive" } },
    ];
  }
  return where;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const { q, status, page } = await searchParams;
  const current = Math.max(1, Number(page) || 1);
  const where = productWhere(q, status);

  let products: Awaited<ReturnType<typeof loadProducts>> | null = null;
  let total = 0;
  try {
    [products, total] = await Promise.all([
      loadProducts(where, current),
      prisma.product.count({ where }),
    ]);
  } catch {
    products = null;
  }

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageHref = (n: number) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (status && status !== "all") p.set("status", status);
    if (n > 1) p.set("page", String(n));
    return `/admin/products${p.size ? `?${p}` : ""}`;
  };

  return (
    <>
      <PageHeader
        title="Products"
        subtitle="Create and manage your gift baskets."
        action={
          <AdminLink href="/admin/products/new">
            <Plus className="h-4 w-4" /> Add product
          </AdminLink>
        }
      />

      <form className="mb-5 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-56">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Name (EN or FR), slug or SKU…"
            className="field w-full pl-10"
          />
        </div>
        <select name="status" defaultValue={status ?? "all"} className="field w-44">
          <option value="all">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="DRAFT">Draft</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        <button className="btn btn-outline btn-sm">Filter</button>
      </form>

      {products === null ? (
        <EmptyState
          title="Database not connected"
          description="Add DATABASE_URL to .env and run the migration to manage products."
        />
      ) : products.length === 0 ? (
        <EmptyState
          title={q || status ? "No matching products" : "No products yet"}
          description={
            q || status
              ? "Try a different search term or status."
              : "Add your first gift basket to start building the catalog."
          }
          action={
            <AdminLink href="/admin/products/new">
              <Plus className="h-4 w-4" /> Add product
            </AdminLink>
          }
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-line bg-shell">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-cream/50 text-left text-xs uppercase tracking-wider text-muted">
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 font-medium">Price</th>
                  <th className="px-3 py-3 font-medium">Stock</th>
                  <th className="px-3 py-3 font-medium">Reviews</th>
                  <th className="px-3 py-3 font-medium">Flags</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-cream/30">
                    <td className="px-5 py-3">
                      <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3">
                        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-cream">
                          {p.images[0] && (
                            <Image
                              src={p.images[0].url}
                              alt=""
                              fill
                              sizes="44px"
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-ink">{t(p.name, "en")}</p>
                          <p className="text-xs text-muted">/{p.slug}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-3 py-3">
                      <Badge tone={statusTone[p.status]}>{p.status}</Badge>
                    </td>
                    <td className="px-3 py-3 font-semibold text-ink">
                      {formatMoney(p.priceCents)}
                    </td>
                    <td className="px-3 py-3">
                      {p.inventory === null ? (
                        <span className="text-muted">∞</span>
                      ) : p.inventory <= 0 ? (
                        <Badge tone="red">Sold out</Badge>
                      ) : p.inventory <= 5 ? (
                        <Badge tone="amber">{p.inventory} left</Badge>
                      ) : (
                        <span className="text-ink-soft">{p.inventory}</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-ink-soft">{p._count.reviews}</td>
                    <td className="px-3 py-3">
                      <div className="flex gap-1">
                        {p.featured && <Badge tone="iris">Featured</Badge>}
                        {p.bestseller && <Badge tone="amber">Bestseller</Badge>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-muted">
            <span>
              {total} product{total === 1 ? "" : "s"} · page {current} of {pages}
            </span>
            <div className="flex gap-2">
              {current > 1 && (
                <Link href={pageHref(current - 1)} className="btn btn-outline btn-sm">
                  Previous
                </Link>
              )}
              {current < pages && (
                <Link href={pageHref(current + 1)} className="btn btn-outline btn-sm">
                  Next
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

function loadProducts(where: Prisma.ProductWhereInput, page: number) {
  return prisma.product.findMany({
    where,
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      _count: { select: { reviews: true } },
    },
    orderBy: { updatedAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });
}
