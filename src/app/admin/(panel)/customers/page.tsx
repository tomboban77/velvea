import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader, EmptyState, Badge } from "@/components/admin/ui";
import { getVerifiedAdmin } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { formatMoney, formatDate } from "@/lib/utils";
import { Search } from "lucide-react";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const admin = await getVerifiedAdmin();
  if (!admin || !can(admin.role, "customers:read")) notFound();

  const { q, page } = await searchParams;
  const current = Math.max(1, Number(page) || 1);
  const term = q?.trim();

  const where: Prisma.UserWhereInput = term
    ? {
        OR: [
          { email: { contains: term, mode: "insensitive" } },
          { name: { contains: term, mode: "insensitive" } },
        ],
      }
    : {};

  let users;
  let total = 0;
  try {
    [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (current - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          orders: {
            where: { status: { in: ["PAID", "PROCESSING", "FULFILLED", "SHIPPED", "DELIVERED"] } },
            select: { totalCents: true },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);
  } catch {
    users = null;
  }

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageHref = (n: number) => {
    const p = new URLSearchParams();
    if (term) p.set("q", term);
    if (n > 1) p.set("page", String(n));
    return `/admin/customers${p.size ? `?${p}` : ""}`;
  };

  return (
    <>
      <PageHeader title="Customers" subtitle="Everyone with a Velvea account." />

      <form className="mb-5 flex items-center gap-3">
        <div className="relative flex-1 min-w-56">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            name="q"
            defaultValue={term ?? ""}
            placeholder="Name or email…"
            className="field w-full pl-9"
          />
        </div>
        <button type="submit" className="btn btn-primary btn-sm">
          Search
        </button>
      </form>

      {!users ? (
        <EmptyState title="Database not connected" />
      ) : users.length === 0 ? (
        <EmptyState title={term ? "No matching customers" : "No customers yet"} />
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-line bg-shell">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-cream/50 text-left text-xs uppercase tracking-wider text-muted">
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-3 py-3 font-medium">Joined</th>
                  <th className="px-3 py-3 font-medium">Orders</th>
                  <th className="px-3 py-3 text-right font-medium">Lifetime</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {users.map((u) => {
                  const spent = u.orders.reduce((s, o) => s + o.totalCents, 0);
                  return (
                    <tr key={u.id} className="hover:bg-cream/30">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-ink">{u.name || "—"}</span>
                          {u.role !== "CUSTOMER" && <Badge tone="iris">{u.role}</Badge>}
                          {!u.emailVerified && <Badge tone="gray">Unverified</Badge>}
                        </div>
                        <Link
                          href={`/admin/orders?q=${encodeURIComponent(u.email)}`}
                          className="text-xs text-muted hover:text-violet"
                        >
                          {u.email}
                        </Link>
                      </td>
                      <td className="px-3 py-3 text-muted">{formatDate(u.createdAt)}</td>
                      <td className="px-3 py-3 text-ink-soft">{u.orders.length}</td>
                      <td className="px-3 py-3 text-right font-semibold text-ink">
                        {formatMoney(spent)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-muted">
            <span>
              {total} customer{total === 1 ? "" : "s"} · page {current} of {pages}
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
