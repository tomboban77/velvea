import { setRequestLocale } from "next-intl/server";
import { Faq } from "@/components/home/Faq";

export const metadata = { title: "FAQ" };

export default async function FaqPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Faq standalone />;
}
