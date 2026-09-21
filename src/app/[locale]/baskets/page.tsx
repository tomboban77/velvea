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
  searchParams: Promise<{ sort?: string; min?: string; max?: string; q?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { sort, min, max, q } = await searchParams;
  const t = await getTranslations();
  const floor = min && Number.isFinite(Number(min)) && Number(min) >= 0 ? Number(min) : undefined;
  const cap = max && Number.isFinite(Number(max)) && Number(max) >= 0 ? Number(max) : undefined;
  const query = (q ?? "").trim().toLowerCase().slice(0, 80);

  // Names are bilingual JSON, so a case-insensitive search is done here rather
  // than in SQL. The catalogue is small enough that fetching it all is cheap.
  const fetched = await getAllProducts({ sort, take: query ? 500 : 48, min: floor, max: cap });
  const matches = (value: unknown) =>
    typeof value === "object" && value !== null
      ? Object.values(value as Record<string, unknown>).some(
          (v) => typeof v === "string" && v.toLowerCase().includes(query)
        )
      : typeof value === "string" && value.toLowerCase().includes(query);
  const products = query
    ? fetched.products.filter((p) => matches(p.name) || matches(p.tagline)).slice(0, 48)
    : fetched.products;
  const total = query ? products.length : fetched.total;

  return (
    <Listing
      eyebrow={t("collection.eyebrow")}
      title={t("listing.allTitle")}
      description={t("listing.allLede")}
      products={products}
      total={total}
      searchable
      showOccasions
      breadcrumb={[
        { label: t("pdp.home"), href: "/" },
        { label: t("listing.allTitle"), href: "/baskets" },
      ]}
    />
  );
}
