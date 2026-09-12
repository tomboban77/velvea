import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { Ornament } from "@/components/brand/Ornament";

export async function Corporate() {
  const t = await getTranslations("corporate");
  const features = [t("f1"), t("f2"), t("f3"), t("f4"), t("f5")];
  const how = [
    { n: "I", title: t("h1"), sub: t("h1Sub") },
    { n: "II", title: t("h2"), sub: t("h2Sub") },
    { n: "III", title: t("h3"), sub: t("h3Sub") },
  ];

  return (
    <section className="bg-ink-grad text-canvas">
      <div className="container-x section grid gap-14 lg:grid-cols-12 lg:items-center">
        <Reveal className="lg:col-span-6">
          <p className="chapter text-lilac-deep">Chapter V · {t("eyebrow")}</p>
          <Ornament className="mt-4" tone="light" />
          <h2 className="h-section mt-7 text-canvas balance">{t("title")}</h2>
          <p className="mt-6 max-w-lg text-[1.05rem] leading-relaxed text-canvas/70 pretty">{t("lede")}</p>
          <ul className="mt-8 grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-3 text-[0.95rem] text-canvas/85">
                <svg viewBox="0 0 10 10" width="7" height="7" aria-hidden className="mt-2 shrink-0 text-lilac-deep">
                  <path d="M5 0 10 5 5 10 0 5Z" fill="currentColor" />
                </svg>
                {f}
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link href="/corporate/quote" className="btn btn-gold">
              {t("requestQuote")} <ArrowRight />
            </Link>
            <Link href="/corporate" className="btn btn-outline-light">
              {t("shopCorporate")}
            </Link>
          </div>
          <p className="mt-5 text-xs text-canvas/50">{t("note")}</p>
        </Reveal>

        <Reveal delay={140} className="lg:col-span-5 lg:col-start-8">
          <div className="p-3">
            <div className="frame-light p-8 sm:p-10">
              <p className="chapter text-lilac-deep">{t("howTitle")}</p>
              <ol className="mt-6 divide-y divide-white/10">
                {how.map((h) => (
                  <li key={h.n} className="flex items-baseline gap-6 py-5">
                    <span className="font-caps w-8 shrink-0 text-[0.75rem] tracking-[0.2em] text-lilac-deep">{h.n}</span>
                    <div>
                      <p className="font-display text-[1.35rem] leading-tight text-canvas">{h.title}</p>
                      <p className="mt-1 text-sm text-canvas/60">{h.sub}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
