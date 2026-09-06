import { setRequestLocale, getTranslations } from "next-intl/server";
import { Hero } from "@/components/home/Hero";
import { TrustBar } from "@/components/home/TrustBar";
import { OccasionsGrid } from "@/components/home/OccasionsGrid";
import { GiftFinder } from "@/components/home/GiftFinder";
import { RecipientsRow } from "@/components/home/RecipientsRow";
import { CorporateBanner } from "@/components/home/CorporateBanner";
import { DeliverySection } from "@/components/home/DeliverySection";
import { HowWeWork } from "@/components/home/HowWeWork";
import { GuidesGrid } from "@/components/home/GuidesGrid";
import { Story } from "@/components/home/Story";
import { Reviews } from "@/components/home/Reviews";
import { Faq } from "@/components/home/Faq";
import { ProductRail } from "@/components/shop/ProductRail";
import { getBestsellers, getFeaturedProducts } from "@/lib/queries";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations();
  const [featured, bestsellers] = await Promise.all([
    getFeaturedProducts(4),
    getBestsellers(4),
  ]);
  const heroImage = featured[0]?.images?.[0]?.url ?? null;

  return (
    <>
      <Hero featuredImage={heroImage} />
      <TrustBar />

      <ProductRail
        products={featured}
        eyebrow={t("occasions.eyebrow")}
        title={locale === "fr" ? "Coups de cœur" : "Featured This Week"}
        link="/baskets"
        linkLabel={t("common.viewAll")}
      />

      <OccasionsGrid />
      <GiftFinder />
      <RecipientsRow />

      <ProductRail
        products={bestsellers}
        title={locale === "fr" ? "Les plus populaires" : "Bestselling Baskets"}
        link="/baskets"
        linkLabel={t("common.viewAll")}
      />

      <CorporateBanner />
      <DeliverySection />
      <HowWeWork />
      <GuidesGrid />
      <Story />
      <Reviews />
      <Faq />
    </>
  );
}
