import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { Cake, Heart, Flower2, Baby, Sun, PartyPopper, House, HandHeart } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getCollections } from "@/lib/queries";
import { OCCASIONS, labelFor } from "@/lib/nav";
import { t as tc } from "@/lib/i18n-content";

const ICONS = [Cake, Heart, HandHeart, Flower2, Baby, Sun, PartyPopper, House];

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
          {shown.map((o, i) => {
            const row = bySlug.get(o.slug);
            const label = row ? tc(row.name, locale) : labelFor(o, locale);
            const Icon = ICONS[i % ICONS.length];
            return (
              <Link key={o.slug} href={`/occasions/${o.slug}`} className="occasion-tile">
                <span className="occasion-icon">
                  {row?.imageUrl ? (
                    <Image src={row.imageUrl} alt="" fill sizes="64px" className="object-cover" />
                  ) : (
                    <Icon size={26} strokeWidth={1.4} />
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
