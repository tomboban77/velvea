import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Check, ArrowRight, Building2 } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

export async function CorporateBanner() {
  const t = await getTranslations("corporate");
  const features = [t("f1"), t("f2"), t("f3"), t("f4"), t("f5")];

  return (
    <section className="container-x py-20">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        {/* visual */}
        <Reveal className="order-2 lg:order-1">
          <div className="relative">
            <div className="relative aspect-[5/4] overflow-hidden rounded-[2rem] border border-line bg-[radial-gradient(120%_120%_at_20%_0%,#211b15,#3a2f24)] p-8 shadow-lg">
              <div className="flex h-full flex-col justify-between text-canvas">
                <Building2 className="h-9 w-9 text-gold-soft" />
                <div>
                  <p className="font-display text-3xl leading-tight text-canvas">
                    {t("cardTitle")}
                  </p>
                  <p className="mt-2 text-sm text-canvas/70">{t("cardSub")}</p>
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    "linear-gradient(150deg,#b0894e,#c9a86c)",
                    "linear-gradient(150deg,#1f7a78,#2f9d9a)",
                    "linear-gradient(150deg,#6d4c8c,#a86bb0)",
                  ].map((g, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-xl ring-1 ring-white/10"
                      style={{ background: g }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute -right-4 -top-4 rounded-2xl border border-line bg-canvas px-4 py-2.5 text-sm font-semibold shadow-lg">
              Volume pricing
            </div>
          </div>
        </Reveal>

        {/* copy */}
        <Reveal delay={120} className="order-1 lg:order-2">
          <p className="eyebrow mb-3">{t("eyebrow")}</p>
          <h2 className="font-display text-4xl leading-tight balance sm:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-ink-soft">{t("lede")}</p>
          <ul className="mt-6 space-y-3">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-3 text-ink-soft">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-iris-soft">
                  <Check className="h-3 w-3 text-teal-deep" />
                </span>
                {f}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/corporate/quote" className="btn btn-primary">
              {t("requestQuote")} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/corporate" className="btn btn-outline">
              {t("shopCorporate")}
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
