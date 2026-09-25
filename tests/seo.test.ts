import { describe, expect, it } from "vitest";
import {
  buildRobots,
  buildSitemap,
  hasFrench,
  indexingMode,
  jsonLdString,
  listingPolicy,
  localePath,
  organizationJsonLd,
  pageMetadata,
  parsePage,
  pathIndexable,
  productJsonLd,
  productSoldOut,
  siteOrigin,
  totalPages,
} from "@/lib/seo";

/**
 * Automated guardrails for the SEO layer (SEO brief V-20). Everything here is
 * pure: no Next runtime, no database. If a page starts emitting the wrong
 * canonical, a localhost origin, or an "InStock" over a sold-out product,
 * this is where it should fail first.
 */

const ORIGIN = "https://www.velvea.ca";
const env = (vars: Record<string, string>) => vars as unknown as NodeJS.ProcessEnv;

describe("siteOrigin", () => {
  it("normalises a trailing slash", () => {
    expect(siteOrigin(env({ NEXT_PUBLIC_SITE_URL: "https://www.velvea.ca/" }))).toBe(ORIGIN);
  });

  it("falls back to localhost outside the production deployment (local builds included)", () => {
    expect(siteOrigin(env({ NODE_ENV: "development" }))).toBe("http://localhost:3000");
    expect(siteOrigin(env({ NODE_ENV: "production", NEXT_PUBLIC_SITE_URL: "http://localhost:3000" }))).toBe("http://localhost:3000");
    expect(siteOrigin(env({ VERCEL_ENV: "preview", NEXT_PUBLIC_SITE_URL: "http://localhost:3000" }))).toBe("http://localhost:3000");
  });

  it("refuses a missing, localhost or http origin on the production deployment", () => {
    expect(() => siteOrigin(env({ VERCEL_ENV: "production" }))).toThrow(/not set/);
    expect(() => siteOrigin(env({ VERCEL_ENV: "production", NEXT_PUBLIC_SITE_URL: "http://localhost:3000" }))).toThrow(/https production origin/);
    expect(() => siteOrigin(env({ VERCEL_ENV: "production", NEXT_PUBLIC_SITE_URL: "http://www.velvea.ca" }))).toThrow(/https production origin/);
  });
});

describe("indexing switch", () => {
  it("defaults to off when unset or unknown", () => {
    expect(indexingMode({} as NodeJS.ProcessEnv)).toBe("off");
    expect(indexingMode(env({ SITE_INDEXING: "yes please" }))).toBe("off");
  });

  it("recognises home and all, case-insensitively", () => {
    expect(indexingMode(env({ SITE_INDEXING: "ALL" }))).toBe("all");
    expect(indexingMode(env({ SITE_INDEXING: " home " }))).toBe("home");
  });

  it("home mode indexes only the homepage", () => {
    expect(pathIndexable("/", "home")).toBe(true);
    expect(pathIndexable("/baskets", "home")).toBe(false);
    expect(pathIndexable("/baskets", "all")).toBe(true);
    expect(pathIndexable("/", "off")).toBe(false);
  });
});

describe("localePath", () => {
  it("leaves English unprefixed and prefixes French", () => {
    expect(localePath("en", "/")).toBe("/");
    expect(localePath("fr", "/")).toBe("/fr");
    expect(localePath("en", "/baskets/")).toBe("/baskets");
    expect(localePath("fr", "/products/x")).toBe("/fr/products/x");
  });
});

describe("pageMetadata", () => {
  const base = { path: "/baskets", title: "All gift baskets", description: "Every basket.", origin: ORIGIN, mode: "all" as const };

  it("emits a self-canonical and an en-CA / fr-CA / x-default set", () => {
    const en = pageMetadata({ ...base, locale: "en" });
    expect(en.alternates?.canonical).toBe(`${ORIGIN}/baskets`);
    expect(en.alternates?.languages).toEqual({
      "en-CA": `${ORIGIN}/baskets`,
      "fr-CA": `${ORIGIN}/fr/baskets`,
      "x-default": `${ORIGIN}/baskets`,
    });
    const fr = pageMetadata({ ...base, locale: "fr" });
    expect(fr.alternates?.canonical).toBe(`${ORIGIN}/fr/baskets`);
    expect(fr.alternates?.languages).toEqual(en.alternates?.languages);
  });

  it("sets page-specific Open Graph and Twitter fields", () => {
    const meta = pageMetadata({ ...base, locale: "fr" });
    const og = meta.openGraph as Record<string, unknown>;
    expect(og.url).toBe(`${ORIGIN}/fr/baskets`);
    expect(og.locale).toBe("fr_CA");
    expect(og.alternateLocale).toEqual(["en_CA"]);
    expect(og.title).toBe("All gift baskets · Velvéa");
    expect(og.siteName).toBe("Velvéa");
    expect((meta.twitter as Record<string, unknown>).card).toBe("summary_large_image");
    expect(meta.robots).toBeUndefined();
  });

  it("is noindex,follow while the switch is off, and indexable once it is all", () => {
    expect(pageMetadata({ ...base, locale: "en", mode: "off" }).robots).toEqual({ index: false, follow: true });
    expect(pageMetadata({ ...base, locale: "en", mode: "home" }).robots).toEqual({ index: false, follow: true });
    expect(pageMetadata({ ...base, locale: "en", path: "/", mode: "home" }).robots).toBeUndefined();
    expect(pageMetadata({ ...base, locale: "en", mode: "all" }).robots).toBeUndefined();
  });

  it("keeps utility pages noindex regardless of the switch", () => {
    expect(pageMetadata({ ...base, locale: "en", index: false }).robots).toEqual({ index: false, follow: true });
  });

  it("puts pagination in the canonical but never sort or filters", () => {
    const meta = pageMetadata({ ...base, locale: "en", query: { page: 2 } });
    expect(meta.alternates?.canonical).toBe(`${ORIGIN}/baskets?page=2`);
    expect((meta.alternates?.languages as Record<string, string>)["fr-CA"]).toBe(`${ORIGIN}/fr/baskets?page=2`);
    expect(pageMetadata({ ...base, locale: "en", query: { page: undefined } }).alternates?.canonical).toBe(`${ORIGIN}/baskets`);
  });

  it("drops the language pair and noindexes the French page when the translation is not ready", () => {
    const en = pageMetadata({ ...base, locale: "en", path: "/products/x", alternates: false });
    expect(en.alternates?.languages).toBeUndefined();
    expect(en.robots).toBeUndefined();
    const fr = pageMetadata({ ...base, locale: "fr", path: "/products/x", alternates: false });
    expect(fr.robots).toEqual({ index: false, follow: true });
  });

  it("uses the brand card when a page has no image, and an absolute title for the homepage", () => {
    const meta = pageMetadata({ ...base, locale: "en", path: "/", title: "Velvéa — Gift Baskets", absoluteTitle: true });
    expect(meta.title).toEqual({ absolute: "Velvéa — Gift Baskets" });
    expect((meta.openGraph as Record<string, unknown>).title).toBe("Velvéa — Gift Baskets");
    expect((meta.openGraph as { images: string[] }).images).toEqual(["/brand/velvea-og.png?v=6"]);
  });
});

describe("brand in titles", () => {
  it("does not append the brand template when the stored title already names it", () => {
    const meta = pageMetadata({ locale: "en", path: "/products/x", title: "Plum Basket | Velvea", origin: ORIGIN, mode: "all" });
    expect(meta.title).toEqual({ absolute: "Plum Basket | Velvea" });
    expect((meta.openGraph as Record<string, unknown>).title).toBe("Plum Basket | Velvea");
  });
});

describe("hasFrench", () => {
  it("treats blank or English-copied French as untranslated", () => {
    expect(hasFrench({ en: "Hello", fr: "" })).toBe(false);
    expect(hasFrench({ en: "Hello", fr: "Hello" })).toBe(false);
    expect(hasFrench({ en: "Hello", fr: " Hello " })).toBe(false);
    expect(hasFrench(null)).toBe(false);
    expect(hasFrench("plain")).toBe(false);
  });

  it("accepts a real translation", () => {
    expect(hasFrench({ en: "Hello", fr: "Bonjour" })).toBe(true);
  });
});

describe("jsonLdString", () => {
  it("escapes < so a description cannot close the script tag", () => {
    const out = jsonLdString({ description: 'x</script><script>alert(1)</script>' });
    expect(out).not.toContain("</script>");
    expect(out).toContain("\\u003c/script>");
    expect(JSON.parse(out).description).toBe('x</script><script>alert(1)</script>');
  });

  it("escapes line and paragraph separators", () => {
    const out = jsonLdString({ a: "x\u2028y\u2029z" });
    expect(out).not.toMatch(/[\u2028\u2029]/);
    expect(JSON.parse(out).a).toBe("x\u2028y\u2029z");
  });
});

describe("productJsonLd", () => {
  const product = {
    slug: "plum-basket",
    name: { en: "Plum Basket", fr: "Panier prune" },
    description: { en: "Gourmet treats.", fr: "Gourmandises." },
    tagline: null,
    sku: "PLUM-1",
    priceCents: 8500,
    inventory: null as number | null,
    avgRating: 4.6,
    reviewCount: 3,
    images: [{ url: "https://res.cloudinary.com/x/plum.jpg" }],
    variants: [] as { label: unknown; priceCents: number; inStock: boolean }[],
  };

  it("emits a single in-stock CAD offer for a simple product", () => {
    const ld = productJsonLd(product, { locale: "en", origin: ORIGIN });
    expect(ld.name).toBe("Plum Basket");
    expect(ld.url).toBe(`${ORIGIN}/products/plum-basket`);
    expect(ld.sku).toBe("PLUM-1");
    expect(ld.offers).toEqual({
      "@type": "Offer",
      priceCurrency: "CAD",
      url: `${ORIGIN}/products/plum-basket`,
      price: "85.00",
      availability: "https://schema.org/InStock",
    });
    expect(ld.aggregateRating).toEqual({ "@type": "AggregateRating", ratingValue: "4.6", reviewCount: 3 });
  });

  it("says OutOfStock when inventory is exhausted", () => {
    const ld = productJsonLd({ ...product, inventory: 0 }, { locale: "en", origin: ORIGIN });
    expect((ld.offers as { availability: string }).availability).toBe("https://schema.org/OutOfStock");
  });

  it("emits one offer per variant with the variant's own price and stock", () => {
    const ld = productJsonLd(
      {
        ...product,
        variants: [
          { label: { en: "Small", fr: "Petit" }, priceCents: 5000, inStock: true },
          { label: { en: "Large", fr: "Grand" }, priceCents: 20000, inStock: false },
        ],
      },
      { locale: "fr", origin: ORIGIN }
    );
    const offers = ld.offers as { name: string; price: string; availability: string; url: string }[];
    expect(offers).toHaveLength(2);
    expect(offers[0]).toMatchObject({ name: "Petit", price: "50.00", availability: "https://schema.org/InStock" });
    expect(offers[1]).toMatchObject({ name: "Grand", price: "200.00", availability: "https://schema.org/OutOfStock" });
    expect(offers[0].url).toBe(`${ORIGIN}/fr/products/plum-basket`);
  });

  it("omits the rating when there are no reviews", () => {
    const ld = productJsonLd({ ...product, reviewCount: 0, avgRating: 0 }, { locale: "en", origin: ORIGIN });
    expect(ld.aggregateRating).toBeUndefined();
  });

  it("mirrors the storefront sold-out rule", () => {
    expect(productSoldOut({ inventory: null, variants: [] })).toBe(false);
    expect(productSoldOut({ inventory: 0, variants: [] })).toBe(true);
    expect(productSoldOut({ inventory: null, variants: [{ label: "", priceCents: 1, inStock: false }] })).toBe(true);
    expect(productSoldOut({ inventory: null, variants: [{ label: "", priceCents: 1, inStock: false }, { label: "", priceCents: 1, inStock: true }] })).toBe(false);
  });
});

describe("organizationJsonLd", () => {
  it("keeps only real URLs in sameAs and builds a postal address", () => {
    const ld = organizationJsonLd({
      origin: ORIGIN,
      contact: { email: "hi@velvea.ca", phone: "+1 555", addressLine: "1 Main St", city: "Mississauga", province: "ON", postalCode: "L5B 1A1" },
      sameAs: ["https://instagram.com/velvea", "", "not a url"],
    });
    expect(ld.sameAs).toEqual(["https://instagram.com/velvea"]);
    expect(ld.address).toMatchObject({ "@type": "PostalAddress", addressLocality: "Mississauga", addressCountry: "CA" });
    expect(ld["@id"]).toBe(`${ORIGIN}/#organization`);
  });
});

describe("listing URL policy", () => {
  it("parses only sane page numbers", () => {
    expect(parsePage(undefined)).toBe(1);
    expect(parsePage("1")).toBe(1);
    expect(parsePage("12")).toBe(12);
    expect(parsePage("0")).toBeNull();
    expect(parsePage("-1")).toBeNull();
    expect(parsePage("2.5")).toBeNull();
    expect(parsePage("abc")).toBeNull();
    expect(parsePage("99999")).toBeNull();
  });

  it("computes total pages with a floor of one", () => {
    expect(totalPages(0)).toBe(1);
    expect(totalPages(48)).toBe(1);
    expect(totalPages(49)).toBe(2);
  });

  it("indexes clean pages, noindexes filtered or empty ones, canonicalises page > 1", () => {
    expect(listingPolicy({ page: 1, filtered: false, empty: false })).toEqual({ index: true, query: undefined });
    expect(listingPolicy({ page: 2, filtered: false, empty: false })).toEqual({ index: true, query: { page: 2 } });
    expect(listingPolicy({ page: 1, filtered: true, empty: false }).index).toBe(false);
    expect(listingPolicy({ page: 1, filtered: false, empty: true }).index).toBe(false);
  });
});

describe("buildSitemap", () => {
  const products = [
    { slug: "a", updatedAt: new Date("2026-09-01T00:00:00Z"), description: { en: "x", fr: "y" } },
    { slug: "b", updatedAt: new Date("2026-09-02T00:00:00Z"), description: { en: "x", fr: "x" } },
  ];
  const articles = [{ slug: "g", updatedAt: new Date("2026-08-01T00:00:00Z"), publishedAt: null, body: { en: "b", fr: "c" } }];
  const collections = [
    { type: "OCCASION", slug: "birthday", updatedAt: new Date("2026-07-01T00:00:00Z"), productCount: 3 },
    { type: "OCCASION", slug: "empty", updatedAt: new Date("2026-07-01T00:00:00Z"), productCount: 0 },
    { type: "THEME", slug: "theme", updatedAt: new Date("2026-07-01T00:00:00Z"), productCount: 3 },
  ];

  it("is empty while indexing is off and homepage-only in home mode", () => {
    expect(buildSitemap({ origin: ORIGIN, mode: "off", products, articles, collections })).toEqual([]);
    const home = buildSitemap({ origin: ORIGIN, mode: "home", products, articles, collections });
    expect(home.map((e) => e.url)).toEqual([`${ORIGIN}/`, `${ORIGIN}/fr`]);
  });

  it("omits the custom builder while it is paused, in both locales", () => {
    // The /custom route 404s when CUSTOM_BUILDER_ENABLED is false. A sitemap
    // that still advertised it would be handing search engines a dead URL, so
    // the flag has to gate STATIC_PATHS and not just the navigation.
    const urls = buildSitemap({ origin: ORIGIN, mode: "all", products, articles, collections }).map((e) => e.url);
    expect(urls).not.toContain(`${ORIGIN}/custom`);
    expect(urls).not.toContain(`${ORIGIN}/fr/custom`);
  });

  it("lists both locales per path with language alternates, and no priority or changefreq", () => {
    const map = buildSitemap({ origin: ORIGIN, mode: "all", products, articles, collections });
    const urls = map.map((e) => e.url);
    expect(urls).toContain(`${ORIGIN}/baskets`);
    expect(urls).toContain(`${ORIGIN}/fr/baskets`);
    const entry = map.find((e) => e.url === `${ORIGIN}/fr/baskets`)!;
    expect(entry.alternates?.languages).toEqual({
      "en-CA": `${ORIGIN}/baskets`,
      "fr-CA": `${ORIGIN}/fr/baskets`,
      "x-default": `${ORIGIN}/baskets`,
    });
    for (const e of map) {
      expect(e).not.toHaveProperty("priority");
      expect(e).not.toHaveProperty("changeFrequency");
    }
  });

  it("dates only records with a real modification time", () => {
    const map = buildSitemap({ origin: ORIGIN, mode: "all", products, articles, collections });
    expect(map.find((e) => e.url === `${ORIGIN}/faq`)).not.toHaveProperty("lastModified");
    expect(map.find((e) => e.url === `${ORIGIN}/products/a`)?.lastModified).toEqual(products[0].updatedAt);
    expect(map.find((e) => e.url === `${ORIGIN}/occasions/birthday`)?.lastModified).toEqual(collections[0].updatedAt);
  });

  it("skips empty and unknown-type collections, the paused gift card, and untranslated French pages", () => {
    const map = buildSitemap({ origin: ORIGIN, mode: "all", products, articles, collections });
    const urls = map.map((e) => e.url);
    expect(urls).toContain(`${ORIGIN}/occasions/birthday`);
    expect(urls).not.toContain(`${ORIGIN}/occasions/empty`);
    expect(urls.some((u) => u.includes("/theme"))).toBe(false);
    expect(urls).not.toContain(`${ORIGIN}/gift-cards`);
    // product "b" has English copied into French: English entry only, no alternates
    expect(urls).toContain(`${ORIGIN}/products/b`);
    expect(urls).not.toContain(`${ORIGIN}/fr/products/b`);
    expect(map.find((e) => e.url === `${ORIGIN}/products/b`)).not.toHaveProperty("alternates");
    expect(urls).toContain(`${ORIGIN}/fr/products/a`);
    expect(urls).toContain(`${ORIGIN}/fr/guides/g`);
  });

  it("lists the gift-card page only when the feature is on", () => {
    const map = buildSitemap({ origin: ORIGIN, mode: "all", products: [], articles: [], collections: [], giftCardsEnabled: true });
    expect(map.map((e) => e.url)).toContain(`${ORIGIN}/gift-cards`);
  });
});

describe("buildRobots", () => {
  it("allows crawling, blocks private areas in both locales, leaves /search readable", () => {
    const robots = buildRobots(ORIGIN);
    const rule = (robots.rules as { allow: string; disallow: string[] }[])[0];
    expect(rule.allow).toBe("/");
    expect(rule.disallow).toContain("/checkout");
    expect(rule.disallow).toContain("/fr/checkout");
    expect(rule.disallow).toContain("/account");
    expect(rule.disallow).not.toContain("/search");
    expect(robots.sitemap).toBe(`${ORIGIN}/sitemap.xml`);
  });
});
