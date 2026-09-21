import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { redirect } from "@/i18n/routing";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AccountHeader } from "@/components/account/AccountHeader";
import { AddressForm } from "@/components/account/AddressForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit address", robots: { index: false, follow: false } };

export default async function EditAddressPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const fr = locale === "fr";
  const user = await getCurrentUser();
  if (!user) redirect({ href: "/account/login", locale });

  // Scoped to the signed-in user so an address id from someone else's account
  // is simply not found.
  const address = await prisma.address
    .findFirst({ where: { id, userId: user!.id } })
    .catch(() => null);
  if (!address) notFound();

  return (
    <div className="container-x max-w-2xl py-14">
      <AccountHeader
        fr={fr}
        title={fr ? "Modifier l'adresse" : "Edit address"}
        lede={address.label || address.fullName}
      />
      <div className="mt-8">
        <AddressForm address={address} />
      </div>
    </div>
  );
}
