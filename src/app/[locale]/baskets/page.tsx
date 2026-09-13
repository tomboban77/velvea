import { setRequestLocale, getTranslations } from "next-intl/server";
import { Listing } from "@/components/shop/Listing";
import { getAllProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const t = await getTranslations("listing");
  return { title: t("allTitle") };
}

export default async function BasketsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ sort?: string; min?: string; max?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { sort, min, max } = await searchParams;
  const t = await getTranslations();
  const floor = min && Number.isFinite(Number(min)) && Number(min) >= 0 ? Number(min) : undefined;
  const cap = max && Number.isFinite(Number(max)) && Number(max) >= 0 ? Number(max) : undefined;

  const { products, total } = await getAllProducts({ sort, take: 48, min: floor, max: cap });

  return (
    <Listing
      eyebrow={t("collection.eyebrow")}
      title={t("listing.allTitle")}
      description={t("listing.allLede")}
      products={products}
      total={total}
      showOccasions
      breadcrumb={[
        { label: t("pdp.home"), href: "/" },
        { label: t("listing.allTitle"), href: "/baskets" },
      ]}
    />
  );
}
