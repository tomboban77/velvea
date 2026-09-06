import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export async function Hero({ featuredImage }: { featuredImage?: string | null }) {
  const t = await getTranslations("hero");
  const locale = await getLocale();

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 h-[38rem] w-[38rem] -translate-y-1/3 translate-x-1/4 rounded-full opacity-[0.10] blur-[90px]"
        style={{ background: "var(--grad-iris)" }}
      />

      <div className="container-x grid items-center gap-14 pb-16 pt-14 lg:grid-cols-[1.02fr_0.98fr] lg:pb-24 lg:pt-20">
        {/* copy */}
        <div className="relative max-w-xl">
          <p className="eyebrow mb-7">{t("eyebrow")}</p>

          <h1 className="font-display text-[3rem] font-normal leading-[1.02] tracking-[-0.01em] balance sm:text-[4rem] lg:text-[4.6rem]">
            {locale === "fr" ? (
              <>
                L&apos;art du cadeau
                <br />
                <span className="italic">réfléchi</span>.
              </>
            ) : (
              <>
                The art of the
                <br />
                <span className="italic">considered</span> gift.
              </>
            )}
          </h1>

          <p className="mt-7 max-w-md text-[1.02rem] leading-relaxed text-ink-soft">
            {t("lede")}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link href="/baskets" className="btn btn-gold btn-lg">
              {locale === "fr" ? "Découvrir la collection" : "Explore the collection"}
              <ArrowRight />
            </Link>
            <Link href="/custom" className="btn btn-outline btn-lg">
              {locale === "fr" ? "Composer un panier" : "Compose a basket"}
            </Link>
          </div>

        </div>

        {/* visual — framed gallery panel */}
        <div className="relative">
          <div className="relative mx-auto max-w-[30rem]">
            {/* gold hairline frame */}
            <div className="absolute -inset-3 rounded-[1.35rem] border border-gold-soft/40" />
            <figure
              className="relative aspect-[4/5] overflow-hidden rounded-[1.1rem] bg-cream"
              style={{ animation: "velvea-float 9s ease-in-out infinite" }}
            >
              {featuredImage ? (
                <Image
                  src={featuredImage}
                  alt="The Velvéa signature basket"
                  fill
                  priority
                  sizes="(max-width:1024px) 90vw, 40vw"
                  className="object-cover"
                />
              ) : (
                <HeroComposition />
              )}
            </figure>

            {/* caption plaque */}
            <figcaption className="absolute -bottom-4 left-8 flex items-center gap-3 bg-canvas px-5 py-3">
              <span className="font-display text-sm italic text-ink">
                {locale === "fr" ? "La collection signature" : "The Signature Collection"}
              </span>
            </figcaption>
          </div>
        </div>
      </div>

      <div className="container-x pb-4">
        <div className="mb-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[0.68rem] uppercase tracking-[0.22em] text-muted">
          <span>{locale === "fr" ? "Fondée en 2026" : "Established 2026"}</span>
          <span className="h-1 w-1 rounded-full bg-gold-soft" />
          <span>Mississauga, Ontario</span>
          <span className="h-1 w-1 rounded-full bg-gold-soft" />
          <span>{locale === "fr" ? "Livré partout au Canada" : "Delivered across Canada"}</span>
        </div>
        <div className="thread" />
      </div>
    </section>
  );
}

/** Editorial composition shown until a featured product image is set. */
function HeroComposition() {
  return (
    <div className="flex h-full flex-col justify-between bg-[radial-gradient(130%_110%_at_50%_-10%,#ffffff,#ece2d6)] p-8">
      <div className="flex items-start justify-between">
        <span className="text-[0.62rem] uppercase tracking-[0.3em] text-muted">
          No. 01
        </span>
        <span
          className="h-9 w-9 rounded-full"
          style={{ background: "var(--grad-iris)", opacity: 0.9 }}
        />
      </div>

      <div className="text-center">
        <p className="font-display text-6xl leading-none tracking-[0.06em] text-ink/90">
          VELVÉA
        </p>
        <div className="mx-auto mt-4 h-px w-16" style={{ background: "var(--grad-gold)" }} />
        <p className="mt-4 text-[0.7rem] uppercase tracking-[0.28em] text-muted">
          Gourmet · Wine · Chocolate
        </p>
      </div>

      <div className="flex items-end justify-between text-[0.62rem] uppercase tracking-[0.22em] text-muted">
        <span>Hand-packed</span>
        <span>Made to order</span>
      </div>
    </div>
  );
}
