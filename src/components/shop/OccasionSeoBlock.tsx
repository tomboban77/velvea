import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { CITY_PAGES, offerFor, sameDayFacts } from "@/lib/cities";
import { getZonesForDisplay } from "@/lib/zones";
import { joinNames, resolveOccasionFaq, resolveOccasionIntro, type OccasionSeo } from "@/lib/occasion-seo";
import { faqJsonLd } from "@/lib/seo";
import { formatMoney } from "@/lib/utils";

/**
 * The editorial half of an occasion page: a written introduction, the cities
 * we deliver to (each linking to its delivery page), and a short FAQ emitted
 * as FAQPage JSON-LD. The product grid above it is what sells; this block is
 * what a search engine or an assistant can read and quote. Facts come from
 * the live delivery zones through `sameDayFacts`.
 */
export async function OccasionSeoBlock({ entry, locale }: { entry: OccasionSeo; locale: string }) {
  const fr = locale === "fr";
  const [t, zones] = await Promise.all([getTranslations("occasionSeo"), getZonesForDisplay()]);
  const money = (c: number) => formatMoney(c, fr ? "fr-CA" : "en-CA").replace(/[.,]00/, "");
  const { cutoff, fee, cityNames } = sameDayFacts(zones, locale, money);
  const facts = { cutoff, fee, cities: joinNames(cityNames, locale) };
  const intro = resolveOccasionIntro(entry, locale, facts);
  const faq = resolveOccasionFaq(entry, locale, facts);
  // Cities we can actually reach; an unserved city has no business on an occasion page.
  const cities = CITY_PAGES.filter((c) => offerFor(c, zones).kind !== "unserved");

  return (
    <>
      {faq.length > 0 && <JsonLd data={faqJsonLd(faq)} />}
      <section className="band-cream border-t border-line">
        <div className="container-x section-sm grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <h2 className="h-sub">{fr ? entry.heading.fr : entry.heading.en}</h2>
            {intro.map((p) => (
              <p key={p.slice(0, 40)} className="mt-4 text-[0.98rem] leading-relaxed text-ink-soft pretty">{p}</p>
            ))}
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/delivery" className="btn btn-outline">{t("deliveryLink")} <ArrowRight /></Link>
              <Link href="/custom-basket" className="link-draw self-center">{t("customLink")}</Link>
            </div>
          </div>
          <div className="lg:col-span-5">
            <h3 className="text-[1.05rem] font-semibold text-ink">{t("citiesH")}</h3>
            <p className="mt-2 text-sm text-muted">{cutoff ? t("citiesLedeSameDay", { time: cutoff }) : t("citiesLede")}</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {cities.map((c) => (
                <li key={c.slug}>
                  <Link href={`/delivery/${c.slug}`} className="chip">{fr ? c.name.fr : c.name.en}</Link>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-muted">{t("canadaNote")}</p>
          </div>
        </div>
      </section>
      {faq.length > 0 && (
        <section className="container-x section-sm border-t border-line">
          <h2 className="h-sub">{t("faqH")}</h2>
          <div className="mt-6 divide-y divide-line rounded-lg border border-line bg-white px-6 sm:px-8">
            {faq.map((item) => (
              <div key={item.q} className="py-5">
                <h3 className="text-[1.05rem] font-semibold leading-snug text-ink">{item.q}</h3>
                <p className="mt-2 text-[0.98rem] leading-relaxed text-ink-soft">{item.a}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
