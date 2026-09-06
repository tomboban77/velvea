"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { Lock, Truck, Clock, MapPin, Tag, Check, Loader2, ShoppingBag, Gift } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { createCheckout, validateDiscountCode } from "@/lib/actions/checkout";
import {
  CLIENT_SETTINGS,
  previewTaxRate,
  isGtaClient,
  PROVINCES,
} from "@/lib/settings-client";
import { formatMoney, cn } from "@/lib/utils";

type Method = "SHIPPING" | "LOCAL_SAMEDAY" | "LOCAL_STANDARD";

export function CheckoutForm() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const { items, subtotalCents, clear } = useCart();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [f, setF] = useState({
    email: "",
    phone: "",
    fullName: "",
    line1: "",
    line2: "",
    city: "",
    province: "ON",
    postalCode: "",
    giftMessage: "",
    deliveryDate: "",
    deliveryNotes: "",
  });
  const [method, setMethod] = useState<Method>("SHIPPING");
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState<{ label: string; cents: number; freeShip: boolean } | null>(null);
  const [codeMsg, setCodeMsg] = useState<string | null>(null);
  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));

  const gta = isGtaClient(f.city);

  const totals = useMemo(() => {
    const discountCents = discount?.cents ?? 0;
    let shippingCents = 0;
    if (method === "LOCAL_SAMEDAY") shippingCents = CLIENT_SETTINGS.localSameDayFeeCents;
    else if (method === "LOCAL_STANDARD") shippingCents = CLIENT_SETTINGS.localStandardFeeCents;
    else {
      const free = discount?.freeShip || subtotalCents >= CLIENT_SETTINGS.freeShippingThresholdCents;
      shippingCents = free ? 0 : CLIENT_SETTINGS.standardShippingCents;
    }
    const rate = previewTaxRate(f.province);
    const taxable = Math.max(0, subtotalCents - discountCents) + shippingCents;
    const taxCents = Math.round((taxable * rate) / 100);
    const totalCents = Math.max(0, subtotalCents - discountCents) + shippingCents + taxCents;
    return { discountCents, shippingCents, taxCents, totalCents, rate };
  }, [method, subtotalCents, discount, f.province]);

  async function applyCode() {
    setCodeMsg(null);
    if (!code) return;
    const res = await validateDiscountCode(code, subtotalCents);
    if (res.valid) {
      setDiscount({ label: res.label!, cents: res.discountCents ?? 0, freeShip: (res.discountCents ?? 0) === 0 && res.label === "Free shipping" });
      setCodeMsg(res.label!);
    } else {
      setDiscount(null);
      setCodeMsg(res.reason ? `Not applied: ${res.reason}` : "Code not valid");
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await createCheckout({
        email: f.email,
        phone: f.phone,
        deliveryMethod: method,
        shipping: {
          fullName: f.fullName,
          line1: f.line1,
          line2: f.line2,
          city: f.city,
          province: f.province,
          postalCode: f.postalCode,
          country: "CA",
          phone: f.phone,
        },
        giftMessage: f.giftMessage,
        deliveryDate: f.deliveryDate,
        deliveryNotes: f.deliveryNotes,
        discountCode: discount ? code : "",
        locale,
        items: items.map((i) => ({
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

      if (!res.ok) {
        setError(res.error);
        return;
      }
      if (res.mode === "stripe") {
        window.location.href = res.url;
      } else {
        clear();
        router.push(`/order/${res.orderNumber}`);
      }
    });
  }

  if (items.length === 0) {
    return (
      <div className="container-x py-24 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cream">
          <ShoppingBag className="h-7 w-7 text-muted" />
        </div>
        <h1 className="mt-5 font-display text-3xl">Your bag is empty</h1>
        <Link href="/baskets" className="btn btn-primary mt-6">
          {t("common.shopGiftBaskets")}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="container-x grid gap-10 py-12 lg:grid-cols-[1.3fr_1fr]">
      {/* left: form */}
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-4xl">{t("common.checkout")}</h1>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-muted">
            <Lock className="h-3.5 w-3.5" /> Secure checkout · CAD
          </p>
        </div>

        <Section title="Contact">
          <div className="grid gap-3 sm:grid-cols-2">
            <input required type="email" placeholder="Email" className="field"
              value={f.email} onChange={(e) => set("email", e.target.value)} />
            <input placeholder="Phone (for delivery)" className="field"
              value={f.phone} onChange={(e) => set("phone", e.target.value)} />
          </div>
        </Section>

        <Section title="Delivery address">
          <div className="space-y-3">
            <input required placeholder="Recipient full name" className="field"
              value={f.fullName} onChange={(e) => set("fullName", e.target.value)} />
            <input required placeholder="Street address" className="field"
              value={f.line1} onChange={(e) => set("line1", e.target.value)} />
            <input placeholder="Apartment, suite (optional)" className="field"
              value={f.line2} onChange={(e) => set("line2", e.target.value)} />
            <div className="grid gap-3 sm:grid-cols-3">
              <input required placeholder="City" className="field"
                value={f.city} onChange={(e) => set("city", e.target.value)} />
              <select className="field" value={f.province} onChange={(e) => set("province", e.target.value)}>
                {PROVINCES.map((p) => (
                  <option key={p.code} value={p.code}>{p.code}</option>
                ))}
              </select>
              <input required placeholder="Postal code" className="field"
                value={f.postalCode} onChange={(e) => set("postalCode", e.target.value)} />
            </div>
          </div>
        </Section>

        <Section title="Delivery method">
          <div className="space-y-2.5">
            {gta && (
              <MethodOption
                active={method === "LOCAL_SAMEDAY"}
                onClick={() => setMethod("LOCAL_SAMEDAY")}
                icon={Clock}
                title="Same-day (GTA)"
                sub={`Order by ${CLIENT_SETTINGS.sameDayCutoff} · eligible orders`}
                price={CLIENT_SETTINGS.localSameDayFeeCents}
              />
            )}
            {gta && (
              <MethodOption
                active={method === "LOCAL_STANDARD"}
                onClick={() => setMethod("LOCAL_STANDARD")}
                icon={MapPin}
                title="Local delivery (GTA)"
                sub="Next available day"
                price={CLIENT_SETTINGS.localStandardFeeCents}
              />
            )}
            <MethodOption
              active={method === "SHIPPING"}
              onClick={() => setMethod("SHIPPING")}
              icon={Truck}
              title="Canada-wide shipping"
              sub={
                subtotalCents >= CLIENT_SETTINGS.freeShippingThresholdCents
                  ? "Free shipping unlocked"
                  : `Free over ${formatMoney(CLIENT_SETTINGS.freeShippingThresholdCents)}`
              }
              price={
                subtotalCents >= CLIENT_SETTINGS.freeShippingThresholdCents
                  ? 0
                  : CLIENT_SETTINGS.standardShippingCents
              }
            />
          </div>
          {!gta && f.city && (
            <p className="mt-2 text-xs text-muted">
              Same-day is available in Mississauga and the GTA. We&apos;ll ship your order Canada-wide.
            </p>
          )}
        </Section>

        <Section title="Gift options">
          <textarea rows={3} placeholder="Add a gift message (printed on a card)…" className="field resize-y"
            value={f.giftMessage} onChange={(e) => set("giftMessage", e.target.value)} />
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Preferred delivery date</label>
              <input type="date" className="field"
                value={f.deliveryDate} onChange={(e) => set("deliveryDate", e.target.value)} />
            </div>
            <div>
              <label className="label">Delivery notes</label>
              <input placeholder="Buzz code, leave at door…" className="field"
                value={f.deliveryNotes} onChange={(e) => set("deliveryNotes", e.target.value)} />
            </div>
          </div>
        </Section>
      </div>

      {/* right: summary */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-[1.75rem] border border-line bg-shell p-6">
          <h2 className="font-display text-xl">Order summary</h2>
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
                  <span className="mt-auto text-sm font-semibold">
                    {formatMoney(i.unitPriceCents * i.quantity)}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          {/* discount */}
          <div className="mt-4 flex gap-2">
            <div className="relative flex-1">
              <Tag className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input placeholder="Discount code" className="field pl-9 uppercase"
                value={code} onChange={(e) => setCode(e.target.value)} />
            </div>
            <button type="button" onClick={applyCode} className="btn btn-outline btn-sm">
              Apply
            </button>
          </div>
          {codeMsg && (
            <p className={cn("mt-2 flex items-center gap-1.5 text-xs", discount ? "text-success" : "text-danger")}>
              {discount && <Check className="h-3.5 w-3.5" />} {codeMsg}
            </p>
          )}

          <dl className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
            <Row label="Subtotal" value={formatMoney(subtotalCents)} />
            {totals.discountCents > 0 && (
              <Row label="Discount" value={`−${formatMoney(totals.discountCents)}`} accent />
            )}
            <Row label="Shipping" value={totals.shippingCents ? formatMoney(totals.shippingCents) : "Free"} />
            <Row label={`Tax (${totals.rate}%)`} value={formatMoney(totals.taxCents)} />
          </dl>
          <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
            <span className="font-display text-lg">Total</span>
            <span className="font-display text-2xl">{formatMoney(totals.totalCents)}</span>
          </div>

          {error && <p className="mt-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

          <button type="submit" disabled={pending} className="btn btn-gold btn-lg mt-5 w-full">
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
            {pending ? "Processing…" : `Pay ${formatMoney(totals.totalCents)}`}
          </button>
          <p className="mt-3 text-center text-xs text-muted">
            Taxes and shipping are finalized on this page. You can review everything before paying.
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
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
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
      <span className="text-sm font-semibold text-ink">{price ? formatMoney(price) : "Free"}</span>
    </button>
  );
}
