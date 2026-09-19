import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { CheckCircle2, Clock, Package, Truck, Home, Lock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { settleFromSession } from "@/lib/actions/orders";
import { getSession, isAdminRole } from "@/lib/auth";
import { verifyOrderToken } from "@/lib/tokens";
import { formatMoney, formatDate } from "@/lib/utils";
import { formatStoreDate } from "@/lib/dates";

export const dynamic = "force-dynamic";
export const metadata = { title: "Order confirmation", robots: { index: false, follow: false } };

/**
 * Order numbers carry a predictable timestamp prefix, so the order number alone
 * is not a secret. Access requires one of:
 *   - the Stripe session id the customer was redirected back with,
 *   - the signed token in the confirmation email,
 *   - a signed-in owner (matched on userId, or on a *verified* email),
 *   - an admin.
 */
export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderNumber: string; locale: string }>;
  searchParams: Promise<{ session_id?: string; t?: string }>;
}) {
  const { orderNumber, locale } = await params;
  const { session_id, t } = await searchParams;
  setRequestLocale(locale);
  const fr = locale === "fr";

  let ownsViaSession = false;
  if (session_id) {
    const result = await settleFromSession(orderNumber, session_id);
    ownsViaSession = result.owns;
  }

  let order;
  try {
    order = await prisma.order.findUnique({
      where: { orderNumber },
      include: { items: true, timeline: { orderBy: { createdAt: "asc" } } },
    });
  } catch {
    order = null;
  }

  const session = await getSession();
  const ownsViaToken = await verifyOrderToken(t, orderNumber);
  const ownsViaAccount =
    Boolean(order && session) &&
    (order!.userId === session!.sub ||
      (order!.email === session!.email.toLowerCase() &&
        Boolean(
          await prisma.user
            .findUnique({ where: { id: session!.sub }, select: { emailVerified: true } })
            .then((u) => u?.emailVerified)
            .catch(() => null)
        )));
  const isAdmin = isAdminRole(session?.role);

  const authorized = Boolean(order) && (ownsViaSession || ownsViaToken || ownsViaAccount || isAdmin);

  // The same response whether the order is missing or simply not ours, so this
  // page can't be used to probe which order numbers exist.
  if (!authorized) {
    return (
      <div className="container-x max-w-xl py-24 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cream">
          <Lock className="h-7 w-7 text-muted" />
        </div>
        <h1 className="mt-5 font-display text-3xl">
          {fr ? "Commande introuvable" : "We can't show this order"}
        </h1>
        <p className="mt-3 text-ink-soft">
          {fr
            ? "Pour des raisons de confidentialité, ouvrez le lien figurant dans votre courriel de confirmation, ou connectez-vous au compte utilisé pour la commande."
            : "For privacy, open the link in your confirmation email, or sign in with the account used to place the order."}
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/account/login" className="btn btn-primary">
            {fr ? "Se connecter" : "Sign in"}
          </Link>
          <Link href="/contact" className="btn btn-outline">
            {fr ? "Nous contacter" : "Contact us"}
          </Link>
        </div>
      </div>
    );
  }

  const shipping = order!.shipping as {
    fullName: string;
    line1: string;
    line2?: string;
    city: string;
    province: string;
    postalCode: string;
  };
  const paid = order!.status !== "PENDING" && order!.status !== "CANCELLED";
  const money = (c: number) => formatMoney(c, fr ? "fr-CA" : "en-CA");

  return (
    <div className="container-x max-w-3xl py-16">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-lilac">
          {paid ? (
            <CheckCircle2 className="h-8 w-8 text-violet-deep" />
          ) : (
            <Clock className="h-8 w-8 text-violet" />
          )}
        </div>
        <h1 className="mt-5 font-display text-4xl">
          {paid
            ? fr
              ? "Merci pour votre commande !"
              : "Thank you for your order!"
            : fr
            ? "Commande reçue"
            : "Order received"}
        </h1>
        <p className="mt-2 text-ink-soft">
          {paid
            ? fr
              ? "Nous préparons votre panier avec soin."
              : "We're hand-packing your basket with care."
            : fr
            ? "Votre commande est enregistrée. Le paiement n'a pas encore été prélevé."
            : "Your order is recorded. Payment hasn't been taken yet."}
        </p>
        <p className="mt-1 text-sm text-muted">
          {fr ? "Commande" : "Order"}{" "}
          <span className="font-semibold text-ink">{order!.orderNumber}</span>
        </p>
      </div>

      <div className="mt-10 rounded-lg border border-line bg-white p-6 sm:p-8">
        <ul className="divide-y divide-line">
          {order!.items.map((i) => {
            const cfg = i.customConfig as { items?: { name: string; qty: number }[] } | null;
            return (
              <li key={i.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="text-sm font-medium text-ink">{i.name}</p>
                  {i.variantLabel && <p className="text-xs text-muted">{i.variantLabel}</p>}
                  {i.isCustom && cfg?.items?.length ? (
                    <p className="text-xs text-violet">
                      {cfg.items
                        .map((c) => (c.qty > 1 ? `${c.name} × ${c.qty}` : c.name))
                        .join(", ")}
                    </p>
                  ) : null}
                  {i.giftMessage && (
                    <p className="mt-1 rounded-lg bg-cream px-2 py-1 text-xs italic text-ink-soft">
                      &ldquo;{i.giftMessage}&rdquo;
                    </p>
                  )}
                  <p className="text-xs text-muted">
                    {fr ? "Qté" : "Qty"} {i.quantity}
                  </p>
                </div>
                <span className="text-sm font-semibold">
                  {money(i.unitPriceCents * i.quantity)}
                </span>
              </li>
            );
          })}
        </ul>
        <dl className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">{fr ? "Sous-total" : "Subtotal"}</dt>
            <dd>{money(order!.subtotalCents)}</dd>
          </div>
          {order!.discountCents > 0 && (
            <div className="flex justify-between">
              <dt className="text-muted">{fr ? "Rabais" : "Discount"}</dt>
              <dd className="text-success">−{money(order!.discountCents)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-muted">{fr ? "Livraison" : "Shipping"}</dt>
            <dd>{order!.shippingCents ? money(order!.shippingCents) : fr ? "Gratuite" : "Free"}</dd>
          </div>
          {order!.taxCents > 0 && (
            <div className="flex justify-between">
              <dt className="text-muted">{fr ? "Taxes" : "Tax"}</dt>
              <dd>{money(order!.taxCents)}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-line pt-3 text-base font-semibold">
            <dt>Total</dt>
            <dd>{money(order!.totalCents)}</dd>
          </div>
          {order!.refundedCents > 0 && (
            <div className="flex justify-between text-sm">
              <dt className="text-muted">{fr ? "Remboursé" : "Refunded"}</dt>
              <dd className="text-success">−{money(order!.refundedCents)}</dd>
            </div>
          )}
        </dl>

        <div className="mt-6 grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              {fr ? "Livraison à" : "Delivering to"}
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              {shipping.fullName}
              <br />
              {shipping.line1}
              {shipping.line2 ? `, ${shipping.line2}` : ""}
              <br />
              {shipping.city}, {shipping.province} {shipping.postalCode}
            </p>
            {order!.deliveryDate && (
              <p className="mt-2 text-xs text-muted">
                {fr ? "Date souhaitée" : "Preferred date"}:{" "}
                {formatStoreDate(order!.deliveryDate, fr ? "fr-CA" : "en-CA")}
              </p>
            )}
          </div>
          {order!.giftMessage && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                {fr ? "Message cadeau" : "Gift message"}
              </p>
              <p className="mt-1 rounded-lg bg-cream px-3 py-2 text-sm italic text-ink-soft">
                &ldquo;{order!.giftMessage}&rdquo;
              </p>
            </div>
          )}
        </div>

        {order!.trackingNumber && (
          <div className="mt-5 border-t border-line pt-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              {fr ? "Suivi" : "Tracking"}
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              {order!.carrier} {order!.trackingNumber}
            </p>
            {order!.trackingUrl && (
              <a
                href={order!.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-sm font-medium text-violet hover:underline"
              >
                {fr ? "Suivre ce colis" : "Track this parcel"}
              </a>
            )}
          </div>
        )}
      </div>

      {/* timeline */}
      <div className="mt-8 flex items-center justify-between rounded-lg border border-line bg-cream/50 px-6 py-5">
        {[
          { icon: CheckCircle2, label: fr ? "Confirmée" : "Confirmed", done: paid },
          {
            icon: Package,
            label: fr ? "Préparée" : "Packed",
            done: ["PROCESSING", "FULFILLED", "SHIPPED", "DELIVERED"].includes(order!.status),
          },
          {
            icon: Truck,
            label: fr ? "Expédiée" : "Shipped",
            done: ["SHIPPED", "DELIVERED"].includes(order!.status),
          },
          { icon: Home, label: fr ? "Livrée" : "Delivered", done: order!.status === "DELIVERED" },
        ].map((s, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1.5 text-center">
            <s.icon className={s.done ? "h-5 w-5 text-violet-deep" : "h-5 w-5 text-line-strong"} />
            <span className={s.done ? "text-xs font-medium text-ink" : "text-xs text-muted"}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-4 text-center text-xs text-muted">
        {fr ? "Commandée le" : "Placed"} {formatDate(order!.createdAt, fr ? "fr-CA" : "en-CA")}
      </p>

      <div className="mt-8 text-center">
        <Link href="/baskets" className="btn btn-outline">
          {fr ? "Continuer vos achats" : "Continue shopping"}
        </Link>
      </div>
    </div>
  );
}
