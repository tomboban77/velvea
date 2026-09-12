import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/admin/ui";
import { OrderStatusControl } from "@/components/admin/OrderStatusControl";
import { formatMoney, formatDate } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let order;
  try {
    order = await prisma.order.findUnique({
      where: { id },
      include: { items: true, timeline: { orderBy: { createdAt: "desc" } } },
    });
  } catch {
    order = null;
  }
  if (!order) notFound();

  const shipping = order.shipping as {
    fullName: string; line1: string; line2?: string; city: string; province: string; postalCode: string; phone?: string;
  };

  return (
    <>
      <Link href="/admin/orders" className="mb-5 inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Orders
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">{order.orderNumber}</h1>
          <p className="text-sm text-muted">{formatDate(order.createdAt)} · {order.email}</p>
        </div>
        <Badge tone="gray">{order.deliveryMethod.replace("_", " ")}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <h2 className="mb-4 font-display text-lg">Items</h2>
            <ul className="divide-y divide-line">
              {order.items.map((i) => (
                <li key={i.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <p className="font-medium text-ink">{i.name}</p>
                    {i.variantLabel && <p className="text-xs text-muted">{i.variantLabel}</p>}
                    {i.isCustom && i.customConfig ? (
                      <p className="text-xs text-violet">
                        Custom: {((i.customConfig as { items?: string[] }).items ?? []).join(", ")}
                      </p>
                    ) : null}
                    <p className="text-xs text-muted">Qty {i.quantity}</p>
                  </div>
                  <span className="font-semibold">{formatMoney(i.unitPriceCents * i.quantity)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm">
              <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatMoney(order.subtotalCents)}</dd></div>
              {order.discountCents > 0 && <div className="flex justify-between"><dt className="text-muted">Discount {order.discountCode ? `(${order.discountCode})` : ""}</dt><dd className="text-success">−{formatMoney(order.discountCents)}</dd></div>}
              <div className="flex justify-between"><dt className="text-muted">Shipping</dt><dd>{formatMoney(order.shippingCents)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Tax</dt><dd>{formatMoney(order.taxCents)}</dd></div>
              <div className="flex justify-between border-t border-line pt-2 text-base font-semibold"><dt>Total</dt><dd>{formatMoney(order.totalCents)}</dd></div>
            </dl>
          </Card>

          {order.giftMessage && (
            <Card>
              <h2 className="mb-2 font-display text-lg">Gift message</h2>
              <p className="rounded-xl bg-cream px-4 py-3 text-sm italic text-ink-soft">&ldquo;{order.giftMessage}&rdquo;</p>
            </Card>
          )}

          <Card>
            <h2 className="mb-3 font-display text-lg">Timeline</h2>
            <ul className="space-y-3">
              {order.timeline.map((e) => (
                <li key={e.id} className="flex gap-3 text-sm">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-gold" />
                  <div>
                    <p className="font-medium text-ink">{e.label}</p>
                    {e.note && <p className="text-xs text-muted">{e.note}</p>}
                    <p className="text-xs text-muted">{formatDate(e.createdAt)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="mb-3 font-display text-lg">Status</h2>
            <OrderStatusControl id={order.id} current={order.status} />
          </Card>
          <Card>
            <h2 className="mb-3 font-display text-lg">Deliver to</h2>
            <p className="text-sm text-ink-soft">
              {shipping.fullName}<br />
              {shipping.line1}{shipping.line2 ? `, ${shipping.line2}` : ""}<br />
              {shipping.city}, {shipping.province} {shipping.postalCode}
              {shipping.phone && <><br />{shipping.phone}</>}
              {order.phone && <><br />{order.phone}</>}
            </p>
            {order.deliveryDate && (
              <p className="mt-2 text-sm"><span className="text-muted">Preferred date:</span> {formatDate(order.deliveryDate)}</p>
            )}
            {order.deliveryNotes && (
              <p className="mt-1 text-sm"><span className="text-muted">Notes:</span> {order.deliveryNotes}</p>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
