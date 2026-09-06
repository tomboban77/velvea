import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Star, ArrowRight, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { getApprovedReviews, getReviewStats } from "@/lib/queries";
import { t as tc } from "@/lib/i18n-content";
import { formatDate } from "@/lib/utils";

const FALLBACK = [
  {
    rating: 5,
    title: "Absolutely perfect gift",
    body: "I gifted this for a birthday and it was an instant hit. From the moment the box opened, the presentation was elegant and every item felt considered.",
    author: "Opeyemi A.",
    location: "Beaver Bank, NS",
    product: "Wine & Luxury Belgian Biscuit Cookies",
  },
  {
    rating: 5,
    title: "Client holiday basket",
    body: "My client wrote to say they truly enjoyed the gourmet basket I sent. It looked exactly like the photos and arrived beautifully packed.",
    author: "Pia M.",
    location: "Montréal, QC",
    product: "Noel Nights Gourmet Basket",
  },
  {
    rating: 5,
    title: "A perfect expression of care",
    body: "I sent this to a friend mourning a loss. At a time when she had no energy to cook, she said it was the kindest, gentlest thing to receive.",
    author: "Anuja V.",
    location: "Toronto, ON",
    product: "Healing Hugs Sympathy Basket",
  },
];

export async function Reviews() {
  const t = await getTranslations("reviews");
  const tCommon = await getTranslations("common");
  const locale = await getLocale();
  const [dbReviews, stats] = await Promise.all([
    getApprovedReviews(3),
    getReviewStats(),
  ]);

  const reviews = dbReviews.length
    ? dbReviews.map((r) => ({
        rating: r.rating,
        title: r.title ?? "",
        body: r.body,
        author: r.authorName,
        location: r.authorLocation ?? "",
        product: tc(r.product?.name, locale),
        date: formatDate(r.createdAt, locale === "fr" ? "fr-CA" : "en-CA"),
      }))
    : FALLBACK.map((r) => ({ ...r, date: "" }));

  return (
    <section className="bg-sand/40">
      <div className="container-x py-20">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <p className="eyebrow mb-3">{t("eyebrow")}</p>
            <h2 className="font-display text-4xl leading-tight balance sm:text-5xl">
              {t("title")}
            </h2>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex text-gold">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <span className="text-sm text-ink-soft">
                {stats.count > 0
                  ? t("summary", {
                      rating: stats.avg.toFixed(1),
                      count: String(stats.count),
                    })
                  : t("title")}
              </span>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <Link
              href="/reviews"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-ink hover:text-gold"
            >
              {tCommon("readAllReviews")}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {reviews.map((r, i) => (
            <Reveal key={i} delay={i * 90}>
              <figure className="flex h-full flex-col rounded-2xl border border-line bg-shell p-6">
                <div className="flex items-center justify-between">
                  <div className="flex text-gold">
                    {Array.from({ length: r.rating }).map((_, s) => (
                      <Star key={s} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </div>
                  {r.date && <span className="text-xs text-muted">{r.date}</span>}
                </div>
                {r.title && (
                  <figcaption className="mt-4 font-display text-xl text-ink">
                    {r.title}
                  </figcaption>
                )}
                <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">
                  &ldquo;{r.body}&rdquo;
                </blockquote>
                {r.product && (
                  <p className="mt-4 border-t border-line pt-4 text-xs text-muted">
                    <span className="uppercase tracking-wider">{tCommon("reviewed")}</span>{" "}
                    <span className="font-medium text-ink-soft">{r.product}</span>
                  </p>
                )}
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-ink">{r.author}</p>
                    {r.location && <p className="text-xs text-muted">{r.location}</p>}
                  </div>
                  <span className="flex items-center gap-1 text-[0.65rem] font-semibold uppercase tracking-wider text-teal-deep">
                    <ShieldCheck className="h-3.5 w-3.5" /> {tCommon("verifiedBuyer")}
                  </span>
                </div>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
