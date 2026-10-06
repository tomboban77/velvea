import { setRequestLocale, getTranslations } from "next-intl/server";
import { CustomBasketRequestForm } from "@/components/custom-request/CustomBasketRequestForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { ShieldCheck } from "lucide-react";
import { pageMetadata } from "@/lib/seo";
import { getRequestableProduct } from "@/lib/queries";
import { t as tc } from "@/lib/i18n-content";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return pageMetadata({
    locale,
    path: "/custom-basket",
    title: t("customRequestTitle"),
    description: t("customRequestDescription"),
  });
}

/**
 * Custom basket request. Not the paused builder at /custom: there is no product
 * picker here on purpose. The customer describes the basket in their own words,
 * we price it by hand and reply by email or phone.
 *
 * `?product=<slug>` comes from a basket's page ("Message us about this
 * basket"): the same form, framed as changes or questions about that basket.
 * The canonical stays the clean /custom-basket URL (pageMetadata), so the
 * per-basket variants are never indexed as separate pages.
 */
export default async function CustomBasketPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ product?: string | string[] }>;
}) {
  const { locale } = await params;
  const { product: slugParam } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations();
  const found = await getRequestableProduct(typeof slugParam === "string" ? slugParam : null);
  const product = found
    ? {
        slug: found.slug,
        name: tc(found.name, locale),
        priceCents: found.priceCents,
        image: found.images[0] ? { url: found.images[0].url, alt: found.images[0].alt ?? "" } : null,
      }
    : null;
  const head = product
    ? { eyebrow: t("customRequest.basket.eyebrow"), title: t("customRequest.basket.title"), lede: t("customRequest.basket.lede") }
    : { eyebrow: t("customRequest.eyebrow"), title: t("customRequest.title"), lede: t("customRequest.lede") };
  const steps = [
    { title: t("customRequest.s1"), sub: t("customRequest.s1Sub") },
    { title: t("customRequest.s2"), sub: t("customRequest.s2Sub") },
    { title: t("customRequest.s3"), sub: t("customRequest.s3Sub") },
  ];

  return (
    <div>
      <PageHeader
        eyebrow={head.eyebrow}
        title={head.title}
        lede={head.lede}
        breadcrumb={[
          { label: t("pdp.home"), href: "/" },
          { label: t("nav.customRequest"), href: "/custom-basket" },
        ]}
      />
      <div className="container-x grid gap-10 py-12 lg:grid-cols-12 lg:gap-16 lg:py-16">
        <aside className="lg:col-span-4">
          <p className="caps">{t("customRequest.howTitle")}</p>
          <ol className="mt-5 space-y-5">
            {steps.map((s, i) => (
              <li key={s.title} className="flex items-start gap-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-lilac text-sm font-semibold text-violet-deep">
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold text-ink">{s.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">{s.sub}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-8 flex items-start gap-3 rounded-lg bg-cream p-5 text-sm text-ink-soft">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-violet-deep" strokeWidth={1.7} />
            {t("customRequest.noPayment")}
          </div>
        </aside>
        <div className="lg:col-span-8">
          {/* Keyed so moving between baskets starts a fresh form. */}
          <CustomBasketRequestForm key={product?.slug ?? "general"} product={product} />
        </div>
      </div>
    </div>
  );
}
