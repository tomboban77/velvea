import { setRequestLocale, getLocale } from "next-intl/server";
import { CorporateQuoteForm } from "@/components/corporate/CorporateQuoteForm";
import { Check } from "lucide-react";

export const metadata = { title: "Request a Corporate Quote" };

export default async function CorporateQuotePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const fr = locale === "fr";
  const points = fr
    ? ["Prix de volume", "Notes et emballage personnalisés", "Livraison multi-adresses", "Programmes des fêtes"]
    : ["Volume pricing", "Branded notes & packaging", "Multi-address delivery", "Holiday programmes"];
  return (
    <div className="container-x grid gap-12 py-14 lg:grid-cols-[1fr_1.2fr]">
      <div>
        <p className="eyebrow mb-3">{fr ? "Cadeaux d'entreprise" : "Corporate Gifting"}</p>
        <h1 className="font-display text-4xl leading-tight balance sm:text-5xl">
          {fr ? "Demandez un devis d'entreprise" : "Request a Corporate Quote"}
        </h1>
        <p className="mt-4 text-ink-soft">
          {fr
            ? "Dites-nous en plus sur votre projet et notre équipe bâtira une proposition sur mesure sous un jour ouvrable."
            : "Tell us about your project and our team will build a tailored proposal within one business day."}
        </p>
        <ul className="mt-6 space-y-3">
          {points.map((p) => (
            <li key={p} className="flex items-center gap-3 text-ink-soft">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-iris-soft">
                <Check className="h-3 w-3 text-teal-deep" />
              </span>{p}
            </li>
          ))}
        </ul>
      </div>
      <CorporateQuoteForm />
    </div>
  );
}
