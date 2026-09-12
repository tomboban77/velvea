import { setRequestLocale, getLocale } from "next-intl/server";
import { GiftCardPicker } from "@/components/shop/GiftCardPicker";
import { getProductBySlug } from "@/lib/queries";
import { t as tc } from "@/lib/i18n-content";
import { Check } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Gift Cards" };

export default async function GiftCardsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const fr = locale === "fr";
  const product = await getProductBySlug("velvea-gift-card");

  const points = fr
    ? ["Échangeable sur tous les paniers", "Livrée par courriel avec un code", "Sans frais, jamais d'expiration"]
    : ["Redeemable on any basket", "Delivered by email with a code", "No fees, never expires"];

  return (
    <div className="container-x grid gap-12 py-14 lg:grid-cols-2 lg:items-center">
      <div>
        <p className="eyebrow mb-3">{fr ? "Cartes-cadeaux" : "Gift Cards"}</p>
        <h1 className="font-display text-4xl leading-tight balance sm:text-5xl">
          {fr ? "Offrez le choix parfait" : "Give the gift of choice"}
        </h1>
        <p className="mt-4 text-ink-soft">
          {fr
            ? "Une carte-cadeau Velvea les laisse choisir leur panier idéal, livré partout au Canada."
            : "A Velvea gift card lets them choose their perfect basket, delivered anywhere in Canada."}
        </p>
        <ul className="mt-6 space-y-3">
          {points.map((p) => (
            <li key={p} className="flex items-center gap-3 text-ink-soft">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-iris-soft"><Check className="h-3 w-3 text-violet-deep" /></span>{p}
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-[1.75rem] border border-line bg-shell p-6 sm:p-8">
        {product && product.variants.length > 0 ? (
          <GiftCardPicker productId={product.id} variants={product.variants.map((v) => ({ id: v.id, label: tc(v.label, locale), priceCents: v.priceCents }))} />
        ) : (
          <p className="text-center text-muted">Gift cards are being set up.</p>
        )}
      </div>
    </div>
  );
}
