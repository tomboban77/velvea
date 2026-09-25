"use client";

import { useState, useEffect, useRef, useId } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { X, ChevronDown, ArrowRight, User, Truck } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { OCCASIONS, RECIPIENTS, CATEGORIES, HOLIDAYS, labelFor, type NavLink } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { GIFT_CARDS_ENABLED, CUSTOM_BUILDER_ENABLED } from "@/lib/features";

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
        className={cn("absolute inset-0 bg-charcoal/50 transition-opacity duration-300", open ? "opacity-100" : "opacity-0")}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "absolute left-0 top-0 flex h-full w-[88%] max-w-sm flex-col bg-white shadow-2xl transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-line px-5">
          <span id={titleId} className="sr-only">{t("nav.menu")}</span>
          <Logo height={20} />
          <button onClick={onClose} className="icon-btn -mr-2" aria-label={t("nav.close")}>
            <X className="h-5 w-5" strokeWidth={1.6} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <Link href="/baskets" className="flex items-center justify-between border-b border-line px-5 py-4 text-[0.95rem] font-bold uppercase tracking-[0.08em] text-violet-deep">
            {t("nav.allBaskets")} <ArrowRight className="h-4 w-4" />
          </Link>

          {groups.map((g) => (
            <div key={g.key} className="border-b border-line">
              <button
                className="flex w-full items-center justify-between px-5 py-4 text-[0.82rem] font-bold uppercase tracking-[0.08em] text-ink"
                onClick={() => setSection(section === g.key ? null : g.key)}
                aria-expanded={section === g.key}
              >
                {g.label}
                <ChevronDown className={cn("h-4 w-4 text-muted transition-transform", section === g.key && "rotate-180")} strokeWidth={2} />
              </button>
              <div
                inert={section !== g.key}
                className={cn("grid transition-all duration-300", section === g.key ? "grid-rows-[1fr] pb-3 opacity-100" : "grid-rows-[0fr] opacity-0")}
              >
                <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 overflow-hidden px-5">
                  {g.items.map((item) => (
                    <Link key={item.slug} href={`${g.base}/${item.slug}`} className="py-1.5 text-[0.95rem] text-ink-soft hover:text-violet-deep">
                      {labelFor(item, locale)}
                    </Link>
                  ))}
                  <Link href={g.base} className="py-1.5 text-[0.9rem] font-semibold text-violet-deep">
                    {t("nav.viewAll")}
                  </Link>
                </div>
              </div>
            </div>
          ))}

          <div className="px-5 py-3">
            {[
              ...(CUSTOM_BUILDER_ENABLED ? [{ href: "/custom", label: t("nav.build") }] : []),
              { href: "/corporate", label: t("nav.corporate") },
              ...(GIFT_CARDS_ENABLED ? [{ href: "/gift-cards", label: t("nav.giftCards") }] : []),
              { href: "/guides", label: t("nav.guides") },
              { href: "/about", label: t("nav.story") },
              { href: "/contact", label: t("footer.contact") },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="block py-2.5 text-[1rem] font-medium text-ink">
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="border-t border-line px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <Link href="/account" className="util-link"><User strokeWidth={1.6} /> {t("nav.signIn")}</Link>
            <Link href="/shipping" className="util-link"><Truck strokeWidth={1.6} /> {t("nav.delivery")}</Link>
            <LocaleSwitcher />
          </div>
        </div>
      </div>
    </div>
  );
}
