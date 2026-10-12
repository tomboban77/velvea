import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { ArrowRight, Check } from "lucide-react";
import { getCorporateProducts } from "@/lib/queries";
import { t as tc } from "@/lib/i18n-content";
import { formatMoney } from "@/lib/utils";

export async function Corporate() {
  const t = await getTranslations("corporate");
  const locale = await getLocale();
  // The ready-to-order boxes, so a buyer sees a price before asking for a quote.
  const boxes = (await getCorporateProducts(2)).map((p) => ({
    slug: p.slug,
    name: tc(p.name, locale),
    image: p.images[0]?.url ?? null,
    price: formatMoney(p.priceCents, locale === "fr" ? "fr-CA" : "en-CA"),
  }));
  const features = [t("f1"), t("f2"), t("f3"), t("f4"), t("f5")];
  const how = [
    { title: t("h1"), sub: t("h1Sub") },
    { title: t("h2"), sub: t("h2Sub") },
    { title: t("h3"), sub: t("h3Sub") },
  ];

  return (
    <section className="band-ink">
      <div className="container-x section grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
        <div className="lg:col-span-6">
          <p className="caps text-gold-pale">{t("eyebrow")}</p>
          <h2 className="h-section mt-4 text-white balance">{t("title")}</h2>
          <p className="mt-5 max-w-lg text-[1.05rem] leading-relaxed text-white/72 pretty">{t("lede")}</p>
          <ul className="mt-8 grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-3 text-[0.95rem] text-white/88">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10">
                  <Check className="h-3 w-3 text-gold-pale" strokeWidth={2.4} />
                </span>
                {f}
              </li>
            ))}
          </ul>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link href="/corporate/quote" className="btn btn-light btn-lg">
              {t("requestQuote")} <ArrowRight />
            </Link>
            <Link href="/corporate" className="btn btn-outline-light btn-lg">
              {t("shopCorporate")}
            </Link>
          </div>
          <p className="mt-4 text-sm text-white/50">{t("note")}</p>

          {boxes.length > 0 && (
            <div className="mt-10">
              <p className="caps text-gold-pale">{t("readyEyebrow")}</p>
              <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                {boxes.map((b) => (
                  <li key={b.slug}>
                    <Link
                      href={`/products/${b.slug}`}
                      className="group flex items-center gap-4 rounded-lg border border-white/12 bg-white/[0.05] p-3 transition-colors hover:bg-white/[0.09]"
                    >
                      <span className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-white/10">
                        {b.image && <Image src={b.image} alt="" fill sizes="80px" className="object-cover" />}
                      </span>
                      <span className="min-w-0">
                        <span className="block font-display text-[1.05rem] leading-tight text-white group-hover:underline">{b.name}</span>
                        <span className="mt-1 block text-sm text-gold-pale">{b.price}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="lg:col-span-5 lg:col-start-8">
          <div className="rounded-lg border border-white/12 bg-white/[0.05] p-7 sm:p-9">
            <p className="caps text-gold-pale">{t("howTitle")}</p>
            <ol className="mt-5 divide-y divide-white/10">
              {how.map((h, i) => (
                <li key={h.title} className="flex items-start gap-5 py-5">
                  <span className="step-num h-10 w-10 text-[1rem] text-gold-pale">{i + 1}</span>
                  <div>
                    <p className="font-display text-[1.3rem] leading-tight text-white">{h.title}</p>
                    <p className="mt-1 text-sm text-white/60">{h.sub}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
