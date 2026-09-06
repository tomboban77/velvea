import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Listing } from "@/components/shop/Listing";
import { getProductsByCollection } from "@/lib/queries";
import { t as tc } from "@/lib/i18n-content";
import { CATEGORIES, labelFor } from "@/lib/nav";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  const match = CATEGORIES.find((o) => o.slug === slug);
  return { title: match ? `${labelFor(match, locale)} Gift Baskets` : "Gift Baskets" };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; locale: string }>;
  searchParams: Promise<{ sort?: string; max?: string }>;
}) {
  const { slug, locale } = await params;
  setRequestLocale(locale);
  const { sort, max } = await searchParams;
  const t = await getTranslations();

  const { collection, products, total } = await getProductsByCollection("CATEGORY", slug, {
    sort,
    take: 48,
  });
  const fallback = CATEGORIES.find((o) => o.slug === slug);
  if (!collection && !fallback) notFound();

  const title = collection ? tc(collection.name, locale) : fallback ? labelFor(fallback, locale) : slug;
  const filtered = max ? products.filter((p) => p.priceCents <= parseInt(max)) : products;

  return (
    <Listing
      eyebrow={t("nav.category")}
      title={title}
      products={filtered}
      total={max ? filtered.length : total}
      breadcrumb={[
        { label: t("brand.name"), href: "/" },
        { label: t("nav.category"), href: "/category" },
        { label: title, href: `/category/${slug}` },
      ]}
    />
  );
}
