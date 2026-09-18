"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { Search, User, ShoppingBag, ChevronDown, Menu, ArrowRight, Truck, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { MobileMenu } from "./MobileMenu";
import { useCart } from "@/components/cart/CartProvider";
import { OCCASIONS, RECIPIENTS, CATEGORIES, HOLIDAYS, labelFor, type NavLink } from "@/lib/nav";
import { formatMoney, cn } from "@/lib/utils";
import { GIFT_CARDS_ENABLED } from "@/lib/features";

export type HeaderFeatured = {
  slug: string;
  name: string;
  image: string | null;
  priceCents: number;
} | null;

type Group = { key: string; label: string; base: string; items: NavLink[]; blurb: string };

/**
 * Three-tier retail header:
 *   1. slim announcement bar
 *   2. brand bar — utility links · centred logo · search + account + bag
 *   3. dark category bar with mega-menus (sticky on desktop)
 * On mobile the brand bar collapses to menu · logo · search · bag and stays sticky.
 */
export function Header({ featured }: { featured?: HeaderFeatured }) {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const { count, openCart, hydrated } = useCart();
  const fr = locale === "fr";

  const [open, setOpen] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const [compact, setCompact] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const brandBarRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  // Once the brand bar scrolls away, the sticky category bar shows the wordmark and bag.
  useEffect(() => {
    const onScroll = () => {
      const bottom = brandBarRef.current?.getBoundingClientRect().bottom ?? 0;
      setCompact(bottom < 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(null);
    setMobileOpen(false);
    setMobileSearch(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileSearch) setTimeout(() => mobileSearchRef.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(null);
        setMobileSearch(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileSearch]);

  function show(key: string) {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(key);
  }
  function scheduleClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(null), 140);
  }

  const searchAction = `/${locale === "en" ? "" : locale + "/"}search`;

  const groups: Group[] = [
    { key: "occasions", label: t("nav.occasions"), base: "/occasions", items: OCCASIONS, blurb: t("occasions.lede") },
    { key: "recipients", label: t("nav.recipients"), base: "/recipients", items: RECIPIENTS, blurb: t("recipients.lede") },
    { key: "category", label: t("nav.category"), base: "/category", items: CATEGORIES, blurb: fr ? "Gourmet, chocolat, café, bien-être et plus." : "Gourmet, chocolate, coffee, wellness and more." },
    { key: "holidays", label: t("nav.holidays"), base: "/occasions", items: HOLIDAYS, blurb: fr ? "Les moments de l’année qui méritent un panier." : "The moments of the year that call for a basket." },
  ];
  const active = groups.find((g) => g.key === open) ?? null;

  const plain: { href: string; label: string }[] = [
    { href: "/baskets", label: t("nav.allBaskets") },
    { href: "/custom", label: t("nav.build") },
    { href: "/corporate", label: t("nav.corporate") },
  ];

  return (
    <>
      {/* 1 · Announcement */}
      <div className="announcement relative z-50">
        <div className="container-x flex h-9 items-center justify-center gap-3 lg:justify-between">
          <p className="flex min-w-0 items-center gap-3 truncate">
            <span className="truncate">{t("announcement.two")}</span>
            <span className="hidden text-white/40 md:inline">·</span>
            <span className="hidden md:inline">{t("announcement.one")}</span>
            <span className="hidden text-white/40 xl:inline">·</span>
            <span className="hidden xl:inline">{t("announcement.three")}</span>
          </p>
          <div className="hidden items-center gap-5 lg:flex">
            <Link href="/shipping">{t("nav.delivery")}</Link>
            {GIFT_CARDS_ENABLED && <Link href="/gift-cards">{t("nav.giftCards")}</Link>}
            <Link href="/corporate/quote">{t("nav.corporateQuote")}</Link>
            <LocaleSwitcher tone="dark" />
          </div>
        </div>
      </div>

      {/* 2 · Brand bar — sticky on mobile only */}
      <div ref={brandBarRef} className="store-header sticky top-0 z-40 border-b border-line lg:static">
        <div className="container-x">
          <div className="grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-x-6 lg:h-[88px] xl:gap-x-8">
            {/* left */}
            <div className="flex items-center gap-1">
              <button className="icon-btn -ml-2 lg:hidden" onClick={() => setMobileOpen(true)} aria-label={t("nav.menu")}>
                <Menu className="h-6 w-6" strokeWidth={1.6} />
              </button>
              <nav className="hidden items-center gap-7 lg:flex" aria-label="Utility">
                <Link href="/corporate" className="util-link">{t("footer.corporate")}</Link>
                <Link href="/custom" className="util-link">{t("nav.build")}</Link>
                <Link href="/guides" className="util-link">{t("nav.guides")}</Link>
              </nav>
            </div>

            {/* centre: logo */}
            <div className="flex items-center justify-center">
              <Link href="/" aria-label="Velvea home" className="block">
                <Logo height={22} priority className="lg:hidden" />
                <Logo height={30} priority className="hidden lg:block xl:hidden" />
                <Logo height={36} priority className="hidden xl:block" />
              </Link>
            </div>

            {/* right */}
            <div className="flex items-center justify-end gap-1 lg:gap-6">
              <form action={searchAction} className="search-form hidden w-[clamp(15rem,21vw,25rem)] lg:flex xl:w-auto xl:min-w-0 xl:max-w-[30rem] xl:flex-1" role="search">
                <input name="q" placeholder={t("nav.searchPlaceholder")} aria-label={t("nav.search")} autoComplete="off" />
                <button type="submit" aria-label={t("nav.search")}>
                  <Search className="h-5 w-5" strokeWidth={1.8} />
                </button>
              </form>
              <Link href="/shipping" className="util-link hidden xl:inline-flex">
                <Truck strokeWidth={1.6} /> {t("nav.delivery")}
              </Link>
              <Link href="/account" className="util-link hidden lg:inline-flex" aria-label={t("nav.account")}>
                <User strokeWidth={1.6} /> {t("nav.signIn")}
              </Link>
              <button
                className={cn("icon-btn lg:hidden", mobileSearch && "bg-lilac text-violet-deep")}
                onClick={() => setMobileSearch((s) => !s)}
                aria-label={t("nav.search")}
                aria-expanded={mobileSearch}
              >
                {mobileSearch ? <X className="h-5 w-5" strokeWidth={1.6} /> : <Search className="h-5 w-5" strokeWidth={1.6} />}
              </button>
              <button onClick={openCart} className="util-link relative -mr-2 inline-flex h-11 w-11 items-center justify-center lg:mr-0 lg:h-auto lg:w-auto" aria-label={t("nav.cart")}>
                <ShoppingBag strokeWidth={1.6} />
                <span className="hidden lg:inline">{t("nav.cart")}</span>
                {hydrated && count > 0 && (
                  <span className="absolute -right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-violet-deep px-1 text-[0.62rem] font-bold text-white lg:static lg:ml-1">
                    {count}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* mobile search row */}
        <div className={cn("overflow-hidden border-t border-line transition-all duration-300 lg:hidden", mobileSearch ? "max-h-24 opacity-100" : "max-h-0 border-t-0 opacity-0")}>
          <form action={searchAction} className="container-x py-3" role="search">
            <div className="search-form">
              <input ref={mobileSearchRef} name="q" placeholder={t("nav.searchPlaceholder")} aria-label={t("nav.search")} autoComplete="off" />
              <button type="submit" aria-label={t("nav.search")}>
                <Search className="h-5 w-5" strokeWidth={1.8} />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 3 · Category bar — desktop, sticky */}
      <header className="nav-bar sticky top-0 z-40 hidden lg:block" onMouseLeave={scheduleClose}>
        <div className="container-x relative flex h-[52px] items-center">
          {/* compact brand, revealed when scrolled */}
          <div
            className={cn(
              "absolute left-[var(--gutter)] flex items-center transition-all duration-300",
              compact ? "translate-x-0 opacity-100" : "pointer-events-none -translate-x-3 opacity-0"
            )}
          >
            <Link href="/" className="font-display text-[1.35rem] tracking-[0.12em] text-white" aria-label="Velvea home">
              VELVÉA
            </Link>
          </div>

          <nav className={cn("mx-auto flex items-center transition-transform duration-300", compact && "translate-x-0")} aria-label="Primary">
            {groups.map((g) => (
              <div key={g.key} onMouseEnter={() => show(g.key)}>
                <button
                  className={cn("nav-item", open === g.key && "is-open")}
                  onClick={() => setOpen(open === g.key ? null : g.key)}
                  aria-expanded={open === g.key}
                  aria-haspopup="true"
                >
                  {g.label}
                  <ChevronDown strokeWidth={2.2} />
                </button>
              </div>
            ))}
            {plain.map((l) => (
              <Link key={l.href} href={l.href} className="nav-item" onMouseEnter={scheduleClose}>
                {l.label}
              </Link>
            ))}
          </nav>

          <div
            className={cn(
              "absolute right-[var(--gutter)] flex items-center gap-1 transition-all duration-300",
              compact ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-3 opacity-0"
            )}
          >
            <Link href={searchAction} className="nav-icon" aria-label={t("nav.search")}>
              <Search className="h-5 w-5" strokeWidth={1.7} />
            </Link>
            <Link href="/account" className="nav-icon" aria-label={t("nav.account")}>
              <User className="h-5 w-5" strokeWidth={1.7} />
            </Link>
            <button onClick={openCart} className="nav-icon relative" aria-label={t("nav.cart")}>
              <ShoppingBag className="h-5 w-5" strokeWidth={1.7} />
              {hydrated && count > 0 && (
                <span className="absolute -right-0.5 top-0 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-gold-soft px-1 text-[0.6rem] font-bold text-violet-ink">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mega panel */}
        {active && (
          <div className="mega" onMouseEnter={() => show(active.key)} onMouseLeave={scheduleClose}>
            <div className="container-x grid grid-cols-[minmax(0,3fr)_minmax(15rem,1fr)] gap-x-12 py-9">
              <div>
                <div className="flex items-end justify-between gap-6 border-b border-line pb-4">
                  <div>
                    <p className="mega-heading mb-1">{active.label}</p>
                    <p className="text-sm text-ink-soft">{active.blurb}</p>
                  </div>
                  <Link href={active.base} className="link-draw shrink-0">
                    {t("nav.viewAll")} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
                <ul className="mt-5 grid grid-cols-4 gap-x-8 gap-y-0.5 xl:grid-cols-5">
                  {active.items.map((item) => (
                    <li key={item.slug}>
                      <Link href={`${active.base}/${item.slug}`} className="mega-link">
                        {labelFor(item, locale)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* featured tile */}
              <div className="border-l border-line pl-10">
                <p className="mega-heading">{t("nav.featuredNow")}</p>
                {featured ? (
                  <Link href={`/products/${featured.slug}`} className="group block">
                    <div className="relative aspect-square overflow-hidden rounded-lg bg-cream">
                      {featured.image ? (
                        <Image src={featured.image} alt={featured.name} fill sizes="280px" className="zoom-img object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <span className="font-display text-2xl text-line-strong">Velvéa</span>
                        </div>
                      )}
                    </div>
                    <p className="product-name mt-3 group-hover:text-violet-deep">{featured.name}</p>
                    <p className="price mt-1 text-sm text-ink">{formatMoney(featured.priceCents)}</p>
                  </Link>
                ) : (
                  <Link href="/baskets" className="group block">
                    <div className="flex aspect-square items-center justify-center rounded-lg bg-cream">
                      <span className="font-display text-2xl text-line-strong">Velvéa</span>
                    </div>
                    <p className="product-name mt-3">{t("nav.allBaskets")}</p>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <MobileMenu open={mobileOpen} onClose={closeMobile} />
    </>
  );
}
