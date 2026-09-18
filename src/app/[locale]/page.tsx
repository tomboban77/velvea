import { setRequestLocale, getTranslations } from "next-intl/server";
import { Hero, type HeroProduct } from "@/components/home/Hero";
import { PromiseBar } from "@/components/home/PromiseBar";
import { GiftFinderBar } from "@/components/home/GiftFinderBar";
import { OccasionsRail } from "@/components/home/OccasionsRail";
import { Collection } from "@/components/home/Collection";
import type { CollectionTab } from "@/components/home/CollectionTabs";
import { BuildYourOwn } from "@/components/home/BuildYourOwn";
import { TheWay } from "@/components/home/TheWay";
import { Corporate } from "@/components/home/Corporate";
import { Atelier } from "@/components/home/Atelier";
import { Reviews } from "@/components/home/Reviews";
import { Journal } from "@/components/home/Journal";
import { Faq } from "@/components/home/Faq";
import { getAllProducts, getFeaturedProducts } from "@/lib/queries";
import { toProductView } from "@/lib/view";
import { t as tc } from "@/lib/i18n-content";
import { formatMoney } from "@/lib/utils";

const UNDER_CENTS = 10000;

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("collection");

  const [{ products: all }, featured] = await Promise.all([getAllProducts({ take: 12 }), getFeaturedProducts(12)]);

  // Hero shelf: featured baskets first (lead in the middle), topped up with the rest.
  const seen = new Set<string>();
  const heroRows = [...featured, ...all].filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true))).slice(0, 5);
  const heroProducts: HeroProduct[] = heroRows.map((p) => ({
    slug: p.slug,
    name: tc(p.name, locale),
    image: p.images[0]?.url ?? null,
    priceCents: p.priceCents,
    badge: p.badges[0] ?? (p.bestseller ? "bestseller" : null),
  }));

  // Tabs are only shown when they contain something and differ from "all".
  const view = (rows: typeof all) => rows.slice(0, 10).map((p) => toProductView(p, locale));
  const money = (c: number) => formatMoney(c, locale === "fr" ? "fr-CA" : "en-CA").replace(/[.,]00/, "");
  const candidates: (CollectionTab & { count: number })[] = [
    { key: "all", label: t("tabAll"), href: "/baskets", seeAll: t("seeAll", { label: t("tabAll").toLowerCase() }), products: view(all), count: all.length },
    {
      key: "best",
      label: t("tabBest"),
      href: "/baskets?sort=rating",
      seeAll: t("seeAll", { label: t("tabBest").toLowerCase() }),
      products: view(all.filter((p) => p.bestseller || p.badges.includes("bestseller"))),
      count: all.filter((p) => p.bestseller || p.badges.includes("bestseller")).length,
    },
    {
      key: "new",
      label: t("tabNew"),
      href: "/baskets",
      seeAll: t("seeAll", { label: t("tabNew").toLowerCase() }),
      products: view(all.filter((p) => p.badges.includes("new"))),
      count: all.filter((p) => p.badges.includes("new")).length,
    },
    {
      key: "under",
      label: t("tabUnder", { amount: money(UNDER_CENTS) }),
      href: `/baskets?max=${UNDER_CENTS}`,
      seeAll: t("seeAll", { label: t("tabUnder", { amount: money(UNDER_CENTS) }).toLowerCase() }),
      products: view(all.filter((p) => p.priceCents < UNDER_CENTS)),
      count: all.filter((p) => p.priceCents < UNDER_CENTS).length,
    },
  ];
  const tabs: CollectionTab[] = candidates
    .filter((c) => c.count > 0 && (c.key === "all" || c.count < all.length))
    .map(({ key, label, href, seeAll, products }) => ({ key, label, href, seeAll, products }));

  return (
    <>
      <Hero products={heroProducts} />
      <PromiseBar />
      <OccasionsRail />
      <GiftFinderBar />
      <Collection tabs={tabs} />
      <BuildYourOwn />
      <TheWay />
      <Corporate />
      <Atelier />
      <Reviews />
      <Journal />
      <Faq />
    </>
  );
}
