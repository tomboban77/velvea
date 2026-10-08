import { setRequestLocale, getTranslations } from "next-intl/server";
import { Check, X } from "lucide-react";
import { BrandPartnerForm } from "@/components/partners/BrandPartnerForm";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return pageMetadata({
    locale,
    path: "/partners",
    title: t("partnersTitle"),
    description: t("partnersDescription"),
  });
}

/**
 * Inbound page for makers and brands who want their products in our baskets.
 * Written to be found by searches like "sell my products to gift basket
 * companies Ontario". The "not a fit" list is deliberate: no AGCO licence, so
 * alcohol is refused up front rather than after a brand has sent samples.
 */
export default async function PartnersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const fr = locale === "fr";

  const offer = fr
    ? [
        "Vos produits offerts en cadeau à travers Mississauga, Toronto et le Grand Toronto",
        "Commandes d'entreprise en volume pour les fêtes et la reconnaissance des clients",
        "Une boutique bilingue, en anglais et en français",
        "Votre produit présenté avec soin, emballé à la main dans chaque panier",
      ]
    : [
        "Your products given as gifts across Mississauga, Toronto and the GTA",
        "Volume corporate orders for holidays and client appreciation",
        "A bilingual storefront, in English and French",
        "Your product presented with care, hand-packed in every basket",
      ];

  const lookFor = fr
    ? [
        "Gourmandises, chocolat, café et thé, soins, bougies et articles pour la maison",
        "Fabriqué ou conçu au Canada, idéalement en Ontario",
        "Étiquettes bilingues conformes à l'ACIA pour les aliments préemballés",
        "Durée de conservation suffisante et emballage qui voyage bien",
        "Prix de gros et approvisionnement fiable, surtout de novembre à décembre",
      ]
    : [
        "Gourmet treats, chocolate, coffee and tea, skincare, candles and home goods",
        "Made or designed in Canada, ideally in Ontario",
        "Bilingual, CFIA-compliant labels on prepackaged food",
        "Enough shelf life, and packaging that travels well",
        "Wholesale pricing and reliable supply, especially November to December",
      ];

  const notFit = fr
    ? ["Alcool de tout type, y compris le vin et les spiritueux", "Produits sans liste d'ingrédients ni allergènes"]
    : ["Alcohol of any kind, including wine and spirits", "Products without ingredient or allergen information"];

  const steps = fr
    ? [
        { title: "Présentez-vous", sub: "Remplissez le formulaire ci-dessous. Cela prend deux minutes." },
        { title: "Nous examinons", sub: "Nous lisons chaque proposition et vous répondons d'ici une semaine si c'est un bon match." },
        { title: "Échantillons et entente", sub: "Nous goûtons ou essayons vos produits, puis convenons des prix et des quantités." },
      ]
    : [
        { title: "Introduce your brand", sub: "Fill in the form below. It takes two minutes." },
        { title: "We review", sub: "We read every submission and reply within a week if it's a fit." },
        { title: "Samples and terms", sub: "We try your products, then agree pricing and quantities." },
      ];

  return (
    <div>
      {/* hero */}
      <section className="band-ink">
        <div className="container-x py-14 lg:py-20">
          <div className="max-w-3xl">
            <p className="caps text-gold-pale">{fr ? "Pour les marques et artisans" : "For brands and makers"}</p>
            <h1 className="h-display mt-4 text-white balance">
              {fr ? "Vos produits dans nos paniers-cadeaux" : "Put your products in our gift baskets"}
            </h1>
            <p className="mt-6 max-w-xl text-[1.08rem] leading-relaxed text-white/72 pretty">
              {fr
                ? "Velvéa compose des paniers-cadeaux à la main à Mississauga, en Ontario. Nous cherchons des marques canadiennes dont les produits méritent d'être offerts."
                : "Velvéa composes gift baskets by hand in Mississauga, Ontario. We're looking for Canadian brands whose products deserve to be given."}
            </p>
            <div className="mt-9">
              <a href="#partner-form" className="btn btn-light btn-lg">
                {fr ? "Proposer votre marque" : "Introduce your brand"}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* what you get / what we look for */}
      <section className="container-x section grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="caps">{fr ? "Ce que vous y gagnez" : "What's in it for you"}</p>
          <ul className="mt-5 space-y-3.5">
            {offer.map((p) => (
              <li key={p} className="flex items-start gap-3 text-[0.98rem] text-ink-soft">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lilac">
                  <Check className="h-3 w-3 text-violet-deep" strokeWidth={2.4} />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="caps">{fr ? "Ce que nous recherchons" : "What we look for"}</p>
          <ul className="mt-5 space-y-3.5">
            {lookFor.map((p) => (
              <li key={p} className="flex items-start gap-3 text-[0.98rem] text-ink-soft">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lilac">
                  <Check className="h-3 w-3 text-violet-deep" strokeWidth={2.4} />
                </span>
                {p}
              </li>
            ))}
          </ul>
          <p className="caps mt-8">{fr ? "Ce que nous ne pouvons pas prendre" : "What we can't carry"}</p>
          <ul className="mt-4 space-y-3">
            {notFit.map((p) => (
              <li key={p} className="flex items-start gap-3 text-[0.98rem] text-ink-soft">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cream">
                  <X className="h-3 w-3 text-ink-soft" strokeWidth={2.4} />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* how it works */}
      <section className="band-cream">
        <div className="container-x section">
          <p className="caps">{fr ? "Comment ça fonctionne" : "How it works"}</p>
          <div className="mt-6 grid gap-6 md:grid-cols-3 md:gap-8">
            {steps.map((s, i) => (
              <div key={s.title} className="rounded-lg border border-line bg-white p-7">
                <span className="step-num text-violet-deep">{i + 1}</span>
                <p className="mt-5 font-display text-[1.45rem] font-medium leading-tight text-ink">{s.title}</p>
                <p className="mt-2 text-[0.98rem] leading-relaxed text-ink-soft">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* form */}
      <section className="container-x section">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-display text-[2rem] leading-tight text-ink">
            {fr ? "Présentez votre marque" : "Introduce your brand"}
          </h2>
          <p className="mt-3 text-ink-soft">
            {fr
              ? "Pas besoin d'échantillons pour l'instant. Dites-nous simplement ce que vous fabriquez."
              : "No samples needed yet. Just tell us what you make."}
          </p>
          <div className="mt-8">
            <BrandPartnerForm />
          </div>
        </div>
      </section>
    </div>
  );
}
