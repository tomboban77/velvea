import { getLocale, getTranslations } from "next-intl/server";
import { Star, ShieldCheck } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { getApprovedReviews, getReviewStats } from "@/lib/queries";
import { t as tc } from "@/lib/i18n-content";
import { formatDate } from "@/lib/utils";

/** Renders only genuine, approved reviews. Nothing is shown until they exist. */
export async function Reviews() {
  const t = await getTranslations("reviews");
  const tCommon = await getTranslations("common");
  const locale = await getLocale();
  const [rows, stats] = await Promise.all([getApprovedReviews(3), getReviewStats()]);
  if (!rows.length) return null;

  return (
    <section className="section bg-cream/60">
      <div className="container-x">
        <SectionHeading
          chapter="Chapter VIII"
          eyebrow={t("eyebrow")}
          title={t("title")}
          lede={stats.count > 0 ? t("summary", { rating: stats.avg.toFixed(1), count: stats.count }) : undefined}
          link="/reviews"
          linkLabel={t("readAll")}
        />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {rows.map((r, i) => (
            <Reveal key={r.id} delay={i * 90}>
              <figure className="flex h-full flex-col rounded-2xl border border-line bg-shell p-6">
                <div className="flex items-center justify-between">
                  <div className="flex text-violet">
                    {Array.from({ length: r.rating }).map((_, s) => (
                      <Star key={s} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="text-xs text-muted">{formatDate(r.createdAt, locale === "fr" ? "fr-CA" : "en-CA")}</span>
                </div>
                {r.title && <figcaption className="mt-4 font-display text-xl text-ink">{r.title}</figcaption>}
                <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">“{r.body}”</blockquote>
                {r.product && (
                  <p className="mt-4 border-t border-line pt-4 text-xs text-muted">
                    <span className="uppercase tracking-wider">{tCommon("reviewed")}</span>{" "}
                    <span className="font-medium text-ink-soft">{tc(r.product.name, locale)}</span>
                  </p>
                )}
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-ink">{r.authorName}</p>
                    {r.authorLocation && <p className="text-xs text-muted">{r.authorLocation}</p>}
                  </div>
                  {r.verified && (
                    <span className="flex items-center gap-1 text-[0.65rem] font-semibold uppercase tracking-wider text-violet-deep">
                      <ShieldCheck className="h-3.5 w-3.5" /> {tCommon("verifiedBuyer")}
                    </span>
                  )}
                </div>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
