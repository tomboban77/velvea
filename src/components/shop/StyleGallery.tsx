import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { GIFT_STYLES, GIFT_STYLES_ANCHOR } from "@/lib/gift-styles";
import { cn } from "@/lib/utils";

/**
 * Gallery of gift styles (src/lib/gift-styles.ts): looks to start from, each
 * leading to the quote request form rather than the cart. The same generic set
 * everywhere it appears; pages decide whether to include it (showsGiftStyles).
 *
 * The notice under the heading and the "Design concept" badge on each photo are
 * not decoration. The photos are illustrations of a presentation, so the page
 * has to say that the final hamper depends on what the customer asks for, or
 * the picture reads as a promise of those exact items. Owner requirement: keep
 * both wherever the photos are shown.
 *
 * The section id is the target of the header's "Gift styles" link
 * (GIFT_STYLES_ANCHOR); scroll-mt clears the sticky header.
 */
export async function StyleGallery({
  compact = false,
}: {
  /** Home page: photo, name and one line, without the "Make it yours" prompts,
   *  so the section stays a glance rather than a catalogue. On phones the
   *  cards become a swipeable row: five full-width photos stacked would push
   *  the rest of the home page several screens down. */
  compact?: boolean;
}) {
  const styles = GIFT_STYLES;
  const [t, locale] = await Promise.all([getTranslations("styles"), getLocale()]);
  const fr = locale === "fr";

  return (
    <section id={GIFT_STYLES_ANCHOR} className="scroll-mt-20 border-t border-line" aria-labelledby="gift-styles-heading">
      <div className="container-x section-sm">
        <div className="max-w-2xl">
          <p className="caps">{t("eyebrow")}</p>
          <h2 id="gift-styles-heading" className="h-sub mt-3 balance">{t("title")}</h2>
          <p className="mt-4 text-[0.98rem] leading-relaxed text-ink-soft pretty">{t("lede")}</p>
        </div>
        <div className="mt-6 max-w-3xl rounded-lg border border-line bg-cream px-5 py-4" role="note">
          <p className="font-semibold text-ink">{t("conceptTitle")}</p>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-soft pretty">{t("note")}</p>
        </div>
        <ul
          className={cn(
            "mt-9 items-start gap-x-6 gap-y-10 sm:grid sm:grid-cols-2 lg:grid-cols-3",
            compact
              ? "no-scrollbar -mx-[var(--gutter)] flex snap-x snap-mandatory scroll-px-[var(--gutter)] gap-x-4 overflow-x-auto px-[var(--gutter)] sm:mx-0 sm:overflow-visible sm:px-0"
              : "grid"
          )}
        >
          {styles.map((s) => {
            const name = fr ? s.name.fr : s.name.en;
            const href = { pathname: "/custom-basket" as const, query: { style: s.slug } };
            return (
              <li key={s.slug} className={cn("flex flex-col", compact && "w-[78vw] max-w-[20rem] shrink-0 snap-start sm:w-auto sm:max-w-none")}>
                <Link
                  href={href}
                  // In the phone row every photo sits in the same square, shown
                  // whole, so the names line up from card to card.
                  className={cn("relative block overflow-hidden rounded-lg bg-cream", compact && "aspect-square sm:aspect-auto")}
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  <span className="badge badge-ink absolute left-3 top-3 z-[1]">{t("conceptBadge")}</span>
                  <Image
                    src={s.image.src}
                    alt=""
                    width={s.image.width}
                    height={s.image.height}
                    sizes="(max-width:639px) 100vw, (max-width:1023px) 50vw, 33vw"
                    className={cn("w-full", compact ? "h-full object-contain sm:h-auto" : "h-auto")}
                  />
                </Link>
                <p className="caps mt-4 text-[0.68rem]">
                  {t("ref", { code: s.code })} · {t("priced")}
                </p>
                <h3 className="mt-1.5 text-[1.05rem] font-semibold leading-snug text-ink">{name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft pretty">{fr ? s.summary.fr : s.summary.en}</p>
                {!compact && (
                  <>
                    <p className="mt-4 text-sm font-semibold text-ink">{t("ideasLabel")}</p>
                    <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm leading-relaxed text-ink-soft">
                      {s.ideas.map((idea) => (
                        <li key={idea.en}>{fr ? idea.fr : idea.en}</li>
                      ))}
                    </ul>
                  </>
                )}
                <Link href={href} className="btn btn-outline mt-5 self-start" aria-label={`${t("cta")}: ${name}`}>
                  {t("cta")} <ArrowRight />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
