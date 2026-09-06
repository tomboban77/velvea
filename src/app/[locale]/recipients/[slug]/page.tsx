import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Listing } from "@/components/shop/Listing";
import { getProductsByCollection } from "@/lib/queries";
import { t as tc } from "@/lib/i18n-content";
import { RECIPIENTS, labelFor } from "@/lib/nav";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  const match = RECIPIENTS.find((o) => o.slug === slug);
  return { title: match ? `Gift Baskets ${labelFor(match, locale)}` : "Gift Baskets" };
}

export default async function RecipientPage({
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

  const { collection, products, total } = await getProductsByCollection("RECIPIENT", slug, {
    sort,
    take: 48,
  });
  const fallback = RECIPIENTS.find((o) => o.slug === slug);
  if (!collection && !fallback) notFound();

  const title = collection ? tc(collection.name, locale) : fallback ? labelFor(fallback, locale) : slug;
  const filtered = max ? products.filter((p) => p.priceCents <= parseInt(max)) : products;

  return (
    <Listing
      eyebrow={t("recipients.eyebrow")}
      title={locale === "fr" ? `Paniers · ${title}` : `Gift Baskets ${title}`}
      description={
        collection?.description
          ? tc(collection.description, locale)
          : locale === "fr"
          ? `Le bon cadeau ${title.toLowerCase()}, livré partout au Canada.`
          : `The right gift ${title.toLowerCase()}, delivered across Canada.`
      }
      products={filtered}
      total={max ? filtered.length : total}
      breadcrumb={[
        { label: t("brand.name"), href: "/" },
        { label: t("nav.recipients"), href: "/recipients" },
        { label: title, href: `/recipients/${slug}` },
      ]}
    />
  );
}
