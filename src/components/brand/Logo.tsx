import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Velvea lockup.
 *
 * The supplied artwork (/brand/velvea-logo.png) carries ~39% transparent
 * padding in its height, so a `height` of 42 only drew 25px of actual mark.
 * /brand/velvea-lockup.png is that artwork trimmed to its ink, which means
 * `height` here is the height the logo genuinely occupies on screen and can
 * be reasoned about against neighbouring controls.
 *
 * The original padded file is kept for Open Graph, where the margin helps.
 */
const SRC_W = 760;
const SRC_H = 177;
const RATIO = SRC_W / SRC_H; // ≈ 4.29

type Props = {
  className?: string;
  /** rendered height in px of the visible mark (width follows the ratio) */
  height?: number;
  priority?: boolean;
  // legacy props accepted so older call-sites keep compiling
  markClassName?: string;
  wordmarkClassName?: string;
  showWordmark?: boolean;
  idSuffix?: string;
};

export function Logo({ className, height = 28, priority = false }: Props) {
  const width = Math.round(height * RATIO);
  return (
    <Image
      src="/brand/velvea-lockup.png"
      alt="Velvea"
      width={width}
      height={height}
      priority={priority}
      className={cn("block h-auto w-auto", className)}
      style={{ width, height }}
    />
  );
}
