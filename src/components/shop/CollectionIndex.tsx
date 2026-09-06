import { getLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { getCollections } from "@/lib/queries";
import { t as tc } from "@/lib/i18n-content";
import { labelFor, type NavLink } from "@/lib/nav";

const IRIS = [
  "linear-gradient(150deg,#db8cb2,#a86bb0)",
  "linear-gradient(150deg,#b0894e,#c9a86c)",
  "linear-gradient(150deg,#2f9d9a,#1f7a78)",
  "linear-gradient(150deg,#6d4c8c,#a86bb0)",
  "linear-gradient(150deg,#1f7a78,#2f9d9a)",
  "linear-gradient(150deg,#c9a86c,#db8cb2)",
  "linear-gradient(150deg,#a86bb0,#6d4c8c)",
  "linear-gradient(150deg,#e7d6b4,#c9a86c)",
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
    <div className="container-x py-12">
      <header className="mb-10 max-w-2xl">
        <p className="eyebrow mb-3">{eyebrow}</p>
        <h1 className="font-display text-4xl leading-tight balance sm:text-5xl">{title}</h1>
        <p className="mt-4 text-ink-soft">{description}</p>
      </header>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {items.map((item, i) => (
          <Reveal key={item.slug} delay={(i % 8) * 50}>
            <Link
              href={`${base}/${item.slug}`}
              className="group relative block aspect-[4/5] overflow-hidden rounded-2xl card-hover"
            >
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.label}
                  fill
                  sizes="(max-width:768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div
                  className="h-full w-full transition-transform duration-700 group-hover:scale-105"
                  style={{ background: IRIS[i % IRIS.length] }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/55 to-transparent" />
              <div className="absolute inset-x-4 bottom-4">
                <p className="font-display text-2xl text-white drop-shadow">{item.label}</p>
                {item.count > 0 && (
                  <p className="mt-0.5 text-xs text-white/80">{item.count} baskets</p>
                )}
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
