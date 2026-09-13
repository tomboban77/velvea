"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { Search, User, ShoppingBag, ChevronDown, Menu, ArrowRight, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { MobileMenu } from "./MobileMenu";
import { useCart } from "@/components/cart/CartProvider";
import { OCCASIONS, RECIPIENTS, CATEGORIES, HOLIDAYS, labelFor } from "@/lib/nav";
import { formatMoney, cn } from "@/lib/utils";

export type HeaderFeatured = {
  slug: string;
  name: string;
  image: string | null;
  priceCents: number;
} | null;

export function Header({ featured }: { featured?: HeaderFeatured }) {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const { count, openCart, hydrated } = useCart();

  const [scrolled, setScrolled] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close everything on navigation
  useEffect(() => {
    setShopOpen(false);
    setMobileOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setShopOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen]);

  function openShop() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setShopOpen(true);
  }
  function scheduleClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setShopOpen(false), 160);
  }

  const searchAction = `/${locale === "en" ? "" : locale + "/"}search`;

  const columns = [
    { key: "occasions", label: t("nav.occasions"), base: "/occasions", items: OCCASIONS },
    { key: "recipients", label: t("nav.recipients"), base: "/recipients", items: RECIPIENTS },
    { key: "category", label: t("nav.category"), base: "/category", items: CATEGORIES },
    { key: "holidays", label: t("nav.holidays"), base: "/occasions", items: HOLIDAYS },
  ];

  const primary: { href: string; label: string }[] = [
    { href: "/custom", label: t("nav.build") },
    { href: "/corporate", label: t("nav.corporate") },
    { href: "/about", label: t("nav.story") },
  ];

  return (
    <>
      {/* Announcement — one slim line */}
      <div className="announcement relative z-50 bg-violet-deep text-[0.58rem] text-white">
        <div className="container-x flex h-9 items-center justify-center gap-3 sm:justify-between">
          <p className="flex items-center gap-3 truncate">
            <span className="hidden md:inline">{t("announcement.one")}</span>
            <span className="hidden md:inline text-white/40">·</span>
            <span className="truncate">{t("announcement.two")}</span>
            <span className="hidden lg:inline text-white/40">·</span>
            <span className="hidden lg:inline">{t("announcement.three")}</span>
          </p>
          <div className="hidden items-center gap-5 sm:flex">
            <Link href="/gift-cards" className="transition-colors hover:text-white">
              {t("nav.giftCards")}
            </Link>
            <Link href="/corporate/quote" className="transition-colors hover:text-white">
              {t("nav.corporateQuote")}
            </Link>
          </div>
        </div>
      </div>

      <header
        className={cn(
          "store-header sticky top-0 z-40 border-b transition-[background-color,box-shadow,border-color] duration-500",
          scrolled || shopOpen || searchOpen
            ? "border-line bg-canvas/95 shadow-[0_10px_30px_-22px_rgba(34,24,34,0.35)] backdrop-blur-xl"
            : "border-transparent bg-canvas/95 backdrop-blur-md"
        )}
        onMouseLeave={scheduleClose}
      >
        <div className="container-x">
          <div className="grid h-[68px] grid-cols-[1fr_auto_1fr] items-center lg:h-[80px] lg:grid-cols-[auto_1fr_auto]">
            {/* left: mobile menu (mobile) / logo (desktop) */}
            <div className="flex items-center">
              <button
                className="icon-btn -ml-2 lg:hidden"
                onClick={() => setMobileOpen(true)}
                aria-label={t("nav.menu")}
              >
                <Menu className="h-5 w-5" strokeWidth={1.6} />
              </button>
              <Link href="/" className="hidden lg:block" aria-label="Velvea home">
                <Logo height={38} priority />
              </Link>
            </div>

            {/* centre: logo (mobile) / nav (desktop) */}
            <div className="flex items-center justify-center">
              <Link href="/" className="lg:hidden" aria-label="Velvea home">
                <Logo height={25} priority />
              </Link>
              <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
                <div onMouseEnter={openShop} onMouseLeave={scheduleClose}>
                  <button
                    className={cn(
                      "caps flex items-center gap-1.5 whitespace-nowrap px-3 py-2 text-[0.62rem] transition-colors xl:px-4 xl:text-[0.68rem]",
                      shopOpen ? "text-violet" : "text-ink hover:text-violet"
                    )}
                    onClick={() => setShopOpen((s) => !s)}
                    aria-expanded={shopOpen}
                    aria-haspopup="true"
                  >
                    {t("nav.shop")}
                    <ChevronDown
                      className={cn("h-3.5 w-3.5 transition-transform duration-300", shopOpen && "rotate-180")}
                      strokeWidth={1.8}
                    />
                  </button>
                </div>
                {primary.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="caps whitespace-nowrap px-3 py-2 text-[0.62rem] text-ink transition-colors hover:text-violet xl:px-4 xl:text-[0.68rem]"
                    onMouseEnter={scheduleClose}
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* right: utilities */}
            <div className="flex items-center justify-end gap-0.5 sm:gap-1">
              <LocaleSwitcher className="mr-2 hidden lg:inline-flex" />
              <button
                className={cn("icon-btn", searchOpen && "bg-cream text-violet")}
                onClick={() => setSearchOpen((s) => !s)}
                aria-label={t("nav.search")}
                aria-expanded={searchOpen}
              >
                {searchOpen ? <X className="h-5 w-5" strokeWidth={1.6} /> : <Search className="h-5 w-5" strokeWidth={1.6} />}
              </button>
              <Link href="/account" className="icon-btn hidden sm:inline-flex" aria-label={t("nav.account")}>
                <User className="h-5 w-5" strokeWidth={1.6} />
              </Link>
              <button onClick={openCart} className="icon-btn relative" aria-label={t("nav.cart")}>
                <ShoppingBag className="h-5 w-5" strokeWidth={1.6} />
                {hydrated && count > 0 && (
                  <span className="absolute right-0.5 top-0.5 flex h-[17px] min-w-[17px] items-center justify-center bg-violet-deep px-1 text-[0.6rem] font-semibold text-canvas">
                    {count}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Search panel */}
        <div
          className={cn(
            "absolute inset-x-0 top-full origin-top overflow-hidden border-b border-line bg-canvas shadow-[0_30px_60px_-40px_rgba(34,24,34,0.4)] transition-all duration-500",
            searchOpen ? "visible max-h-[70vh] opacity-100" : "invisible max-h-0 opacity-0"
          )}
        >
          <div className="container-x py-8 lg:py-10">
            <form action={searchAction} className="relative mx-auto max-w-3xl">
              <Search className="pointer-events-none absolute left-0 top-1/2 h-5 w-5 -translate-y-1/2 text-violet" strokeWidth={1.6} />
              <input
                ref={searchRef}
                name="q"
                placeholder={t("nav.searchPlaceholder")}
                aria-label={t("nav.search")}
                className="w-full border-0 border-b border-line-strong bg-transparent py-3 pl-9 pr-24 font-display text-3xl italic text-ink placeholder:text-muted/70 focus:border-violet focus:outline-none sm:text-4xl"
                autoComplete="off"
              />
              <button type="submit" className="btn btn-primary btn-sm absolute right-0 top-1/2 -translate-y-1/2">
                {t("nav.search")}
              </button>
            </form>
            <div className="mx-auto mt-6 flex max-w-3xl flex-wrap items-center gap-2">
              <span className="caps mr-2 text-[0.58rem] text-muted">{t("nav.popular")}</span>
              {OCCASIONS.slice(0, 6).map((o) => (
                <Link key={o.slug} href={`/occasions/${o.slug}`} className="chip">
                  {labelFor(o, locale)}
                </Link>
              ))}
              <Link href="/custom" className="chip">
                {t("nav.build")}
              </Link>
            </div>
          </div>
        </div>

        {/* Shop mega panel */}
        {shopOpen && (
          <div
            className="absolute inset-x-0 top-full hidden border-b border-line bg-canvas shadow-[0_40px_80px_-40px_rgba(34,24,34,0.35)] lg:block"
            onMouseEnter={openShop}
            onMouseLeave={scheduleClose}
            style={{ animation: "velvea-rise 0.35s var(--ease-out-soft)" }}
          >
            <div className="container-x grid grid-cols-[repeat(4,minmax(0,1fr))_minmax(10rem,15rem)] gap-x-5 py-10">
              {columns.map((col) => (
                <div key={col.key}>
                  <Link
                    href={col.base}
                    className="caps mb-4 flex items-center gap-2 text-[0.58rem] text-violet hover:text-ink"
                  >
                    {col.label}
                  </Link>
                  <ul className="space-y-1.5">
                    {col.items.map((item) => (
                      <li key={item.slug}>
                        <Link
                          href={`${col.base}/${item.slug}`}
                          className="group inline-flex items-center gap-2 text-[0.95rem] text-ink-soft transition-colors hover:text-ink"
                        >
                          {labelFor(item, locale)}
                          <ArrowRight className="h-3 w-3 -translate-x-1 text-violet opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {/* featured tile */}
              <div className="border-l border-line pl-8">
                <p className="caps mb-4 text-[0.58rem] text-violet">
                  {t("nav.featuredNow")}
                </p>
                {featured ? (
                  <Link href={`/products/${featured.slug}`} className="group block">
                    <div className="arch relative aspect-[4/5] overflow-hidden bg-cream">
                      {featured.image ? (
                        <Image
                          src={featured.image}
                          alt={featured.name}
                          fill
                          sizes="288px"
                          className="zoom-img object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <span className="font-display text-2xl text-line-strong">Velvéa</span>
                        </div>
                      )}
                    </div>
                    <p className="mt-3 font-display text-lg leading-snug text-ink group-hover:text-violet">
                      {featured.name}
                    </p>
                    <p className="mt-0.5 text-sm text-muted">{formatMoney(featured.priceCents)}</p>
                  </Link>
                ) : (
                  <Link href="/baskets" className="group block">
                    <div className="arch flex aspect-[4/5] items-center justify-center bg-cream">
                      <span className="font-display text-2xl text-line-strong">Velvéa</span>
                    </div>
                    <p className="mt-3 font-display text-lg text-ink group-hover:text-violet">{t("nav.allBaskets")}</p>
                  </Link>
                )}
                <Link href="/baskets" className="link-draw mt-4 text-ink">
                  {t("nav.allBaskets")} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      <MobileMenu open={mobileOpen} onClose={closeMobile} />
    </>
  );
}
