import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Listing } from "@/components/shop/Listing";
import { getProductsByCollection } from "@/lib/queries";
import { t as tc } from "@/lib/i18n-content";
import { OCCASIONS, HOLIDAYS, labelFor } from "@/lib/nav";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = await params;
  const match = [...OCCASIONS, ...HOLIDAYS].find((o) => o.slug === slug);
  return { title: match ? `${labelFor(match, locale)} Gift Baskets` : "Gift Baskets" };
}

export default async function OccasionPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; locale: string }>;
  searchParams: Promise<{ sort?: string; max?: string; recipient?: string }>;
}) {
  const { slug, locale } = await params;
  setRequestLocale(locale);
  const { sort, max } = await searchParams;
  const t = await getTranslations();

  const { collection, products, total } = await getProductsByCollection("OCCASION", slug, { sort, take: 48 });

  const fallback = [...OCCASIONS, ...HOLIDAYS].find((o) => o.slug === slug);
  if (!collection && !fallback) notFound();

  const title = collection ? tc(collection.name, locale) : fallback ? labelFor(fallback, locale) : slug;
  const cap = max ? parseInt(max) : NaN;
  const filtered = !isNaN(cap) && cap < 999999 ? products.filter((p) => p.priceCents <= cap) : products;

  return (
    <Listing
      eyebrow={t("occasions.eyebrow")}
      title={locale === "fr" ? `Paniers · ${title}` : `${title} gift baskets`}
      description={
        collection?.description
          ? tc(collection.description, locale)
          : locale === "fr"
          ? `Des paniers attentionnés pour ${title.toLowerCase()}, composés à la main et livrés partout au Canada.`
          : `Thoughtful gift baskets for ${title.toLowerCase()}, composed by hand and delivered across Canada.`
      }
      products={filtered}
      total={filtered.length === products.length ? total : filtered.length}
      showOccasions
      activeSlug={slug}
      breadcrumb={[
        { label: t("pdp.home"), href: "/" },
        { label: t("nav.occasions"), href: "/occasions" },
        { label: title, href: `/occasions/${slug}` },
      ]}
    />
  );
}
