import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import { Reveal } from "./Reveal";

export function SectionHeading({
  eyebrow,
  title,
  lede,
  link,
  linkLabel,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
  link?: string;
  linkLabel?: string;
  align?: "left" | "center";
}) {
  return (
    <div
      className={
        align === "center"
          ? "mx-auto max-w-2xl text-center"
          : "flex flex-wrap items-end justify-between gap-6"
      }
    >
      <Reveal className="max-w-2xl">
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h2 className="font-display text-4xl leading-[1.05] balance sm:text-5xl">
          {title}
        </h2>
        {lede && <p className="mt-4 text-ink-soft">{lede}</p>}
      </Reveal>
      {link && linkLabel && (
        <Reveal delay={120}>
          <Link
            href={link}
            className="group inline-flex items-center gap-2 text-sm font-semibold text-ink transition-colors hover:text-gold"
          >
            {linkLabel}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
      )}
    </div>
  );
}
