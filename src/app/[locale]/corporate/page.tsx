import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Check, ArrowRight } from "lucide-react";
import { ProductRail } from "@/components/shop/ProductRail";
import { getProductsByCollection } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return pageMetadata({
    locale,
    path: "/corporate",
    title: t("corporateTitle"),
    description: t("corporateDescription"),
  });
}

export default async function CorporatePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("corporate");
  const { products } = await getProductsByCollection("RECIPIENT", "clients", { take: 5 });
  const features = [t("f1"), t("f2"), t("f3"), t("f4"), t("f5")];
  const how = [
    { title: t("h1"), sub: t("h1Sub") },
    { title: t("h2"), sub: t("h2Sub") },
    { title: t("h3"), sub: t("h3Sub") },
  ];

  return (
    <div>
      {/* hero */}
      <section className="band-ink">
        <div className="container-x grid gap-12 py-14 lg:grid-cols-12 lg:items-center lg:py-24">
          <div className="lg:col-span-7">
            <p className="caps text-gold-pale">{t("eyebrow")}</p>
            <h1 className="h-display mt-4 text-white balance">{t("pageTitle")}</h1>
            <p className="mt-6 max-w-xl text-[1.08rem] leading-relaxed text-white/72 pretty">{t("lede")}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/corporate/quote" className="btn btn-light btn-lg">
                {t("requestQuote")} <ArrowRight />
              </Link>
              <Link href="/recipients/clients" className="btn btn-outline-light btn-lg">
                {t("shopCorporate")}
              </Link>
            </div>
            <p className="mt-4 text-sm text-white/50">{t("note")}</p>
          </div>
          <div className="lg:col-span-4 lg:col-start-9">
            <ul className="space-y-4 rounded-lg border border-white/12 bg-white/[0.05] p-7">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-[0.98rem] text-white/88">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10">
                    <Check className="h-3 w-3 text-gold-pale" strokeWidth={2.4} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* how it works */}
      <section className="container-x section">
        <p className="caps">{t("howTitle")}</p>
        <div className="mt-6 grid gap-6 md:grid-cols-3 md:gap-8">
          {how.map((h, i) => (
            <div key={h.title} className="rounded-lg border border-line bg-white p-7">
              <span className="step-num text-violet-deep">{i + 1}</span>
              <p className="mt-5 font-display text-[1.45rem] font-medium leading-tight text-ink">{h.title}</p>
              <p className="mt-2 text-[0.98rem] leading-relaxed text-ink-soft">{h.sub}</p>
            </div>
          ))}
        </div>
        <div className="mt-10">
          <Link href="/corporate/quote" className="btn btn-primary btn-lg">
            {t("requestQuote")} <ArrowRight />
          </Link>
        </div>
      </section>

      <ProductRail products={products} title={t("shopCorporate")} link="/recipients/clients" linkLabel={t("shopCorporate")} tone="cream" />
    </div>
  );
}
