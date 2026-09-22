import { setRequestLocale, getTranslations } from "next-intl/server";
import { CollectionIndex } from "@/components/shop/CollectionIndex";
import { CATEGORIES } from "@/lib/nav";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return pageMetadata({
    locale,
    path: "/category",
    title: t("categoryIndexTitle"),
    description: t("categoryIndexDescription"),
  });
}

export default async function CategoryIndex({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  return (
    <CollectionIndex type="CATEGORY" base="/category" navList={CATEGORIES}
      eyebrow={t("nav.category")} title={t("nav.category")}
      description={locale === "fr" ? "Parcourez nos paniers par catégorie." : "Browse our baskets by category, from gourmet to wellness."} />
  );
}
