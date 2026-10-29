import { getSettings } from "@/lib/settings";
import { CITY_PAGES } from "@/lib/cities";
import { OCCASIONS, RECIPIENTS, CATEGORIES } from "@/lib/nav";
import { siteOrigin } from "@/lib/seo";
import { getPublishedArticles, getSitemapCollections } from "@/lib/queries";
import { t as tc } from "@/lib/i18n-content";

export const revalidate = 3600;

/**
 * llms.txt — a plain-text map of the site for AI assistants and answer
 * engines (llmstxt.org). Everything in it is already public on the pages it
 * links to; the point is to hand a crawler the facts and the canonical URLs in
 * one fetch instead of making it infer them from navigation.
 */
export async function GET() {
  const origin = siteOrigin();
  const { contact } = await getSettings();
  const url = (p: string) => `${origin}${p}`;

  // Only collections that hold products: an empty one is noindex on the site,
  // so pointing an assistant at it sends people to a page with nothing to buy.
  // If the database is unreachable, list the menus as they are rather than none.
  const stocked = await getSitemapCollections()
    .then((rows) => new Set(rows.filter((c) => c.productCount > 0).map((c) => `${c.type}:${c.slug}`)))
    .catch(() => null);
  const has = (type: string) => (link: { slug: string }) => !stocked || stocked.has(`${type}:${link.slug}`);
  const browse = (label: string, type: string, base: string, links: { slug: string; en: string }[]) => {
    const shown = links.filter(has(type));
    return shown.length ? `- ${label}: ${shown.map((l) => `[${l.en}](${url(`${base}/${l.slug}`)})`).join(", ")}` : "";
  };
  const browseLines = [
    browse("Occasions", "OCCASION", "/occasions", OCCASIONS),
    browse("Recipients", "RECIPIENT", "/recipients", RECIPIENTS),
    browse("Categories", "CATEGORY", "/category", CATEGORIES),
  ]
    .filter(Boolean)
    .join("\n");
  const guides = await getPublishedArticles({ limit: 100 });
  const guideSection = guides.length
    ? `\n## Gift guides\n\n${guides.map((g) => `- [${tc(g.title, "en")}](${url(`/guides/${g.slug}`)})`).join("\n")}\n`
    : "";

  const body = `# Velvéa

> Velvéa is a gift-basket atelier in Mississauga, Ontario, Canada. Every basket is composed by hand after the order is placed and delivered by the Velvéa team across Mississauga, Toronto and the Greater Toronto Area, with same-day delivery available in eligible cities. Baskets that travel well are shipped by tracked courier to the rest of Ontario, the Atlantic provinces, the Prairies and British Columbia. The business is online-only (no walk-in shop); free pickup from the Mississauga studio is by appointment. No alcohol is sold. The site is bilingual: English at ${origin}/ and French at ${origin}/fr.

## Key pages

- [All gift baskets](${url("/baskets")}): the full catalogue with prices in Canadian dollars
- [Custom basket request](${url("/custom-basket")}): describe the products you want in a basket and receive a final price by email or phone; nothing is charged until the quote is approved
- [Corporate gifting](${url("/corporate")}): volume pricing, branded cards, multi-address delivery; [request a quote](${url("/corporate/quote")})
- [Brand partners](${url("/partners")}): Canadian makers and brands can propose products for Velvéa gift baskets (no alcohol)
- [Delivery areas](${url("/delivery")}): which cities get same-day, next-day or courier delivery, with fees and cutoffs
- [Delivery policy](${url("/shipping")}): costs, cutoffs, pickup and what cannot be shipped
- [FAQ](${url("/faq")}): delivery, gift messages, how baskets are packed, bespoke and corporate orders, and why all sales are final
- [Our story](${url("/about")})
- [Contact](${url("/contact")}): ${contact.email}

## Delivery by city

${CITY_PAGES.map((c) => `- [${c.name.en}](${url(`/delivery/${c.slug}`)})`).join("\n")}

## Browse

${browseLines}
${guideSection}
## Optional

- [Sitemap](${url("/sitemap.xml")})
- [Privacy policy](${url("/privacy")})
- [Terms of service](${url("/terms")})
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
