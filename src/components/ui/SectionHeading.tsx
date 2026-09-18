import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Section header: small eyebrow, serif title, optional lede, optional link
 * aligned to the right on desktop. Left-aligned by default.
 */
export function SectionHeading({
  chapter,
  eyebrow,
  title,
  lede,
  link,
  linkLabel,
  align = "left",
  tone = "light",
  className,
  as: Tag = "h2",
}: {
  chapter?: string;
  eyebrow?: string;
  title: string;
  lede?: string;
  link?: string;
  linkLabel?: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
  className?: string;
  as?: "h1" | "h2";
}) {
  const dark = tone === "dark";
  const centered = align === "center";
  const label = eyebrow || chapter;
  return (
    <div
      className={cn(
        centered
          ? "mx-auto flex max-w-3xl flex-col items-center text-center"
          : "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-8",
        className
      )}
    >
      <div className={cn("max-w-2xl", centered && "flex flex-col items-center")}>
        {label && <p className={cn("caps mb-3", dark ? "text-gold-pale" : "text-violet-deep")}>{label}</p>}
        <Tag className={cn("h-section balance", dark && "text-white")}>{title}</Tag>
        {lede && <p className={cn("mt-3 max-w-xl text-[1.02rem] leading-relaxed pretty", dark ? "text-white/75" : "text-ink-soft")}>{lede}</p>}
      </div>
      {link && linkLabel && (
        <Link href={link} className={cn("link-draw shrink-0", dark ? "text-white" : "", centered && "mt-5")}>
          {linkLabel} <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
        </Link>
      )}
    </div>
  );
}
