import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader, Badge, EmptyState } from "@/components/admin/ui";
import { formatMoney, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const tone: Record<string, "green" | "amber" | "gray" | "red" | "iris"> = {
  PAID: "green", DELIVERED: "green", SHIPPED: "iris", PROCESSING: "amber",
  FULFILLED: "iris", PENDING: "gray", CANCELLED: "red", REFUNDED: "red",
};

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  let orders;
  try {
    orders = await prisma.order.findMany({
      where: status && status !== "all" ? { status: status as never } : {},
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { _count: { select: { items: true } } },
    });
  } catch {
    orders = null;
  }

  return (
    <>
      <PageHeader title="Orders" subtitle="Every order placed on your store." />

      <form className="mb-5">
        <select name="status" defaultValue={status ?? "all"} className="field w-52">
          <option value="all">All statuses</option>
          {["PENDING", "PAID", "PROCESSING", "FULFILLED", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </form>

      {!orders ? (
        <EmptyState title="Database not connected" />
      ) : orders.length === 0 ? (
        <EmptyState title="No orders yet" description="Orders will appear here as customers check out." />
      ) : (
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
                    <Link href={`/admin/orders/${o.id}`} className="font-medium text-ink hover:text-violet">
                      {o.orderNumber}
                    </Link>
                    <div className="text-xs text-muted">{formatDate(o.createdAt)}</div>
                  </td>
                  <td className="px-3 py-3 text-ink-soft">{o.email}</td>
                  <td className="px-3 py-3 text-ink-soft">{o._count.items}</td>
                  <td className="px-3 py-3"><Badge tone={tone[o.status] ?? "gray"}>{o.status}</Badge></td>
                  <td className="px-3 py-3 text-right font-semibold text-ink">{formatMoney(o.totalCents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
