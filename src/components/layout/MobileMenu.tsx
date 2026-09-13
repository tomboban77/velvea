"use client";

import { useState, useEffect, useRef, useId } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { X, ChevronDown, ArrowRight } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { OCCASIONS, RECIPIENTS, CATEGORIES, HOLIDAYS, labelFor, type NavLink } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const t = useTranslations();
  const locale = useLocale();
  const [section, setSection] = useState<string | null>("occasions");

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    panelRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab") return;
      const focusable = Array.from(panelRef.current?.querySelectorAll<HTMLElement>('a[href], button, select, input, [tabindex="0"]') ?? []).filter((el) => !el.closest('[inert]'));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); previous?.focus(); };
  }, [open, onClose]);

  const groups: { key: string; label: string; base: string; items: NavLink[] }[] = [
    { key: "occasions", label: t("nav.occasions"), base: "/occasions", items: OCCASIONS },
    { key: "recipients", label: t("nav.recipients"), base: "/recipients", items: RECIPIENTS },
    { key: "category", label: t("nav.category"), base: "/category", items: CATEGORIES },
    { key: "holidays", label: t("nav.holidays"), base: "/occasions", items: HOLIDAYS },
  ];

  return (
    <div
      className={cn("fixed inset-0 z-[60] lg:hidden", open ? "pointer-events-auto" : "pointer-events-none")}
      aria-hidden={!open}
      inert={!open}
    >
      <div
        className={cn(
          "absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity duration-400",
          open ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "absolute left-0 top-0 flex h-full w-[88%] max-w-sm flex-col bg-canvas shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <span id={titleId} className="sr-only">{t("nav.menu")}</span>
          <Logo height={26} />
          <button onClick={onClose} className="icon-btn -mr-2" aria-label={t("nav.close")}>
            <X className="h-5 w-5" strokeWidth={1.6} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <Link href="/baskets" className="flex items-center justify-between py-3 font-display text-2xl text-ink">
            {t("nav.allBaskets")} <ArrowRight className="h-4 w-4 text-violet" />
          </Link>

          <div className="mt-2 border-t border-line">
            {groups.map((g) => (
              <div key={g.key} className="border-b border-line">
                <button
                  className="caps flex w-full items-center justify-between py-3.5 text-[0.62rem] text-ink"
                  onClick={() => setSection(section === g.key ? null : g.key)}
                  aria-expanded={section === g.key}
                >
                  {g.label}
                  <ChevronDown
                    className={cn("h-4 w-4 text-muted transition-transform", section === g.key && "rotate-180")}
                    strokeWidth={1.8}
                  />
                </button>
                <div
                  inert={section !== g.key}
                  className={cn(
                    "grid transition-all duration-400",
                    section === g.key ? "grid-rows-[1fr] pb-3 opacity-100" : "grid-rows-[0fr] opacity-0"
                  )}
                >
                  <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 overflow-hidden">
                    {g.items.map((item) => (
                      <Link
                        key={item.slug}
                        href={`${g.base}/${item.slug}`}
                        className="py-1.5 text-[0.95rem] text-ink-soft hover:text-violet"
                      >
                        {labelFor(item, locale)}
                      </Link>
                    ))}
                    <Link href={g.base} className="py-1.5 text-[0.9rem] font-medium text-violet">
                      {t("nav.viewAll")}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-0.5">
            {[
              { href: "/custom", label: t("nav.build") },
              { href: "/corporate", label: t("nav.corporate") },
              { href: "/gift-cards", label: t("nav.giftCards") },
              { href: "/about", label: t("nav.story") },
              { href: "/guides", label: t("nav.journal") },
              { href: "/account", label: t("nav.account") },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="block py-2.5 font-display text-xl text-ink">
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-line px-5 py-4">
          <LocaleSwitcher />
          <span className="text-[0.65rem] uppercase tracking-[0.2em] text-muted">Mississauga · Canada</span>
        </div>
      </div>
    </div>
  );
}
