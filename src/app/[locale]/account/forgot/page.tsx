import { setRequestLocale } from "next-intl/server";
import { ForgotPasswordForm } from "@/components/account/PasswordForms";

export const metadata = { title: "Forgot password", robots: { index: false, follow: false } };

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ForgotPasswordForm />;
}
