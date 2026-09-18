import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { ArrowRight, Gift } from "lucide-react";

export async function EmptyBaskets() {
  const t = await getTranslations();
  return (
    <div className="rounded-lg border border-dashed border-line-strong bg-cream/60 px-6 py-20 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-lilac text-violet-deep">
        <Gift className="h-6 w-6" strokeWidth={1.5} />
      </span>
      <p className="mt-5 font-display text-2xl">{t("listing.emptyTitle")}</p>
      <p className="mx-auto mt-2 max-w-md text-ink-soft pretty">{t("listing.emptyLede")}</p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link href="/baskets" className="btn btn-primary">
          {t("nav.allBaskets")} <ArrowRight />
        </Link>
        <Link href="/custom" className="btn btn-outline">
          {t("common.buildCustom")}
        </Link>
      </div>
    </div>
  );
}
