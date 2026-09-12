import type { MetadataRoute } from "next";
import { getAllProducts, getPublishedArticles } from "@/lib/queries";
import { OCCASIONS, RECIPIENTS, CATEGORIES, HOLIDAYS } from "@/lib/nav";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/** English lives at `/`, French at `/fr` (localePrefix: as-needed). */
function entry(path: string, opts?: { priority?: number; changeFrequency?: MetadataRoute.Sitemap[number]["changeFrequency"]; lastModified?: Date }) {
  const en = `${siteUrl}${path === "/" ? "" : path}`;
  const fr = `${siteUrl}/fr${path === "/" ? "" : path}`;
  return {
    url: en || `${siteUrl}/`,
    lastModified: opts?.lastModified ?? new Date(),
    changeFrequency: opts?.changeFrequency ?? "weekly",
    priority: opts?.priority ?? 0.6,
    alternates: { languages: { en: en || `${siteUrl}/`, fr } },
  } satisfies MetadataRoute.Sitemap[number];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ products }, articles] = await Promise.all([getAllProducts({ take: 500 }), getPublishedArticles({ limit: 200 })]);

  const statics = [
    entry("/", { priority: 1, changeFrequency: "daily" }),
    entry("/baskets", { priority: 0.9, changeFrequency: "daily" }),
    entry("/custom", { priority: 0.8 }),
    entry("/corporate", { priority: 0.8 }),
    entry("/corporate/quote", { priority: 0.6 }),
    entry("/gift-cards", { priority: 0.6 }),
    entry("/occasions", { priority: 0.7 }),
    entry("/recipients", { priority: 0.7 }),
    entry("/category", { priority: 0.7 }),
    entry("/about", { priority: 0.5, changeFrequency: "monthly" }),
    entry("/guides", { priority: 0.5 }),
    entry("/reviews", { priority: 0.4 }),
    entry("/faq", { priority: 0.4, changeFrequency: "monthly" }),
    entry("/shipping", { priority: 0.4, changeFrequency: "monthly" }),
    entry("/contact", { priority: 0.4, changeFrequency: "monthly" }),
    entry("/privacy", { priority: 0.2, changeFrequency: "yearly" }),
    entry("/terms", { priority: 0.2, changeFrequency: "yearly" }),
  ];

  const collections = [
    ...[...OCCASIONS, ...HOLIDAYS].map((o) => entry(`/occasions/${o.slug}`, { priority: 0.7 })),
    ...RECIPIENTS.map((r) => entry(`/recipients/${r.slug}`, { priority: 0.6 })),
    ...CATEGORIES.map((c) => entry(`/category/${c.slug}`, { priority: 0.6 })),
  ];

  const productEntries = products.map((p) =>
    entry(`/products/${p.slug}`, { priority: 0.8, changeFrequency: "weekly", lastModified: p.updatedAt })
  );

  const articleEntries = articles.map((a) =>
    entry(`/guides/${a.slug}`, { priority: 0.5, changeFrequency: "monthly", lastModified: a.updatedAt ?? a.publishedAt ?? new Date() })
  );

  return [...statics, ...collections, ...productEntries, ...articleEntries];
}
