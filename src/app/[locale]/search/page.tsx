import { setRequestLocale, getLocale } from "next-intl/server";
import { getAllProducts } from "@/lib/queries";
import { toProductView } from "@/lib/view";
import { ProductCard } from "@/components/shop/ProductCard";
import { Search as SearchIcon } from "lucide-react";
import { t as tc } from "@/lib/i18n-content";

export const dynamic = "force-dynamic";
export const metadata = { title: "Search" };

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
    <div className="container-x py-14">
      <form className="mx-auto max-w-xl">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
          <input name="q" defaultValue={q} placeholder={fr ? "Rechercher des paniers…" : "Search gift baskets…"} className="field !rounded-full pl-12 !py-3.5 text-lg" autoFocus />
        </div>
      </form>
      {query && (
        <p className="mt-8 text-center text-sm text-muted">
          {views.length} {fr ? "résultats pour" : "results for"} &ldquo;{q}&rdquo;
        </p>
      )}
      {views.length > 0 && (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {views.map((v) => <ProductCard key={v.id} product={v} />)}
        </div>
      )}
      {query && views.length === 0 && (
        <p className="mt-16 text-center text-muted">{fr ? "Aucun résultat. Essayez un autre terme." : "No results. Try another search."}</p>
      )}
    </div>
  );
}
