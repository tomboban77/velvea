import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { getCollections } from "@/lib/queries";
import { OCCASIONS, labelFor } from "@/lib/nav";
import { t as tc } from "@/lib/i18n-content";

// Paper tints per occasion until a photograph is set in admin.
const TINTS: Record<string, string> = {
  birthday: "#efe3ea",
  anniversary: "#ecdfc9",
  "thank-you": "#e6dff0",
  sympathy: "#e9e6ee",
  "new-baby": "#f3e6e6",
  "get-well": "#e4e2f1",
  congratulations: "#ecdcc0",
  housewarming: "#eae2dc",
  wedding: "#f4f0f4",
  holiday: "#dcd6ea",
};

const NUMERALS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

export async function OccasionsRail() {
  const t = await getTranslations("occasions");
  const tCommon = await getTranslations("common");
  const locale = await getLocale();
  const db = await getCollections("OCCASION");
  const bySlug = new Map(db.map((c) => [c.slug, c]));

  const items = OCCASIONS.map((o, i) => {
    const row = bySlug.get(o.slug);
    return {
      slug: o.slug,
      numeral: NUMERALS[i],
      label: row ? tc(row.name, locale) : labelFor(o, locale),
      image: row?.imageUrl ?? null,
      count: row?._count?.products ?? 0,
    };
  });

  return (
    <section className="section">
      <div className="container-x">
        <SectionHeading chapter="Chapter I" eyebrow={t("eyebrow")} title={t("title")} lede={t("lede")} link="/occasions" linkLabel={t("viewAll")} />
      </div>

      <div className="container-x mt-14">
        <div className="max-lg:rail -mx-5 px-5 sm:mx-0 sm:px-0 lg:grid lg:grid-cols-5 lg:gap-x-8">
          {items.map((item, i) => (
            <Reveal key={item.slug} delay={Math.min(i, 4) * 70} className="w-[58vw] max-w-[15rem] sm:w-[36vw] lg:w-auto lg:max-w-none">
              <Link href={`/occasions/${item.slug}`} className="group block px-2 pt-2 text-center" aria-label={item.label}>
                <div className="arch relative aspect-[4/5] overflow-hidden" style={{ background: TINTS[item.slug] ?? "var(--color-cream)" }}>
                  {item.image ? (
                    <Image src={item.image} alt="" fill sizes="(max-width:1024px) 60vw, 20vw" className="zoom-img object-cover" />
                  ) : (
                    <span className="zoom-img absolute inset-0 flex items-center justify-center font-display text-[7rem] font-light leading-none text-ink/[0.08]">
                      {item.label.charAt(0)}
                    </span>
                  )}
                  <span className="arch pointer-events-none absolute inset-0 border border-lilac-deep/0 transition-colors duration-500 group-hover:border-lilac-deep" />
                </div>
                <p className="chapter mt-5">{item.numeral}</p>
                <p className="mt-1 font-display text-[1.35rem] leading-tight text-ink transition-colors group-hover:text-violet-deep">{item.label}</p>
                {item.count >= 3 && (
                  <p className="mt-0.5 text-xs text-muted">
                    {item.count} {tCommon("baskets")}
                  </p>
                )}
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
