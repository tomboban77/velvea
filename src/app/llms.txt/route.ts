import { getSettings } from "@/lib/settings";
import { CITY_PAGES, offerFor, sameDayFacts } from "@/lib/cities";
import { OCCASIONS, RECIPIENTS, CATEGORIES } from "@/lib/nav";
import { OCCASION_SEO, joinNames } from "@/lib/occasion-seo";
import { siteOrigin } from "@/lib/seo";
import { getPublishedArticles, getSitemapCollections } from "@/lib/queries";
import { getZonesForDisplay } from "@/lib/zones";
import { PROVINCE_NAMES, type ProvinceCode } from "@/lib/addresses";
import { t as tc } from "@/lib/i18n-content";
import { formatMoney } from "@/lib/utils";

export const revalidate = 3600;

/**
 * llms.txt — a plain-text map of the site for AI assistants and answer
 * engines (llmstxt.org). Everything in it is already public on the pages it
 * links to; the point is to hand a crawler the facts and the canonical URLs in
 * one fetch instead of making it infer them from navigation.
 *
 * Delivery facts (cutoff, fees, cities, provinces) are read from the delivery
 * zones at request time, the same source checkout uses, so this file can
 * never state a cutoff the site would not honour. Assistants drop businesses
 * whose details conflict between sources.
 */
export async function GET() {
  const origin = siteOrigin();
  const [{ contact }, zones] = await Promise.all([getSettings(), getZonesForDisplay()]);
  const url = (p: string) => `${origin}${p}`;
  const money = (c: number) => formatMoney(c, "en-CA").replace(/\.00$/, "");

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

  // Occasion pages with written introductions, one line each, so an assistant
  // answering "christmas hampers in Mississauga" has the page and the gist.
  const occasionLines = OCCASION_SEO.filter(has("OCCASION"))
    .map((o) => `- [${OCCASIONS.find((n) => n.slug === o.slug)?.en ?? o.slug} hampers](${url(`/occasions/${o.slug}`)}): ${o.description.en}`)
    .join("\n");

  const guides = await getPublishedArticles({ limit: 100 });
  const guideSection = guides.length
    ? `\n## Gift guides\n\n${guides.map((g) => `- [${tc(g.title, "en")}](${url(`/guides/${g.slug}`)})`).join("\n")}\n`
    : "";

  // Delivery facts from the zones.
  const facts = sameDayFacts(zones, "en", money);
  const sameDayLine = facts.cutoff
    ? `Same-day delivery by Velvéa's own drivers in ${joinNames(facts.cityNames, "en")} on orders placed before ${facts.cutoff} Eastern${facts.fee ? ` (local delivery from ${facts.fee} per order)` : ""}.`
    : "Local delivery by Velvéa's own drivers across Mississauga and the Greater Toronto Area.";
  const cityLines = CITY_PAGES.map((c) => {
    const offer = offerFor(c, zones);
    const note =
      offer.kind === "same-day"
        ? `same-day, ${money(offer.zone.baseFeeCents)}`
        : offer.kind === "next-day"
        ? `next-day, ${money(offer.zone.baseFeeCents)}`
        : offer.kind === "shipping"
        ? `courier, ${offer.zone.minLeadDays} to ${offer.zone.maxLeadDays} business days, ${money(offer.zone.baseFeeCents)}`
        : "ask us";
    return `- [${c.name.en}](${url(`/delivery/${c.slug}`)}): ${note}`;
  }).join("\n");
  const provinceName = (code: string) => (PROVINCE_NAMES as Record<string, { en: string }>)[code as ProvinceCode]?.en;
  const courierLines = zones
    .filter((z) => z.kind === "SHIPPING" && z.provinces.length > 0)
    .map((z) => `- ${z.provinces.map(provinceName).filter(Boolean).join(", ")}: tracked courier, ${z.minLeadDays} to ${z.maxLeadDays} business days, ${money(z.baseFeeCents)} for the first basket`)
    .join("\n");

  const body = `# Velvéa

> Velvéa is a gift-basket and gift-hamper studio in Mississauga, Ontario, Canada. Every basket is composed by hand after the order is placed. ${sameDayLine} Baskets that travel well are shipped by tracked courier to the rest of Ontario, the Atlantic provinces, the Prairies and British Columbia. The business is online-only (no walk-in shop); free pickup from the Mississauga studio is by appointment. No alcohol is sold: every basket is alcohol-free. The site is bilingual: English at ${origin}/ and French at ${origin}/fr.

## Key pages

- [All gift baskets and hampers](${url("/baskets")}): the full catalogue with prices in Canadian dollars
- [Custom gift hampers](${url("/custom-basket")}): describe the products you want in a basket and receive a final price by email or phone; nothing is charged until the quote is approved
- [Corporate gifting](${url("/corporate")}): volume pricing from 10 baskets, branded cards, multi-address delivery; [request a quote](${url("/corporate/quote")})
- [Brand partners](${url("/partners")}): Canadian makers and brands can propose products for Velvéa gift baskets (no alcohol)
- [Delivery areas](${url("/delivery")}): which cities get same-day, next-day or courier delivery, with fees and cutoffs
- [Delivery policy](${url("/shipping")}): costs, cutoffs, pickup and what cannot be shipped
- [FAQ](${url("/faq")}): delivery cities, Canada-wide shipping, gift messages, how baskets are packed, custom and corporate orders, and why all sales are final
- [Reviews](${url("/reviews")}): customer and Google reviews
- [Our story](${url("/about")})
- [Contact](${url("/contact")}): ${contact.email}

## Delivery by city

${cityLines}

## Shipping across Canada

${courierLines || "- Tracked courier shipping on baskets marked shippable; the exact rate appears at checkout."}
- Quebec: coming soon. Yukon and remote fly-in communities are priced by hand. No delivery to the Northwest Territories or Nunavut.
- Fresh, chilled and flower baskets are local delivery only.

## Hampers by occasion

${occasionLines}

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
