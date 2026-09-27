import { setRequestLocale, getTranslations } from "next-intl/server";
import { Faq } from "@/components/home/Faq";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqJsonLd, pageMetadata } from "@/lib/seo";
import { resolveFaqItems, type FaqItem } from "@/lib/faq";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return pageMetadata({ locale, path: "/faq", title: t("faqTitle"), description: t("faqDescription") });
}

export default async function FaqPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  // Resolved through the same helper the <Faq> component uses, so the markup
  // and the rendered answers cannot drift apart.
  const t = await getTranslations("faq");
  const items = resolveFaqItems(t.raw("items") as FaqItem[]);
  return (
    <>
      <JsonLd data={faqJsonLd(items)} />
      <Faq standalone />
    </>
  );
}
