import { setRequestLocale, getTranslations } from "next-intl/server";
import { CustomBuilder } from "@/components/custom/CustomBuilder";
import { PageHeader } from "@/components/ui/PageHeader";
import { getBuilderData } from "@/lib/queries";
import { t as tc } from "@/lib/i18n-content";
import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return pageMetadata({
    locale,
    path: "/custom",
    title: t("customTitle"),
    description: t("customDescription"),
  });
}

export default async function CustomPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const { containers, categories } = await getBuilderData();

  const view = {
    containers: containers.map((c) => ({
      id: c.id,
      name: tc(c.name, locale),
      priceCents: c.priceCents,
      image: c.imageUrl,
      capacity: c.capacity,
    })),
    categories: categories.map((cat) => ({
      id: cat.id,
      name: tc(cat.name, locale),
      items: cat.items.map((i) => ({
        id: i.id,
        name: tc(i.name, locale),
        priceCents: i.priceCents,
        image: i.imageUrl,
      })),
    })),
  };

  const empty = view.containers.length === 0;
  const steps = [t("build.s1"), t("build.s2"), t("build.s3")];

  return (
    <div>
      <PageHeader
        eyebrow={t("custom.eyebrow")}
        title={t("custom.title")}
        lede={t("custom.lede")}
        breadcrumb={[{ label: t("pdp.home"), href: "/" }, { label: t("nav.build"), href: "/custom" }]}
      >
        <ol className="mt-7 flex flex-wrap gap-x-8 gap-y-3">
          {steps.map((s, i) => (
            <li key={s} className="flex items-center gap-3 text-[0.95rem] font-medium text-ink">
              <span className="step-num h-9 w-9 text-[0.95rem] text-violet-deep">{i + 1}</span>
              {s}
            </li>
          ))}
        </ol>
      </PageHeader>

      {empty ? (
        <div className="container-x py-24 text-center">
          <p className="font-display text-3xl">{t("custom.emptyTitle")}</p>
          <p className="mt-3 text-ink-soft">{t("custom.emptyLede")}</p>
          <Link href="/baskets" className="btn btn-primary mt-8">
            {t("nav.allBaskets")} <ArrowRight />
          </Link>
        </div>
      ) : (
        <CustomBuilder data={view} />
      )}
    </div>
  );
}
