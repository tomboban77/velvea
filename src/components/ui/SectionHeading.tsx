import { Link } from "@/i18n/routing";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "./Reveal";
import { cn } from "@/lib/utils";

export function SectionHeading({ chapter, eyebrow, title, lede, link, linkLabel, align = "center", tone = "light", className }: {
  chapter?: string; eyebrow?: string; title: string; lede?: string; link?: string; linkLabel?: string;
  align?: "left" | "center"; tone?: "light" | "dark"; className?: string;
}) {
  const dark = tone === "dark";
  const centered = align === "center";
  return <div className={cn(centered ? "mx-auto flex max-w-3xl flex-col items-center text-center" : "flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between", className)}>
    <Reveal className={cn("max-w-2xl", centered && "flex flex-col items-center")}>
      {(eyebrow || chapter) && <p className={cn("eyebrow no-tick mb-4", dark && "text-lilac-deep")}>{eyebrow || chapter}</p>}
      <h2 className={cn("h-section balance", dark && "text-canvas")}>{title}</h2>
      {lede && <p className={cn("mt-4 max-w-xl text-base leading-relaxed pretty", dark ? "text-canvas/75" : "text-ink-soft")}>{lede}</p>}
    </Reveal>
    {link && linkLabel && <Reveal delay={100} className={cn("shrink-0", centered && "mt-6")}><Link href={link} className={cn("link-draw", dark ? "text-canvas" : "text-ink")}>{linkLabel}<ArrowUpRight size={17} /></Link></Reveal>}
  </div>;
}
