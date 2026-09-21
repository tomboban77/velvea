import { setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/routing";
import { getCurrentUser } from "@/lib/auth";
import { AccountHeader } from "@/components/account/AccountHeader";
import { ProfileForm } from "@/components/account/ProfileForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Profile", robots: { index: false, follow: false } };

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const fr = locale === "fr";
  const user = await getCurrentUser();
  if (!user) redirect({ href: "/account/login", locale });

  return (
    <div className="container-x max-w-2xl py-14">
      <AccountHeader
        fr={fr}
        title={fr ? "Profil" : "Profile"}
        lede={
          fr
            ? "Le nom et le téléphone que nous utilisons pour vos commandes."
            : "The name and phone number we use for your orders."
        }
      />
      <div className="mt-8">
        <ProfileForm email={user!.email} name={user!.name ?? ""} phone={user!.phone ?? ""} />
      </div>
    </div>
  );
}
