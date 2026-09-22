import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { getPublishedArticles } from "@/lib/queries";
import { t as tc } from "@/lib/i18n-content";
import { cn } from "@/lib/utils";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ category?: string }> }) {
  const [{ locale }, { category }] = await Promise.all([params, searchParams]);
  const t = await getTranslations({ locale, namespace: "meta" });
  // A category filter is an uncurated subset of the same list: crawlable, not indexed.
  return pageMetadata({ locale, path: "/guides", title: t("guidesTitle"), description: t("guidesDescription"), index: !category });
}

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
  const tp = await getTranslations("pdp");
  const articles = await getPublishedArticles({ category, limit: 24 });
  const cats = ["CORPORATE", "SYMPATHY", "OCCASIONS", "RECIPIENTS", "SEASONAL", "ETIQUETTE"];

  return (
    <div>
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} lede={t("lede")} breadcrumb={[{ label: tp("home"), href: "/" }, { label: t("title"), href: "/guides" }]}>
        <div className="mt-7 flex flex-wrap gap-2">
          <Link href="/guides" className={cn("chip", !category && "is-active")}>{t("all")}</Link>
          {cats.map((c) => (
            <Link key={c} href={`/guides?category=${c}`} className={cn("chip capitalize", category === c && "is-active")}>
              {c.toLowerCase()}
            </Link>
          ))}
        </div>
      </PageHeader>

      <div className="container-x py-10 lg:py-14">
        {articles.length === 0 ? (
          <p className="rounded-lg border border-dashed border-line-strong bg-cream/60 px-6 py-16 text-center text-ink-soft">
            {t("comingSoon")}
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4">
            {articles.map((a) => (
              <Link key={a.id} href={`/guides/${a.slug}`} className="group flex h-full flex-col rounded-lg border border-line bg-white p-7 card-hover">
                <p className="caps">{a.category.toLowerCase()}</p>
                <h2 className="mt-3 font-display text-[1.5rem] font-medium leading-snug text-ink group-hover:text-violet-deep">{tc(a.title, locale)}</h2>
                <p className="mt-3 flex-1 text-[0.95rem] leading-relaxed text-ink-soft">{tc(a.excerpt, locale)}</p>
                <span className="link-draw mt-6">
                  {t("readGuide")} <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
