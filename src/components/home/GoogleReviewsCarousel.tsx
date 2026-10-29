"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export type GoogleReviewCard = {
  author: string;
  initial: string;
  ago: string;
  rating: number;
  starsLabel: string;
  text: string | null;
};

type Labels = {
  eyebrow: string;
  title: string;
  average: string;
  count: string;
  stars: string;
  seeAll: string;
  write: string;
  prev: string;
  next: string;
  goTo: string[];
  more: string;
  less: string;
  ratingOnly: string;
  fromGoogle: string;
};

/** Google's avatar palette, picked by name so a reviewer keeps their colour. */
const AVATAR = ["#1a73e8", "#d93025", "#188038", "#e37400", "#9334e6", "#007b83", "#c5221f"];
const avatarColour = (name: string) => AVATAR[[...name].reduce((n, c) => n + c.charCodeAt(0), 0) % AVATAR.length];

/** Long reviews are clamped; past this length the card offers "Read more". */
const CLAMP_AT = 220;

function GoogleG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={className}>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

function Stars({ rating, size = "h-4 w-4" }: { rating: number; size?: string }) {
  return (
    <span className="flex gap-0.5 text-[#fbbc04]" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={cn(size, i < rating ? "fill-current" : "fill-transparent text-line-strong")} strokeWidth={i < rating ? 0 : 1.5} />
      ))}
    </span>
  );
}

function ReviewCard({ card, labels }: { card: GoogleReviewCard; labels: Labels }) {
  const [open, setOpen] = useState(false);
  const long = (card.text?.length ?? 0) > CLAMP_AT;
  return (
    <figure className="flex h-full flex-col rounded-lg border border-line bg-white p-6 shadow-[0_1px_2px_rgba(60,64,67,0.12)]">
      <div className="flex items-start gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[1.05rem] font-medium text-white"
          style={{ background: avatarColour(card.author) }}
          aria-hidden="true"
        >
          {card.initial}
        </span>
        <div className="min-w-0 flex-1">
          <figcaption className="truncate text-[0.95rem] font-medium text-ink">{card.author}</figcaption>
          <p className="text-xs text-muted">{card.ago}</p>
        </div>
        <GoogleG className="h-5 w-5 shrink-0" />
      </div>
      <div className="mt-4 flex items-center gap-2">
        <Stars rating={card.rating} />
        <span className="sr-only">{card.starsLabel}</span>
      </div>
      {card.text ? (
        <>
          {/* Shown as written on Google, which so far means English. */}
          <blockquote lang="en" className={cn("mt-3 text-sm leading-relaxed text-ink-soft", !open && long && "line-clamp-5")}>
            {card.text}
          </blockquote>
          {long && (
            <button type="button" onClick={() => setOpen((o) => !o)} className="mt-2 self-start text-sm font-medium text-[#1a73e8] hover:underline">
              {open ? labels.less : labels.more}
            </button>
          )}
        </>
      ) : (
        <p className="mt-3 text-sm text-muted">{labels.ratingOnly}</p>
      )}
    </figure>
  );
}

/**
 * Scroll-snap carousel: native swipe on touch, arrows and dots for everyone
 * else. No autoplay, so nobody has a review pulled away mid-sentence.
 */
export function GoogleReviewsCarousel({
  cards,
  profileUrl,
  average,
  labels,
}: {
  cards: GoogleReviewCard[];
  profileUrl: string | null;
  average: number;
  labels: Labels;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [edges, setEdges] = useState({ prev: false, next: false });

  const measure = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const first = el.firstElementChild as HTMLElement | null;
    const step = first ? first.offsetWidth + parseFloat(getComputedStyle(el).columnGap || "0") : el.clientWidth;
    setActive(Math.min(cards.length - 1, Math.round(el.scrollLeft / Math.max(1, step))));
    setEdges({ prev: el.scrollLeft > 4, next: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 });
  }, [cards.length]);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  const goTo = (i: number) => {
    const el = track.current;
    const card = el?.children[i] as HTMLElement | undefined;
    if (el && card) el.scrollTo({ left: card.offsetLeft - el.offsetLeft, behavior: "smooth" });
  };
  const scrollBy = (dir: 1 | -1) => goTo(Math.max(0, Math.min(cards.length - 1, active + dir)));
  const scrollable = edges.prev || edges.next;

  return (
    <>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="caps mb-3 text-violet-deep">{labels.eyebrow}</p>
          <h2 id="google-reviews-title" className="h-section balance">{labels.title}</h2>
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1">
            <GoogleG className="h-6 w-6" />
            <span className="text-[2rem] font-normal leading-none text-ink">{labels.average}</span>
            <Stars rating={Math.round(average)} size="h-5 w-5" />
            <span className="sr-only">{labels.stars}</span>
            {profileUrl ? (
              <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-muted underline-offset-4 hover:underline">
                {labels.count}
              </a>
            ) : (
              <span className="text-sm text-muted">{labels.count}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {profileUrl && (
            <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
              {labels.write}
            </a>
          )}
          {scrollable && (
            <>
              <button type="button" onClick={() => scrollBy(-1)} disabled={!edges.prev} aria-label={labels.prev} className="circle-arrow disabled:opacity-40">
                <ChevronLeft className="h-4 w-4" strokeWidth={1.8} />
              </button>
              <button type="button" onClick={() => scrollBy(1)} disabled={!edges.next} aria-label={labels.next} className="circle-arrow disabled:opacity-40">
                <ChevronRight className="h-4 w-4" strokeWidth={1.8} />
              </button>
            </>
          )}
        </div>
      </div>

      <div
        ref={track}
        onScroll={measure}
        role="region"
        aria-roledescription="carousel"
        aria-label={labels.fromGoogle}
        className="no-scrollbar -mx-(--gutter) mt-8 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-(--gutter) px-(--gutter) pb-2 sm:mx-0 sm:scroll-px-0 sm:px-0"
      >
        {cards.map((card, i) => (
          <div
            key={`${card.author}-${i}`}
            className="w-[85%] shrink-0 snap-start sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)]"
            aria-roledescription="slide"
            aria-label={labels.goTo[i]}
          >
            <ReviewCard card={card} labels={labels} />
          </div>
        ))}
      </div>

      {scrollable && (
        <div className="mt-6 flex justify-center gap-2">
          {cards.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={labels.goTo[i]}
              aria-current={i === active ? "true" : undefined}
              className={cn("h-2 rounded-full transition-all", i === active ? "w-6 bg-violet-deep" : "w-2 bg-line-strong hover:bg-muted")}
            />
          ))}
        </div>
      )}

      {profileUrl && (
        <p className="mt-6 text-center text-sm">
          <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="link-draw">
            {labels.seeAll}
          </a>
        </p>
      )}
    </>
  );
}
