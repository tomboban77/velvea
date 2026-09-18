import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Velvea lockup — the supplied artwork at /brand/velvea-logo.png.
 * Source is 2172×724 (the current official artwork),
 * so the image is rendered at its natural ratio with no cropping. Served
 * unoptimized (small asset) so the ?v cache-buster needs no localPatterns config.
 */
const SRC_W = 2172;
const SRC_H = 724;
const RATIO = SRC_W / SRC_H; // = 3.0

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
      src="/brand/velvea-logo.png?v=5"
      alt="Velvea"
      width={width}
      height={height}
      priority={priority}
      unoptimized
      className={cn("block", className)}
      style={{ width, height }}
    />
  );
}
