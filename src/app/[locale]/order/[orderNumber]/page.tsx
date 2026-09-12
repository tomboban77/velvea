import { setRequestLocale, getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import { CheckCircle2, Clock, Package, Truck, Home } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { settleFromSession } from "@/lib/actions/orders";
import { formatMoney, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Order confirmation" };

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderNumber: string; locale: string }>;
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { orderNumber, locale } = await params;
  const { session_id } = await searchParams;
  setRequestLocale(locale);

  if (session_id) await settleFromSession(orderNumber, session_id);

  let order;
  try {
    order = await prisma.order.findUnique({
      where: { orderNumber },
      include: { items: true, timeline: { orderBy: { createdAt: "asc" } } },
    });
  } catch {
    order = null;
  }
  if (!order) notFound();

  const shipping = order.shipping as {
    fullName: string; line1: string; line2?: string; city: string; province: string; postalCode: string;
  };
  const paid = order.status !== "PENDING" && order.status !== "CANCELLED";
  const fr = locale === "fr";

  return (
    <div className="container-x max-w-3xl py-16">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-iris-soft">
          {paid ? (
            <CheckCircle2 className="h-8 w-8 text-violet-deep" />
          ) : (
            <Clock className="h-8 w-8 text-violet" />
          )}
        </div>
        <h1 className="mt-5 font-display text-4xl">
          {paid ? (fr ? "Merci pour votre commande !" : "Thank you for your order!") : (fr ? "Commande reçue" : "Order received")}
        </h1>
        <p className="mt-2 text-ink-soft">
          {paid
            ? fr
              ? "Nous préparons votre panier avec soin."
              : "We're hand-packing your basket with care."
            : fr
            ? "Votre commande est enregistrée. Le paiement suivra."
            : "Your order is placed. Payment will follow."}
        </p>
        <p className="mt-1 text-sm text-muted">
          {fr ? "Commande" : "Order"} <span className="font-semibold text-ink">{order.orderNumber}</span>
        </p>
      </div>

      <div className="mt-10 rounded-[1.75rem] border border-line bg-shell p-6 sm:p-8">
        <ul className="divide-y divide-line">
          {order.items.map((i) => (
            <li key={i.id} className="flex items-center justify-between gap-4 py-3">
              <div>
                <p className="text-sm font-medium text-ink">{i.name}</p>
                {i.variantLabel && <p className="text-xs text-muted">{i.variantLabel}</p>}
                <p className="text-xs text-muted">{fr ? "Qté" : "Qty"} {i.quantity}</p>
              </div>
              <span className="text-sm font-semibold">{formatMoney(i.unitPriceCents * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
          <div className="flex justify-between"><dt className="text-muted">{fr ? "Sous-total" : "Subtotal"}</dt><dd>{formatMoney(order.subtotalCents)}</dd></div>
          {order.discountCents > 0 && (
            <div className="flex justify-between"><dt className="text-muted">{fr ? "Rabais" : "Discount"}</dt><dd className="text-success">−{formatMoney(order.discountCents)}</dd></div>
          )}
          <div className="flex justify-between"><dt className="text-muted">{fr ? "Livraison" : "Shipping"}</dt><dd>{order.shippingCents ? formatMoney(order.shippingCents) : (fr ? "Gratuite" : "Free")}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">{fr ? "Taxes" : "Tax"}</dt><dd>{formatMoney(order.taxCents)}</dd></div>
          <div className="flex justify-between border-t border-line pt-3 text-base font-semibold"><dt>Total</dt><dd>{formatMoney(order.totalCents)}</dd></div>
        </dl>

        <div className="mt-6 grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">{fr ? "Livraison à" : "Delivering to"}</p>
            <p className="mt-1 text-sm text-ink-soft">
              {shipping.fullName}<br />{shipping.line1}{shipping.line2 ? `, ${shipping.line2}` : ""}<br />
              {shipping.city}, {shipping.province} {shipping.postalCode}
            </p>
          </div>
          {order.giftMessage && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">{fr ? "Message cadeau" : "Gift message"}</p>
              <p className="mt-1 rounded-xl bg-cream px-3 py-2 text-sm italic text-ink-soft">&ldquo;{order.giftMessage}&rdquo;</p>
            </div>
          )}
        </div>
      </div>

      {/* timeline */}
      <div className="mt-8 flex items-center justify-between rounded-2xl border border-line bg-cream/50 px-6 py-5">
        {[
          { icon: CheckCircle2, label: fr ? "Confirmée" : "Confirmed", done: true },
          { icon: Package, label: fr ? "Préparée" : "Packed", done: ["PROCESSING","FULFILLED","SHIPPED","DELIVERED"].includes(order.status) },
          { icon: Truck, label: fr ? "Expédiée" : "Shipped", done: ["SHIPPED","DELIVERED"].includes(order.status) },
          { icon: Home, label: fr ? "Livrée" : "Delivered", done: order.status === "DELIVERED" },
        ].map((s, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1.5 text-center">
            <s.icon className={s.done ? "h-5 w-5 text-violet-deep" : "h-5 w-5 text-line-strong"} />
            <span className={s.done ? "text-xs font-medium text-ink" : "text-xs text-muted"}>{s.label}</span>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link href="/baskets" className="btn btn-outline">{fr ? "Continuer vos achats" : "Continue shopping"}</Link>
      </div>
    </div>
  );
}
