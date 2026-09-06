import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { PageHeader, Badge, EmptyState, AdminLink } from "@/components/admin/ui";
import { formatMoney } from "@/lib/utils";
import { t } from "@/lib/i18n-content";
import { Plus, Search } from "lucide-react";

export const dynamic = "force-dynamic";

const statusTone = { ACTIVE: "green", DRAFT: "amber", ARCHIVED: "gray" } as const;

async function getProducts(q?: string, status?: string) {
  try {
    return await prisma.product.findMany({
      where: {
        ...(status && status !== "all" ? { status: status as never } : {}),
      },
      include: { images: { orderBy: { position: "asc" }, take: 1 }, _count: { select: { reviews: true } } },
      orderBy: { updatedAt: "desc" },
      take: 100,
    });
  } catch {
    return null;
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;
  const products = await getProducts(q, status);

  const filtered =
    products && q
      ? products.filter((p) =>
          t(p.name, "en").toLowerCase().includes(q.toLowerCase())
        )
      : products;

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
            placeholder="Search products…"
            className="field pl-10"
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
      ) : filtered && filtered.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-line bg-shell">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-cream/50 text-left text-xs uppercase tracking-wider text-muted">
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 font-medium">Price</th>
                <th className="px-3 py-3 font-medium">Reviews</th>
                <th className="px-3 py-3 font-medium">Flags</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-cream/30">
                  <td className="px-5 py-3">
                    <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3">
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-cream">
                        {p.images[0] && (
                          <Image src={p.images[0].url} alt="" fill sizes="44px" className="object-cover" />
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
                  <td className="px-3 py-3 font-semibold text-ink">{formatMoney(p.priceCents)}</td>
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
      ) : (
        <EmptyState
          title="No products yet"
          description="Add your first gift basket to start building the catalog."
          action={
            <AdminLink href="/admin/products/new">
              <Plus className="h-4 w-4" /> Add product
            </AdminLink>
          }
        />
      )}
    </>
  );
}
