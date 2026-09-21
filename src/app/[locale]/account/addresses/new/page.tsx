import { setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/routing";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MAX_ADDRESSES } from "@/lib/addresses";
import { AccountHeader } from "@/components/account/AccountHeader";
import { AddressForm } from "@/components/account/AddressForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Add address", robots: { index: false, follow: false } };

export default async function NewAddressPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const fr = locale === "fr";
  const user = await getCurrentUser();
  if (!user) redirect({ href: "/account/login", locale });

  const count = await prisma.address.count({ where: { userId: user!.id } }).catch(() => 0);
  if (count >= MAX_ADDRESSES) redirect({ href: "/account/addresses", locale });

  return (
    <div className="container-x max-w-2xl py-14">
      <AccountHeader
        fr={fr}
        title={fr ? "Nouvelle adresse" : "New address"}
        lede={
          fr
            ? "Elle sera proposée à la caisse pour vos prochaines commandes."
            : "It will be offered at checkout for your next orders."
        }
      />
      <div className="mt-8">
        <AddressForm defaultName={user!.name ?? ""} defaultPhone={user!.phone ?? ""} />
      </div>
    </div>
  );
}
