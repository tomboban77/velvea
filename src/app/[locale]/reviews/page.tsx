import { setRequestLocale, getLocale } from "next-intl/server";
import { Star, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { t as tc } from "@/lib/i18n-content";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Customer Reviews" };

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
  return (
    <div className="container-x py-14">
      <header className="mb-10 text-center">
        <p className="eyebrow mb-3">{fr ? "Avis clients" : "Customer Reviews"}</p>
        <h1 className="font-display text-4xl sm:text-5xl">{fr ? "Adoré partout au Canada" : "Loved across Canada"}</h1>
        {stats._count > 0 && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="flex text-gold">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}</div>
            <span className="text-sm text-ink-soft">{(stats._avg.rating ?? 0).toFixed(1)} / 5 · {stats._count} {fr ? "avis" : "reviews"}</span>
          </div>
        )}
      </header>
      {reviews.length === 0 ? (
        <p className="text-center text-muted">{fr ? "Aucun avis pour l'instant." : "No reviews yet."}</p>
      ) : (
        <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
          {reviews.map((r) => (
            <figure key={r.id} className="mb-5 break-inside-avoid rounded-2xl border border-line bg-shell p-6">
              <div className="flex items-center justify-between">
                <div className="flex text-gold">{Array.from({ length: r.rating }).map((_: unknown, i: number) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}</div>
                <span className="text-xs text-muted">{formatDate(r.createdAt, fr ? "fr-CA" : "en-CA")}</span>
              </div>
              {r.title && <figcaption className="mt-3 font-display text-lg">{r.title}</figcaption>}
              <blockquote className="mt-2 text-sm leading-relaxed text-ink-soft">&ldquo;{r.body}&rdquo;</blockquote>
              <div className="mt-4 flex items-center justify-between">
                <div><p className="text-sm font-semibold text-ink">{r.authorName}</p>{r.authorLocation && <p className="text-xs text-muted">{r.authorLocation}</p>}</div>
                {r.verified && <span className="flex items-center gap-1 text-[0.65rem] font-semibold uppercase tracking-wider text-teal-deep"><ShieldCheck className="h-3.5 w-3.5" /> {fr ? "Vérifié" : "Verified"}</span>}
              </div>
              {r.product && <p className="mt-3 border-t border-line pt-3 text-xs text-muted">{fr ? "Sur" : "On"} {tc(r.product.name, locale)}</p>}
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
