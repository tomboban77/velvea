import { setRequestLocale, getTranslations } from "next-intl/server";
import { CorporateQuoteForm } from "@/components/corporate/CorporateQuoteForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { Check, Clock } from "lucide-react";

export const metadata = { title: "Request a Corporate Quote" };

export default async function CorporateQuotePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const fr = locale === "fr";
  const t = await getTranslations();
  const points = fr
    ? ["Prix de volume dès 10 paniers", "Cartes et emballage personnalisés", "Livraison multi-adresses partout en Ontario", "Programmes des fêtes et saisonniers", "Une seule personne-ressource"]
    : ["Volume pricing from 10 baskets", "Branded cards and packaging", "Multi-address delivery across Ontario", "Holiday and seasonal programmes", "One dedicated point of contact"];

  return (
    <div>
      <PageHeader
        eyebrow={fr ? "Cadeaux d'entreprise" : "Corporate gifting"}
        title={fr ? "Demandez un devis d'entreprise" : "Request a corporate quote"}
        lede={fr ? "Dites-nous en plus sur votre projet et notre équipe bâtira une proposition sur mesure sous un jour ouvrable." : "Tell us about your project and our team will build a tailored proposal within one business day."}
        breadcrumb={[
          { label: t("pdp.home"), href: "/" },
          { label: t("nav.corporate"), href: "/corporate" },
          { label: t("nav.corporateQuote"), href: "/corporate/quote" },
        ]}
      />
      <div className="container-x grid gap-10 py-12 lg:grid-cols-12 lg:gap-16 lg:py-16">
        <aside className="lg:col-span-4">
          <p className="caps">{fr ? "Ce que nous offrons" : "What we offer"}</p>
          <ul className="mt-5 space-y-3.5">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-3 text-[0.98rem] text-ink-soft">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lilac">
                  <Check className="h-3 w-3 text-violet-deep" strokeWidth={2.4} />
                </span>
                {p}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex items-start gap-3 rounded-lg bg-cream p-5 text-sm text-ink-soft">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-violet-deep" strokeWidth={1.7} />
            {t("corporate.note")}
          </div>
        </aside>
        <div className="lg:col-span-8">
          <CorporateQuoteForm />
        </div>
      </div>
    </div>
  );
}
