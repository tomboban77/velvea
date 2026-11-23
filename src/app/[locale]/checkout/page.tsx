import { setRequestLocale } from "next-intl/server";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { getSettings } from "@/lib/settings";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  // Private and transactional pages stay out of search in both languages.
  return { title: locale === "fr" ? "Paiement" : "Checkout", robots: { index: false, follow: false } };
}

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ canceled?: string }>;
}) {
  const { locale } = await params;
  const { canceled } = await searchParams;
  setRequestLocale(locale);

  // Rates, eligibility and tax are no longer passed down at all: the form asks
  // the server for a quote once it has a postal code, so there is only ever one
  // copy of the pricing rules. Only the studio address is needed here, for
  // pickup orders.
  const [settings, user] = await Promise.all([getSettings(), getCurrentUser()]);

  // A signed-in customer gets their profile and saved addresses offered as
  // starting values; guests see the same empty form as before.
  const addresses = user
    ? await prisma.address
        .findMany({
          where: { userId: user.id },
          orderBy: [{ isDefault: "desc" }, { label: "asc" }, { fullName: "asc" }],
        })
        .catch(() => [])
    : [];

  return (
    <CheckoutForm
      // Set by Stripe's cancel link when the customer backs out of the payment page.
      canceled={canceled === "1"}
      studio={{
        addressLine: settings.contact.addressLine,
        city: settings.contact.city,
        province: settings.contact.province,
        postalCode: settings.contact.postalCode,
      }}
      customer={
        user
          ? { email: user.email, name: user.name ?? "", phone: user.phone ?? "", addresses }
          : null
      }
    />
  );
}
