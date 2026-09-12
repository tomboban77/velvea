import { setRequestLocale, getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { getPublishedArticles } from "@/lib/queries";
import { t as tc } from "@/lib/i18n-content";

export const dynamic = "force-dynamic";
export const metadata = { title: "Gift Guides & Gifting Advice" };

export default async function GuidesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { locale } = await params;
  const { category } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("guides");

  const articles = await getPublishedArticles({ category, limit: 24 });
  const cats = ["CORPORATE", "SYMPATHY", "OCCASIONS", "RECIPIENTS", "SEASONAL", "ETIQUETTE"];

  return (
    <div className="container-x py-12">
      <header className="mb-8 max-w-2xl">
        <p className="eyebrow mb-3">{t("eyebrow")}</p>
        <h1 className="font-display text-4xl leading-tight balance sm:text-5xl">{t("title")}</h1>
        <p className="mt-4 text-ink-soft">{t("lede")}</p>
      </header>

      <div className="mb-8 flex flex-wrap gap-2">
        <Link href="/guides" className={`rounded-full border px-4 py-1.5 text-sm font-medium ${!category ? "border-ink bg-ink text-canvas" : "border-line-strong text-ink-soft hover:border-ink"}`}>
          All
        </Link>
        {cats.map((c) => (
          <Link key={c} href={`/guides?category=${c}`} className={`rounded-full border px-4 py-1.5 text-sm font-medium capitalize ${category === c ? "border-ink bg-ink text-canvas" : "border-line-strong text-ink-soft hover:border-ink"}`}>
            {c.toLowerCase()}
          </Link>
        ))}
      </div>

      {articles.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line-strong bg-cream/40 px-6 py-16 text-center text-muted">
          Guides are coming soon.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a, i) => (
            <Reveal key={a.id} delay={(i % 6) * 60}>
              <Link href={`/guides/${a.slug}`} className="group flex h-full flex-col rounded-2xl border border-line bg-shell p-6 card-hover">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-violet">{a.category.toLowerCase()}</p>
                <h2 className="mt-4 font-display text-2xl leading-snug text-ink">{tc(a.title, locale)}</h2>
                <p className="mt-3 flex-1 text-sm text-ink-soft">{tc(a.excerpt, locale)}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ink group-hover:text-violet">
                  Read guide <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
