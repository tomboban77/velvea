import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProductRail } from "@/components/shop/ProductRail";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBestsellers } from "@/lib/queries";
import { getZonesForDisplay } from "@/lib/zones";
import { getSettings } from "@/lib/settings";
import { CITY_PAGES, cityBySlug, formatCutoff, offerFor } from "@/lib/cities";
import { OCCASIONS, labelFor } from "@/lib/nav";
import { formatMoney } from "@/lib/utils";
import { BRAND, absoluteUrl, breadcrumbJsonLd, faqJsonLd, pageMetadata, siteOrigin, type JsonLdValue } from "@/lib/seo";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return CITY_PAGES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const city = cityBySlug(slug);
  if (!city?.page) return pageMetadata({ locale, path: `/delivery/${slug}`, title: t("deliveryTitle"), index: false, alternates: false });

  const fr = locale === "fr";
  const name = fr ? city.name.fr : city.name.en;
  const offer = offerFor(city, await getZonesForDisplay());
  const money = (c: number) => formatMoney(c, fr ? "fr-CA" : "en-CA").replace(/[.,]00/, "");
  const description =
    offer.kind === "same-day"
      ? t("cityDescriptionSameDay", { city: name, time: formatCutoff(offer.cutoff, locale), fee: money(offer.zone.baseFeeCents) })
      : offer.kind === "next-day"
      ? t("cityDescriptionNextDay", { city: name, fee: money(offer.zone.baseFeeCents) })
      : offer.kind === "shipping"
      ? t("cityDescriptionShipping", { city: name, fee: money(offer.zone.baseFeeCents) })
      : undefined;

  return pageMetadata({
    locale,
    path: `/delivery/${city.slug}`,
    title: t("cityTitle", { city: name }),
    description,
    // A city we cannot currently reach has nothing to say to a searcher.
    index: offer.kind !== "unserved",
  });
}

export default async function CityDeliveryPage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = await params;
  const city = cityBySlug(slug);
  if (!city?.page) notFound();
  setRequestLocale(locale);

  const [t, tp, tn, zones, bestsellers, settings] = await Promise.all([
    getTranslations("delivery"),
    getTranslations("pdp"),
    getTranslations("nav"),
    getZonesForDisplay(),
    getBestsellers(5),
    getSettings(),
  ]);
  const fr = locale === "fr";
  const name = fr ? city.name.fr : city.name.en;
  const offer = offerFor(city, zones);
  const money = (c: number) => formatMoney(c, fr ? "fr-CA" : "en-CA").replace(/[.,]00/, "");
  const origin = siteOrigin();

  const breadcrumb = [
    { label: tp("home"), href: "/" },
    { label: t("eyebrow"), href: "/delivery" },
    { label: name, href: `/delivery/${city.slug}` },
  ];

  // Facts and FAQ answers are built from the resolved zone, so the page can
  // never promise a cutoff or fee that checkout would not honour.
  const facts: { label: string; value: string }[] = [];
  if (offer.kind === "same-day" || offer.kind === "next-day") {
    facts.push({ label: t("factFee"), value: t("factFeeValue", { fee: money(offer.zone.baseFeeCents) }) });
    if (offer.kind === "same-day") {
      facts.push({ label: t("factCutoff"), value: t("factCutoffValue", { time: formatCutoff(offer.cutoff, locale), surcharge: money(offer.zone.sameDaySurchargeCents) }) });
    } else {
      facts.push({ label: t("factNextDay"), value: t("factNextDayValue") });
    }
  } else if (offer.kind === "shipping") {
    facts.push({ label: t("factShipping"), value: t("factShippingValue", { min: offer.zone.minLeadDays, max: offer.zone.maxLeadDays, fee: money(offer.zone.baseFeeCents) }) });
  }
  facts.push({ label: t("factPickup"), value: t("factPickupValue") });

  const faq: { q: string; a: string }[] = [];
  if (offer.kind === "same-day") {
    faq.push({ q: t("faqQ1", { city: name }), a: t("faqA1SameDay", { time: formatCutoff(offer.cutoff, locale), fee: money(offer.zone.baseFeeCents), surcharge: money(offer.zone.sameDaySurchargeCents) }) });
  } else if (offer.kind === "next-day") {
    faq.push({ q: t("faqQ1", { city: name }), a: t("faqA1NextDay", { city: name, fee: money(offer.zone.baseFeeCents) }) });
  } else if (offer.kind === "shipping") {
    faq.push({ q: t("faqQ1", { city: name }), a: t("faqA1Shipping", { city: name, min: offer.zone.minLeadDays, max: offer.zone.maxLeadDays, fee: money(offer.zone.baseFeeCents) }) });
  }
  if (offer.kind !== "unserved" && offer.kind !== "quote") {
    faq.push({ q: t("faqQ2", { city: name }), a: t("faqA2", { city: name, fee: money(offer.zone.baseFeeCents) }) });
    faq.push({ q: t("faqQ3"), a: offer.kind === "shipping" ? t("faqA3Shipping") : t("faqA3Local") });
  }

  const serviceLd: JsonLdValue = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: fr ? "Livraison de paniers-cadeaux" : "Gift basket delivery",
    name: t("cityTitle", { city: name }),
    url: absoluteUrl(locale, `/delivery/${city.slug}`, origin),
    provider: { "@id": `${origin}/#organization`, "@type": "Organization", name: BRAND },
    areaServed: { "@type": "City", name: city.name.en, containedInPlace: { "@type": "AdministrativeArea", name: "Ontario" } },
  };

  const areas = fr ? city.areas.fr : city.areas.en;

  return (
    <div>
      <JsonLd data={[serviceLd, breadcrumbJsonLd(breadcrumb, { locale, origin }), ...(faq.length ? [faqJsonLd(faq)] : [])]} />
      <PageHeader eyebrow={t("cityEyebrow", { city: name })} title={t("cityTitle", { city: name })} lede={fr ? city.intro.fr : city.intro.en} breadcrumb={breadcrumb} />

      <section className="container-x section-sm">
        <h2 className="h-sub">{t("factsH", { city: name })}</h2>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {facts.map((f) => (
            <div key={f.label} className="rounded-lg border border-line bg-white p-5">
              <dt className="text-sm text-muted">{f.label}</dt>
              <dd className="mt-1 font-semibold text-ink">{f.value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-sm text-muted">{t("factNote", { city: name })}</p>
        <Link href="/baskets" className="btn btn-primary mt-6">{tp("baskets")} <ArrowRight /></Link>
      </section>

      {(areas.length > 0 || city.fsas.length > 0) && (
        <section className="band-cream border-y border-line">
          <div className="container-x section-sm grid gap-10 lg:grid-cols-12">
            {areas.length > 0 && (
              <div className="lg:col-span-7">
                <h2 className="h-sub">{t("areasH", { city: name })}</h2>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {areas.map((a) => <li key={a} className="chip cursor-default">{a}</li>)}
                </ul>
              </div>
            )}
            <div className="lg:col-span-5">
              <h2 className="h-sub">{t("postalH")}</h2>
              <p className="mt-5 font-mono text-sm leading-loose tracking-wide text-ink-soft">{city.fsas.join(" · ")}</p>
            </div>
          </div>
        </section>
      )}

      <ProductRail products={bestsellers} title={t("popularH", { city: name })} link="/baskets" linkLabel={t("popularLink")} />

      <section className="container-x section-sm border-t border-line">
        <h2 className="h-sub">{t("occasionsH")}</h2>
        <div className="mt-5 flex flex-wrap gap-2">
          {OCCASIONS.map((o) => (
            <Link key={o.slug} href={`/occasions/${o.slug}`} className="chip">{labelFor(o, locale)}</Link>
          ))}
        </div>
      </section>

      {faq.length > 0 && (
        <section className="band-cream border-t border-line">
          <div className="container-x section-sm">
            <h2 className="h-sub">{t("faqH", { city: name })}</h2>
            <div className="mt-6 divide-y divide-line rounded-lg border border-line bg-white px-6 sm:px-8">
              {faq.map((item) => (
                <div key={item.q} className="py-5">
                  <h3 className="text-[1.05rem] font-semibold leading-snug text-ink">{item.q}</h3>
                  <p className="mt-2 text-[0.98rem] leading-relaxed text-ink-soft">{item.a}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 text-sm text-muted">
              {tn("delivery")}: <Link href="/shipping" className="underline hover:text-violet-deep">{t("seePolicy")}</Link>
              {" · "}
              <Link href="/delivery" className="underline hover:text-violet-deep">{t("otherCities")}</Link>
              {" · "}
              <a href={`mailto:${settings.contact.email}`} className="underline hover:text-violet-deep">{settings.contact.email}</a>
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
