import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Listing } from "@/components/shop/Listing";
import { JsonLd } from "@/components/seo/JsonLd";
import { t as tc } from "@/lib/i18n-content";
import { RECIPIENTS } from "@/lib/nav";
import { collectionJsonLd, collectionMetadata, collectionTitle, loadCollection, totalPages, type CollectionSearch } from "@/lib/collection-page";

export const dynamic = "force-dynamic";

const BASE = "/recipients";

export async function generateMetadata({ params, searchParams }: { params: Promise<{ slug: string; locale: string }>; searchParams: Promise<CollectionSearch> }) {
  const [{ slug, locale }, sp] = await Promise.all([params, searchParams]);
  return collectionMetadata({ type: "RECIPIENT", base: BASE, navList: RECIPIENTS, slug, locale, sp });
}

export default async function RecipientPage({ params, searchParams }: { params: Promise<{ slug: string; locale: string }>; searchParams: Promise<CollectionSearch> }) {
  const [{ slug, locale }, sp] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);
  const t = await getTranslations();

  const data = await loadCollection("RECIPIENT", slug, sp);
  const fallback = RECIPIENTS.find((o) => o.slug === slug);
  if (!data.collection && !fallback) notFound();
  const pages = totalPages(data.total);
  if (data.page === null || (data.page > 1 && data.page > pages)) notFound();

  const title = collectionTitle(data, fallback, slug, locale);
  const description = data.collection?.description
    ? tc(data.collection.description, locale)
    : locale === "fr"
    ? `Le bon cadeau ${title.toLowerCase()}, livré partout en Ontario.`
    : `The right gift ${title.toLowerCase()}, delivered across Ontario.`;
  const heading = locale === "fr" ? `Paniers · ${title}` : `Gift Baskets ${title}`;

  return (
    <>
      {!data.filtered && data.products.length > 0 && (
        <JsonLd data={collectionJsonLd({ base: BASE, slug, locale, page: data.page, name: heading, description, productSlugs: data.products.map((p) => p.slug) })} />
      )}
      <Listing
        eyebrow={t("recipients.eyebrow")}
        title={heading}
        description={description}
        products={data.products}
        total={data.total}
        breadcrumb={[
          { label: t("brand.name"), href: "/" },
          { label: t("nav.recipients"), href: BASE },
          { label: title, href: `${BASE}/${slug}` },
        ]}
        pagination={{ page: data.page, totalPages: pages, basePath: `${BASE}/${slug}`, params: { sort: sp.sort, min: sp.min, max: sp.max } }}
      />
    </>
  );
}
