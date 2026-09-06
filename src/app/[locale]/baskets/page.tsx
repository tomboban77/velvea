import { setRequestLocale, getTranslations } from "next-intl/server";
import { Listing } from "@/components/shop/Listing";
import { getAllProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return { title: "All Gift Baskets" };
}

export default async function BasketsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ sort?: string; max?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { sort, max } = await searchParams;
  const t = await getTranslations();

  const { products, total } = await getAllProducts({ sort, take: 48 });
  const filtered = max
    ? products.filter((p) => p.priceCents <= parseInt(max))
    : products;

  return (
    <Listing
      eyebrow={t("occasions.eyebrow")}
      title={t("nav.allBaskets")}
      description={
        locale === "fr"
          ? "Parcourez tous nos paniers-cadeaux, préparés à la main et livrés partout au Canada."
          : "Browse our full range of hand-packed gift baskets, delivered across Canada."
      }
      products={filtered}
      total={max ? filtered.length : total}
      breadcrumb={[
        { label: t("brand.name"), href: "/" },
        { label: t("nav.allBaskets"), href: "/baskets" },
      ]}
    />
  );
}
