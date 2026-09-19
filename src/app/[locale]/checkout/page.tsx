import { setRequestLocale } from "next-intl/server";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { getSettings } from "@/lib/settings";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Checkout", robots: { index: false, follow: false } };

export default async function CheckoutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Rates, eligibility and tax are no longer passed down at all: the form asks
  // the server for a quote once it has a postal code, so there is only ever one
  // copy of the pricing rules. Only the studio address is needed here, for
  // pickup orders.
  const [settings, user] = await Promise.all([getSettings(), getCurrentUser()]);

  return (
    <CheckoutForm
      studio={{
        addressLine: settings.contact.addressLine,
        city: settings.contact.city,
        province: settings.contact.province,
        postalCode: settings.contact.postalCode,
      }}
      defaultEmail={user?.email ?? ""}
    />
  );
}
