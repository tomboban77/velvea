import { setRequestLocale } from "next-intl/server";
import { ForgotPasswordForm } from "@/components/account/PasswordForms";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  // Private and transactional pages stay out of search in both languages.
  return { title: locale === "fr" ? "Mot de passe oublié" : "Forgot password", robots: { index: false, follow: false } };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ForgotPasswordForm />;
}
