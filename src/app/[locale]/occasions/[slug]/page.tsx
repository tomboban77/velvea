import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Listing } from "@/components/shop/Listing";
import { JsonLd } from "@/components/seo/JsonLd";
import { t as tc } from "@/lib/i18n-content";
import { OCCASIONS, HOLIDAYS } from "@/lib/nav";
import { collectionJsonLd, collectionMetadata, collectionTitle, loadCollection, totalPages, type CollectionSearch } from "@/lib/collection-page";

export const dynamic = "force-dynamic";

const NAV = [...OCCASIONS, ...HOLIDAYS];
const BASE = "/occasions";

export async function generateMetadata({ params, searchParams }: { params: Promise<{ slug: string; locale: string }>; searchParams: Promise<CollectionSearch> }) {
  const [{ slug, locale }, sp] = await Promise.all([params, searchParams]);
  return collectionMetadata({ type: "OCCASION", base: BASE, navList: NAV, slug, locale, sp });
}

export default async function OccasionPage({ params, searchParams }: { params: Promise<{ slug: string; locale: string }>; searchParams: Promise<CollectionSearch> }) {
  const [{ slug, locale }, sp] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);
  const t = await getTranslations();

  const data = await loadCollection("OCCASION", slug, sp);
  const fallback = NAV.find((o) => o.slug === slug);
  if (!data.collection && !fallback) notFound();
  const pages = totalPages(data.total);
  // An out-of-range page is a 404, not an empty page 1: soft 404s get indexed.
  if (data.page === null || (data.page > 1 && data.page > pages)) notFound();

  const title = collectionTitle(data, fallback, slug, locale);
  const description = data.collection?.description
    ? tc(data.collection.description, locale)
    : locale === "fr"
    ? `Des paniers attentionnés pour ${title.toLowerCase()}, composés à la main et livrés partout en Ontario.`
    : `Thoughtful gift baskets for ${title.toLowerCase()}, composed by hand and delivered across Ontario.`;
  const heading = locale === "fr" ? `Paniers · ${title}` : `${title} gift baskets`;

  return (
    <>
      {!data.filtered && data.products.length > 0 && (
        <JsonLd data={collectionJsonLd({ base: BASE, slug, locale, page: data.page, name: heading, description, productSlugs: data.products.map((p) => p.slug) })} />
      )}
      <Listing
        eyebrow={t("occasions.eyebrow")}
        title={heading}
        description={description}
        products={data.products}
        total={data.total}
        showOccasions
        activeSlug={slug}
        breadcrumb={[
          { label: t("pdp.home"), href: "/" },
          { label: t("nav.occasions"), href: BASE },
          { label: title, href: `${BASE}/${slug}` },
        ]}
        pagination={{ page: data.page, totalPages: pages, basePath: `${BASE}/${slug}`, params: { sort: sp.sort, min: sp.min, max: sp.max, recipient: sp.recipient } }}
      />
    </>
  );
}
