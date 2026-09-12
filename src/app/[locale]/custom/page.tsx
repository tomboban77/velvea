import { setRequestLocale, getTranslations } from "next-intl/server";
import { CustomBuilder } from "@/components/custom/CustomBuilder";
import { getBuilderData } from "@/lib/queries";
import { t as tc } from "@/lib/i18n-content";
import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const t = await getTranslations("custom");
  return { title: t("title") };
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

  return (
    <div>
      <div className="relative overflow-hidden border-b border-line bg-cream/60">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 -top-32 h-80 w-80 rounded-full opacity-[0.12] blur-3xl"
          style={{ background: "var(--grad-iris)" }}
        />
        <div className="container-x relative py-14 text-center lg:py-18">
          <p className="eyebrow centered mb-4">{t("custom.eyebrow")}</p>
          <h1 className="h-section mx-auto max-w-2xl font-display balance">{t("custom.title")}</h1>
          <p className="mx-auto mt-4 max-w-xl text-[1.02rem] text-ink-soft pretty">{t("custom.lede")}</p>
          <ul className="mx-auto mt-7 flex flex-wrap justify-center gap-x-8 gap-y-2 text-[0.68rem] uppercase tracking-[0.24em] text-muted">
            <li>{t("build.s1")}</li>
            <li className="text-lilac-deep">·</li>
            <li>{t("build.s2")}</li>
            <li className="text-lilac-deep">·</li>
            <li>{t("build.s3")}</li>
          </ul>
        </div>
      </div>

      {empty ? (
        <div className="container-x py-24 text-center">
          <span className="font-display text-5xl text-line-strong">V</span>
          <p className="mt-4 font-display text-2xl">{t("custom.emptyTitle")}</p>
          <p className="mt-2 text-muted">{t("custom.emptyLede")}</p>
          <Link href="/baskets" className="btn btn-primary mt-7">
            {t("nav.allBaskets")} <ArrowRight />
          </Link>
        </div>
      ) : (
        <CustomBuilder data={view} />
      )}
    </div>
  );
}
