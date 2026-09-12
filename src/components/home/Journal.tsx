import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { getPublishedArticles } from "@/lib/queries";
import { t as tc } from "@/lib/i18n-content";

/** Shows published guides only; hidden until the journal has content. */
export async function Journal() {
  const t = await getTranslations("journal");
  const locale = await getLocale();
  const articles = await getPublishedArticles({ limit: 3 });
  if (!articles.length) return null;

  return (
    <section className="section">
      <div className="container-x">
        <SectionHeading chapter="Chapter IX" eyebrow={t("eyebrow")} title={t("title")} link="/guides" linkLabel={t("readAll")} />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {articles.map((a, i) => (
            <Reveal key={a.id} delay={i * 90}>
              <Link href={`/guides/${a.slug}`} className="group flex h-full flex-col border-t border-line-strong pt-6">
                <p className="text-[0.65rem] uppercase tracking-[0.24em] text-violet">{a.category.toLowerCase()}</p>
                <h3 className="mt-3 font-display text-2xl leading-snug text-ink group-hover:text-violet transition-colors">
                  {tc(a.title, locale)}
                </h3>
                <p className="mt-3 flex-1 text-sm text-ink-soft">{tc(a.excerpt, locale)}</p>
                <span className="link-draw mt-5 text-sm font-medium text-ink">
                  {t("read")} <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.6} />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
