import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import { getArticleBySlug } from "@/lib/queries";
import { t as tc } from "@/lib/i18n-content";
import { formatDate } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";
import { articleJsonLd, breadcrumbJsonLd, hasFrench, pageMetadata, siteOrigin } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const a = await getArticleBySlug(slug);
  if (!a) return pageMetadata({ locale, path: `/guides/${slug}`, title: t("guideFallbackTitle"), index: false, alternates: false });
  return pageMetadata({
    locale,
    path: `/guides/${a.slug}`,
    title: tc(a.seoTitle, locale) || tc(a.title, locale),
    description: tc(a.seoDescription, locale) || tc(a.excerpt, locale),
    image: a.coverImage,
    type: "article",
    publishedTime: a.publishedAt?.toISOString(),
    modifiedTime: a.updatedAt.toISOString(),
    // A guide whose French body is still the English text is not a French page.
    alternates: hasFrench(a.body),
  });
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const a = await getArticleBySlug(slug);
  if (!a) notFound();

  const title = tc(a.title, locale);
  const breadcrumb = [
    { label: t("pdp.home"), href: "/" },
    { label: t("guides.title"), href: "/guides" },
    { label: title, href: `/guides/${a.slug}` },
  ];
  const origin = siteOrigin();

  return (
    <article className="container-narrow py-10 lg:py-14">
      <JsonLd
        data={[
          articleJsonLd({
            origin,
            locale,
            path: `/guides/${a.slug}`,
            headline: title,
            description: tc(a.excerpt, locale) || undefined,
            image: a.coverImage,
            author: a.author,
            publishedAt: a.publishedAt,
            updatedAt: a.updatedAt,
          }),
          breadcrumbJsonLd(breadcrumb, { locale, origin }),
        ]}
      />
      <Breadcrumb items={breadcrumb} className="mb-8" />

      <p className="caps">{a.category.toLowerCase()}</p>
      <h1 className="h-display mt-3 balance">{title}</h1>
      <p className="mt-3 text-sm text-muted">
        {a.author ?? "Velvea"} · {t("guides.readMinutes", { count: a.readMinutes })}
        {a.publishedAt ? ` · ${formatDate(a.publishedAt, locale === "fr" ? "fr-CA" : "en-CA")}` : ""}
      </p>

      {/* Bodies are sanitised on save, and again here so articles written
          before that check can't render script either. */}
      <div
        className="prose prose-velvea mt-8 max-w-none prose-headings:font-display"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(tc(a.body, locale)) }}
      />

      <div className="band-lilac mt-14 rounded-lg p-8 text-center sm:p-10">
        <h2 className="h-sub">{t("guides.ctaTitle")}</h2>
        <p className="mt-2 text-ink-soft">{t("guides.ctaBody")}</p>
        <Link href="/baskets" className="btn btn-primary mt-5">
          {t("guides.ctaButton")} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
