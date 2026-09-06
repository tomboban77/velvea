import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { getCollections } from "@/lib/queries";
import { OCCASIONS, labelFor } from "@/lib/nav";
import { t as tc } from "@/lib/i18n-content";

// Signature gradient per occasion, used when no image is set.
const GRADIENTS: Record<string, string> = {
  birthday: "linear-gradient(150deg,#db8cb2,#a86bb0)",
  anniversary: "linear-gradient(150deg,#b0894e,#c9a86c)",
  "thank-you": "linear-gradient(150deg,#2f9d9a,#1f7a78)",
  sympathy: "linear-gradient(150deg,#6d7d8c,#8a8072)",
  "new-baby": "linear-gradient(150deg,#e7d6b4,#db8cb2)",
  "get-well": "linear-gradient(150deg,#2f9d9a,#6d4c8c)",
  congratulations: "linear-gradient(150deg,#c9a86c,#db8cb2)",
  housewarming: "linear-gradient(150deg,#b0894e,#6d4c8c)",
  wedding: "linear-gradient(150deg,#e7d6b4,#c9a86c)",
  holiday: "linear-gradient(150deg,#1f7a78,#a86bb0)",
};

export async function OccasionsGrid() {
  const t = await getTranslations("occasions");
  const tCommon = await getTranslations("common");
  const locale = await getLocale();
  const dbCollections = await getCollections("OCCASION");

  // Merge DB data (image, count) over the canonical nav list.
  const byslug = new Map(dbCollections.map((c) => [c.slug, c]));
  const items = OCCASIONS.map((o) => {
    const db = byslug.get(o.slug);
    return {
      slug: o.slug,
      label: db ? tc(db.name, locale) : labelFor(o, locale),
      image: db?.imageUrl ?? null,
      count: db?._count?.products ?? 0,
    };
  });

  return (
    <section className="container-x py-20">
      <SectionHeading
        eyebrow={t("eyebrow")}
        title={t("title")}
        lede={t("lede")}
        link="/occasions"
        linkLabel={tCommon("viewAllOccasions")}
      />

      <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {items.map((item, i) => (
          <Reveal key={item.slug} delay={i * 60}>
            <Link
              href={`/occasions/${item.slug}`}
              className="group relative block aspect-[4/5] overflow-hidden rounded-2xl card-hover"
            >
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.label}
                  fill
                  sizes="(max-width:768px) 50vw, 20vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div
                  className="h-full w-full transition-transform duration-700 group-hover:scale-105"
                  style={{ background: GRADIENTS[item.slug] ?? "var(--grad-iris)" }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/55 via-charcoal/5 to-transparent" />
              {item.count > 0 && (
                <span className="absolute right-3 top-3 rounded-full bg-charcoal/70 px-2.5 py-1 text-[0.65rem] font-semibold text-white backdrop-blur">
                  {item.count} {tCommon("baskets")}
                </span>
              )}
              <div className="absolute inset-x-3 bottom-3">
                <span className="inline-flex rounded-full bg-canvas/95 px-4 py-2 text-sm font-semibold text-ink shadow-sm backdrop-blur transition-all group-hover:bg-canvas">
                  {item.label}
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
