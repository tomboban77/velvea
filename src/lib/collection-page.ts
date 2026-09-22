import { cache } from "react";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { getProductsByCollection } from "@/lib/queries";
import { t as tc } from "@/lib/i18n-content";
import { labelFor, type NavLink } from "@/lib/nav";
import { PAGE_SIZE, collectionPageJsonLd, listingPolicy, pageMetadata, parsePage, siteOrigin, totalPages, type JsonLdValue } from "@/lib/seo";

/**
 * Shared plumbing for the three collection listings (/occasions, /recipients,
 * /category). Each page differs only in its collection type, nav list, base
 * path and copy, so the pagination, URL policy, metadata and structured data
 * live here and cannot drift apart.
 */

export type CollectionSearch = { sort?: string; min?: string; max?: string; recipient?: string; page?: string };
export type CollectionKind = "OCCASION" | "RECIPIENT" | "CATEGORY";

function priceBound(raw?: string) {
  return raw && Number.isFinite(Number(raw)) && Number(raw) >= 0 ? Number(raw) : undefined;
}

/** One read per request, shared by generateMetadata and the page body. */
export const loadCollection = cache(async (type: CollectionKind, slug: string, sp: CollectionSearch) => {
  const page = parsePage(sp.page);
  const floor = priceBound(sp.min);
  const cap = priceBound(sp.max);
  const recipient = type === "OCCASION" ? sp.recipient : undefined;
  const filtered = floor !== undefined || cap !== undefined || Boolean(recipient);
  if (page === null) return { page: null as null, collection: null, products: [], total: 0, filtered };
  const result = await getProductsByCollection(type, slug, {
    sort: sp.sort,
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    min: floor,
    max: cap,
    recipient,
  });
  return { page, ...result, filtered };
});

export function collectionTitle(
  data: { collection: { name: unknown } | null },
  fallback: NavLink | undefined,
  slug: string,
  locale: string
): string {
  return data.collection ? tc(data.collection.name, locale) : fallback ? labelFor(fallback, locale) : slug;
}

export async function collectionMetadata(opts: {
  type: CollectionKind;
  base: string;
  navList: NavLink[];
  slug: string;
  locale: string;
  sp: CollectionSearch;
}): Promise<Metadata> {
  const { type, base, navList, slug, locale, sp } = opts;
  const t = await getTranslations({ locale, namespace: "meta" });
  const fallback = navList.find((o) => o.slug === slug);
  const data = await loadCollection(type, slug, sp);
  const name = collectionTitle(data, fallback, slug, locale);
  const current = data.page ?? 1;

  // Stored SEO fields are the editorial source of truth; the templates are
  // only the fallback for collections nobody has written copy for yet.
  const storedTitle = tc(data.collection?.seoTitle, locale);
  const storedDescription = tc(data.collection?.seoDescription, locale) || tc(data.collection?.description, locale);
  const title = storedTitle || (type === "RECIPIENT" ? t("recipientTitle", { name }) : t("collectionTitle", { name }));
  const description =
    storedDescription ||
    (type === "OCCASION"
      ? t("occasionDescription", { name: name.toLowerCase() })
      : type === "RECIPIENT"
      ? t("recipientDescription", { name: name.toLowerCase() })
      : t("categoryDescription", { name }));

  const policy = listingPolicy({ page: current, filtered: data.filtered, empty: data.total === 0 });
  return pageMetadata({
    locale,
    path: `${base}/${slug}`,
    title: current > 1 ? t("pageSuffix", { title, page: current }) : title,
    description,
    image: data.collection?.imageUrl,
    index: policy.index,
    query: policy.query,
  });
}

export function collectionJsonLd(opts: {
  base: string;
  slug: string;
  locale: string;
  page: number;
  name: string;
  description?: string;
  productSlugs: string[];
}): JsonLdValue {
  const path = `${opts.base}/${opts.slug}${opts.page > 1 ? `?page=${opts.page}` : ""}`;
  return collectionPageJsonLd({
    origin: siteOrigin(),
    locale: opts.locale,
    path,
    name: opts.name,
    description: opts.description,
    productSlugs: opts.productSlugs,
  });
}

export { totalPages };
