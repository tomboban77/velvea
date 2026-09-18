import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { Cake, Heart, Feather, Flower2, Moon, Leaf, Sparkles, KeyRound, Gift } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getCollections } from "@/lib/queries";
import { OCCASIONS, labelFor } from "@/lib/nav";
import { t as tc } from "@/lib/i18n-content";

/* Keyed by slug rather than by position, so reordering OCCASIONS cannot
   silently hand an occasion the wrong mark. The set leans on quieter,
   more restrained shapes: a quill for thanks, a key for a new home. */
const ICONS: Record<string, typeof Gift> = {
  birthday: Cake,
  anniversary: Heart,
  "thank-you": Feather,
  sympathy: Flower2,
  "new-baby": Moon,
  "get-well": Leaf,
  congratulations: Sparkles,
  housewarming: KeyRound,
};

/** The eight most-shopped occasions as round-icon tiles; scrolls on mobile, grid on desktop. */
export async function OccasionsRail() {
  const t = await getTranslations("occasions");
  const locale = await getLocale();
  const db = await getCollections("OCCASION");
  const bySlug = new Map(db.map((c) => [c.slug, c]));
  const shown = OCCASIONS.slice(0, 8);

  return (
    <section className="section-sm">
      <div className="container-x">
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} link="/occasions" linkLabel={t("viewAll")} />
        <div className="occasion-scroller mt-8">
          {shown.map((o) => {
            const row = bySlug.get(o.slug);
            const label = row ? tc(row.name, locale) : labelFor(o, locale);
            const Icon = ICONS[o.slug] ?? Gift;
            return (
              <Link key={o.slug} href={`/occasions/${o.slug}`} className="occasion-tile">
                <span className="occasion-icon">
                  {row?.imageUrl ? (
                    <Image src={row.imageUrl} alt="" fill sizes="72px" className="object-cover" />
                  ) : (
                    <Icon size={28} strokeWidth={1.25} />
                  )}
                </span>
                <p>{label}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
