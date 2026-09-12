import { setRequestLocale } from "next-intl/server";
import { Hero, type HeroProduct } from "@/components/home/Hero";
import { PromiseBar } from "@/components/home/PromiseBar";
import { GiftFinderBar } from "@/components/home/GiftFinderBar";
import { OccasionsRail } from "@/components/home/OccasionsRail";
import { Collection } from "@/components/home/Collection";
import { BuildYourOwn } from "@/components/home/BuildYourOwn";
import { TheWay } from "@/components/home/TheWay";
import { Corporate } from "@/components/home/Corporate";
import { Atelier } from "@/components/home/Atelier";
import { Reviews } from "@/components/home/Reviews";
import { Journal } from "@/components/home/Journal";
import { Faq } from "@/components/home/Faq";
import { getBestsellers, getFeaturedProducts } from "@/lib/queries";
import { t as tc } from "@/lib/i18n-content";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [featured, bestsellers] = await Promise.all([getFeaturedProducts(8), getBestsellers(8)]);

  // One de-duplicated list: featured first, then bestsellers.
  const seen = new Set<string>();
  const products = [...featured, ...bestsellers].filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true)));

  const lead = products[0];
  const heroProduct: HeroProduct = lead
    ? { slug: lead.slug, name: tc(lead.name, locale), image: lead.images[0]?.url ?? null, priceCents: lead.priceCents }
    : null;

  return (
    <>
      <Hero product={heroProduct} />
      <PromiseBar />
      <GiftFinderBar />
      <OccasionsRail />
      <Collection products={products} />
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
