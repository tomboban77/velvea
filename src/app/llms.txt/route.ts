import { getSettings } from "@/lib/settings";
import { CITY_PAGES } from "@/lib/cities";
import { OCCASIONS, RECIPIENTS, CATEGORIES } from "@/lib/nav";
import { siteOrigin } from "@/lib/seo";

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

  const body = `# Velvéa

> Velvéa is a gift-basket atelier in Mississauga, Ontario, Canada. Every basket is composed by hand after the order is placed and delivered by the Velvéa team across Mississauga, Toronto and the Greater Toronto Area, with same-day delivery available in eligible cities. Baskets are shipped by tracked courier to the rest of Ontario. The business is online-only (no walk-in shop); free pickup from the Mississauga studio is by appointment. No alcohol is sold. The site is bilingual: English at ${origin}/ and French at ${origin}/fr.

## Key pages

- [All gift baskets](${url("/baskets")}): the full catalogue with prices in Canadian dollars
- [Corporate gifting](${url("/corporate")}): volume pricing, branded cards, multi-address delivery; [request a quote](${url("/corporate/quote")})
- [Delivery areas](${url("/delivery")}): which cities get same-day, next-day or courier delivery, with fees and cutoffs
- [Delivery policy](${url("/shipping")}): costs, cutoffs, pickup and what cannot be shipped
- [FAQ](${url("/faq")}): delivery, gift messages, allergens, substitutions
- [Our story](${url("/about")})
- [Contact](${url("/contact")}): ${contact.email}

## Delivery by city

${CITY_PAGES.map((c) => `- [${c.name.en}](${url(`/delivery/${c.slug}`)})`).join("\n")}

## Browse

- Occasions: ${OCCASIONS.map((o) => `[${o.en}](${url(`/occasions/${o.slug}`)})`).join(", ")}
- Recipients: ${RECIPIENTS.map((r) => `[${r.en}](${url(`/recipients/${r.slug}`)})`).join(", ")}
- Categories: ${CATEGORIES.map((c) => `[${c.en}](${url(`/category/${c.slug}`)})`).join(", ")}

## Optional

- [Sitemap](${url("/sitemap.xml")})
- [Privacy policy](${url("/privacy")})
- [Terms of service](${url("/terms")})
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
