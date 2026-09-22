import { setRequestLocale, getTranslations } from "next-intl/server";
import { CollectionIndex } from "@/components/shop/CollectionIndex";
import { OCCASIONS } from "@/lib/nav";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return pageMetadata({
    locale,
    path: "/occasions",
    title: t("occasionsTitle"),
    description: t("occasionsDescription"),
  });
}

export default async function OccasionsIndex({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("occasions");
  return (
    <CollectionIndex type="OCCASION" base="/occasions" navList={OCCASIONS}
      eyebrow={t("eyebrow")} title={t("title")} description={t("lede")} />
  );
}
