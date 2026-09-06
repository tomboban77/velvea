"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export function Faq() {
  const t = useTranslations("faq");
  const items = t.raw("items") as { q: string; a: string }[];
  const [open, setOpen] = useState(0);

  return (
    <section className="container-x py-20">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="font-display text-4xl sm:text-5xl">{t("title")}</h2>
        <p className="mt-3 text-ink-soft">{t("lede")}</p>
      </div>

      <div className="mx-auto mt-12 max-w-3xl divide-y divide-line rounded-[1.75rem] border border-line bg-shell px-2">
        {items.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={i} className="px-4 sm:px-6">
              <button
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="flex w-full items-center justify-between gap-6 py-5 text-left"
                aria-expanded={isOpen}
              >
                <span className="font-semibold text-ink">{item.q}</span>
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors",
                    isOpen ? "border-gold bg-gold/10 text-gold" : "border-line-strong text-ink-soft"
                  )}
                >
                  {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </span>
              </button>
              <div
                className={cn(
                  "grid transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  isOpen ? "grid-rows-[1fr] pb-5 opacity-100" : "grid-rows-[0fr] opacity-0"
                )}
              >
                <p className="overflow-hidden pr-14 text-sm leading-relaxed text-ink-soft">
                  {item.a}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
