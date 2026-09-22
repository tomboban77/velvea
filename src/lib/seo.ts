import type { Metadata, MetadataRoute } from "next";
import { LOCALES, DEFAULT_LOCALE, type Locale } from "@/i18n/locales";
import { t as tc } from "@/lib/i18n-content";

/**
 * Everything search engines see in one place: the production origin, the
 * pre-launch indexing switch, canonical/hreflang metadata, JSON-LD builders and
 * the sitemap/robots builders. Pure functions only — the App Router files
 * (`sitemap.ts`, `robots.ts`, each `generateMetadata`) call in here so the
 * behaviour is unit-tested in `tests/seo.test.ts` without a Next runtime.
 */

export const BRAND = "Velvéa";
export const DEFAULT_OG_IMAGE = "/brand/velvea-og.png?v=6";

/** hreflang codes. Google matches on language, and the region tells it these are Canadian pages. */
export const HREFLANG: Record<Locale, string> = { en: "en-CA", fr: "fr-CA" };
const OG_LOCALE: Record<Locale, string> = { en: "en_CA", fr: "fr_CA" };

// ---------------------------------------------------------------------------
// Origin
// ---------------------------------------------------------------------------

/**
 * Normalised public origin, no trailing slash. On the production deployment a
 * missing or localhost origin would put `http://localhost:3000` into every
 * canonical, OG URL and sitemap entry, so it is rejected there instead of
 * falling back. Keyed on VERCEL_ENV rather than NODE_ENV so a local
 * `next build` against the dev `.env` still works.
 */
export function siteOrigin(env: NodeJS.ProcessEnv = process.env): string {
  const raw = (env.NEXT_PUBLIC_SITE_URL || "").trim().replace(/\/+$/, "");
  const strict = env.VERCEL_ENV === "production";
  if (!raw) {
    if (strict) throw new Error("NEXT_PUBLIC_SITE_URL is not set.");
    return "http://localhost:3000";
  }
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`NEXT_PUBLIC_SITE_URL is not a valid URL: "${raw}".`);
  }
  if (strict) {
    const local = url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.hostname.endsWith(".local");
    if (local || url.protocol !== "https:") {
      throw new Error(`NEXT_PUBLIC_SITE_URL must be an https production origin, got "${raw}".`);
    }
  }
  return url.origin;
}

// ---------------------------------------------------------------------------
// Indexing switch (V-00)
// ---------------------------------------------------------------------------

/**
 * `SITE_INDEXING` controls what search engines may index:
 *
 *   off  — (default) every storefront page is `noindex, follow`, the sitemap is
 *          empty. Missing configuration must never expose unfinished inventory,
 *          which is why the default is the closed state and why preview deploys
 *          need no extra setup.
 *   home — only the homepage (both locales) is indexable. For announcing the
 *          brand before the catalogue is ready.
 *   all  — normal operation. Utility pages (account, checkout, search…) stay
 *          noindex through their own metadata regardless.
 *
 * `robots.txt` still allows crawling in every mode, because a crawler has to
 * fetch a page to read its noindex. Blocking would only hide the signal.
 */
export type IndexingMode = "off" | "home" | "all";

export function indexingMode(env: NodeJS.ProcessEnv = process.env): IndexingMode {
  const v = (env.SITE_INDEXING || "").trim().toLowerCase();
  if (v === "all" || v === "home") return v;
  return "off";
}

/** Whether a page at `path` may be indexed under the current switch. */
export function pathIndexable(path: string, mode: IndexingMode = indexingMode()): boolean {
  if (mode === "all") return true;
  if (mode === "home") return path === "/";
  return false;
}

// ---------------------------------------------------------------------------
// URLs
// ---------------------------------------------------------------------------

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** Locale-prefixed path: EN lives at `/`, FR at `/fr` (localePrefix "as-needed"). */
export function localePath(locale: Locale | string, path: string): string {
  const clean = path === "/" ? "" : path.replace(/\/+$/, "");
  if (locale === DEFAULT_LOCALE) return clean || "/";
  return `/${locale}${clean}`;
}

export function absoluteUrl(locale: Locale | string, path: string, origin = siteOrigin()): string {
  return `${origin}${localePath(locale, path)}`;
}

/** Append a canonical query string (only the keys that define a distinct page, e.g. `page`). */
export function withQuery(path: string, query?: Record<string, string | number | undefined>): string {
  if (!query) return path;
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) if (v !== undefined && v !== "") sp.set(k, String(v));
  const qs = sp.toString();
  return qs ? `${path}?${qs}` : path;
}

// ---------------------------------------------------------------------------
// Translation readiness
// ---------------------------------------------------------------------------

/**
 * A French value is "ready" when it exists, is not blank and differs from the
 * English. `localized()` in i18n-content copies English into empty French
 * fields on save, so equality is the tell-tale of an untranslated record.
 * Names may legitimately match in both languages, so callers pass a body-like
 * field (description, excerpt…) rather than the name.
 */
export function hasFrench(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  const fr = typeof v.fr === "string" ? v.fr.trim() : "";
  const en = typeof v.en === "string" ? v.en.trim() : "";
  return fr.length > 0 && fr !== en;
}

// ---------------------------------------------------------------------------
// Page metadata (V-01, V-02, V-10, V-18, V-21, V-23)
// ---------------------------------------------------------------------------

export type PageMeta = {
  locale: string;
  /** Locale-less path, e.g. "/baskets" or "/products/x". */
  path: string;
  /** Unbranded title; the root layout's template appends " · Velvéa". */
  title: string;
  description?: string | null;
  /** Absolute or root-relative image; defaults to the brand card. */
  image?: string | null;
  /**
   * False for utility pages (account, checkout…), filtered listings and any
   * page that must not be indexed regardless of the launch switch.
   */
  index?: boolean;
  /**
   * False when the other locale is not ready (untranslated product or guide):
   * no hreflang pair is declared, and the FR page is noindex.
   */
  alternates?: boolean;
  /** Query keys that make this a distinct page (pagination). Sort/filter params are never canonical. */
  query?: Record<string, string | number | undefined>;
  type?: "website" | "article";
  /** For articles: ISO dates. */
  publishedTime?: string;
  modifiedTime?: string;
  /** Skip the root " · Velvéa" template (the homepage title already carries the brand). */
  absoluteTitle?: boolean;
  /** Overrides the launch switch — tests only. */
  mode?: IndexingMode;
  origin?: string;
};

export function pageMetadata(meta: PageMeta): Metadata {
  const locale: Locale = isLocale(meta.locale) ? meta.locale : DEFAULT_LOCALE;
  const origin = meta.origin ?? siteOrigin();
  const mode = meta.mode ?? indexingMode();
  const pathWithQuery = withQuery(meta.path, meta.query);
  const canonical = absoluteUrl(locale, pathWithQuery, origin);
  const alternates = meta.alternates !== false;
  const description = meta.description?.trim() || undefined;
  const image = meta.image?.trim() || DEFAULT_OG_IMAGE;
  // A stored SEO title that already names the brand must not get the template
  // suffix too — the live site once rendered "… Velvea · Velvea".
  const absolute = Boolean(meta.absoluteTitle) || /velv[ée]a/i.test(meta.title);
  const brandedTitle = absolute ? meta.title : `${meta.title} · ${BRAND}`;

  const index = (meta.index ?? true) && pathIndexable(meta.path, mode) && (alternates || locale === DEFAULT_LOCALE);

  const languages: Record<string, string> = {};
  if (alternates) {
    for (const l of LOCALES) languages[HREFLANG[l]] = absoluteUrl(l, pathWithQuery, origin);
    languages["x-default"] = absoluteUrl(DEFAULT_LOCALE, pathWithQuery, origin);
  }

  return {
    title: absolute ? { absolute: meta.title } : meta.title,
    description,
    alternates: {
      canonical,
      ...(alternates ? { languages } : {}),
    },
    // Next merges metadata shallowly: a page-level openGraph replaces the root
    // one entirely, so every field is set here rather than inherited.
    openGraph: {
      type: meta.type ?? "website",
      siteName: BRAND,
      url: canonical,
      title: brandedTitle,
      description,
      images: [image],
      locale: OG_LOCALE[locale],
      ...(alternates ? { alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => OG_LOCALE[l]) } : {}),
      ...(meta.type === "article"
        ? { publishedTime: meta.publishedTime, modifiedTime: meta.modifiedTime }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: brandedTitle,
      description,
      images: [image],
    },
    // `follow` stays on so internal links are still discovered during pre-launch.
    ...(index ? {} : { robots: { index: false, follow: true } }),
  };
}

// ---------------------------------------------------------------------------
// JSON-LD (V-03, V-04, V-06, V-07, V-08)
// ---------------------------------------------------------------------------

export type JsonLdValue = Record<string, unknown>;

/**
 * JSON.stringify does not escape "<", so a description containing "</script>"
 * would break out of the tag. Escaping "<" keeps the JSON valid and the page
 * intact. U+2028/2029 are legal in JSON but not in JS source pre-ES2019 and
 * confuse some parsers, so they are escaped too.
 */
export function jsonLdString(data: JsonLdValue | JsonLdValue[]): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(new RegExp("\u2028", "g"), "\\u2028")
    .replace(new RegExp("\u2029", "g"), "\\u2029");
}

export type OrgContact = {
  email?: string;
  phone?: string;
  addressLine?: string;
  city?: string;
  province?: string;
  postalCode?: string;
};

export function organizationJsonLd(opts: {
  origin: string;
  contact: OrgContact;
  sameAs?: string[];
}): JsonLdValue {
  const { origin, contact } = opts;
  const sameAs = (opts.sameAs ?? []).filter((u) => /^https?:\/\//.test(u));
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${origin}/#organization`,
    name: BRAND,
    alternateName: "Velvea",
    url: `${origin}/`,
    logo: `${origin}/brand/velvea-logo.png`,
    // Online-only: there is no shop customers can visit, which is why this is
    // an Organization with a service area and not a LocalBusiness.
    areaServed: { "@type": "AdministrativeArea", name: "Ontario, Canada" },
    ...(contact.email ? { email: contact.email } : {}),
    ...(contact.phone ? { telephone: contact.phone } : {}),
    ...(contact.addressLine
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: contact.addressLine,
            addressLocality: contact.city,
            addressRegion: contact.province,
            postalCode: contact.postalCode,
            addressCountry: "CA",
          },
        }
      : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function webSiteJsonLd(opts: { origin: string; locale: string }): JsonLdValue {
  const locale: Locale = isLocale(opts.locale) ? opts.locale : DEFAULT_LOCALE;
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${opts.origin}/#website`,
    url: `${opts.origin}/`,
    name: BRAND,
    inLanguage: HREFLANG[locale],
    publisher: { "@id": `${opts.origin}/#organization` },
  };
}

export function breadcrumbJsonLd(
  items: { label: string; href: string }[],
  opts: { locale: string; origin?: string }
): JsonLdValue {
  const origin = opts.origin ?? siteOrigin();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      item: absoluteUrl(opts.locale, item.href, origin),
    })),
  };
}

export function faqJsonLd(items: { q: string; a: string }[]): JsonLdValue {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export function articleJsonLd(opts: {
  origin: string;
  locale: string;
  path: string;
  headline: string;
  description?: string;
  image?: string | null;
  author?: string | null;
  publishedAt?: Date | null;
  updatedAt?: Date | null;
}): JsonLdValue {
  const locale: Locale = isLocale(opts.locale) ? opts.locale : DEFAULT_LOCALE;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.headline,
    ...(opts.description ? { description: opts.description } : {}),
    ...(opts.image ? { image: [opts.image] } : {}),
    inLanguage: HREFLANG[locale],
    mainEntityOfPage: absoluteUrl(locale, opts.path, opts.origin),
    author: { "@type": opts.author && opts.author !== "Velvea" && opts.author !== BRAND ? "Person" : "Organization", name: opts.author || BRAND },
    publisher: { "@id": `${opts.origin}/#organization` },
    ...(opts.publishedAt ? { datePublished: opts.publishedAt.toISOString() } : {}),
    ...(opts.updatedAt ? { dateModified: opts.updatedAt.toISOString() } : {}),
  };
}

/** Product fields the JSON-LD needs; mirrors the Prisma shape without importing it. */
export type ProductForJsonLd = {
  slug: string;
  name: unknown;
  description?: unknown;
  tagline?: unknown;
  sku?: string | null;
  priceCents: number;
  inventory: number | null;
  avgRating: number;
  reviewCount: number;
  images: { url: string }[];
  variants: { label: unknown; priceCents: number; inStock: boolean; sku?: string | null }[];
};

/** Mirrors `toProductView().soldOut` and the PDP's own sold-out logic. */
export function productSoldOut(p: Pick<ProductForJsonLd, "inventory" | "variants">): boolean {
  return (p.inventory !== null && p.inventory <= 0) || (p.variants.length > 0 && p.variants.every((v) => !v.inStock));
}

export function availabilityUrl(inStock: boolean): string {
  return inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";
}

/**
 * One Offer per variant when there are variants (the PDP pre-selects the first
 * variant and shows its price, so a single base-price offer would disagree
 * with the page); a single Offer otherwise. Availability follows the same
 * rule as the visible sold-out state.
 */
export function productJsonLd(p: ProductForJsonLd, opts: { locale: string; origin: string }): JsonLdValue {
  const locale = opts.locale;
  const url = absoluteUrl(locale, `/products/${p.slug}`, opts.origin);
  const soldOut = productSoldOut(p);
  const money = (cents: number) => (cents / 100).toFixed(2);
  const offerBase = { "@type": "Offer", priceCurrency: "CAD", url };

  const offers =
    p.variants.length > 0
      ? p.variants.map((v) => ({
          ...offerBase,
          name: tc(v.label, locale),
          price: money(v.priceCents),
          availability: availabilityUrl(!soldOut && v.inStock),
          ...(v.sku ? { sku: v.sku } : {}),
        }))
      : { ...offerBase, price: money(p.priceCents), availability: availabilityUrl(!soldOut) };

  const description = tc(p.description, locale) || tc(p.tagline, locale);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: tc(p.name, locale),
    ...(description ? { description } : {}),
    ...(p.images.length ? { image: p.images.map((i) => i.url) } : {}),
    url,
    ...(p.sku ? { sku: p.sku } : {}),
    brand: { "@type": "Brand", name: BRAND },
    offers,
    // Zero-review aggregates are omitted: Google rejects a rating with no reviews.
    ...(p.reviewCount > 0
      ? { aggregateRating: { "@type": "AggregateRating", ratingValue: p.avgRating.toFixed(1), reviewCount: p.reviewCount } }
      : {}),
  };
}

export function collectionPageJsonLd(opts: {
  origin: string;
  locale: string;
  path: string;
  name: string;
  description?: string;
  productSlugs: string[];
}): JsonLdValue {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: opts.name,
    ...(opts.description ? { description: opts.description } : {}),
    url: absoluteUrl(opts.locale, opts.path, opts.origin),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: opts.productSlugs.length,
      itemListElement: opts.productSlugs.map((slug, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: absoluteUrl(opts.locale, `/products/${slug}`, opts.origin),
      })),
    },
  };
}

// ---------------------------------------------------------------------------
// Pagination / listing URL policy (V-22)
// ---------------------------------------------------------------------------

export const PAGE_SIZE = 48;
const MAX_PAGE = 500;

/** `?page=` as a positive integer, or null when absent/invalid. */
export function parsePage(raw: string | undefined): number | null {
  if (raw === undefined) return 1;
  if (!/^\d{1,4}$/.test(raw)) return null;
  const n = parseInt(raw, 10);
  if (n < 1 || n > MAX_PAGE) return null;
  return n;
}

export function totalPages(total: number, pageSize = PAGE_SIZE): number {
  return Math.max(1, Math.ceil(total / pageSize));
}

/**
 * Listing URL policy, in one place so every collection page agrees:
 *  - `page` is canonical (page 2 is its own page; never folded into page 1),
 *  - `sort` is an equivalent view → canonical points at the unsorted page,
 *  - price/recipient/search filters are uncurated subsets → noindex,
 *  - an empty collection is a thin placeholder → noindex.
 */
export function listingPolicy(opts: {
  page: number;
  filtered: boolean;
  empty: boolean;
}): { index: boolean; query: Record<string, number> | undefined } {
  return {
    index: !opts.filtered && !opts.empty,
    query: opts.page > 1 ? { page: opts.page } : undefined,
  };
}

// ---------------------------------------------------------------------------
// Sitemap (V-19) and robots (V-22)
// ---------------------------------------------------------------------------

export type SitemapProduct = { slug: string; updatedAt: Date; description?: unknown; tagline?: unknown };
export type SitemapArticle = { slug: string; updatedAt: Date; publishedAt?: Date | null; body?: unknown };
export type SitemapCollection = { type: string; slug: string; updatedAt: Date; productCount: number };

export const STATIC_PATHS = [
  "/",
  "/baskets",
  "/custom",
  "/corporate",
  "/corporate/quote",
  "/occasions",
  "/recipients",
  "/category",
  "/about",
  "/guides",
  "/reviews",
  "/faq",
  "/shipping",
  "/contact",
  "/privacy",
  "/terms",
] as const;

const COLLECTION_BASE: Record<string, string> = {
  OCCASION: "/occasions",
  RECIPIENT: "/recipients",
  CATEGORY: "/category",
};

/**
 * One entry per locale per path, each declaring its language pair. Dates are
 * only set when the record carries a real modification time; statics and
 * collections without one omit `lastModified` rather than claiming "now".
 * Google ignores priority/changefreq, so neither is emitted.
 */
export function buildSitemap(input: {
  origin: string;
  mode: IndexingMode;
  products: SitemapProduct[];
  articles: SitemapArticle[];
  collections: SitemapCollection[];
  giftCardsEnabled?: boolean;
}): MetadataRoute.Sitemap {
  const { origin, mode } = input;
  if (mode === "off") return [];

  const entries: MetadataRoute.Sitemap = [];
  const add = (path: string, opts: { lastModified?: Date; frReady?: boolean }) => {
    const frReady = opts.frReady !== false;
    const locales: Locale[] = frReady ? [...LOCALES] : [DEFAULT_LOCALE];
    const languages: Record<string, string> = {};
    if (frReady) {
      for (const l of LOCALES) languages[HREFLANG[l]] = absoluteUrl(l, path, origin);
      languages["x-default"] = absoluteUrl(DEFAULT_LOCALE, path, origin);
    }
    for (const l of locales) {
      entries.push({
        url: absoluteUrl(l, path, origin),
        ...(opts.lastModified ? { lastModified: opts.lastModified } : {}),
        ...(frReady ? { alternates: { languages } } : {}),
      });
    }
  };

  add("/", {});
  if (mode === "home") return entries;

  for (const path of STATIC_PATHS) if (path !== "/") add(path, {});
  if (input.giftCardsEnabled) add("/gift-cards", {});

  // Empty collections are noindex placeholders, so they stay out of the map.
  for (const c of input.collections) {
    const base = COLLECTION_BASE[c.type];
    if (!base || c.productCount <= 0) continue;
    add(`${base}/${c.slug}`, { lastModified: c.updatedAt });
  }

  for (const p of input.products) {
    add(`/products/${p.slug}`, { lastModified: p.updatedAt, frReady: hasFrench(p.description) || hasFrench(p.tagline) });
  }

  for (const a of input.articles) {
    add(`/guides/${a.slug}`, { lastModified: a.updatedAt ?? a.publishedAt ?? undefined, frReady: hasFrench(a.body) });
  }

  return entries;
}

/**
 * Crawling stays allowed in every indexing mode: a noindex can only be read
 * on a fetched page. Only private/utility areas are disallowed, and those
 * carry their own noindex for any crawler that ignores robots.txt. `/search`
 * is deliberately not listed: it is noindex, and blocking it would hide that.
 */
export function buildRobots(origin: string): MetadataRoute.Robots {
  const locales = ["", "/fr"];
  const privatePaths = ["/admin", "/api/", "/checkout", "/account", "/order/"];
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: locales.flatMap((prefix) => privatePaths.map((p) => `${prefix}${p}`)),
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
