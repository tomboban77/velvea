"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { useTransition } from "react";
import { cn } from "@/lib/utils";

export function LocaleSwitcher({ className, tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname(); // resolved path, locale-agnostic
  const [isPending, startTransition] = useTransition();

  function switchTo(next: "en" | "fr") {
    if (next === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  }

  const dark = tone === "dark";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 text-[0.72rem] font-bold uppercase tracking-[0.08em]",
        isPending && "opacity-60",
        className
      )}
      aria-label="Language"
    >
      {(["en", "fr"] as const).map((l, i) => (
        <span key={l} className="inline-flex items-center">
          {i > 0 && <span className={cn("mx-1.5", dark ? "text-white/40" : "text-line-strong")}>/</span>}
          <button
            type="button"
            onClick={() => switchTo(l)}
            className={cn(
              "transition-colors",
              dark
                ? locale === l ? "text-white underline underline-offset-4" : "text-white/60 hover:text-white"
                : locale === l ? "text-ink underline underline-offset-4" : "text-muted hover:text-ink"
            )}
            aria-label={l === "en" ? "English" : "Français"}
            aria-pressed={locale === l}
          >
            {l}
          </button>
        </span>
      ))}
    </div>
  );
}
