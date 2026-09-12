import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Check, ArrowRight } from "lucide-react";
import { ProductRail } from "@/components/shop/ProductRail";
import { Reveal } from "@/components/ui/Reveal";
import { getProductsByCollection } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const t = await getTranslations("corporate");
  return { title: t("pageTitle") };
}

export default async function CorporatePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("corporate");
  const { products } = await getProductsByCollection("RECIPIENT", "clients", { take: 4 });
  const features = [t("f1"), t("f2"), t("f3"), t("f4"), t("f5")];
  const how = [
    { n: "01", title: t("h1"), sub: t("h1Sub") },
    { n: "02", title: t("h2"), sub: t("h2Sub") },
    { n: "03", title: t("h3"), sub: t("h3Sub") },
  ];

  return (
    <div>
      {/* hero */}
      <section className="relative overflow-hidden bg-ink-grad text-canvas">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 -top-40 h-[30rem] w-[30rem] rounded-full opacity-[0.16] blur-[110px]"
          style={{ background: "var(--grad-iris)" }}
        />
        <div className="container-x relative grid gap-12 py-16 lg:grid-cols-12 lg:items-center lg:py-24">
          <div className="lg:col-span-7">
            <p className="eyebrow mb-4 text-lilac-deep">{t("eyebrow")}</p>
            <h1 className="h-display font-display text-canvas balance">{t("pageTitle")}</h1>
            <p className="mt-6 max-w-xl text-[1.05rem] text-canvas/70 pretty">{t("lede")}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/corporate/quote" className="btn btn-light btn-lg">
                {t("requestQuote")} <ArrowRight />
              </Link>
              <Link href="/recipients/clients" className="btn btn-outline-light btn-lg">
                {t("shopCorporate")}
              </Link>
            </div>
            <p className="mt-4 text-xs text-canvas/50">{t("note")}</p>
          </div>
          <div className="lg:col-span-4 lg:col-start-9">
            <ul className="space-y-3.5 rounded-2xl border border-white/10 bg-white/[0.04] p-7">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-[0.95rem] text-canvas/85">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-lilac-deep/50">
                    <Check className="h-3 w-3 text-lilac-deep" strokeWidth={2} />
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
        <p className="eyebrow mb-4">{t("howTitle")}</p>
        <div className="grid gap-10 md:grid-cols-3">
          {how.map((h, i) => (
            <Reveal key={h.n} delay={i * 100}>
              <div className="border-t border-line-strong pt-6">
                <span className="numeral text-6xl">{h.n}</span>
                <p className="mt-4 font-display text-xl text-ink">{h.title}</p>
                <p className="mt-2 text-[0.95rem] text-ink-soft">{h.sub}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="mt-12">
          <Link href="/corporate/quote" className="btn btn-primary">
            {t("requestQuote")} <ArrowRight />
          </Link>
        </div>
      </section>

      <ProductRail products={products} title={t("shopCorporate")} link="/recipients/clients" linkLabel={t("shopCorporate")} />
    </div>
  );
}
