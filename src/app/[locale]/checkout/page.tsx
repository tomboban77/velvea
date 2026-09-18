import { setRequestLocale } from "next-intl/server";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { getSettings } from "@/lib/settings";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Checkout", robots: { index: false, follow: false } };

export default async function CheckoutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  // The preview totals on this page used to come from a hard-coded copy of the
  // defaults, so any rate the admin edited showed one number and charged
  // another. The real settings are passed in instead.
  const [settings, user] = await Promise.all([getSettings(), getCurrentUser()]);

  return (
    <CheckoutForm
      settings={{
        freeShippingThresholdCents: settings.delivery.freeShippingThresholdCents,
        standardShippingCents: settings.delivery.standardShippingCents,
        localSameDayFeeCents: settings.delivery.localSameDayFeeCents,
        localStandardFeeCents: settings.delivery.localStandardFeeCents,
        sameDayCutoff: settings.delivery.sameDayCutoff,
        taxRates: settings.tax.rates,
        defaultTaxRate: settings.tax.default,
      }}
      defaultEmail={user?.email ?? ""}
    />
  );
}
