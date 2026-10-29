import { getLocale, getTranslations } from "next-intl/server";
import { getSettings } from "@/lib/settings";
import { GOOGLE_RATING, GOOGLE_REVIEWS } from "@/lib/google-reviews";
import { GoogleReviewsCarousel, type GoogleReviewCard } from "./GoogleReviewsCarousel";

const DAY = 86_400_000;

/**
 * "a day ago" / "il y a 2 semaines", the way Google words it. Worked out at
 * render time from the posted date: the homepage revalidates hourly, so a
 * hard-coded "a day ago" would be wrong by the weekend.
 */
function ago(date: string, locale: string, now: number): string {
  const days = Math.max(0, Math.floor((now - Date.parse(`${date}T12:00:00-04:00`)) / DAY));
  const rtf = new Intl.RelativeTimeFormat(locale === "fr" ? "fr-CA" : "en-CA", { numeric: "auto" });
  if (days < 7) return rtf.format(-days, "day");
  if (days < 30) return rtf.format(-Math.floor(days / 7), "week");
  if (days < 365) return rtf.format(-Math.floor(days / 30), "month");
  return rtf.format(-Math.floor(days / 365), "year");
}

/** Google Business Profile reviews, styled after Google's own review cards. */
export async function GoogleReviews() {
  if (!GOOGLE_REVIEWS.length) return null;
  const t = await getTranslations("googleReviews");
  const locale = await getLocale();
  const { social } = await getSettings();
  const now = Date.now();

  // Shown in the order the owner lists them in google-reviews.ts, not by date.
  const cards: GoogleReviewCard[] = GOOGLE_REVIEWS.map((r) => ({
      author: r.author || t("anonymous"),
      initial: (r.author || "G").charAt(0).toUpperCase(),
      ago: ago(r.date, locale, now),
      rating: r.rating,
      starsLabel: t("stars", { rating: r.rating }),
      text: r.text ?? null,
    }));

  const fr = locale === "fr";
  const average = GOOGLE_RATING.average.toLocaleString(fr ? "fr-CA" : "en-CA", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  return (
    <section className="section band-cream border-y border-line" aria-labelledby="google-reviews-title">
      <div className="container-x">
        <GoogleReviewsCarousel
          cards={cards}
          profileUrl={social.googleBusiness || null}
          average={GOOGLE_RATING.average}
          labels={{
            eyebrow: t("eyebrow"),
            title: t("title"),
            average,
            count: t("count", { count: GOOGLE_RATING.count }),
            stars: t("stars", { rating: average }),
            seeAll: t("seeAll"),
            write: t("write"),
            prev: t("prev"),
            next: t("next"),
            goTo: cards.map((_, i) => t("goTo", { n: i + 1 })),
            more: t("more"),
            less: t("less"),
            ratingOnly: t("ratingOnly"),
            fromGoogle: t("fromGoogle"),
          }}
        />
      </div>
    </section>
  );
}
