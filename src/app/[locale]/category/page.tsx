import { setRequestLocale, getTranslations } from "next-intl/server";
import { CollectionIndex } from "@/components/shop/CollectionIndex";
import { CATEGORIES } from "@/lib/nav";

export const dynamic = "force-dynamic";
export const metadata = { title: "Shop by Category" };

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
