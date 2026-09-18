import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Velvea lockup.
 *
 * The mark's two petals already draw a V, so the wordmark drops its own
 * leading V and reads through the mark: [petals]ELVEA. /brand/velvea-lockup.png
 * is that recomposed lockup, trimmed to its ink — the original artwork carries
 * ~39% transparent padding in its height, so a `height` of 42 only drew 25px of
 * actual mark. Because this file is trimmed, `height` here is the height the
 * logo genuinely occupies on screen and can be reasoned about against
 * neighbouring controls.
 *
 * Siblings, all cut from the same artwork and trimmed the same way:
 *   /brand/velvea-icon.png        petals alone (see `iconOnly`)
 *   /brand/velvea-wordmark.png    ELVEA alone
 *   /brand/velvea-lockup-with-v.png  previous lockup, mark + full VELVEA
 *   /brand/velvea-og.png          padded card for Open Graph
 */
const LOCKUP = { src: "/brand/velvea-lockup.png", ratio: 641 / 177 }; // ≈ 3.62
const ICON = { src: "/brand/velvea-icon.png", ratio: 241 / 177 }; // ≈ 1.36

type Props = {
  className?: string;
  /** rendered height in px of the visible mark (width follows the ratio) */
  height?: number;
  priority?: boolean;
  /** render the petals alone, without ELVEA */
  iconOnly?: boolean;
  // legacy props accepted so older call-sites keep compiling
  markClassName?: string;
  wordmarkClassName?: string;
  showWordmark?: boolean;
  idSuffix?: string;
};

export function Logo({
  className,
  height = 28,
  priority = false,
  iconOnly = false,
}: Props) {
  const art = iconOnly ? ICON : LOCKUP;
  const width = Math.round(height * art.ratio);
  return (
    <Image
      src={art.src}
      alt="Velvea"
      width={width}
      height={height}
      priority={priority}
      className={cn("block h-auto w-auto", className)}
      style={{ width, height }}
    />
  );
}
