import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  markClassName?: string;
  wordmarkClassName?: string;
  showWordmark?: boolean;
  /** unique id suffix so multiple logos on a page don't share gradient ids */
  idSuffix?: string;
};

/**
 * Velvea brand lockup — an iridescent calligraphic "V" mark paired with the
 * gold serif wordmark. Vector, so it stays crisp on light or dark surfaces.
 */
export function Logo({
  className,
  markClassName,
  wordmarkClassName,
  showWordmark = true,
  idSuffix = "hdr",
}: Props) {
  const irisId = `velvea-iris-${idSuffix}`;
  const goldId = `velvea-gold-${idSuffix}`;
  const sheenId = `velvea-sheen-${idSuffix}`;

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        viewBox="0 0 100 96"
        className={cn("h-9 w-9", markClassName)}
        role="img"
        aria-label="Velvea"
        fill="none"
      >
        <defs>
          <linearGradient id={irisId} x1="6" y1="8" x2="94" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#1f7a78" />
            <stop offset="0.28" stopColor="#2f9d9a" />
            <stop offset="0.55" stopColor="#6d4c8c" />
            <stop offset="0.78" stopColor="#a86bb0" />
            <stop offset="1" stopColor="#db8cb2" />
          </linearGradient>
          <linearGradient id={goldId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#e7d6b4" />
            <stop offset="0.5" stopColor="#c9a86c" />
            <stop offset="1" stopColor="#b0894e" />
          </linearGradient>
          <linearGradient id={sheenId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="0.4" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* left ribbon of the V */}
        <path
          d="M6 9c10 1.5 17 6 22 14 7 12 14 26 22 41 2-4 4-8 5-11-6-12-13-25-19-35C57 9 49 4 39 3 28 2 16 4 6 9Z"
          fill={`url(#${irisId})`}
          opacity="0.96"
        />
        {/* right ribbon of the V */}
        <path
          d="M94 9C84 4 72 2 61 3c-6 .6-11 3-15 8 4 3 7 7 9 12 4 8 8 17 11 24 6-11 12-22 18-32 4-7 2-2 10-6Z"
          fill={`url(#${irisId})`}
          opacity="0.82"
        />
        {/* gold inner stroke tracing the V */}
        <path
          d="M12 12c9 2 15 7 20 15 7 12 14 27 18 37 5-11 12-25 19-37 4-7 10-12 19-15"
          stroke={`url(#${goldId})`}
          strokeWidth="3.2"
          strokeLinecap="round"
          fill="none"
          opacity="0.9"
        />
        {/* sheen */}
        <path
          d="M6 9c10 1.5 17 6 22 14 7 12 14 26 22 41 2-4 4-8 5-11-6-12-13-25-19-35C57 9 49 4 39 3 28 2 16 4 6 9Z"
          fill={`url(#${sheenId})`}
        />
        {/* sparkle */}
        <path
          d="M84 66l1.6 4.6L90 72l-4.4 1.4L84 78l-1.6-4.6L78 72l4.4-1.4Z"
          fill={`url(#${goldId})`}
        />
      </svg>

      {showWordmark && (
        <span
          className={cn(
            "font-display text-[1.55rem] leading-none tracking-[0.14em]",
            wordmarkClassName
          )}
          style={{
            backgroundImage: "linear-gradient(180deg,#e7d6b4 0%,#c9a86c 45%,#b0894e 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          VELVÉA
        </span>
      )}
    </span>
  );
}
