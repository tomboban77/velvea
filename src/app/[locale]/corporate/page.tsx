import { setRequestLocale, getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Check, ArrowRight, Building2 } from "lucide-react";
import { ProductRail } from "@/components/shop/ProductRail";
import { getProductsByCollection } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata = { title: "Corporate Gift Baskets" };

export default async function CorporatePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("corporate");
  const { products } = await getProductsByCollection("RECIPIENT", "clients", { take: 4 });
  const features = [t("f1"), t("f2"), t("f3"), t("f4"), t("f5")];
  return (
    <div>
      <section className="border-b border-line bg-charcoal text-canvas">
        <div className="container-x grid gap-10 py-16 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="eyebrow mb-3 text-gold-soft">{t("eyebrow")}</p>
            <h1 className="font-display text-4xl leading-tight balance text-canvas sm:text-5xl">{t("title")}</h1>
            <p className="mt-4 text-canvas/70">{t("lede")}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/corporate/quote" className="btn btn-gold">{t("requestQuote")} <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/recipients/clients" className="btn btn-outline !border-white/20 !text-canvas hover:!bg-white/5">{t("shopCorporate")}</Link>
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
            <Building2 className="h-9 w-9 text-gold-soft" />
            <ul className="mt-6 space-y-3">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-canvas/80">
                  <Check className="h-4 w-4 text-teal" /> {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      <ProductRail products={products} title={locale === "fr" ? "Populaires pour l'entreprise" : "Popular for corporate"} link="/recipients/clients" linkLabel={t("shopCorporate")} />
    </div>
  );
}
