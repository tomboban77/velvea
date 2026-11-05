import { setRequestLocale } from "next-intl/server";
import { CustomerAuth } from "@/components/account/CustomerAuth";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  // Private and transactional pages stay out of search in both languages.
  return { title: locale === "fr" ? "Créer un compte" : "Create account", robots: { index: false, follow: false } };
}
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; setRequestLocale(locale);
  return <CustomerAuth mode="register" />;
}
