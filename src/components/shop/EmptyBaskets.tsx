import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";

export async function EmptyBaskets() {
  const t = await getTranslations();
  return (
    <div className="rounded-2xl border border-dashed border-line-strong bg-cream/50 px-6 py-20 text-center">
      <span className="font-display text-5xl text-line-strong">V</span>
      <p className="mt-4 font-display text-2xl">{t("listing.emptyTitle")}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted pretty">{t("listing.emptyLede")}</p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link href="/baskets" className="btn btn-primary btn-sm">
          {t("nav.allBaskets")} <ArrowRight />
        </Link>
        <Link href="/custom" className="btn btn-outline btn-sm">
          {t("common.buildCustom")}
        </Link>
      </div>
    </div>
  );
}
