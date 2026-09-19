import { getLocale, getTranslations } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { SameDayNotice } from "@/components/ui/SameDayNotice";
import { advertisedSameDayCutoff } from "@/lib/zones";
import { formatMoney, cn } from "@/lib/utils";

export type HeroProduct = { slug: string; name: string; image: string | null; priceCents: number; badge?: string | null };

/**
 * Product-led hero. The statement sits centred on a lilac band; beneath it the
 * baskets themselves are set out on a shelf — square photographs shown whole,
 * the featured basket largest in the middle. Three tiles on laptops, five on
 * wide screens, a swipeable row on phones.
 */
export async function Hero({ products }: { products: HeroProduct[] }) {
  const t = await getTranslations("hero");
  const tc = await getTranslations("common");
  const locale = await getLocale();
  const fr = locale === "fr";
  const money = (c: number) => formatMoney(c, fr ? "fr-CA" : "en-CA");
  const cutoff = await advertisedSameDayCutoff();

  const withImage = products.filter((p) => p.image);
  const [lead, ...rest] = withImage;
  // Shelf order: [4th, 2nd, lead, 3rd, 5th] so the lead is centred and the
  // outer pair only appears on wide screens.
  const shelf = lead
    ? [
        { p: rest[2], pos: "outer" as const },
        { p: rest[0], pos: "inner" as const },
        { p: lead, pos: "lead" as const },
        { p: rest[1], pos: "inner" as const },
        { p: rest[3], pos: "outer" as const },
      ].filter((s) => s.p)
    : [];

  const badgeLabel = (b?: string | null) =>
    b === "new" ? tc("new") : b === "bestseller" ? tc("bestseller") : b === "limited" ? tc("limited") : null;

  return (
    <section className="hero">
      <div className="container-x hero-stage">
        <div className="hero-copy anim-rise">
          <p className="inline-flex items-center gap-2 rounded-full border border-violet-deep/15 bg-white/70 px-3.5 py-1.5 text-[0.72rem] font-bold uppercase tracking-[0.1em] text-violet-deep">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-deep" />
            {t("badge")}
          </p>
          <h1 className="hero-title balance">
            {t("titleA")} <em>{t("titleB")}</em> {t("titleC")}
          </h1>
          <p className="hero-lede pretty">{t("lede")}</p>
          <div className="hero-actions">
            <Link href="/baskets" className="btn btn-primary btn-lg">
              {t("shopNow")} <ArrowRight />
            </Link>
            <Link href="/custom" className="btn btn-outline btn-lg">
              {t("ctaSecondary")}
            </Link>
          </div>
          {cutoff && (
            <div className="hero-note">
              <SameDayNotice cutoff={cutoff} />
            </div>
          )}
        </div>

        {shelf.length > 0 ? (
          <div className={cn("hero-shelf anim-fade", shelf.length < 3 && "is-short")} data-count={shelf.length}>
            {shelf.map(({ p, pos }, i) => {
              const label = badgeLabel(p!.badge);
              return (
                <Link
                  key={p!.slug}
                  href={`/products/${p!.slug}`}
                  className={cn("hero-tile group", pos === "lead" && "is-lead", pos === "outer" && "is-outer")}
                  style={{ animationDelay: `${i * 70}ms` }}
                >
                  <figure>
                    <Image
                      src={p!.image!}
                      alt={p!.name}
                      fill
                      priority={pos === "lead"}
                      sizes={pos === "lead" ? "(max-width:1023px) 72vw, 34vw" : "(max-width:1023px) 72vw, 24vw"}
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                    {label && <span className={cn("badge absolute left-3 top-3", p!.badge === "bestseller" ? "badge-plum" : "badge-gold")}>{label}</span>}
                  </figure>
                  <span className="hero-tile-caption">
                    <span className="min-w-0">
                      <span className="hero-tile-name">{p!.name}</span>
                      <span className="price block text-sm text-ink-soft">{money(p!.priceCents)}</span>
                    </span>
                    <span className="circle-arrow h-9 w-9">
                      <ArrowUpRight className="h-4 w-4" strokeWidth={1.8} />
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="hero-shelf is-short anim-fade">
            <div className="hero-tile is-lead">
              <figure>
                <Image
                  src="/images/gifting-editorial.webp"
                  alt={fr ? "Coffrets ivoire et rubans prune, inspiration de notre atelier" : "Ivory gift boxes with plum ribbons, inspiration from our atelier"}
                  fill
                  priority
                  sizes="(max-width:1023px) 90vw, 40vw"
                  className="object-cover"
                />
              </figure>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
