import { setRequestLocale, getTranslations } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import { PromiseBar } from "@/components/home/PromiseBar";
import { PageHeader } from "@/components/ui/PageHeader";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return pageMetadata({
    locale,
    path: "/about",
    title: t("aboutTitle"),
    description: t("aboutDescription"),
  });
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("atelier");
  const tp = await getTranslations("pdp");
  const fr = locale === "fr";

  const sections = fr
    ? [
        { h: "Notre conviction", p: "Le bon cadeau ne dépend jamais du prix. Un anniversaire appelle un peu d'indulgence ; un geste de sympathie doit être doux et réfléchi. Trouver le ton juste, c'est ce qui rend un cadeau mémorable." },
        { h: "Notre promesse", p: "Seuls des produits que nous offririons nous-mêmes entrent dans nos paniers. Chacun est assemblé après votre commande, fini à la main et arrangé pour arriver exactement comme en ligne." },
        { h: "Fait à Mississauga", p: "De notre atelier à leur porte : livraison le jour même dans le Grand Toronto, et livraison suivie partout en Ontario." },
      ]
    : [
        { h: "What we believe", p: "The right gift never depends on price. A birthday calls for a little indulgence; a sympathy gift needs to feel gentle and considered. Getting the tone right is what makes a gift memorable." },
        { h: "Our promise", p: "Only products we would give ourselves make it into a basket. Each one is assembled after you order, finished by hand and arranged to arrive exactly as it appeared online." },
        { h: "Made in Mississauga", p: "From our atelier to their door: same-day delivery across the GTA, and tracked delivery anywhere in Ontario." },
      ];

  return (
    <div>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        lede={t("body2")}
        breadcrumb={[{ label: tp("home"), href: "/" }, { label: t("eyebrow"), href: "/about" }]}
      >
        <p className="mt-5 text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-muted">{t("badge")}</p>
      </PageHeader>

      <section className="container-x section">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-cream">
              <Image src="/images/gifting-editorial.webp" alt={fr ? "Coffrets ivoire et rubans prune" : "Ivory gift boxes with plum ribbon"} fill sizes="(max-width:1023px) 100vw, 40vw" className="object-cover" />
            </div>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <blockquote className="border-l-2 border-violet-deep pl-6 font-display text-[1.5rem] italic leading-[1.4] text-ink sm:text-[1.9rem]">
              “{t("body1")}”
            </blockquote>
            <p className="mt-5 text-sm font-semibold text-ink">{t("sign")}</p>
            <div className="mt-10 grid gap-8 sm:grid-cols-1">
              {sections.map((s, i) => (
                <div key={s.h} className="flex gap-5">
                  <span className="step-num text-violet-deep">{i + 1}</span>
                  <div>
                    <h2 className="font-display text-[1.4rem] font-medium">{s.h}</h2>
                    <p className="mt-2 text-[0.98rem] leading-relaxed text-ink-soft pretty">{s.p}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/baskets" className="btn btn-primary">
                {fr ? "Voir les paniers" : "Shop gift baskets"} <ArrowRight />
              </Link>
              <Link href="/corporate" className="btn btn-outline">
                {fr ? "Cadeaux d'entreprise" : "Corporate gifting"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PromiseBar />
    </div>
  );
}
