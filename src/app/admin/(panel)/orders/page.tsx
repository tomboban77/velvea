import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader, Badge, EmptyState } from "@/components/admin/ui";
import { formatMoney, formatDate } from "@/lib/utils";
import { Download, Search } from "lucide-react";
import { orderListWhere, ORDER_STATUSES } from "@/lib/admin-orders";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

const tone: Record<string, "green" | "amber" | "gray" | "red" | "iris"> = {
  PAID: "green",
  DELIVERED: "green",
  SHIPPED: "iris",
  PROCESSING: "amber",
  FULFILLED: "iris",
  PENDING: "gray",
  CANCELLED: "red",
  REFUNDED: "red",
};

const STATUSES = [...ORDER_STATUSES];

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}) {
  const { status, q, page } = await searchParams;
  const current = Math.max(1, Number(page) || 1);
  const where = orderListWhere(status, q);

  let orders;
  let total = 0;
  try {
    [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (current - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: { _count: { select: { items: true } } },
      }),
      prisma.order.count({ where }),
    ]);
  } catch {
    orders = null;
  }

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const params = new URLSearchParams();
  if (status && status !== "all") params.set("status", status);
  if (q) params.set("q", q);
  const pageHref = (n: number) => {
    const p = new URLSearchParams(params);
    if (n > 1) p.set("page", String(n));
    return `/admin/orders${p.size ? `?${p}` : ""}`;
  };

  return (
    <>
      <PageHeader title="Orders" subtitle="Every order placed on your store." />

      <form className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-56">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Order number, email, phone, tracking…"
            className="field w-full pl-9"
          />
        </div>
        <select name="status" defaultValue={status ?? "all"} className="field w-44">
          <option value="all">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button type="submit" className="btn btn-primary btn-sm">
          Search
        </button>
        <Link
          href={`/admin/orders/export${params.size ? `?${params}` : ""}`}
          className="btn btn-outline btn-sm"
          prefetch={false}
        >
          <Download className="h-4 w-4" /> CSV
        </Link>
      </form>

      {!orders ? (
        <EmptyState title="Database not connected" />
      ) : orders.length === 0 ? (
        <EmptyState
          title={q || status ? "No matching orders" : "No orders yet"}
          description={
            q || status
              ? "Try a different search or status filter."
              : "Orders will appear here as customers check out."
          }
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-line bg-shell">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-cream/50 text-left text-xs uppercase tracking-wider text-muted">
                  <th className="px-5 py-3 font-medium">Order</th>
                  <th className="px-3 py-3 font-medium">Customer</th>
                  <th className="px-3 py-3 font-medium">Items</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-cream/30">
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="font-medium text-ink hover:text-violet"
                      >
                        {o.orderNumber}
                      </Link>
                      <div className="text-xs text-muted">{formatDate(o.createdAt)}</div>
                    </td>
                    <td className="px-3 py-3 text-ink-soft">{o.email}</td>
                    <td className="px-3 py-3 text-ink-soft">{o._count.items}</td>
                    <td className="px-3 py-3">
                      <Badge tone={tone[o.status] ?? "gray"}>{o.status}</Badge>
                    </td>
                    <td className="px-3 py-3 text-right font-semibold text-ink">
                      {formatMoney(o.totalCents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-muted">
            <span>
              {total} order{total === 1 ? "" : "s"} · page {current} of {pages}
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
