import { cache } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Listing } from "@/components/shop/Listing";
import { JsonLd } from "@/components/seo/JsonLd";
import { getAllProducts } from "@/lib/queries";
import { PAGE_SIZE, collectionPageJsonLd, listingPolicy, pageMetadata, parsePage, siteOrigin, totalPages } from "@/lib/seo";

export const dynamic = "force-dynamic";

type Search = { sort?: string; min?: string; max?: string; q?: string; page?: string };

function priceBound(raw?: string) {
  return raw && Number.isFinite(Number(raw)) && Number(raw) >= 0 ? Number(raw) : undefined;
}

/** One read per request, shared by generateMetadata and the page. */
const load = cache(async (sp: Search) => {
  const page = parsePage(sp.page);
  const floor = priceBound(sp.min);
  const cap = priceBound(sp.max);
  const query = (sp.q ?? "").trim().toLowerCase().slice(0, 80);
  if (page === null) return { page: null as null, products: [], total: 0, query, floor, cap };

  // Names are bilingual JSON, so a case-insensitive search is done here rather
  // than in SQL. The catalogue is small enough that fetching it all is cheap.
  const fetched = await getAllProducts({
    sort: sp.sort,
    take: query ? 500 : PAGE_SIZE,
    skip: query ? 0 : (page - 1) * PAGE_SIZE,
    min: floor,
    max: cap,
  });
  const matches = (value: unknown) =>
    typeof value === "object" && value !== null
      ? Object.values(value as Record<string, unknown>).some((v) => typeof v === "string" && v.toLowerCase().includes(query))
      : typeof value === "string" && value.toLowerCase().includes(query);
  const products = query ? fetched.products.filter((p) => matches(p.name) || matches(p.tagline)).slice(0, PAGE_SIZE) : fetched.products;
  const total = query ? products.length : fetched.total;
  return { page, products, total, query, floor, cap };
});

export async function generateMetadata({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<Search> }) {
  const [{ locale }, sp] = await Promise.all([params, searchParams]);
  const t = await getTranslations({ locale, namespace: "meta" });
  const { page, total, query, floor, cap } = await load(sp);
  const current = page ?? 1;
  const policy = listingPolicy({ page: current, filtered: Boolean(query || floor !== undefined || cap !== undefined), empty: total === 0 });
  const title = t("basketsTitle");
  return pageMetadata({
    locale,
    path: "/baskets",
    title: current > 1 ? t("pageSuffix", { title, page: current }) : title,
    description: t("basketsDescription"),
    index: policy.index,
    query: policy.query,
  });
}

export default async function BasketsPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<Search> }) {
  const [{ locale }, sp] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);
  const t = await getTranslations();
  const { page, products, total, query } = await load(sp);
  const pages = totalPages(total);
  // An out-of-range page is a 404, not an empty page 1: soft 404s get indexed.
  if (page === null || (page > 1 && page > pages)) notFound();

  return (
    <>
      {!query && products.length > 0 && (
        <JsonLd
          data={collectionPageJsonLd({
            origin: siteOrigin(),
            locale,
            path: page > 1 ? `/baskets?page=${page}` : "/baskets",
            name: t("listing.allTitle"),
            description: t("listing.allLede"),
            productSlugs: products.map((p) => p.slug),
          })}
        />
      )}
      <Listing
        eyebrow={t("collection.eyebrow")}
        title={t("listing.allTitle")}
        description={t("listing.allLede")}
        products={products}
        total={total}
        searchable
        showOccasions
        breadcrumb={[
          { label: t("pdp.home"), href: "/" },
          { label: t("listing.allTitle"), href: "/baskets" },
        ]}
        pagination={query ? undefined : { page, totalPages: pages, basePath: "/baskets", params: { sort: sp.sort, min: sp.min, max: sp.max } }}
      />
    </>
  );
}
