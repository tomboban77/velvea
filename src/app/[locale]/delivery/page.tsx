import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { ArrowRight, Clock, Truck, Package } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { JsonLd } from "@/components/seo/JsonLd";
import { getZonesForDisplay } from "@/lib/zones";
import { CITIES, formatCutoff, offerFor, type City, type CityOffer } from "@/lib/cities";
import { formatMoney } from "@/lib/utils";
import { breadcrumbJsonLd, pageMetadata, siteOrigin } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return pageMetadata({ locale, path: "/delivery", title: t("deliveryTitle"), description: t("deliveryDescription") });
}

/**
 * Delivery hub. Cities are grouped by what checkout would actually offer at
 * their postal codes (same-day / next-day / courier), read live from the
 * delivery zones, so an admin zone edit re-sorts this page on its own.
 */
export default async function DeliveryHubPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("delivery");
  const tp = await getTranslations("pdp");
  const zones = await getZonesForDisplay();
  const fr = locale === "fr";
  const money = (c: number) => formatMoney(c, fr ? "fr-CA" : "en-CA").replace(/[.,]00/, "");

  const withOffer = CITIES.map((city) => ({ city, offer: offerFor(city, zones) }));
  const sameDay = withOffer.filter((c) => c.offer.kind === "same-day");
  const nextDay = withOffer.filter((c) => c.offer.kind === "next-day");
  const shipping = withOffer.filter((c) => c.offer.kind === "shipping" || c.offer.kind === "quote");

  const breadcrumb = [
    { label: tp("home"), href: "/" },
    { label: t("eyebrow"), href: "/delivery" },
  ];

  const label = (offer: CityOffer) => {
    switch (offer.kind) {
      case "same-day":
        return `${t("cardSameDay", { time: formatCutoff(offer.cutoff, locale) })} · ${t("cardFee", { fee: money(offer.zone.baseFeeCents) })}`;
      case "next-day":
        return t("cardNextDay", { fee: money(offer.zone.baseFeeCents) });
      case "shipping":
        return t("cardShipping", { min: offer.zone.minLeadDays, max: offer.zone.maxLeadDays, fee: money(offer.zone.baseFeeCents) });
      case "quote":
        return t("cardQuote");
      default:
        return t("cardUnserved");
    }
  };

  const CityCard = ({ city, offer }: { city: City; offer: CityOffer }) => {
    const inner = (
      <>
        <div className="min-w-0">
          <p className="font-display text-[1.25rem] font-medium leading-tight text-ink group-hover:text-violet-deep">{fr ? city.name.fr : city.name.en}</p>
          <p className="mt-0.5 text-sm text-muted">{fr ? city.region.fr : city.region.en}</p>
          <p className="mt-2 text-sm text-ink-soft">{label(offer)}</p>
        </div>
        {city.page && <span className="circle-arrow h-9 w-9 shrink-0"><ArrowRight className="h-4 w-4" strokeWidth={1.8} /></span>}
      </>
    );
    const cls = "group flex items-start justify-between gap-4 rounded-lg border border-line bg-white p-5";
    return city.page ? (
      <Link href={`/delivery/${city.slug}`} className={`${cls} card-hover`}>{inner}</Link>
    ) : (
      <div className={cls}>{inner}</div>
    );
  };

  const Group = ({ icon: Icon, title, lede, items }: { icon: typeof Clock; title: string; lede: string; items: typeof withOffer }) =>
    items.length === 0 ? null : (
      <section className="container-x section-sm">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-lilac text-violet-deep"><Icon className="h-5 w-5" strokeWidth={1.6} /></span>
          <div>
            <h2 className="h-sub">{title}</h2>
            <p className="mt-1 max-w-2xl text-ink-soft">{lede}</p>
          </div>
        </div>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map(({ city, offer }) => <CityCard key={city.slug} city={city} offer={offer} />)}
        </div>
      </section>
    );

  return (
    <div>
      <JsonLd data={breadcrumbJsonLd(breadcrumb, { locale, origin: siteOrigin() })} />
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} lede={t("lede")} breadcrumb={breadcrumb} />

      <Group icon={Clock} title={t("sameDayH")} lede={t("sameDayLede")} items={sameDay} />
      <Group icon={Truck} title={t("nextDayH")} lede={t("nextDayLede")} items={nextDay} />
      <Group icon={Package} title={t("shippingH")} lede={t("shippingLede")} items={shipping} />

      <section className="container-x pb-16">
        <div className="band-cream flex flex-col gap-4 rounded-lg p-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-ink-soft">{t("pickupNote")}</p>
          <Link href="/shipping" className="btn btn-outline shrink-0">{t("seePolicy")} <ArrowRight /></Link>
        </div>
      </section>
    </div>
  );
}
