import { getLocale, getTranslations } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { ProductCard } from "@/components/shop/ProductCard";
import { Ornament } from "@/components/brand/Ornament";
import { toProductView } from "@/lib/view";
import { tList } from "@/lib/i18n-content";
import { formatMoney } from "@/lib/utils";
import type { ProductCard as ProductRow } from "@/lib/queries";

/**
 * Adaptive collection block. Four or more products → grid. Fewer → the
 * lead basket is presented as a plate: framed photograph, contents listed
 * like a menu, price on a rule.
 */
export async function Collection({ products }: { products: ProductRow[] }) {
  if (!products.length) return null;
  const t = await getTranslations("collection");
  const locale = await getLocale();

  if (products.length >= 4) {
    const views = products.slice(0, 8).map((p) => toProductView(p, locale));
    return (
      <section className="section bg-cream">
        <div className="container-x">
          <SectionHeading chapter="Chapter II" eyebrow={t("eyebrow")} title={t("title")} lede={t("lede")} link="/baskets" linkLabel={t("viewAll")} />
          <div className="mt-14 grid grid-cols-2 gap-x-5 gap-y-10 sm:gap-x-8 lg:grid-cols-4">
            {views.map((v, i) => (
              <Reveal key={v.id} delay={(i % 4) * 70}>
                <ProductCard product={v} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const lead = products[0];
  const leadView = toProductView(lead, locale);
  const contents = tList(lead.contents, locale);
  const shown = contents.slice(0, 8);
  const others = products.slice(1, 3).map((p) => toProductView(p, locale));
  const isNew = leadView.badges.includes("new");

  return (
    <section className="section bg-cream">
      <div className="container-x">
        <SectionHeading chapter="Chapter II" eyebrow={t("eyebrow")} title={t("title")} lede={t("lede")} />

        <div className="mt-16 grid gap-12 lg:grid-cols-12 lg:items-center">
          <Reveal className="lg:col-span-6">
            <Link href={`/products/${leadView.slug}`} className="group block p-3">
              <div className="frame relative aspect-[5/6] overflow-hidden bg-sand">
                {leadView.image ? (
                  <Image src={leadView.image} alt={leadView.name} fill sizes="(max-width:1024px) 100vw, 50vw" className="zoom-img object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="font-caps text-3xl tracking-[0.2em] text-line-strong">VELVEA</span>
                  </div>
                )}
              </div>
            </Link>
          </Reveal>

          <Reveal delay={120} className="lg:col-span-5 lg:col-start-8">
            <p className="chapter">
              {t("signature")}
              {isNew && (
                <>
                  <span className="mx-3 text-lilac-deep">·</span>
                  <span className="text-violet">{t("newArrival")}</span>
                </>
              )}
            </p>
            <h3 className="h-sub mt-4 balance">
              <Link href={`/products/${leadView.slug}`} className="transition-colors hover:text-violet-deep">
                {leadView.name}
              </Link>
            </h3>
            {leadView.tagline && <p className="mt-3 font-display text-[1.25rem] italic text-ink-soft">{leadView.tagline}</p>}

            {shown.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center gap-4">
                  <p className="caps text-[0.6rem] text-violet">{t("inside")}</p>
                  <span className="h-px flex-1 bg-line" />
                </div>
                <ul className="mt-4 columns-2 gap-x-8 text-[0.95rem] leading-[1.9] text-ink-soft">
                  {shown.map((c) => (
                    <li key={c} className="break-inside-avoid">
                      {c}
                    </li>
                  ))}
                </ul>
                {contents.length > shown.length && <p className="mt-1 text-xs text-muted">{t("moreInside", { count: contents.length - shown.length })}</p>}
              </div>
            )}

            <div className="mt-8 flex items-center justify-between border-t border-line-strong pt-5">
              <p className="flex items-baseline gap-3">
                <span className="font-display text-[1.9rem] text-ink">{formatMoney(leadView.priceCents)}</span>
                {leadView.compareAtCents && leadView.compareAtCents > leadView.priceCents && (
                  <span className="text-sm text-muted line-through">{formatMoney(leadView.compareAtCents)}</span>
                )}
              </p>
              <Link href={`/products/${leadView.slug}`} className="btn btn-primary">
                {t("view")} <ArrowRight />
              </Link>
            </div>
          </Reveal>
        </div>

        {others.length > 0 && (
          <div className="mt-16 grid grid-cols-2 gap-5 sm:gap-8 lg:grid-cols-4">
            {others.map((v, i) => (
              <Reveal key={v.id} delay={i * 80}>
                <ProductCard product={v} />
              </Reveal>
            ))}
          </div>
        )}

        <div className="mt-16 flex flex-col items-center">
          <Ornament />
          <Link href="/baskets" className="link-draw mt-5 text-ink">
            {t("explore")} <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.6} />
          </Link>
        </div>
      </div>
    </section>
  );
}
