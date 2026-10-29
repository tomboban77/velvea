import { setRequestLocale, getTranslations } from "next-intl/server";
import { Star, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { t as tc } from "@/lib/i18n-content";
import { formatDate } from "@/lib/utils";
import { pageMetadata } from "@/lib/seo";
import { GOOGLE_REVIEWS } from "@/lib/google-reviews";
import { googleReviewsData } from "@/components/home/GoogleReviews";
import { GoogleG, ReviewCard, Stars } from "@/components/home/GoogleReviewsCarousel";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return pageMetadata({
    locale,
    path: "/reviews",
    title: t("reviewsTitle"),
    description: t("reviewsDescription"),
  });
}

export default async function ReviewsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const fr = locale === "fr";
  const [reviews, stats] = await Promise.all([
    prisma.review
      .findMany({
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        take: 60,
        include: { product: { select: { name: true, slug: true } } },
      })
      .catch(() => []),
    prisma.review
      .aggregate({ where: { status: "APPROVED" }, _avg: { rating: true }, _count: true })
      .catch(() => ({ _avg: { rating: 0 }, _count: 0 })),
  ]);
  // Google reviews lead: they are the ones with a public, checkable source. The
  // on-site reviews (approved in the admin) follow once there are any.
  const google = GOOGLE_REVIEWS.length ? await googleReviewsData() : null;

  return (
    <div>
      <header className="band-cream border-b border-line px-[var(--gutter)] py-12 text-center lg:py-16">
        <p className="caps">{fr ? "Avis clients" : "Customer reviews"}</p>
        <h1 className="h-display mt-3">{fr ? "Adoré par nos clients" : "Loved by our customers"}</h1>
        {google && (
          <div className="mt-6 flex flex-col items-center gap-4">
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
              <GoogleG className="h-6 w-6" />
              <span className="text-[2rem] leading-none text-ink">{google.labels.average}</span>
              <Stars rating={Math.round(google.average)} size="h-5 w-5" />
              <span className="sr-only">{google.labels.stars}</span>
              {google.profileUrl ? (
                <a href={google.profileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-muted underline-offset-4 hover:underline">
                  {google.labels.count}
                </a>
              ) : (
                <span className="text-sm text-muted">{google.labels.count}</span>
              )}
            </div>
            {google.profileUrl && (
              <a href={google.profileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
                {google.labels.write}
              </a>
            )}
          </div>
        )}
      </header>

      {google && (
        <section className="container-x py-12" aria-label={google.labels.fromGoogle}>
          <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
            {google.cards.map((card, i) => (
              <div key={`${card.author}-${i}`} className="mb-5 break-inside-avoid">
                <ReviewCard card={card} labels={google.labels} />
              </div>
            ))}
          </div>
          {google.profileUrl && (
            <p className="mt-4 text-center text-sm">
              <a href={google.profileUrl} target="_blank" rel="noopener noreferrer" className="link-draw">
                {google.labels.seeAll}
              </a>
            </p>
          )}
        </section>
      )}

      <div className={google ? "container-x pb-12" : "container-x py-12"}>
      {google && reviews.length > 0 && (
        <div className="mb-8 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line pt-10">
          <h2 className="font-display text-2xl text-ink">{fr ? "Avis laissés sur velvea.ca" : "Reviews left on velvea.ca"}</h2>
          <span className="stars">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}</span>
          <span className="text-sm text-ink-soft">{(stats._avg.rating ?? 0).toFixed(1)} / 5 · {stats._count} {fr ? "avis" : "reviews"}</span>
        </div>
      )}
      {!google && stats._count > 0 && (
        <div className="mb-8 flex items-center justify-center gap-2">
          <span className="stars">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}</span>
          <span className="text-sm text-ink-soft">{(stats._avg.rating ?? 0).toFixed(1)} / 5 · {stats._count} {fr ? "avis" : "reviews"}</span>
        </div>
      )}
      {reviews.length === 0 ? (
        !google && <p className="text-center text-muted">{fr ? "Aucun avis pour l'instant." : "No reviews yet."}</p>
      ) : (
        <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
          {reviews.map((r) => (
            <figure key={r.id} className="mb-5 break-inside-avoid rounded-lg border border-line bg-white p-6">
              <div className="flex items-center justify-between">
                <span className="stars">{Array.from({ length: r.rating }).map((_: unknown, i: number) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}</span>
                <span className="text-xs text-muted">{formatDate(r.createdAt, fr ? "fr-CA" : "en-CA")}</span>
              </div>
              {r.title && <figcaption className="mt-3 font-display text-lg">{r.title}</figcaption>}
              <blockquote className="mt-2 text-sm leading-relaxed text-ink-soft">&ldquo;{r.body}&rdquo;</blockquote>
              <div className="mt-4 flex items-center justify-between">
                <div><p className="text-sm font-semibold text-ink">{r.authorName}</p>{r.authorLocation && <p className="text-xs text-muted">{r.authorLocation}</p>}</div>
                {r.verified && <span className="flex items-center gap-1 text-[0.65rem] font-semibold uppercase tracking-wider text-violet-deep"><ShieldCheck className="h-3.5 w-3.5" /> {fr ? "Vérifié" : "Verified"}</span>}
              </div>
              {r.product && <p className="mt-3 border-t border-line pt-3 text-xs text-muted">{fr ? "Sur" : "On"} {tc(r.product.name, locale)}</p>}
            </figure>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
