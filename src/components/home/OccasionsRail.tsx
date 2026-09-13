import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { Cake, Heart, Flower2, Baby, Sun, PartyPopper, House, Gem, Gift, HandHeart } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getCollections } from "@/lib/queries";
import { OCCASIONS, labelFor } from "@/lib/nav";
import { t as tc } from "@/lib/i18n-content";

const ICONS = [Cake, Heart, Flower2, HandHeart, Baby, Sun, PartyPopper, House, Gem, Gift];
const TINTS = ["#f5e6e4", "#eee2e8", "#e8edde", "#eee8df", "#f3e9df"];

export async function OccasionsRail() {
  const t = await getTranslations("occasions");
  const locale = await getLocale();
  const db = await getCollections("OCCASION");
  const bySlug = new Map(db.map((c) => [c.slug, c]));
  return (
    <section className="section-sm">
      <div className="container-x">
        <SectionHeading align="left" eyebrow={t("eyebrow")} title={t("title")} link="/occasions" linkLabel={t("viewAll")} />
        <div className="occasion-grid mt-8">
          {OCCASIONS.map((o, i) => {
            const row = bySlug.get(o.slug);
            const label = row ? tc(row.name, locale) : labelFor(o, locale);
            const Icon = ICONS[i % ICONS.length];
            return <Link key={o.slug} href={`/occasions/${o.slug}`} className="occasion-card"><span className="occasion-icon" style={{ background: TINTS[i % TINTS.length] }}>{row?.imageUrl ? <Image src={row.imageUrl} alt="" fill sizes="44px" className="object-cover" /> : <Icon size={21} strokeWidth={1.4} />}</span><p>{label}</p></Link>;
          })}
        </div>
      </div>
    </section>
  );
}
