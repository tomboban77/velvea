import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

export async function GuidesGrid() {
  const t = await getTranslations("guides");
  const tCommon = await getTranslations("common");
  const cards = [
    { kind: "Corporate", slug: "corporate", title: "Corporate & Workplace Gifting Advice" },
    { kind: "Etiquette", slug: "etiquette", title: "Sympathy & Condolence Gift Advice" },
    { kind: "Occasions", slug: "occasions", title: "Gift Ideas by Occasion" },
    { kind: "Recipients", slug: "recipients", title: "Gift Ideas by Recipient" },
    { kind: "Seasonal", slug: "seasonal", title: "Seasonal & Holiday Gift Guides" },
    { kind: "Etiquette", slug: "etiquette", title: "Personalization, Budget & Gift Etiquette" },
  ];

  return (
    <section className="bg-cream/60">
      <div className="container-x grid gap-12 py-20 lg:grid-cols-[0.8fr_1.2fr]">
        <Reveal>
          <p className="eyebrow mb-3">{t("eyebrow")}</p>
          <h2 className="font-display text-4xl leading-tight balance sm:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-ink-soft">{t("lede")}</p>
          <Link
            href="/guides"
            className="group mt-6 inline-flex items-center gap-2 text-sm font-semibold text-ink hover:text-gold"
          >
            {tCommon("browseGuides")}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2">
          {cards.map((c, i) => (
            <Reveal key={c.title} delay={i * 60}>
              <Link
                href={`/guides/${c.slug}`}
                className="group flex h-full flex-col justify-between rounded-2xl border border-line bg-shell p-6 card-hover"
              >
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gold">
                  {c.kind}
                </p>
                <p className="mt-6 font-display text-xl leading-snug text-ink">
                  {c.title}
                </p>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm text-ink-soft group-hover:text-gold">
                  {t("eyebrow").split(" ").slice(-2).join(" ")}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
