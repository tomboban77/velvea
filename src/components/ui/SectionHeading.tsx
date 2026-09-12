import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import { Reveal } from "./Reveal";
import { Ornament } from "@/components/brand/Ornament";
import { cn } from "@/lib/utils";

/**
 * Chapter-style heading: roman numeral + label, engraved ornament, display title.
 * Centered by default (the site's editorial spine); "left" for dense pages.
 */
export function SectionHeading({
  chapter,
  eyebrow,
  title,
  lede,
  link,
  linkLabel,
  align = "center",
  tone = "light",
  className,
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
}) {
  const dark = tone === "dark";
  const centered = align === "center";

  return (
    <div className={cn(centered ? "mx-auto flex max-w-3xl flex-col items-center text-center" : "", className)}>
      <Reveal className={cn(centered ? "flex flex-col items-center" : "max-w-2xl")}>
        {(chapter || eyebrow) && (
          <p className={cn("chapter", dark && "text-lilac-deep")}>
            {chapter && <span>{chapter}</span>}
            {chapter && eyebrow && <span className="mx-3 text-lilac-deep">·</span>}
            {eyebrow && <span className={dark ? "text-lilac-deep" : "text-violet"}>{eyebrow}</span>}
          </p>
        )}
        <Ornament className={cn("my-4", !centered && "ml-0")} tone={dark ? "light" : "gold"} />
        <h2 className={cn("h-section balance", dark && "text-canvas")}>{title}</h2>
        {lede && (
          <p className={cn("mt-5 max-w-xl text-[1.05rem] leading-relaxed pretty", dark ? "text-canvas/70" : "text-ink-soft")}>
            {lede}
          </p>
        )}
      </Reveal>
      {link && linkLabel && (
        <Reveal delay={120} className={cn(centered ? "mt-7" : "mt-6")}>
          <Link href={link} className={cn("link-draw", dark ? "text-canvas" : "text-ink")}>
            {linkLabel}
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.6} />
          </Link>
        </Reveal>
      )}
    </div>
  );
}
