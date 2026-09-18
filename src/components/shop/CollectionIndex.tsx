import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getCollections } from "@/lib/queries";
import { t as tc } from "@/lib/i18n-content";
import { labelFor, type NavLink } from "@/lib/nav";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

const TINTS = ["#f8f2fb", "#f6f1eb", "#f1e8f7", "#f1ebe4", "#f6eefb", "#f7f2ec", "#ece1f4", "#f3ede7"];

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
  const t = await getTranslations();
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
    <div>
      <div className="band-cream border-b border-line">
        <div className="container-x pb-8 pt-5 lg:pb-10">
          <Breadcrumb items={[{ label: t("pdp.home"), href: "/" }, { label: title, href: base }]} />
          <header className="mt-6 max-w-3xl">
            <p className="caps mb-3">{eyebrow}</p>
            <h1 className="h-display balance">{title}</h1>
            <p className="mt-4 max-w-2xl text-[1.05rem] leading-relaxed text-ink-soft pretty">{description}</p>
          </header>
        </div>
      </div>

      <div className="container-x pb-16 pt-10">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5 xl:gap-5">
          {items.map((item, i) => (
            <Link key={item.slug} href={`${base}/${item.slug}`} className="group relative block aspect-[4/3] overflow-hidden rounded-lg border border-line transition-shadow hover:shadow-md">
              {item.image ? (
                <>
                  <Image src={item.image} alt={item.label} fill sizes="(max-width:768px) 50vw, 25vw" className="zoom-img object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent" />
                </>
              ) : (
                <div className="zoom-img h-full w-full" style={{ background: TINTS[i % TINTS.length] }}>
                  <span className="absolute -bottom-8 -right-2 select-none font-display text-[9rem] leading-none text-violet-deep/[0.06]">
                    {item.label.charAt(0)}
                  </span>
                </div>
              )}
              <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-3">
                <div>
                  <p className={cn2("font-display text-[1.35rem] font-medium leading-tight", item.image ? "text-white" : "text-ink")}>{item.label}</p>
                  {item.count > 0 && (
                    <p className={cn2("mt-0.5 text-sm", item.image ? "text-white/80" : "text-ink-soft")}>
                      {item.count} {item.count === 1 ? (locale === "fr" ? "panier" : "basket") : t("common.baskets")}
                    </p>
                  )}
                </div>
                <span className={cn2("circle-arrow h-10 w-10", item.image && "border-white/40 bg-white/15 text-white")}>
                  <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function cn2(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}
