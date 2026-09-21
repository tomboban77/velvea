import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/admin/ui";
import {
  OrderStatusControl,
  OrderTrackingControl,
  OrderNotes,
  OrderRefundControl,
} from "@/components/admin/OrderStatusControl";
import { formatMoney, formatDate } from "@/lib/utils";
import { formatStoreDate } from "@/lib/dates";
import { ArrowLeft, Printer } from "lucide-react";

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
    fullName: string;
    line1: string;
    line2?: string;
    city: string;
    province: string;
    postalCode: string;
    phone?: string;
  };

  return (
    <>
      <Link
        href="/admin/orders"
        className="mb-5 inline-flex items-center gap-2 text-sm text-muted hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" /> Orders
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">{order.orderNumber}</h1>
          <p className="text-sm text-muted">
            {formatDate(order.createdAt)} · {order.email}
            {order.phone ? ` · ${order.phone}` : ""} · {order.locale.toUpperCase()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/orders/${order.id}/packing-slip`}
            className="btn btn-outline btn-sm"
            target="_blank"
          >
            <Printer className="h-4 w-4" /> Packing slip
          </Link>
          <Badge tone="gray">{order.deliveryMethod.replace("_", " ")}</Badge>
          {/* Which zone priced this order — the number to check a rate against. */}
          {order.deliveryZoneKey && <Badge tone="violet">{order.deliveryZoneKey}</Badge>}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <h2 className="mb-4 font-display text-lg">Items</h2>
            <ul className="divide-y divide-line">
              {order.items.map((i) => {
                const cfg = i.customConfig as {
                  containerName?: string;
                  items?: { name: string; qty: number }[];
                  note?: string;
                } | null;
                return (
                  <li key={i.id} className="flex items-center justify-between py-3 text-sm">
                    <div>
                      <p className="font-medium text-ink">{i.name}</p>
                      {i.variantLabel && <p className="text-xs text-muted">{i.variantLabel}</p>}
                      {i.isCustom && cfg ? (
                        <div className="text-xs text-violet">
                          {cfg.containerName && <p>{cfg.containerName}</p>}
                          {cfg.items?.length ? (
                            <p>
                              {cfg.items
                                .map((c) => (c.qty > 1 ? `${c.name} × ${c.qty}` : c.name))
                                .join(", ")}
                            </p>
                          ) : null}
                          {cfg.note && <p className="italic text-muted">“{cfg.note}”</p>}
                        </div>
                      ) : null}
                      {i.giftMessage && (
                        <p className="mt-1 rounded-lg bg-cream px-2 py-1 text-xs italic text-ink-soft">
                          &ldquo;{i.giftMessage}&rdquo;
                        </p>
                      )}
                      {i.cardFeeCents > 0 && (
                        <p className="text-xs text-violet">
                          Premium greeting card · +{formatMoney(i.cardFeeCents)} each
                        </p>
                      )}
                      <p className="text-xs text-muted">Qty {i.quantity}</p>
                    </div>
                    <span className="font-semibold">
                      {formatMoney((i.unitPriceCents + i.cardFeeCents) * i.quantity)}
                    </span>
                  </li>
                );
              })}
            </ul>
            <dl className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd>{formatMoney(order.subtotalCents)}</dd>
              </div>
              {order.discountCents > 0 && (
                <div className="flex justify-between">
                  <dt className="text-muted">
                    Discount {order.discountCode ? `(${order.discountCode})` : ""}
                  </dt>
                  <dd className="text-success">−{formatMoney(order.discountCents)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted">Shipping</dt>
                <dd>{formatMoney(order.shippingCents)}</dd>
              </div>
              {order.taxCents > 0 && (
                <div className="flex justify-between">
                  <dt className="text-muted">Tax</dt>
                  <dd>{formatMoney(order.taxCents)}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-line pt-2 text-base font-semibold">
                <dt>Total</dt>
                <dd>{formatMoney(order.totalCents)}</dd>
              </div>
              {order.refundedCents > 0 && (
                <div className="flex justify-between">
                  <dt className="text-muted">Refunded</dt>
                  <dd className="text-danger">−{formatMoney(order.refundedCents)}</dd>
                </div>
              )}
            </dl>
          </Card>

          {order.giftMessage && (
            <Card>
              <h2 className="mb-2 font-display text-lg">Gift message</h2>
              <p className="rounded-xl bg-cream px-4 py-3 text-sm italic text-ink-soft">
                &ldquo;{order.giftMessage}&rdquo;
              </p>
            </Card>
          )}

          <Card>
            <h2 className="mb-3 font-display text-lg">Internal notes</h2>
            <OrderNotes id={order.id} initial={order.adminNotes ?? ""} />
          </Card>

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
            <h2 className="mb-3 font-display text-lg">Shipping & tracking</h2>
            <OrderTrackingControl
              id={order.id}
              carrier={order.carrier}
              trackingNumber={order.trackingNumber}
              trackingUrl={order.trackingUrl}
              shipped={Boolean(order.shippedAt)}
            />
          </Card>

          <Card>
            <h2 className="mb-3 font-display text-lg">Refund</h2>
            <OrderRefundControl
              id={order.id}
              totalCents={order.totalCents}
              refundedCents={order.refundedCents}
              viaStripe={Boolean(order.stripePaymentIntentId)}
            />
          </Card>

          <Card>
            <h2 className="mb-3 font-display text-lg">Deliver to</h2>
            <p className="text-sm text-ink-soft">
              {shipping.fullName}
              <br />
              {shipping.line1}
              {shipping.line2 ? `, ${shipping.line2}` : ""}
              <br />
              {shipping.city}, {shipping.province} {shipping.postalCode}
              {shipping.phone && (
                <>
                  <br />
                  {shipping.phone}
                </>
              )}
            </p>
            {order.deliveryDate && (
              <p className="mt-2 text-sm">
                <span className="text-muted">Preferred date:</span>{" "}
                {formatStoreDate(order.deliveryDate)}
              </p>
            )}
            {order.deliveryNotes && (
              <p className="mt-1 text-sm">
                <span className="text-muted">Notes:</span> {order.deliveryNotes}
              </p>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
