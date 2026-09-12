import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { PromiseBar } from "@/components/home/PromiseBar";

export async function generateMetadata() {
  const t = await getTranslations("atelier");
  return { title: t("eyebrow") };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("atelier");
  const fr = locale === "fr";

  const sections = fr
    ? [
        {
          h: "Notre conviction",
          p: "Le bon cadeau ne dépend jamais du prix. Un anniversaire appelle un peu d'indulgence ; un geste de sympathie doit être doux et réfléchi. Trouver le ton juste, c'est ce qui rend un cadeau mémorable.",
        },
        {
          h: "Notre promesse",
          p: "Seuls des produits que nous offririons nous-mêmes entrent dans nos paniers. Chacun est assemblé après votre commande, fini à la main et arrangé pour arriver exactement comme en ligne.",
        },
        {
          h: "Fait à Mississauga",
          p: "De notre atelier à leur porte : livraison le jour même dans le Grand Toronto avant 16 h, et expédition suivie dans chaque province et territoire.",
        },
      ]
    : [
        {
          h: "What we believe",
          p: "The right gift never depends on price. A birthday calls for a little indulgence; a sympathy gift needs to feel gentle and considered. Getting the tone right is what makes a gift memorable.",
        },
        {
          h: "Our promise",
          p: "Only products we would give ourselves make it into a basket. Each one is assembled after you order, finished by hand and arranged to arrive exactly as it appeared online.",
        },
        {
          h: "Made in Mississauga",
          p: "From our atelier to their door: same-day delivery across the GTA before 4 PM, and tracked shipping to every province and territory.",
        },
      ];

  return (
    <div>
      <section className="container-x pt-12 lg:pt-16">
        <div className="max-w-3xl">
          <p className="eyebrow mb-4">{t("eyebrow")}</p>
          <h1 className="h-display font-display balance">{t("title")}</h1>
          <p className="mt-6 max-w-2xl text-[1.1rem] leading-relaxed text-ink-soft pretty">{t("body2")}</p>
          <p className="mt-6 text-[0.68rem] uppercase tracking-[0.26em] text-muted">{t("badge")}</p>
        </div>
      </section>

      <section className="container-x section">
        <div className="grid gap-10 md:grid-cols-3">
          {sections.map((s, i) => (
            <Reveal key={s.h} delay={i * 100}>
              <div className="border-t border-line-strong pt-6">
                <span className="numeral text-5xl">0{i + 1}</span>
                <h2 className="mt-4 font-display text-2xl">{s.h}</h2>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-soft pretty">{s.p}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={200}>
          <blockquote className="mt-16 max-w-3xl border-l border-lilac-deep pl-8">
            <p className="font-display text-[1.6rem] leading-[1.3] text-ink balance sm:text-[2rem]">“{t("body1")}”</p>
            <footer className="mt-4 text-[0.68rem] uppercase tracking-[0.26em] text-violet">{t("sign")}</footer>
          </blockquote>
        </Reveal>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link href="/baskets" className="btn btn-primary">
            {fr ? "Voir les paniers" : "Shop gift baskets"} <ArrowRight />
          </Link>
          <Link href="/corporate" className="btn btn-outline">
            {fr ? "Cadeaux d'entreprise" : "Corporate gifting"}
          </Link>
        </div>
      </section>

      <PromiseBar />
    </div>
  );
}
