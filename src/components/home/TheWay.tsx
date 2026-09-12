import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { getSettings } from "@/lib/settings";
import { formatMoney } from "@/lib/utils";

/** Process and delivery facts in one calm, engraved section. */
export async function TheWay() {
  const t = await getTranslations("way");
  const locale = await getLocale();
  const s = await getSettings();
  const free = formatMoney(s.delivery.freeShippingThresholdCents, locale === "fr" ? "fr-CA" : "en-CA").replace(/[.,]00/, "");

  const steps = [
    { n: "I", title: t("s1"), sub: t("s1Sub") },
    { n: "II", title: t("s2"), sub: t("s2Sub") },
    { n: "III", title: t("s3"), sub: t("s3Sub") },
  ];
  const facts = [
    { title: t("f1"), sub: t("f1Sub") },
    { title: t("f2"), sub: t("f2Sub") },
    { title: t("f3"), sub: t("f3Sub", { amount: free }) },
  ];

  return (
    <section className="section bg-cream">
      <div className="container-x">
        <SectionHeading chapter="Chapter IV" eyebrow={t("eyebrow")} title={t("title")} />

        <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-10">
          {steps.map((st, i) => (
            <Reveal key={st.n} delay={i * 100}>
              <div className="text-center">
                <p className="numeral text-[5rem]">{st.n}</p>
                <p className="mt-5 font-display text-[1.5rem] leading-tight text-ink">{st.title}</p>
                <p className="mx-auto mt-3 max-w-xs text-[0.95rem] leading-relaxed text-ink-soft pretty">{st.sub}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={200}>
          <div className="double-rule mt-16" />
          <div className="grid gap-8 py-8 sm:grid-cols-3 sm:divide-x sm:divide-line">
            {facts.map((f) => (
              <div key={f.title} className="text-center sm:px-6">
                <p className="caps text-[0.62rem] text-violet">{f.title}</p>
                <p className="mt-2 font-display text-[1.2rem] text-ink">{f.sub}</p>
              </div>
            ))}
          </div>
          <div className="double-rule" />
          <div className="mt-8 text-center">
            <Link href="/shipping" className="link-draw text-ink">
              {t("link")} <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.6} />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
