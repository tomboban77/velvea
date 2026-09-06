"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import {
  Search,
  User,
  ShoppingBag,
  ChevronDown,
  Menu,
  X,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { useCart } from "@/components/cart/CartProvider";
import {
  OCCASIONS,
  RECIPIENTS,
  CATEGORIES,
  HOLIDAYS,
  labelFor,
  type NavLink as TNavLink,
} from "@/lib/nav";
import { cn } from "@/lib/utils";
import { MobileMenu } from "./MobileMenu";

type MegaKey = "occasions" | "holidays" | "recipients" | "category" | null;

export function Header() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const { count, openCart, hydrated } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mega, setMega] = useState<MegaKey>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close menus on route change
  useEffect(() => {
    setMega(null);
    setMobileOpen(false);
  }, [pathname]);

  function openMega(key: MegaKey) {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMega(key);
  }
  function scheduleClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMega(null), 140);
  }

  const megaData: Record<Exclude<MegaKey, null>, { base: string; items: TNavLink[] }> = {
    occasions: { base: "/occasions", items: OCCASIONS },
    holidays: { base: "/occasions", items: HOLIDAYS },
    recipients: { base: "/recipients", items: RECIPIENTS },
    category: { base: "/category", items: CATEGORIES },
  };

  const navButtons: { key: Exclude<MegaKey, null>; label: string }[] = [
    { key: "occasions", label: t("nav.occasions") },
    { key: "holidays", label: t("nav.holidays") },
    { key: "recipients", label: t("nav.recipients") },
    { key: "category", label: t("nav.category") },
  ];

  return (
    <>
      {/* Announcement bar */}
      <div className="relative z-50 bg-charcoal text-[0.72rem] text-canvas/85">
        <div className="container-x flex h-9 items-center justify-between">
          <div className="flex items-center gap-2 tracking-[0.14em] uppercase">
            <Sparkles className="h-3 w-3 text-gold-soft" />
            <span className="hidden sm:inline">{t("announcement.one")}</span>
            <span className="hidden md:inline text-canvas/30">·</span>
            <span>{t("announcement.two")}</span>
            <span className="text-canvas/30">·</span>
            <span className="text-gold-soft">{t("announcement.three")}</span>
          </div>
          <div className="hidden items-center gap-4 uppercase tracking-[0.14em] sm:flex">
            <Link href="/gift-cards" className="hover:text-gold-soft transition-colors">
              {t("footer.giftCards")}
            </Link>
            <Link href="/corporate/quote" className="hover:text-gold-soft transition-colors">
              {t("nav.corporateQuote")}
            </Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header
        className={cn(
          "sticky top-0 z-40 transition-all duration-500",
          scrolled
            ? "bg-canvas/90 shadow-[0_8px_30px_-16px_rgba(33,27,21,0.25)] backdrop-blur-xl"
            : "bg-canvas/70 backdrop-blur-md"
        )}
        onMouseLeave={scheduleClose}
      >
        <div className="container-x">
          <div className="flex h-[70px] items-center gap-4">
            {/* mobile menu */}
            <button
              className="btn-ghost -ml-2 p-2 lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <Link href="/" className="shrink-0" aria-label="Velvea home">
              <Logo />
            </Link>

            {/* search */}
            <form
              action={`/${locale === "en" ? "" : locale + "/"}search`}
              className="relative ml-6 mr-2 hidden max-w-sm flex-1 md:block"
            >
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                name="q"
                placeholder={t("nav.search")}
                className="field !rounded-full !border-line !bg-cream/50 !pl-11 !py-2.5 text-sm"
                aria-label={t("nav.search")}
              />
            </form>

            {/* right cluster */}
            <div className="ml-auto flex items-center gap-1.5 sm:gap-3">
              <button
                className="btn-ghost p-2 md:hidden"
                onClick={() => setSearchOpen((s) => !s)}
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>
              <LocaleSwitcher className="hidden sm:inline-flex" />
              <Link
                href="/account"
                className="btn-ghost hidden p-2 sm:inline-flex"
                aria-label={t("nav.account")}
              >
                <User className="h-5 w-5" />
              </Link>
              <button
                onClick={openCart}
                className="relative rounded-full p-2 text-ink transition-colors hover:text-gold"
                aria-label={t("nav.cart")}
              >
                <ShoppingBag className="h-5 w-5" />
                {hydrated && count > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-iris px-1 text-[0.62rem] font-bold text-white">
                    {count}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* mobile inline search */}
          {searchOpen && (
            <form
              action={`/${locale === "en" ? "" : locale + "/"}search`}
              className="relative pb-3 md:hidden"
            >
              <Search className="pointer-events-none absolute left-4 top-2.5 h-4 w-4 text-muted" />
              <input
                name="q"
                autoFocus
                placeholder={t("nav.search")}
                className="field !rounded-full pl-11 !py-2.5 text-sm"
              />
            </form>
          )}
        </div>

        {/* nav row */}
        <div className="hidden border-t border-line/70 lg:block">
          <div className="container-x">
            <nav className="flex items-center gap-1">
              <Link
                href="/deal-of-the-day"
                className="group flex items-center gap-1.5 py-3 pr-5 text-sm font-semibold text-ink"
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pink opacity-70" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-iris" />
                </span>
                {t("nav.dealOfDay")}
              </Link>

              {navButtons.map((b) => (
                <div
                  key={b.key}
                  onMouseEnter={() => openMega(b.key)}
                  onMouseLeave={scheduleClose}
                >
                  <button
                    className={cn(
                      "flex items-center gap-1 px-4 py-3 text-sm font-medium transition-colors",
                      mega === b.key ? "text-gold" : "text-ink-soft hover:text-ink"
                    )}
                    onClick={() => setMega(mega === b.key ? null : b.key)}
                    aria-expanded={mega === b.key}
                  >
                    {b.label}
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 transition-transform duration-300",
                        mega === b.key && "rotate-180"
                      )}
                    />
                  </button>
                </div>
              ))}

              <Link
                href="/corporate"
                className="px-4 py-3 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
              >
                {t("nav.corporate")}
              </Link>
              <Link
                href="/category/wine-spirits"
                className="px-4 py-3 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
              >
                {t("nav.wine")}
              </Link>

              <Link
                href="/custom"
                className="btn btn-outline btn-sm ml-auto my-1.5"
              >
                <Sparkles className="h-4 w-4 text-gold" />
                {t("nav.customBasket")}
              </Link>
            </nav>
          </div>

          {/* Mega panel */}
          {mega && (
            <div
              className="absolute inset-x-0 top-full origin-top border-t border-line bg-canvas/97 shadow-[0_30px_60px_-30px_rgba(33,27,21,0.3)] backdrop-blur-xl"
              onMouseEnter={() => openMega(mega)}
              onMouseLeave={scheduleClose}
              style={{ animation: "velvea-rise 0.35s var(--ease-out-soft)" }}
            >
              <div className="container-x grid grid-cols-4 gap-x-8 gap-y-3 py-8">
                <div className="col-span-1 pr-6">
                  <p className="eyebrow mb-2">
                    {navButtons.find((b) => b.key === mega)?.label}
                  </p>
                  <p className="font-display text-2xl leading-tight text-ink">
                    {mega === "occasions" && t("occasions.title")}
                    {mega === "holidays" && t("nav.holidays")}
                    {mega === "recipients" && t("recipients.title")}
                    {mega === "category" && t("nav.category")}
                  </p>
                  <Link
                    href={megaData[mega].base}
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gold hover:gap-2.5 transition-all"
                  >
                    {t("common.viewAll")} <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="col-span-3 grid grid-cols-3 gap-x-6 gap-y-1">
                  {megaData[mega].items.map((item) => (
                    <Link
                      key={item.slug}
                      href={`${megaData[mega].base}/${item.slug}`}
                      className="group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-ink-soft transition-colors hover:bg-cream hover:text-ink"
                    >
                      {labelFor(item, locale)}
                      <ArrowRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 text-gold" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
