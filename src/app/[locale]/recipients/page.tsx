import { setRequestLocale, getTranslations } from "next-intl/server";
import { CollectionIndex } from "@/components/shop/CollectionIndex";
import { RECIPIENTS } from "@/lib/nav";

export const dynamic = "force-dynamic";
export const metadata = { title: "Gift Baskets by Recipient" };

export default async function RecipientsIndex({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("recipients");
  return (
    <CollectionIndex type="RECIPIENT" base="/recipients" navList={RECIPIENTS}
      eyebrow={t("eyebrow")} title={t("title")} description={t("lede")} />
  );
}
