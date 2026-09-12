import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import { SameDayNotice } from "@/components/ui/SameDayNotice";
import { Ornament } from "@/components/brand/Ornament";
import { formatMoney } from "@/lib/utils";

export type HeroProduct = {
  slug: string;
  name: string;
  image: string | null;
  priceCents: number;
} | null;

/**
 * Hero — engraved-stationery composition. Copy in columns 1–5 with a
 * chapter label and ornament; the basket photograph arched and ringed in
 * hairline gold in columns 7–12, caption on a rule beneath.
 */
export async function Hero({ product }: { product: HeroProduct }) {
  const t = await getTranslations("hero");

  return (
    <section className="relative">
      <div className="container-x">
        <div className="grid items-center gap-14 pb-16 pt-12 lg:grid-cols-12 lg:gap-x-10 lg:pb-24 lg:pt-16">
          {/* copy — columns 1–5 */}
          <div className="lg:col-span-5">
            <p className="chapter anim-rise" style={{ animationDelay: "60ms" }}>
              {t("eyebrow")}
            </p>
            <Ornament className="anim-rise mt-4" />

            <h1 className="h-display anim-rise mt-7" style={{ animationDelay: "140ms" }}>
              {t("titleA")}
              <br />
              <span className="italic text-violet-deep">{t("titleB")}</span> {t("titleC")}
            </h1>

            <p className="anim-rise mt-8 max-w-[27rem] text-[1.08rem] leading-relaxed text-ink-soft" style={{ animationDelay: "220ms" }}>
              {t("lede")}
            </p>

            <div className="anim-rise mt-10 flex flex-wrap items-center gap-3" style={{ animationDelay: "300ms" }}>
              <Link href="/baskets" className="btn btn-primary">
                {t("ctaPrimary")}
                <ArrowRight />
              </Link>
              <Link href="/custom" className="btn btn-outline">
                {t("ctaSecondary")}
              </Link>
            </div>

            <div className="anim-rise mt-9 border-t border-line pt-6" style={{ animationDelay: "380ms" }}>
              <SameDayNotice />
            </div>
          </div>

          {/* photograph — columns 7–12 */}
          <div className="anim-fade lg:col-span-6 lg:col-start-7" style={{ animationDelay: "200ms" }}>
            <figure className="px-3 pt-3">
              <div className="arch ring-gold relative aspect-[4/5] overflow-hidden bg-cream">
                {product?.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    priority
                    sizes="(max-width:1024px) 100vw, 45vw"
                    className="object-cover"
                  />
                ) : (
                  <HeroComposition />
                )}
              </div>

              {product && (
                <figcaption className="mt-8 flex items-end justify-between gap-4 border-t border-line pt-4">
                  <div className="min-w-0">
                    <p className="chapter">{t("pictured")}</p>
                    <p className="mt-1 truncate font-display text-[1.35rem] leading-tight text-ink">{product.name}</p>
                  </div>
                  <Link href={`/products/${product.slug}`} className="link-draw shrink-0 text-ink">
                    {formatMoney(product.priceCents)} · {t("view")}
                    <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.6} />
                  </Link>
                </figcaption>
              )}
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Typographic composition shown until a product image exists. */
function HeroComposition() {
  return (
    <div className="flex h-full flex-col justify-between bg-[radial-gradient(130%_110%_at_50%_-10%,#fffdf8,#ece3d2)] p-8 pt-24">
      <div className="text-center">
        <p className="font-caps text-5xl tracking-[0.18em] text-violet-deep">VELVEA</p>
        <Ornament className="mx-auto mt-5" />
        <p className="caps mt-5 text-[0.62rem] text-muted">Gourmet · Wine · Chocolate</p>
      </div>
      <div className="flex items-end justify-between text-[0.6rem] uppercase tracking-[0.22em] text-muted">
        <span>Hand-packed</span>
        <span>Made to order</span>
      </div>
    </div>
  );
}
