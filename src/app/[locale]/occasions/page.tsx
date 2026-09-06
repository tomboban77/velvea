import { setRequestLocale, getTranslations } from "next-intl/server";
import { CollectionIndex } from "@/components/shop/CollectionIndex";
import { OCCASIONS } from "@/lib/nav";

export const dynamic = "force-dynamic";
export const metadata = { title: "Gift Baskets by Occasion" };

export default async function OccasionsIndex({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("occasions");
  return (
    <CollectionIndex type="OCCASION" base="/occasions" navList={OCCASIONS}
      eyebrow={t("eyebrow")} title={t("title")} description={t("lede")} />
  );
}
