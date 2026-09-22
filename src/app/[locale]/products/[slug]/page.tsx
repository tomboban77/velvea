import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { ProductDetail, type ProductDetailView } from "@/components/shop/ProductDetail";
import { getSettings } from "@/lib/settings";
import { ProductReviews } from "@/components/shop/ProductReviews";
import { ProductRail } from "@/components/shop/ProductRail";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import { getProductBySlug, getBestsellers } from "@/lib/queries";
import { t as tc, tList } from "@/lib/i18n-content";
import { advertisedSameDayCutoff } from "@/lib/zones";
import { breadcrumbJsonLd, hasFrench, pageMetadata, productJsonLd, siteOrigin } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const product = await getProductBySlug(slug);
  if (!product || product.status === "DRAFT") {
    return pageMetadata({ locale, path: `/products/${slug}`, title: t("productFallbackTitle"), index: false, alternates: false });
  }
  // A product whose French copy is still the English text is not offered as a
  // French page: no hreflang pair, and the /fr URL itself is noindex.
  const frReady = hasFrench(product.description) || hasFrench(product.tagline);
  return pageMetadata({
    locale,
    path: `/products/${product.slug}`,
    title: tc(product.seoTitle, locale) || tc(product.name, locale),
    description: tc(product.seoDescription, locale) || tc(product.tagline, locale) || tc(product.description, locale)?.slice(0, 160),
    image: product.images[0]?.url,
    alternates: frReady,
  });
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pdp");

  const [product, sameDayCutoff, settings] = await Promise.all([
    getProductBySlug(slug),
    advertisedSameDayCutoff(),
    getSettings(),
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

  const breadcrumb = [
    { label: t("home"), href: "/" },
    { label: t("baskets"), href: "/baskets" },
    { label: view.name, href: `/products/${view.slug}` },
  ];
  const origin = siteOrigin();

  return (
    <>
      {/* Availability and per-variant prices come from the same fields the page
          renders, so the structured data cannot say "in stock" over a sold-out button. */}
      <JsonLd data={[productJsonLd(product, { locale, origin }), breadcrumbJsonLd(breadcrumb, { locale, origin })]} />

      <div className="container-x pt-5">
        <Breadcrumb items={breadcrumb} />
      </div>

      <ProductDetail
        product={view}
        sameDayCutoff={sameDayCutoff}
        premiumCardFeeCents={settings.gifting.premiumCardFeeCents}
      />

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
