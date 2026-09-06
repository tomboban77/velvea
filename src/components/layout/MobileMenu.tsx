"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { X, ChevronDown, Sparkles } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { OCCASIONS, RECIPIENTS, CATEGORIES, labelFor, type NavLink } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function MobileMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const [section, setSection] = useState<string | null>("occasions");

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const groups: { key: string; label: string; base: string; items: NavLink[] }[] = [
    { key: "occasions", label: t("nav.occasions"), base: "/occasions", items: OCCASIONS },
    { key: "recipients", label: t("nav.recipients"), base: "/recipients", items: RECIPIENTS },
    { key: "category", label: t("nav.category"), base: "/category", items: CATEGORIES },
  ];

  return (
    <div
      className={cn(
        "fixed inset-0 z-[60] lg:hidden",
        open ? "pointer-events-auto" : "pointer-events-none"
      )}
      aria-hidden={!open}
    >
      <div
        className={cn(
          "absolute inset-0 bg-charcoal/40 backdrop-blur-sm transition-opacity duration-400",
          open ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          "absolute left-0 top-0 flex h-full w-[86%] max-w-sm flex-col bg-canvas shadow-2xl transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <Logo />
          <button onClick={onClose} className="btn-ghost p-2" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <Link
            href="/deal-of-the-day"
            className="block rounded-xl bg-iris-soft px-4 py-3 text-sm font-semibold text-ink"
          >
            {t("nav.dealOfDay")}
          </Link>

          <Link
            href="/custom"
            className="mt-2 flex items-center gap-2 rounded-xl border border-line-strong px-4 py-3 text-sm font-semibold text-ink"
          >
            <Sparkles className="h-4 w-4 text-gold" />
            {t("nav.customBasket")}
          </Link>

          <div className="mt-4 space-y-1">
            {groups.map((g) => (
              <div key={g.key} className="border-b border-line/70">
                <button
                  className="flex w-full items-center justify-between py-3.5 text-sm font-semibold text-ink"
                  onClick={() => setSection(section === g.key ? null : g.key)}
                >
                  {g.label}
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-muted transition-transform",
                      section === g.key && "rotate-180"
                    )}
                  />
                </button>
                {section === g.key && (
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 pb-3">
                    {g.items.map((item) => (
                      <Link
                        key={item.slug}
                        href={`${g.base}/${item.slug}`}
                        className="py-1.5 text-sm text-ink-soft hover:text-gold"
                      >
                        {labelFor(item, locale)}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-1 text-sm font-medium text-ink-soft">
            <Link href="/corporate" className="block py-2.5">{t("nav.corporate")}</Link>
            <Link href="/gift-cards" className="block py-2.5">{t("footer.giftCards")}</Link>
            <Link href="/guides" className="block py-2.5">{t("nav.guides")}</Link>
            <Link href="/account" className="block py-2.5">{t("nav.account")}</Link>
          </div>
        </div>

        <div className="border-t border-line px-5 py-4">
          <LocaleSwitcher />
        </div>
      </div>
    </div>
  );
}
