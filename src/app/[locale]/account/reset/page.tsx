import { setRequestLocale } from "next-intl/server";
import { ResetPasswordForm } from "@/components/account/PasswordForms";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  // Private and transactional pages stay out of search in both languages.
  return { title: locale === "fr" ? "Réinitialiser le mot de passe" : "Reset password", robots: { index: false, follow: false } };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { locale } = await params;
  const { token } = await searchParams;
  setRequestLocale(locale);
  return <ResetPasswordForm token={token ?? ""} />;
}
