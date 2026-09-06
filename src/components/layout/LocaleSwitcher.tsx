"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { useTransition } from "react";
import { cn } from "@/lib/utils";

export function LocaleSwitcher({ className }: { className?: string }) {
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

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-line-strong bg-shell/70 p-[3px] text-[0.7rem] font-medium tracking-wide",
        isPending && "opacity-60",
        className
      )}
    >
      {(["en", "fr"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => switchTo(l)}
          className={cn(
            "rounded-full px-2.5 py-1 uppercase transition-colors",
            locale === l ? "bg-ink text-canvas" : "text-muted hover:text-ink"
          )}
          aria-label={l === "en" ? "English" : "Français"}
          aria-pressed={locale === l}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
