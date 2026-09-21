"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { Lock, Truck, Clock, MapPin, Store, Tag, Check, Loader2, ShoppingBag, Gift, AlertTriangle } from "lucide-react";
import { useCart, lineUnitCents } from "@/components/cart/CartProvider";
import { createCheckout, validateDiscountCode, type CartChange } from "@/lib/actions/checkout";
import { quoteDelivery, type DeliveryQuote } from "@/lib/actions/delivery";
import { Honeypot } from "@/components/ui/Honeypot";
import { formatMoney, cn } from "@/lib/utils";
import type { SavedAddress } from "@/lib/addresses";
import type { DeliveryMethod } from "@prisma/client";

export type StudioAddress = {
  addressLine: string;
  city: string;
  province: string;
  postalCode: string;
};

/** The signed-in customer, used only to prefill; guests get `null`. */
export type CheckoutCustomer = {
  email: string;
  name: string;
  phone: string;
  addresses: SavedAddress[];
};

/** Copy a saved address into the delivery fields. */
function addressFields(a: SavedAddress) {
  return {
    fullName: a.fullName,
    line1: a.line1,
    line2: a.line2 ?? "",
    city: a.city,
    postalCode: a.postalCode,
  };
}

function addressSummary(a: SavedAddress): string {
  const where = `${a.line1}, ${a.city}`;
  return a.label ? `${a.label} — ${where}` : `${a.fullName} — ${where}`;
}

const ICONS: Record<DeliveryMethod, React.ComponentType<{ className?: string }>> = {
  PICKUP: Store,
  LOCAL_SAMEDAY: Clock,
  LOCAL_STANDARD: MapPin,
  SHIPPING: Truck,
};

export function CheckoutForm({
  studio,
  customer = null,
}: {
  /** Where pickup orders are collected, and the address recorded against them. */
  studio: StudioAddress;
  customer?: CheckoutCustomer | null;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const fr = locale === "fr";
  const router = useRouter();
  const { items, subtotalCents, clear } = useCart();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [changes, setChanges] = useState<CartChange[]>([]);
  const [company, setCompany] = useState("");

  const saved = customer?.addresses ?? [];
  const defaultSaved = saved.find((a) => a.isDefault) ?? null;

  const [f, setF] = useState({
    email: customer?.email ?? "",
    phone: customer?.phone ?? "",
    // The default saved address wins; otherwise the profile name is a fair
    // guess at who is receiving it, and the customer can overtype either.
    fullName: customer?.name ?? "",
    line1: "",
    line2: "",
    city: "",
    postalCode: "",
    ...(defaultSaved ? addressFields(defaultSaved) : {}),
    giftMessage: "",
    deliveryDate: "",
    deliveryNotes: "",
  });
  // "" means the customer is typing an address rather than using a saved one.
  const [savedId, setSavedId] = useState(defaultSaved?.id ?? "");
  const [method, setMethod] = useState<DeliveryMethod | null>(null);
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState<{ label: string; cents: number; freeShip: boolean } | null>(null);
  const [codeMsg, setCodeMsg] = useState<string | null>(null);
  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));

  function chooseSaved(id: string) {
    setSavedId(id);
    const a = saved.find((x) => x.id === id);
    if (!a) return;
    setF((p) => ({ ...p, ...addressFields(a), phone: a.phone || p.phone }));
  }

  // --- Delivery quote ------------------------------------------------------
  // Rates, eligibility and tax all come from the server, computed by the same
  // code that will charge the card. The browser deliberately holds no copy of
  // the rules: the previous version previewed from a hardcoded settings block,
  // so editing a fee in the admin left this page quoting the old number.
  const [quote, setQuote] = useState<DeliveryQuote | null>(null);
  const [quoting, setQuoting] = useState(false);

  const itemCount = useMemo(() => items.reduce((n, i) => n + i.quantity, 0), [items]);
  const productKey = useMemo(
    () => items.map((i) => i.productId).filter(Boolean).join(","),
    [items]
  );
  // Add-on ids out of any custom baskets, so the quote can warn about a
  // custom build that cannot be shipped just as it does for a catalogue one.
  const addonKey = useMemo(
    () =>
      [
        ...new Set(
          items.flatMap((i) => {
            const cfg = i.customConfig as { itemIds?: unknown } | undefined;
            return Array.isArray(cfg?.itemIds)
              ? (cfg.itemIds as unknown[]).filter((v): v is string => typeof v === "string")
              : [];
          })
        ),
      ].join(","),
    [items]
  );

  // Ignore a slow reply that lands after a newer one.
  const seq = useRef(0);

  useEffect(() => {
    // Quoted even with an empty postal code: pickup does not depend on where
    // the customer lives, so it has to be offered before they have typed an
    // address. The server returns it alongside the "enter a postal code" note.
    const postal = f.postalCode.trim();
    const mine = ++seq.current;
    setQuoting(true);
    const id = setTimeout(async () => {
      try {
        const res = await quoteDelivery({
          postalCode: postal,
          subtotalCents,
          itemCount,
          productIds: productKey ? productKey.split(",") : [],
          builderItemIds: addonKey ? addonKey.split(",") : [],
          locale: locale === "fr" ? "fr" : "en",
        });
        if (mine === seq.current) setQuote(res);
      } catch {
        if (mine === seq.current) setQuote(null);
      } finally {
        if (mine === seq.current) setQuoting(false);
      }
    }, 400);
    return () => clearTimeout(id);
  }, [f.postalCode, subtotalCents, itemCount, productKey, addonKey, locale]);

  // Memoized: the `?? []` fallback would otherwise be a new array identity on
  // every render, re-running the selection effect below in a loop.
  const EMPTY: DeliveryQuote["options"] = useMemo(() => [], []);
  const options = quote?.options ?? EMPTY;

  // Keep the selection valid: if the address moves to a zone where the chosen
  // method no longer exists, fall to the first one that does rather than
  // submitting something the server will reject.
  //
  // Pickup is never auto-selected. It is offered from the first render, before
  // any address exists, and quietly selecting it would swap the delivery
  // address fields out from under someone who has not chosen it.
  useEffect(() => {
    const deliverable = options.filter((o) => o.method !== "PICKUP");
    setMethod((current) => {
      if (current && options.some((o) => o.method === current)) return current;
      return deliverable[0]?.method ?? null;
    });
  }, [options]);

  const selected = options.find((o) => o.method === method) ?? null;
  const isPickup = method === "PICKUP";

  const totals = useMemo(() => {
    const discountCents = discount?.cents ?? 0;
    const baseFee = selected?.feeCents ?? 0;
    const shippingCents = discount?.freeShip ? 0 : baseFee;
    const rate = quote?.ok ? quote.taxRate : 0;
    const taxable = Math.max(0, subtotalCents - discountCents) + shippingCents;
    const taxCents = Math.round((taxable * rate) / 100);
    const totalCents = Math.max(0, subtotalCents - discountCents) + shippingCents + taxCents;
    return { discountCents, shippingCents, taxCents, totalCents, rate };
  }, [selected, subtotalCents, discount, quote]);

  const blockedItems = quote?.ok ? quote.unshippable : [];
  const shippingBlocked = method === "SHIPPING" && blockedItems.length > 0;
  const canSubmit = Boolean(method) && !shippingBlocked;

  async function applyCode() {
    setCodeMsg(null);
    if (!code) return;
    const res = await validateDiscountCode(code, subtotalCents, locale === "fr" ? "fr" : "en");
    if (res.valid) {
      setDiscount({
        label: res.label!,
        cents: res.discountCents ?? 0,
        freeShip: Boolean(res.freeShipping),
      });
      setCodeMsg(res.label!);
    } else {
      setDiscount(null);
      setCodeMsg(
        res.reason
          ? `${fr ? "Non appliqué" : "Not applied"}: ${res.reason}`
          : fr
          ? "Code non valide"
          : "Code not valid"
      );
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setChanges([]);
    if (!method) {
      setError(
        fr
          ? "Entrez un code postal pour voir les options de livraison."
          : "Enter a postal code to see delivery options."
      );
      return;
    }
    // A pickup order is collected here, so the studio is the address recorded
    // against it — asking the customer to type a delivery address for
    // something they are coming to fetch only invites a wrong one.
    const address = isPickup
      ? {
          line1: studio.addressLine,
          line2: "",
          city: studio.city,
          province: studio.province,
          postalCode: studio.postalCode,
        }
      : {
          line1: f.line1,
          line2: f.line2,
          city: f.city,
          // Derived from the postal code server-side; this is only a hint.
          province: (quote?.ok && quote.province) || "ON",
          postalCode: f.postalCode,
        };
    startTransition(async () => {
      // A thrown action (network drop, server crash) would otherwise leave the
      // button spinning with no message; only a *returned* error is handled below.
      let res: Awaited<ReturnType<typeof createCheckout>>;
      try {
        res = await createCheckout({
          email: f.email,
          phone: f.phone,
          deliveryMethod: method,
          shipping: {
            fullName: f.fullName,
            ...address,
            country: "CA",
            phone: f.phone,
          },
          giftMessage: f.giftMessage,
          deliveryDate: f.deliveryDate,
          deliveryNotes: f.deliveryNotes,
          discountCode: discount ? code : "",
          locale: locale === "fr" ? "fr" : "en",
          company,
          items: items.map((i) => ({
            giftMessage: i.giftMessage,
            premiumCard: i.premiumCard,
            cardFeeCents: i.cardFeeCents,
            productId: i.productId,
            variantId: i.variantId,
            slug: i.slug,
            name: i.name,
            unitPriceCents: i.unitPriceCents,
            quantity: i.quantity,
            isCustom: i.isCustom,
            customConfig: i.customConfig,
            image: i.image,
          })),
        });
      } catch {
        setError(
          fr
            ? "Impossible de lancer le paiement pour le moment. Veuillez réessayer."
            : "We couldn't start the payment right now. Please try again."
        );
        return;
      }

      if (!res.ok) {
        setError(res.error);
        // Anything that changed under the customer is listed rather than
        // quietly applied, so the total on screen is the total charged.
        setChanges(res.changes ?? []);
        return;
      }
      if (res.mode === "stripe") {
        window.location.href = res.url;
      } else {
        clear();
        // The confirmation page is gated, so carry the signed token across.
        router.push(`/order/${res.orderNumber}?t=${encodeURIComponent(res.token)}`);
      }
    });
  }

  if (items.length === 0) {
    return (
      <div className="container-x py-24 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cream">
          <ShoppingBag className="h-7 w-7 text-muted" />
        </div>
        <h1 className="mt-5 font-display text-3xl">{fr ? "Votre sac est vide" : "Your bag is empty"}</h1>
        <Link href="/baskets" className="btn btn-primary mt-6">
          {t("common.shopGiftBaskets")}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="container-x relative grid gap-10 py-12 lg:grid-cols-[1.3fr_1fr]">
      <Honeypot value={company} onChange={setCompany} />
      {/* left: form */}
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-4xl">{t("common.checkout")}</h1>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-muted">
            <Lock className="h-3.5 w-3.5" /> {fr ? "Paiement sécurisé · CAD" : "Secure checkout · CAD"}
          </p>
        </div>

        <Section title="Contact">
          <div className="grid gap-3 sm:grid-cols-2">
            <input required type="email" id="checkout-email" autoComplete="email"
              placeholder={fr ? "Courriel" : "Email"} aria-label={fr ? "Courriel" : "Email"} className="field"
              value={f.email} onChange={(e) => set("email", e.target.value)} />
            <input id="checkout-phone" type="tel" autoComplete="tel"
              placeholder={fr ? "Téléphone (pour la livraison)" : "Phone (for delivery)"}
              aria-label={fr ? "Téléphone (pour la livraison)" : "Phone (for delivery)"} className="field"
              value={f.phone} onChange={(e) => set("phone", e.target.value)} />
          </div>
        </Section>

        <Section
          title={
            isPickup
              ? fr ? "Qui vient chercher la commande" : "Who is collecting"
              : fr ? "Adresse de livraison" : "Delivery address"
          }
        >
          <div className="space-y-3">
            {!isPickup && saved.length > 0 && (
              <div>
                <label className="label" htmlFor="saved-address">
                  {fr ? "Adresse enregistrée" : "Saved address"}
                </label>
                <select
                  id="saved-address"
                  className="field"
                  value={savedId}
                  onChange={(e) => chooseSaved(e.target.value)}
                >
                  <option value="">
                    {fr ? "Entrer une autre adresse" : "Enter a different address"}
                  </option>
                  {saved.map((a) => (
                    <option key={a.id} value={a.id}>
                      {addressSummary(a)}
                      {a.isDefault ? (fr ? " (par défaut)" : " (default)") : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <input required id="checkout-full-name" autoComplete="name"
              placeholder={fr ? "Nom complet du destinataire" : "Recipient full name"}
              aria-label={fr ? "Nom complet du destinataire" : "Recipient full name"} className="field"
              value={f.fullName} onChange={(e) => set("fullName", e.target.value)} />
            {isPickup ? (
              <div className="rounded-lg border border-line bg-cream/50 px-4 py-3 text-sm">
                <p className="font-medium text-ink">{fr ? "À récupérer à notre atelier" : "Collect from our studio"}</p>
                <p className="mt-0.5 text-muted">
                  {studio.addressLine}, {studio.city}, {studio.province} {studio.postalCode}
                </p>
              </div>
            ) : (
              <>
                <input required id="checkout-line1" autoComplete="address-line1"
                  placeholder={fr ? "Adresse" : "Street address"} aria-label={fr ? "Adresse" : "Street address"} className="field"
                  value={f.line1} onChange={(e) => set("line1", e.target.value)} />
                <input id="checkout-line2" autoComplete="address-line2"
                  placeholder={fr ? "Appartement, bureau (facultatif)" : "Apartment, suite (optional)"}
                  aria-label={fr ? "Appartement, bureau (facultatif)" : "Apartment, suite (optional)"} className="field"
                  value={f.line2} onChange={(e) => set("line2", e.target.value)} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <input required id="checkout-city" autoComplete="address-level2"
                    placeholder={fr ? "Ville" : "City"} aria-label={fr ? "Ville" : "City"} className="field"
                    value={f.city} onChange={(e) => set("city", e.target.value)} />
                  {/* No province selector: the postal code already determines
                      it, and a dropdown that can disagree with the address is
                      how an order to Toronto got taxed at another province's
                      rate. */}
                  <input required id="checkout-postal-code" autoComplete="postal-code"
                    placeholder={fr ? "Code postal" : "Postal code"} aria-label={fr ? "Code postal" : "Postal code"} className="field uppercase"
                    value={f.postalCode} onChange={(e) => set("postalCode", e.target.value)} />
                </div>
              </>
            )}
          </div>
        </Section>

        <Section title={fr ? "Mode de livraison" : "Delivery method"}>
          {/* Always render the postal-code field above, even for pickup, so the
              customer can switch back without the options vanishing. */}
          {isPickup && (
            <div className="mb-3">
              <label className="label" htmlFor="pickup-postal-code">
                {fr ? "Code postal (pour les options de livraison)" : "Postal code (for delivery options)"}
              </label>
              <input id="pickup-postal-code" autoComplete="postal-code"
                placeholder={fr ? "Code postal" : "Postal code"} className="field uppercase"
                value={f.postalCode} onChange={(e) => set("postalCode", e.target.value)} />
            </div>
          )}

          {options.length === 0 ? (
            <div className="rounded-lg border border-dashed border-line px-4 py-6 text-center text-sm text-muted">
              {quoting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />{" "}
                  {fr ? "Vérification de votre adresse…" : "Checking your address…"}
                </span>
              ) : quote && !quote.ok ? (
                quote.message
              ) : fr ? (
                "Entrez un code postal pour voir les options et les tarifs de livraison."
              ) : (
                "Enter a postal code to see delivery options and pricing."
              )}
            </div>
          ) : (
            <div className="space-y-2.5">
              {options.map((o) => (
                <MethodOption
                  key={o.method}
                  active={method === o.method}
                  onClick={() => setMethod(o.method)}
                  icon={ICONS[o.method]}
                  title={o.label}
                  sub={o.sub}
                  price={o.feeCents}
                />
              ))}
            </div>
          )}

          {quote?.ok ? (
            <p className="mt-2 text-xs text-muted">
              {fr ? "Livraison vers" : "Delivering to"} {quote.zoneName}
              {quoting && (fr ? " · mise à jour…" : " · updating…")}
            </p>
          ) : (
            quote && (
              <p className="mt-2 text-xs text-muted">
                {quoting ? (fr ? "Vérification de votre adresse…" : "Checking your address…") : quote.message}
              </p>
            )
          )}

          {blockedItems.length > 0 && (
            <p
              className={cn(
                "mt-2 flex items-start gap-1.5 text-xs",
                shippingBlocked ? "text-danger" : "text-muted"
              )}
            >
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                {fr
                  ? `${blockedItems.join(", ")} ${blockedItems.length > 1 ? "sont trop périssables pour être expédiés" : "est trop périssable pour être expédié"}. Choisissez la livraison locale ou le ramassage.`
                  : `${blockedItems.join(", ")} ${blockedItems.length > 1 ? "are" : "is"} too perishable to ship. Choose local delivery or pickup.`}
              </span>
            </p>
          )}
        </Section>

        <Section title={fr ? "Options cadeau" : "Gift options"}>
          {items.some((i) => i.giftMessage) && (
            <p className="mb-2 text-xs text-muted">
              {fr
                ? "Les paniers qui ont déjà leur propre message le conservent. Celui-ci s'applique aux autres."
                : "Baskets with their own card message keep it. This one covers anything without."}
            </p>
          )}
          <textarea rows={3} id="checkout-gift-message"
            placeholder={fr ? "Ajoutez un message-cadeau (imprimé sur une carte)…" : "Add a gift message (printed on a card)…"}
            aria-label={fr ? "Message-cadeau" : "Gift message"} className="field resize-y"
            value={f.giftMessage} onChange={(e) => set("giftMessage", e.target.value)} />
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="checkout-delivery-date">
                {fr ? "Date de livraison souhaitée" : "Preferred delivery date"}
              </label>
              <input type="date" id="checkout-delivery-date" className="field"
                value={f.deliveryDate} onChange={(e) => set("deliveryDate", e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="checkout-delivery-notes">
                {fr ? "Consignes de livraison" : "Delivery notes"}
              </label>
              <input id="checkout-delivery-notes"
                placeholder={fr ? "Code d'interphone, laisser à la porte…" : "Buzz code, leave at door…"} className="field"
                value={f.deliveryNotes} onChange={(e) => set("deliveryNotes", e.target.value)} />
            </div>
          </div>
        </Section>
      </div>

      {/* right: summary */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-lg border border-line bg-white p-6">
          <h2 className="font-display text-xl">{fr ? "Résumé de la commande" : "Order summary"}</h2>
          <ul className="mt-4 divide-y divide-line">
            {items.map((i) => (
              <li key={i.id} className="flex gap-3 py-3">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-cream">
                  {i.image ? (
                    <Image src={i.image} alt="" fill sizes="64px" className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Gift className="h-5 w-5 text-line-strong" />
                    </div>
                  )}
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[0.6rem] font-bold text-canvas">
                    {i.quantity}
                  </span>
                </div>
                <div className="flex flex-1 flex-col">
                  <p className="text-sm font-medium leading-snug text-ink">{i.name}</p>
                  {i.variantLabel && <p className="text-xs text-muted">{i.variantLabel}</p>}
                  {i.giftMessage && (
                    <p className="mt-1 line-clamp-2 text-[0.7rem] italic text-muted">
                      &ldquo;{i.giftMessage}&rdquo;
                    </p>
                  )}
                  {i.premiumCard && (
                    <p className="mt-1 text-[0.7rem] text-violet">
                      {fr ? "Carte de vœux premium" : "Premium greeting card"}
                      {i.cardFeeCents ? ` · +${formatMoney(i.cardFeeCents)}` : ""}
                    </p>
                  )}
                  <span className="mt-auto text-sm font-semibold">
                    {formatMoney(lineUnitCents(i) * i.quantity)}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          {/* discount */}
          <div className="mt-4 flex gap-2">
            <div className="relative flex-1">
              <Tag className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input id="checkout-discount-code"
                placeholder={fr ? "Code promo" : "Discount code"} aria-label={fr ? "Code promo" : "Discount code"} className="field pl-9 uppercase"
                value={code} onChange={(e) => setCode(e.target.value)} />
            </div>
            <button type="button" onClick={applyCode} className="btn btn-outline btn-sm">
              {fr ? "Appliquer" : "Apply"}
            </button>
          </div>
          {codeMsg && (
            <p className={cn("mt-2 flex items-center gap-1.5 text-xs", discount ? "text-success" : "text-danger")}>
              {discount && <Check className="h-3.5 w-3.5" />} {codeMsg}
            </p>
          )}

          <dl className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
            <Row label={fr ? "Sous-total" : "Subtotal"} value={formatMoney(subtotalCents)} />
            {totals.discountCents > 0 && (
              <Row label={fr ? "Rabais" : "Discount"} value={`−${formatMoney(totals.discountCents)}`} accent />
            )}
            <Row
              label={isPickup ? (fr ? "Ramassage" : "Pickup") : fr ? "Livraison" : "Delivery"}
              value={totals.shippingCents ? formatMoney(totals.shippingCents) : fr ? "Gratuit" : "Free"}
            />
            {/* Hidden while the rate is zero. A "Tax $0.00" line on a receipt
                reads as an error, and we are not registered to charge it. */}
            {totals.rate > 0 && (
              <Row label={fr ? `Taxes (${totals.rate} %)` : `Tax (${totals.rate}%)`} value={formatMoney(totals.taxCents)} />
            )}
          </dl>
          <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
            <span className="font-display text-lg">Total</span>
            <span className="font-display text-2xl">{formatMoney(totals.totalCents)}</span>
          </div>

          {error && (
            <div className="mt-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
              <p className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </p>
              {changes.length > 0 && (
                <ul className="mt-2 space-y-1 border-t border-danger/20 pt-2 text-xs">
                  {changes.map((c, i) => (
                    <li key={i}>
                      <span className="font-semibold">{c.subject}</span> &mdash; {c.message}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Final-sale disclosure sits above the pay button so it is read before
              payment, which is what Ontario's consumer-protection rules expect. */}
          <div className="mt-5 rounded-md border border-line bg-cream/50 px-4 py-3 text-xs leading-relaxed text-ink-soft">
            <p className="font-semibold text-ink">
              {locale === "fr" ? "Toutes les ventes sont finales." : "All sales are final."}
            </p>
            <p className="mt-1">
              {locale === "fr"
                ? "Nos paniers sont périssables et préparés à la commande : aucun retour, échange, annulation ni remboursement pour changement d'avis. Si votre panier arrive endommagé ou ne correspond pas à votre commande, écrivez-nous dans les 48 heures et nous y remédierons."
                : "Our baskets are perishable and packed to order, so there are no returns, exchanges, cancellations or change-of-mind refunds. If your basket arrives damaged or not as ordered, write to us within 48 hours and we will make it right."}
            </p>
            <p className="mt-2 text-muted">
              {locale === "fr" ? "En passant cette commande, vous acceptez nos " : "By placing this order you agree to our "}
              <Link href="/terms" className="underline hover:text-violet-deep">
                {locale === "fr" ? "conditions d'utilisation" : "Terms of Service"}
              </Link>
              {locale === "fr" ? " et notre " : " and "}
              <Link href="/privacy" className="underline hover:text-violet-deep">
                {locale === "fr" ? "politique de confidentialité" : "Privacy Policy"}
              </Link>
              .
            </p>
          </div>

          <button
            type="submit"
            disabled={pending || !canSubmit}
            className="btn btn-gold btn-lg mt-4 w-full disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
            {pending
              ? fr ? "Traitement…" : "Processing…"
              : !method
              ? fr ? "Entrez un code postal" : "Enter a postal code"
              : shippingBlocked
              ? fr ? "Choisissez la livraison locale ou le ramassage" : "Choose local delivery or pickup"
              : fr
              ? `Payer ${formatMoney(totals.totalCents)}`
              : `Pay ${formatMoney(totals.totalCents)}`}
          </button>
          <p className="mt-3 text-center text-xs text-muted">
            {fr
              ? "Les taxes et la livraison sont finalisées sur cette page. Vous pouvez tout vérifier avant de payer."
              : "Taxes and delivery are finalized on this page. You can review everything before paying."}
          </p>
        </div>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 font-display text-xl">{title}</h2>
      {children}
    </section>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted">{label}</dt>
      <dd className={accent ? "font-medium text-success" : "text-ink"}>{value}</dd>
    </div>
  );
}

function MethodOption({
  active,
  onClick,
  icon: Icon,
  title,
  sub,
  price,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  sub: string;
  price: number;
}) {
  const fr = useLocale() === "fr";
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors",
        active ? "border-ink bg-cream/60" : "border-line hover:border-line-strong"
      )}
    >
      <span className={cn("flex h-9 w-9 items-center justify-center rounded-full", active ? "bg-ink text-canvas" : "bg-cream text-ink-soft")}>
        <Icon className="h-4 w-4" />
      </span>
      <span className="flex-1">
        <span className="block text-sm font-semibold text-ink">{title}</span>
        <span className="block text-xs text-muted">{sub}</span>
      </span>
      <span className="text-sm font-semibold text-ink">{price ? formatMoney(price) : fr ? "Gratuit" : "Free"}</span>
    </button>
  );
}
