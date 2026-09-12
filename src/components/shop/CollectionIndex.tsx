import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { getCollections } from "@/lib/queries";
import { t as tc } from "@/lib/i18n-content";
import { labelFor, type NavLink } from "@/lib/nav";

const TINTS = [
  "linear-gradient(160deg,#efe3ea,#e6d6e2)",
  "linear-gradient(160deg,#ecdfc9,#e3d2b4)",
  "linear-gradient(160deg,#e6dff0,#d9cfe8)",
  "linear-gradient(160deg,#e9e6ee,#dcd7e4)",
  "linear-gradient(160deg,#f3e6e6,#ead6d6)",
  "linear-gradient(160deg,#e4e2f1,#d5d1e8)",
  "linear-gradient(160deg,#ecdcc0,#e1cca7)",
  "linear-gradient(160deg,#eae2dc,#ddd2c9)",
];

export async function CollectionIndex({
  type,
  base,
  navList,
  eyebrow,
  title,
  description,
}: {
  type: "OCCASION" | "RECIPIENT" | "CATEGORY";
  base: string;
  navList: NavLink[];
  eyebrow: string;
  title: string;
  description: string;
}) {
  const locale = await getLocale();
  const tCommon = await getTranslations("common");
  const db = await getCollections(type);
  const bySlug = new Map(db.map((c) => [c.slug, c]));

  const items = navList.map((n) => {
    const row = bySlug.get(n.slug);
    return {
      slug: n.slug,
      label: row ? tc(row.name, locale) : labelFor(n, locale),
      image: row?.imageUrl ?? null,
      count: row?._count?.products ?? 0,
    };
  });

  return (
    <div className="container-x pb-16 pt-8 lg:pt-10">
      <header className="max-w-2xl">
        <p className="chapter mb-4">{eyebrow}</p>
        <h1 className="h-section font-display balance">{title}</h1>
        <p className="mt-4 text-[1.02rem] text-ink-soft pretty">{description}</p>
      </header>

      <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
        {items.map((item, i) => (
          <Reveal key={item.slug} delay={(i % 8) * 50}>
            <Link href={`${base}/${item.slug}`} className="group arch relative block aspect-[4/5] overflow-hidden">
              {item.image ? (
                <Image src={item.image} alt={item.label} fill sizes="(max-width:768px) 50vw, 25vw" className="zoom-img object-cover" />
              ) : (
                <div className="zoom-img h-full w-full" style={{ background: TINTS[i % TINTS.length] }}>
                  <span className="absolute -bottom-6 -right-3 select-none font-display text-[9rem] leading-none text-ink/[0.045]">
                    {item.label.charAt(0)}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/35 via-transparent to-transparent opacity-80" />
              <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-2">
                <div>
                  <p className={item.image ? "font-display text-xl text-canvas" : "font-display text-xl text-ink"}>{item.label}</p>
                  {item.count >= 3 && (
                    <p className={item.image ? "text-xs text-canvas/75" : "text-xs text-ink-soft"}>
                      {item.count} {tCommon("baskets")}
                    </p>
                  )}
                </div>
                <span
                  className={
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-transform group-hover:translate-x-0.5 " +
                    (item.image ? "bg-canvas/90 text-ink" : "bg-ink text-canvas")
                  }
                >
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.7} />
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
