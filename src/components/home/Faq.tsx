"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Plus, Minus, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Faq({ standalone = false }: { standalone?: boolean }) {
  const t = useTranslations("faq");
  const items = t.raw("items") as { q: string; a: string }[];
  const [open, setOpen] = useState(0);

  return (
    <section className={cn(standalone ? "pb-24 pt-12 lg:pb-32 lg:pt-16" : "section bg-cream")}>
      <div className="container-x grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="chapter">{t("eyebrow")}</p>
          {standalone ? <h1 className="h-section mt-7">{t("title")}</h1> : <h2 className="h-section mt-7">{t("title")}</h2>}
          <p className="mt-5 text-ink-soft">{t("lede")}</p>
          {!standalone && (
            <Link href="/faq" className="link-draw mt-7 text-ink">
              {t("more")} <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.6} />
            </Link>
          )}
        </div>

        <div className="divide-y divide-line-strong border-y border-line-strong lg:col-span-7 lg:col-start-6">
          {items.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={i}>
                <button onClick={() => setOpen(isOpen ? -1 : i)} className="flex w-full items-center justify-between gap-6 py-5 text-left" aria-expanded={isOpen}>
                  <span className="flex items-baseline gap-5">
                    <span className="font-sans w-7 shrink-0 text-xs text-violet">{String(i + 1).padStart(2, "0")}</span>
                    <span className="font-display text-[1.35rem] leading-tight text-ink">{item.q}</span>
                  </span>
                  <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors", isOpen ? "border-violet text-violet" : "border-line-strong text-ink-soft")}>
                    {isOpen ? <Minus className="h-3.5 w-3.5" strokeWidth={1.8} /> : <Plus className="h-3.5 w-3.5" strokeWidth={1.8} />}
                  </span>
                </button>
                <div className={cn("grid transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]", isOpen ? "grid-rows-[1fr] pb-6 opacity-100" : "grid-rows-[0fr] opacity-0")}>
                  <p className="overflow-hidden pl-12 pr-14 text-[0.98rem] leading-relaxed text-ink-soft pretty">{item.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
