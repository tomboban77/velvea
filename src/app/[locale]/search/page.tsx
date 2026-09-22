import { setRequestLocale, getTranslations } from "next-intl/server";
import { getAllProducts } from "@/lib/queries";
import { toProductView } from "@/lib/view";
import { ProductCard } from "@/components/shop/ProductCard";
import { EmptyBaskets } from "@/components/shop/EmptyBaskets";
import { Search as SearchIcon } from "lucide-react";
import { t as tc } from "@/lib/i18n-content";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
// Internal search results are never indexed; robots.txt leaves the route
// crawlable so this noindex can actually be read.
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return pageMetadata({
    locale,
    path: "/search",
    title: t("searchTitle"),
    index: false,
    alternates: false,
  });
}

export default async function SearchPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ q?: string }> }) {
  const { locale } = await params;
  const { q } = await searchParams;
  setRequestLocale(locale);
  const fr = locale === "fr";
  const { products } = await getAllProducts({ take: 100 });
  const query = (q ?? "").toLowerCase().trim();
  const results = query
    ? products.filter((p) => (tc(p.name, locale) + " " + tc(p.tagline, locale)).toLowerCase().includes(query))
    : [];
  const views = results.map((p) => toProductView(p, locale));

  return (
    <div>
      <div className="band-cream border-b border-line">
        <div className="container-x py-10 lg:py-14">
          <p className="caps text-center">{fr ? "Recherche" : "Search"}</p>
          <h1 className="h-section mt-3 text-center">{fr ? "Que cherchez-vous ?" : "What are you looking for?"}</h1>
          <form className="mx-auto mt-7 max-w-2xl">
            <div className="search-form">
              <input name="q" defaultValue={q} placeholder={fr ? "Rechercher des paniers…" : "Search gift baskets…"} autoFocus aria-label={fr ? "Rechercher" : "Search"} />
              <button type="submit" aria-label={fr ? "Rechercher" : "Search"}>
                <SearchIcon className="h-5 w-5" strokeWidth={1.8} />
              </button>
            </div>
          </form>
          {query && (
            <p className="mt-5 text-center text-sm text-ink-soft">
              {views.length} {fr ? "résultat(s) pour" : (views.length === 1 ? "result for" : "results for")} &ldquo;{q}&rdquo;
            </p>
          )}
        </div>
      </div>
      <div className="container-x py-10">
        {views.length > 0 && (
          <div className="grid-products">
            {views.map((v) => <ProductCard key={v.id} product={v} />)}
          </div>
        )}
        {query && views.length === 0 && <EmptyBaskets />}
      </div>
    </div>
  );
}
