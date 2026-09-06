import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader, StatCard, Card, Badge, EmptyState } from "@/components/admin/ui";
import { formatMoney, formatDate } from "@/lib/utils";
import { t } from "@/lib/i18n-content";
import { Package, ShoppingCart, Star, Building2, ArrowRight } from "lucide-react";

async function getDashboard() {
  try {
    const [
      productCount,
      activeProducts,
      orderCount,
      pendingReviews,
      newInquiries,
      paidAgg,
      recentOrders,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { status: "ACTIVE" } }),
      prisma.order.count(),
      prisma.review.count({ where: { status: "PENDING" } }),
      prisma.corporateInquiry.count({ where: { status: "NEW" } }),
      prisma.order.aggregate({
        where: { status: { in: ["PAID", "PROCESSING", "FULFILLED", "SHIPPED", "DELIVERED"] } },
        _sum: { totalCents: true },
      }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        select: {
          id: true,
          orderNumber: true,
          email: true,
          status: true,
          totalCents: true,
          createdAt: true,
        },
      }),
    ]);
    return {
      ok: true as const,
      productCount,
      activeProducts,
      orderCount,
      pendingReviews,
      newInquiries,
      revenue: paidAgg._sum.totalCents ?? 0,
      recentOrders,
    };
  } catch {
    return { ok: false as const };
  }
}

const statusTone: Record<string, "green" | "amber" | "gray" | "red" | "iris"> = {
  PAID: "green",
  DELIVERED: "green",
  SHIPPED: "iris",
  PROCESSING: "amber",
  FULFILLED: "iris",
  PENDING: "gray",
  CANCELLED: "red",
  REFUNDED: "red",
};

export default async function AdminDashboard() {
  const data = await getDashboard();

  if (!data.ok) {
    return (
      <>
        <PageHeader title="Dashboard" />
        <EmptyState
          title="Database not connected"
          description="Add your DATABASE_URL to .env and run the migration. Until then, the storefront shows sample content and the admin can't load data."
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="A snapshot of your store today."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Revenue" value={formatMoney(data.revenue)} hint="Paid orders" />
        <StatCard label="Orders" value={data.orderCount} />
        <StatCard
          label="Products"
          value={data.activeProducts}
          hint={`${data.productCount} total`}
        />
        <StatCard label="Pending reviews" value={data.pendingReviews} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl">Recent orders</h2>
            <Link
              href="/admin/orders"
              className="flex items-center gap-1 text-sm font-medium text-gold hover:gap-2"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {data.recentOrders.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-muted">
                    <th className="pb-2 font-medium">Order</th>
                    <th className="pb-2 font-medium">Customer</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {data.recentOrders.map((o) => (
                    <tr key={o.id}>
                      <td className="py-3">
                        <Link href={`/admin/orders/${o.id}`} className="font-medium text-ink hover:text-gold">
                          {o.orderNumber}
                        </Link>
                        <div className="text-xs text-muted">{formatDate(o.createdAt)}</div>
                      </td>
                      <td className="py-3 text-ink-soft">{o.email}</td>
                      <td className="py-3">
                        <Badge tone={statusTone[o.status] ?? "gray"}>{o.status}</Badge>
                      </td>
                      <td className="py-3 text-right font-semibold text-ink">
                        {formatMoney(o.totalCents)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card>
          <h2 className="mb-4 font-display text-xl">Quick actions</h2>
          <div className="space-y-2.5">
            <QuickLink href="/admin/products/new" icon={Package} label="Add a product" />
            <QuickLink href="/admin/orders" icon={ShoppingCart} label="Manage orders" />
            <QuickLink
              href="/admin/reviews"
              icon={Star}
              label={`Moderate reviews${data.pendingReviews ? ` (${data.pendingReviews})` : ""}`}
            />
            <QuickLink
              href="/admin/inquiries"
              icon={Building2}
              label={`Corporate inquiries${data.newInquiries ? ` (${data.newInquiries})` : ""}`}
            />
          </div>
        </Card>
      </div>
    </>
  );
}

function QuickLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border border-line px-4 py-3 text-sm font-medium text-ink transition-colors hover:border-ink hover:bg-cream/50"
    >
      <Icon className="h-4 w-4 text-gold" />
      {label}
    </Link>
  );
}
