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
    <section className={cn(standalone ? "section" : "section band-cream border-t border-line")}>
      <div className="container-x grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <p className="caps">{t("eyebrow")}</p>
          {standalone ? <h1 className="h-section mt-4">{t("title")}</h1> : <h2 className="h-section mt-4">{t("title")}</h2>}
          <p className="mt-4 text-ink-soft">{t("lede")}</p>
          {!standalone && (
            <Link href="/faq" className="link-draw mt-6">
              {t("more")} <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        <div className="lg:col-span-8">
          <div className="divide-y divide-line rounded-lg border border-line bg-white px-6 sm:px-8">
            {items.map((item, i) => {
              const isOpen = open === i;
              return (
                <div key={i}>
                  <button onClick={() => setOpen(isOpen ? -1 : i)} className="flex w-full items-center justify-between gap-6 py-5 text-left" aria-expanded={isOpen}>
                    <span className="text-[1.05rem] font-semibold leading-snug text-ink">{item.q}</span>
                    <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors", isOpen ? "border-violet-deep bg-violet-deep text-white" : "border-line-strong text-ink-soft")}>
                      {isOpen ? <Minus className="h-4 w-4" strokeWidth={2} /> : <Plus className="h-4 w-4" strokeWidth={2} />}
                    </span>
                  </button>
                  <div className={cn("grid transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]", isOpen ? "grid-rows-[1fr] pb-6 opacity-100" : "grid-rows-[0fr] opacity-0")}>
                    <p className="overflow-hidden pr-14 text-[0.98rem] leading-relaxed text-ink-soft pretty">{item.a}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
