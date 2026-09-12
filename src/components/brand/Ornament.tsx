import { cn } from "@/lib/utils";

/**
 * Small engraved ornament: two leaves echoing the mark, meeting at a lozenge.
 * Used under chapter labels and as a divider.
 */
export function Ornament({ className, tone = "gold" }: { className?: string; tone?: "gold" | "light" }) {
  const stroke = tone === "light" ? "#d9bfb0" : "#b88870";
  return (
    <svg
      viewBox="0 0 120 16"
      width="120"
      height="16"
      aria-hidden
      className={cn("block", className)}
      fill="none"
      stroke={stroke}
      strokeWidth="1"
      strokeLinecap="round"
    >
      <path d="M2 8h34" />
      <path d="M118 8H84" />
      <path d="M42 8c6-6 10-6 14 0-4 6-8 6-14 0Z" />
      <path d="M78 8c-6-6-10-6-14 0 4 6 8 6 14 0Z" />
      <path d="M60 3.5 64.5 8 60 12.5 55.5 8Z" fill={stroke} stroke="none" />
    </svg>
  );
}
