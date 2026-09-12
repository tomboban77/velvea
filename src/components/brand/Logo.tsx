import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Velvea lockup — the supplied artwork at /brand/velvea-logo.png.
 * Source is 2153×452 with the artwork filling the canvas (≈24px padding),
 * so the image is rendered at its natural ratio with no cropping.
 */
const SRC_W = 2153;
const SRC_H = 452;
const RATIO = SRC_W / SRC_H; // ≈ 4.76

type Props = {
  className?: string;
  /** rendered height in px (width follows the ratio) */
  height?: number;
  priority?: boolean;
  // legacy props accepted so older call-sites keep compiling
  markClassName?: string;
  wordmarkClassName?: string;
  showWordmark?: boolean;
  idSuffix?: string;
};

export function Logo({ className, height = 34, priority = false }: Props) {
  const width = Math.round(height * RATIO);
  return (
    <Image
      src="/brand/velvea-logo.png?v=3"
      alt="Velvea"
      width={width}
      height={height}
      priority={priority}
      className={cn("block", className)}
      style={{ width, height }}
    />
  );
}
