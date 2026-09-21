import { setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/routing";
import { getCurrentUser } from "@/lib/auth";
import { AccountHeader } from "@/components/account/AccountHeader";
import { ChangePasswordForm } from "@/components/account/ChangePasswordForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Change password", robots: { index: false, follow: false } };

export default async function PasswordPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const fr = locale === "fr";
  const user = await getCurrentUser();
  if (!user) redirect({ href: "/account/login", locale });

  return (
    <div className="container-x max-w-2xl py-14">
      <AccountHeader
        fr={fr}
        title={fr ? "Mot de passe" : "Password"}
        lede={
          fr
            ? "Confirmez votre mot de passe actuel pour en choisir un nouveau."
            : "Confirm your current password to choose a new one."
        }
      />
      <div className="mt-8">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
