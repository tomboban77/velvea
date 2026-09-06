import { setRequestLocale, getLocale, getTranslations } from "next-intl/server";
import { CustomBuilder } from "@/components/custom/CustomBuilder";
import { getBuilderData } from "@/lib/queries";
import { t as tc } from "@/lib/i18n-content";
import { Link } from "@/i18n/routing";

export const dynamic = "force-dynamic";
export const metadata = { title: "Build a Custom Basket" };

export default async function CustomPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
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
      <div className="relative overflow-hidden border-b border-line bg-[radial-gradient(120%_120%_at_80%_0%,#f5efe3,#fbf8f2)]">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-20 -top-20 h-80 w-80 rounded-full opacity-15 blur-3xl"
          style={{ background: "var(--grad-iris)" }}
        />
        <div className="container-x relative py-14 text-center">
          <p className="eyebrow mb-3">{t("nav.customBasket")}</p>
          <h1 className="mx-auto max-w-2xl font-display text-4xl leading-tight balance sm:text-5xl">
            {locale === "fr" ? "Composez un panier qui vous ressemble" : "Build a basket, exactly your way"}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-ink-soft">
            {locale === "fr"
              ? "Choisissez un contenant, ajoutez vos favoris, et nous l'emballons à la main avec soin."
              : "Choose a vessel, add your favourites, and we'll hand-pack it with care."}
          </p>
        </div>
      </div>

      {empty ? (
        <div className="container-x py-20 text-center">
          <p className="font-display text-2xl">The builder is being set up</p>
          <p className="mt-2 text-muted">
            In the meantime, explore our ready-made baskets.
          </p>
          <Link href="/baskets" className="btn btn-primary mt-6">
            {t("nav.allBaskets")}
          </Link>
        </div>
      ) : (
        <CustomBuilder data={view} />
      )}
    </div>
  );
}
