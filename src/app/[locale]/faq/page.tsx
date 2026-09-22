import { setRequestLocale, getTranslations } from "next-intl/server";
import { Faq } from "@/components/home/Faq";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqJsonLd, pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return pageMetadata({ locale, path: "/faq", title: t("faqTitle"), description: t("faqDescription") });
}

export default async function FaqPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  // Same message items the <Faq> component renders, so markup and page agree.
  const t = await getTranslations("faq");
  const items = t.raw("items") as { q: string; a: string }[];
  return (
    <>
      <JsonLd data={faqJsonLd(items)} />
      <Faq standalone />
    </>
  );
}
