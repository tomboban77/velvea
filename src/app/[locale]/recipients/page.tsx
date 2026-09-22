import { setRequestLocale, getTranslations } from "next-intl/server";
import { CollectionIndex } from "@/components/shop/CollectionIndex";
import { RECIPIENTS } from "@/lib/nav";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return pageMetadata({
    locale,
    path: "/recipients",
    title: t("recipientsTitle"),
    description: t("recipientsDescription"),
  });
}

export default async function RecipientsIndex({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("recipients");
  return (
    <CollectionIndex type="RECIPIENT" base="/recipients" navList={RECIPIENTS}
      eyebrow={t("eyebrow")} title={t("title")} description={t("lede")} />
  );
}
