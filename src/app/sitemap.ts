import type { MetadataRoute } from "next";
import { getSitemapArticles, getSitemapCollections, getSitemapProducts } from "@/lib/queries";
import { GIFT_CARDS_ENABLED } from "@/lib/features";
import { buildSitemap, indexingMode, siteOrigin } from "@/lib/seo";

/**
 * Regenerate hourly rather than only at build time, so a basket added in admin
 * reaches the sitemap without a redeploy.
 */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const mode = indexingMode();
  const origin = siteOrigin();

  // Nothing but the homepage is ever listed before launch, so skip the reads.
  if (mode !== "all") {
    return buildSitemap({ origin, mode, products: [], articles: [], collections: [] });
  }

  // These queries throw on a database error instead of returning [] — an
  // outage must surface as a failed sitemap fetch, not as "the catalogue is
  // empty", which a crawler would happily believe and act on.
  const [products, articles, collections] = await Promise.all([
    getSitemapProducts(),
    getSitemapArticles(),
    getSitemapCollections(),
  ]);

  return buildSitemap({ origin, mode, products, articles, collections, giftCardsEnabled: GIFT_CARDS_ENABLED });
}
