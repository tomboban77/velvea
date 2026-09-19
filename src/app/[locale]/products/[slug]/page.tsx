import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { ProductDetail, type ProductDetailView } from "@/components/shop/ProductDetail";
import { ProductReviews } from "@/components/shop/ProductReviews";
import { ProductRail } from "@/components/shop/ProductRail";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { getProductBySlug, getBestsellers } from "@/lib/queries";
import { t as tc, tList } from "@/lib/i18n-content";
import { advertisedSameDayCutoff } from "@/lib/zones";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Gift Basket" };
  const image = product.images[0]?.url;
  return {
    title: tc(product.seoTitle, locale) || tc(product.name, locale),
    description: tc(product.seoDescription, locale) || tc(product.tagline, locale),
    openGraph: image ? { images: [image] } : undefined,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pdp");

  const [product, sameDayCutoff] = await Promise.all([
    getProductBySlug(slug),
    advertisedSameDayCutoff(),
  ]);
  if (!product || product.status === "DRAFT") notFound();

  const view: ProductDetailView = {
    id: product.id,
    slug: product.slug,
    name: tc(product.name, locale),
    tagline: tc(product.tagline, locale),
    description: tc(product.description, locale),
    care: tc(product.care, locale),
    contents: tList(product.contents, locale),
    priceCents: product.priceCents,
    compareAtCents: product.compareAtCents,
    rating: product.avgRating,
    reviewCount: product.reviewCount,
    badges: product.badges,
    leadTimeDays: product.leadTimeDays,
    images: product.images.map((img) => ({ url: img.url, alt: img.alt ?? "" })),
    inventory: product.inventory,
    shippable: product.shippable,
    variants: product.variants.map((v) => ({
      id: v.id,
      label: tc(v.label, locale),
      priceCents: v.priceCents,
      compareAtCents: v.compareAtCents,
      inStock: v.inStock,
    })),
  };

  const related = (await getBestsellers(6)).filter((p) => p.id !== product.id).slice(0, 5);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: view.name,
    description: view.description || view.tagline,
    image: view.images.map((i) => i.url),
    brand: { "@type": "Brand", name: "Velvéa" },
    offers: {
      "@type": "Offer",
      priceCurrency: "CAD",
      price: (view.priceCents / 100).toFixed(2),
      availability: "https://schema.org/InStock",
    },
    ...(view.reviewCount > 0
      ? { aggregateRating: { "@type": "AggregateRating", ratingValue: view.rating.toFixed(1), reviewCount: view.reviewCount } }
      : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="container-x pt-5">
        <Breadcrumb
          items={[
            { label: t("home"), href: "/" },
            { label: t("baskets"), href: "/baskets" },
            { label: view.name, href: `/products/${view.slug}` },
          ]}
        />
      </div>

      <ProductDetail product={view} sameDayCutoff={sameDayCutoff} />

      <div id="reviews">
        <ProductReviews
          productId={product.id}
          rating={product.avgRating}
          count={product.reviewCount}
          reviews={product.reviews.map((r) => ({
            id: r.id,
            author: r.authorName,
            location: r.authorLocation ?? "",
            rating: r.rating,
            title: r.title ?? "",
            body: r.body,
            verified: r.verified,
            date: r.createdAt.toISOString(),
          }))}
        />
      </div>

      <ProductRail products={related} title={t("related")} link="/baskets" linkLabel={t("shopAll")} tone="cream" />
    </>
  );
}
